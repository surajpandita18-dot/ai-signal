// agents/orchestrator.ts
// Inngest function: Fetcher → Scorer → Writer → Personalizer → Formatter → Supabase → Beehiiv
// Cron: 0 0 * * 1-5 (UTC midnight = 5:30 AM IST, Mon–Fri)

import { inngest } from "@/lib/inngest";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { runFetcher } from "./fetcher";
import { runScorer } from "./scorer";
import { runWriter } from "./writer";
import { runPersonalizer } from "./personalizer";
import { runFormatter } from "./formatter";
import { runSender } from "./sender";
import type { RawStory } from "./fetcher";
import type { ScoredStory } from "./scorer";
import type { WrittenBrief } from "./writer";
import type { PersonalizedBrief } from "./personalizer";
import type { FormatterOutput } from "./formatter";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function logError(
  agent: string,
  error: string,
  context: Record<string, unknown>
): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from("agent_errors")
    .insert({ agent, error, context });
}

// ── Orchestrator function ─────────────────────────────────────────────────────

export const dailyPipeline = inngest.createFunction(
  {
    id: "daily-brief-pipeline",
    name: "Daily Brief Pipeline",
    triggers: [
      { cron: "0 0 * * 1-5" },
      { event: "ai-signal/pipeline.run" }, // manual trigger for dev/testing
    ],
  },
  async ({ step, logger, event }) => {
    const startTime = Date.now();
    const today = new Date().toISOString().split("T")[0];
    const lookback = (event.data as { lookback?: number })?.lookback ?? 24;

    logger.info(`[Orchestrator] Starting pipeline for ${today} (lookback=${lookback}h)`);

    // ── Step 1: Fetch ──────────────────────────────────────────────────────
    let rawStories: RawStory[];
    try {
      rawStories = await step.run("fetch-stories", () => runFetcher(lookback));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logError("fetcher", msg, { date: today });
      throw new Error(`[Fetcher] ${msg}`);
    }

    const unique = rawStories.filter((s) => !s.isDuplicate);
    logger.info(`[Fetcher] ${rawStories.length} total, ${unique.length} unique`);

    if (unique.length < 10) {
      const msg = `Only ${unique.length} unique stories — pipeline aborted (minimum 10)`;
      await logError("fetcher", msg, { date: today, count: unique.length });
      throw new Error(msg);
    }

    // ── Step 2: Score ──────────────────────────────────────────────────────
    let scoredStories: ScoredStory[];
    try {
      scoredStories = await step.run("score-stories", () => runScorer(rawStories));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logError("scorer", msg, { date: today });
      throw new Error(`[Scorer] ${msg}`);
    }

    const actionable = scoredStories.filter(
      (s) => s.tier === "critical" || s.tier === "monitor"
    );
    const criticalCount = scoredStories.filter((s) => s.tier === "critical").length;
    const monitorCount = scoredStories.filter((s) => s.tier === "monitor").length;

    logger.info(`[Scorer] critical=${criticalCount} monitor=${monitorCount} actionable=${actionable.length}`);

    if (actionable.length < 5) {
      const msg = `Only ${actionable.length} actionable stories — pipeline aborted (minimum 5)`;
      await logError("scorer", msg, { date: today, actionable: actionable.length });
      throw new Error(msg);
    }

    // ── Step 3: Write ──────────────────────────────────────────────────────
    let brief: WrittenBrief;
    try {
      const result = await step.run("write-brief", () => runWriter(scoredStories));
      brief = result.brief;
      logger.info(`[Writer] critical=${brief.criticalStories.length} monitor=${brief.monitorStories.length}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logError("writer", msg, { date: today });
      logger.warn(`[Writer] failed, using raw fallback: ${msg}`);

      brief = {
        date: today,
        criticalStories: scoredStories
          .filter((s) => s.tier === "critical")
          .slice(0, 5)
          .map((s) => ({
            id: s.id,
            tier: "critical" as const,
            headline: s.title,
            summary: s.rawText.slice(0, 200),
            actionTemplate: {
              owner: "CTO" as const,
              action: "Review this story and determine impact",
              by: "Today",
            },
            url: s.url,
            source: s.source,
            ctaLabel: "Read more →",
          })),
        monitorStories: scoredStories
          .filter((s) => s.tier === "monitor")
          .slice(0, 8)
          .map((s) => ({
            id: s.id,
            tier: "monitor" as const,
            headline: s.title,
            summary: s.rawText.slice(0, 150),
            url: s.url,
            source: s.source,
            ctaLabel: "Read more →",
          })),
        ctaPrompt:
          "Ask your team: what would we do if our primary LLM API went down for 4 hours today?",
      };
    }

    // ── Step 4: Personalize ────────────────────────────────────────────────
    let personalizedBrief: PersonalizedBrief;
    try {
      personalizedBrief = await step.run("personalize-brief", () =>
        runPersonalizer(brief)
      );
      logger.info(
        `[Personalizer] free critical=${personalizedBrief.freeBrief.criticalStories.length} monitor=${personalizedBrief.freeBrief.monitorStories.length} | pro critical=${personalizedBrief.proBrief.criticalStories.length} monitor=${personalizedBrief.proBrief.monitorStories.length}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logError("personalizer", msg, { date: today });
      throw new Error(`[Personalizer] ${msg}`);
    }

    // ── Step 5: Format ─────────────────────────────────────────────────────
    let formatted: FormatterOutput;
    try {
      formatted = await step.run("format-brief", () =>
        runFormatter(personalizedBrief)
      );
      logger.info(`[Formatter] emailHtml=${formatted.emailHtml.length} chars`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logError("formatter", msg, { date: today });
      throw new Error(`[Formatter] ${msg}`);
    }

    // ── Step 6: Save brief to Supabase ─────────────────────────────────────
    await step.run("save-brief", async () => {
      if (!supabaseAdmin) {
        logger.warn("[Save] supabaseAdmin not configured — skipping persist");
        return { skipped: true };
      }

      const { error } = await supabaseAdmin.from("briefs").upsert(
        {
          date: today,
          slug: today,
          free_content: personalizedBrief.freeBrief as unknown as Record<string, unknown>,
          pro_content: personalizedBrief.proBrief as unknown as Record<string, unknown>,
          web_payload: formatted.webPayload as unknown as Record<string, unknown>,
          email_html: formatted.emailHtml,
        },
        { onConflict: "slug" }
      );

      if (error) throw new Error(`Supabase briefs upsert: ${error.message}`);
      logger.info(`[Save] brief persisted for ${today} (email_html=${formatted.emailHtml.length} chars)`);
      return { saved: today };
    });

    // ── Step 7: Send via Beehiiv ───────────────────────────────────────────
    const sendResult = await step.run("send-brief", async () => {
      try {
        const result = await runSender(
          formatted.emailHtml,
          brief.criticalStories[0]?.headline ?? "AI Signal Daily Brief",
          today
        );
        if (result.skipped) {
          logger.info(`[Sender] skipped — ${result.reason}`);
        } else {
          logger.info(
            `[Sender] postId=${result.postId} scheduledAt=${result.scheduledAt} subscribers=${result.subscriberCount}`
          );
        }
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await logError("sender", msg, { date: today });
        logger.warn(`[Sender] failed: ${msg} — pipeline continues`);
        return { skipped: true, reason: `error: ${msg}` };
      }
    });

    // ── Step 8: Log pipeline run ───────────────────────────────────────────
    await step.run("log-pipeline-run", async () => {
      if (!supabaseAdmin) return { skipped: true };

      const { error } = await supabaseAdmin.from("pipeline_runs").insert({
        date: today,
        duration_ms: Date.now() - startTime,
        story_count: rawStories.length,
        critical_count: criticalCount,
        monitor_count: monitorCount,
        emails_scheduled: !sendResult.skipped,
        manual_send: false,
        success: true,
        errors: null,
      });

      if (error) logger.warn(`[Log] pipeline_runs insert failed: ${error.message}`);
      return { logged: today };
    });

    // ── Step 9: Update pipeline state (context memory for Scorer) ──────────
    await step.run("update-pipeline-state", async () => {
      if (!supabaseAdmin) return { skipped: true };

      const stateValue = {
        lastRunDate: today,
        topStoryPatterns: brief.criticalStories.map((s) => s.headline).slice(0, 3),
        avgCriticalCount: criticalCount,
        runDurationMs: Date.now() - startTime,
      };

      const { error } = await supabaseAdmin.from("pipeline_state").upsert(
        { key: "daily_context", value: stateValue },
        { onConflict: "key" }
      );

      if (error) logger.warn(`[State] pipeline_state upsert failed: ${error.message}`);
      return { updated: today };
    });

    logger.info(`[Orchestrator] Pipeline complete in ${Date.now() - startTime}ms`);

    return {
      date: today,
      durationMs: Date.now() - startTime,
      storyCount: rawStories.length,
      criticalCount,
      monitorCount,
      emailHtmlChars: formatted.emailHtml.length,
      briefSaved: true,
      emailScheduled: !sendResult.skipped,
      beehiivPostId: sendResult.postId ?? null,
    };
  }
);
