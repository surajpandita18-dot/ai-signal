// agents/scorer.ts
// Single responsibility: score RawStory[] using the Signal Score rubric.
// Returns ScoredStory[] sorted by scores.final descending.
// Does NOT write to DB — caller (Orchestrator) persists results.

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import type { RawStory } from "./fetcher";

export interface ScoredStory extends RawStory {
  scores: {
    infraImpact: number;
    speedToAction: number;
    competitiveRelevance: number;
    hypeDiscount: number;
    final: number;
  };
  tier: "critical" | "monitor" | "tool" | "ignore";
  scoreRationale: string;
}

export interface ClickSignal {
  storyPattern: string;
  clickRate: number;
  tier: "critical" | "monitor";
}

const MODEL = "claude-sonnet-4-5";
const PROJECT_ROOT = join(process.cwd());

function buildSystemPrompt(): string {
  const agentMd = readFileSync(join(PROJECT_ROOT, "AGENT.md"), "utf-8");
  const scorerPrompt = readFileSync(
    join(PROJECT_ROOT, "prompts", "scorer-system.md"),
    "utf-8"
  );
  return `${agentMd}\n\n---\n\n${scorerPrompt}`;
}

function assignTier(finalScore: number): ScoredStory["tier"] {
  if (finalScore >= 22) return "critical";
  if (finalScore >= 14) return "monitor";
  if (finalScore >= 7) return "tool";
  return "ignore";
}

interface RawScoreEntry {
  id?: string;
  title?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  rawText?: string;
  scores?: {
    infraImpact?: number;
    speedToAction?: number;
    competitiveRelevance?: number;
    hypeDiscount?: number;
    final?: number;
  };
  tier?: string;
  scoreRationale?: string;
}

function parseScoreResponse(
  raw: string,
  originals: RawStory[]
): ScoredStory[] {
  // Strip any markdown code fences if Claude wraps in ```json ... ```
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: RawScoreEntry[];
  try {
    parsed = JSON.parse(cleaned) as RawScoreEntry[];
  } catch {
    throw new Error(`Scorer: failed to parse Claude response as JSON. Preview: ${cleaned.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Scorer: Claude response is not a JSON array");
  }

  // Build lookup from original stories so we never lose data
  const origMap = new Map(originals.map((s) => [s.id, s]));

  // Build a set of scored ids so we can handle any originals Claude dropped
  const scoredIds = new Set(parsed.map((e) => e.id));

  const results = parsed.map((entry): ScoredStory => {
    const orig = origMap.get(entry.id ?? "");
    if (!orig) {
      // Claude returned an id we don't recognise — skip gracefully below
      return null as unknown as ScoredStory;
    }
    const infraImpact = Number(entry.scores?.infraImpact ?? 0);
    const speedToAction = Number(entry.scores?.speedToAction ?? 0);
    const competitiveRelevance = Number(entry.scores?.competitiveRelevance ?? 0);
    const hypeDiscount = Number(entry.scores?.hypeDiscount ?? 0);
    const final = Number(
      entry.scores?.final ?? infraImpact + speedToAction + competitiveRelevance + hypeDiscount
    );

    return {
      ...orig,
      scores: { infraImpact, speedToAction, competitiveRelevance, hypeDiscount, final },
      tier: assignTier(final),
      scoreRationale: entry.scoreRationale ?? "",
    };
  }).filter(Boolean) as ScoredStory[];

  // Any story Claude silently dropped gets scored as ignore(0)
  for (const orig of originals) {
    if (!scoredIds.has(orig.id)) {
      results.push({
        ...orig,
        scores: { infraImpact: 0, speedToAction: 0, competitiveRelevance: 0, hypeDiscount: 0, final: 0 },
        tier: "ignore",
        scoreRationale: "Not scored by model.",
      });
    }
  }

  return results;
}

const BATCH_SIZE = 20;
const MAX_TOKENS_PER_BATCH = 8192;

async function scoreBatch(
  client: Anthropic,
  systemPrompt: string,
  batch: RawStory[],
  clickHistory: ClickSignal[]
): Promise<ScoredStory[]> {
  const userMessage =
    JSON.stringify({
      stories: batch.map(({ id, title, url, source, publishedAt, rawText }) => ({
        id,
        title,
        url,
        source,
        publishedAt,
        rawText,
      })),
      clickHistory,
    }) +
    "\n\nIMPORTANT: Return ONLY a compact JSON array. Each element must contain ONLY these fields: id, scores (infraImpact, speedToAction, competitiveRelevance, hypeDiscount, final), tier, scoreRationale. Do NOT echo title, url, source, publishedAt, or rawText.";

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS_PER_BATCH,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const firstBlock = message.content[0];
  if (firstBlock.type !== "text") {
    throw new Error("Scorer: unexpected non-text response from Claude");
  }

  return parseScoreResponse(firstBlock.text, batch);
}

export async function runScorer(
  stories: RawStory[],
  clickHistory: ClickSignal[] = []
): Promise<ScoredStory[]> {
  const unique = stories.filter((s) => !s.isDuplicate);
  if (unique.length === 0) return [];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const systemPrompt = buildSystemPrompt();

  // Score in batches to avoid hitting the output token ceiling
  const batches: RawStory[][] = [];
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    batches.push(unique.slice(i, i + BATCH_SIZE));
  }

  const batchResults = await Promise.all(
    batches.map((batch) => scoreBatch(client, systemPrompt, batch, clickHistory))
  );

  const all = batchResults.flat();
  return all.sort((a, b) => b.scores.final - a.scores.final);
}
