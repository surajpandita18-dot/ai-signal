// agents/personalizer.ts
// Single responsibility: split WrittenBrief into free and pro versions by applying gating rules.
// Gating is 100% deterministic (table-driven rules) — no Claude call needed.
// Claude Haiku can be wired here later if personalization/copy tailoring is added.

import type {
  WrittenBrief,
  WrittenCriticalStory,
  WrittenMonitorStory,
  WrittenToolStory,
} from "./writer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BriefContent {
  criticalStories: WrittenCriticalStory[];
  monitorStories: WrittenMonitorStory[];
  toolOfDay?: WrittenToolStory;
  ctaPrompt: string;
}

export interface PersonalizedBrief {
  freeBrief: BriefContent;
  proBrief: BriefContent;
  metadata: {
    date: string;
    criticalCount: number;
    monitorCount: number;
    generatedAt: string;
  };
}

// ── Gating constants ──────────────────────────────────────────────────────────

const FREE_CRITICAL_SUMMARIES = 3; // Show summaries for first N critical stories
const FREE_MONITOR_LIMIT = 3;       // Show only first N monitor stories
const PRO_CRITICAL_LIMIT = 5;
const PRO_MONITOR_LIMIT = 8;

const BLURRED_ACTION = {
  owner: "CTO" as const,
  action:
    "[🔒 Action template available for Pro subscribers]\n" +
    "Upgrade to see: who owns this, what to do, and by when.\n" +
    "→ aisignal.io/upgrade",
  by: "Upgrade to unlock",
};

// ── Public API ────────────────────────────────────────────────────────────────

export function runPersonalizer(brief: WrittenBrief): PersonalizedBrief {
  const { criticalStories, monitorStories, toolOfDay, ctaPrompt } = brief;

  // Free: all critical headlines visible; summaries only for first 3;
  // action templates replaced with blurred placeholder on ALL stories.
  const freeCritical: WrittenCriticalStory[] = criticalStories.map(
    (story, i) => ({
      ...story,
      summary: i < FREE_CRITICAL_SUMMARIES ? story.summary : "",
      actionTemplate: BLURRED_ACTION,
    })
  );

  // Free: first 3 monitor stories (headline + summary)
  const freeMonitor: WrittenMonitorStory[] = monitorStories.slice(
    0,
    FREE_MONITOR_LIMIT
  );

  // Pro: all critical (up to 5) with full content
  const proCritical: WrittenCriticalStory[] = criticalStories.slice(
    0,
    PRO_CRITICAL_LIMIT
  );

  // Pro: all monitor (up to 8)
  const proMonitor: WrittenMonitorStory[] = monitorStories.slice(
    0,
    PRO_MONITOR_LIMIT
  );

  const date =
    brief.date ?? new Date().toISOString().split("T")[0];

  return {
    freeBrief: {
      criticalStories: freeCritical,
      monitorStories: freeMonitor,
      toolOfDay,
      ctaPrompt,
    },
    proBrief: {
      criticalStories: proCritical,
      monitorStories: proMonitor,
      toolOfDay,
      ctaPrompt,
    },
    metadata: {
      date,
      criticalCount: criticalStories.length,
      monitorCount: monitorStories.length,
      generatedAt: new Date().toISOString(),
    },
  };
}
