// agents/writer.ts
// Single responsibility: convert CRITICAL + MONITOR ScoredStory[] into the written brief JSON.
// Does NOT write to DB — caller persists the result.

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import type { ScoredStory } from "./scorer";

// ── Output types ──────────────────────────────────────────────────────────────

export interface ActionTemplate {
  owner: "CTO" | "Infra Lead" | "ML Engineer" | "Full Team";
  action: string;
  by: string;
}

export interface WrittenCriticalStory {
  id: string;
  tier: "critical";
  headline: string;
  summary: string;
  actionTemplate: ActionTemplate;
  url: string;
  source: string;
  ctaLabel: string;
}

export interface WrittenMonitorStory {
  id: string;
  tier: "monitor";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

export interface WrittenToolStory {
  id: string;
  tier: "tool";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

export interface WrittenBrief {
  date: string;
  criticalStories: WrittenCriticalStory[];
  monitorStories: WrittenMonitorStory[];
  toolOfDay?: WrittenToolStory;
  ctaPrompt: string;
}

export interface WriterResult {
  brief: WrittenBrief;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-5";
const PROJECT_ROOT = join(process.cwd());
// 400 tokens/story × 13 stories max + structural overhead
const MAX_TOKENS = 6000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const agentMd = readFileSync(join(PROJECT_ROOT, "AGENT.md"), "utf-8");
  const writerPrompt = readFileSync(
    join(PROJECT_ROOT, "prompts", "writer-system.md"),
    "utf-8"
  );
  const brandVoice = readFileSync(
    join(PROJECT_ROOT, "prompts", "brand-voice.md"),
    "utf-8"
  );
  return `${agentMd}\n\n---\n\n${brandVoice}\n\n---\n\n${writerPrompt}`;
}

function todayIST(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function parseWriterResponse(raw: string): WrittenBrief {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: WrittenBrief;
  try {
    parsed = JSON.parse(cleaned) as WrittenBrief;
  } catch {
    throw new Error(
      `Writer: failed to parse Claude response as JSON. Preview: ${cleaned.slice(0, 300)}`
    );
  }

  if (!Array.isArray(parsed.criticalStories) || !Array.isArray(parsed.monitorStories)) {
    throw new Error("Writer: response missing criticalStories or monitorStories arrays");
  }

  return parsed;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runWriter(stories: ScoredStory[]): Promise<WriterResult> {
  const criticalInput = stories
    .filter((s) => s.tier === "critical")
    .slice(0, 5);

  const monitorInput = stories
    .filter((s) => s.tier === "monitor")
    .slice(0, 8);

  const toolInput = stories
    .filter((s) => s.tier === "tool")
    .slice(0, 1);

  const writerStories = [...criticalInput, ...monitorInput, ...toolInput];

  if (writerStories.length === 0) {
    return {
      brief: {
        date: todayIST(),
        criticalStories: [],
        monitorStories: [],
        ctaPrompt: "Ask your team: what would we do if our primary LLM API went down for 4 hours today?",
      },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const systemPrompt = buildSystemPrompt();

  const userMessage = JSON.stringify({
    stories: writerStories.map(({ id, title, url, source, publishedAt, rawText, scores, tier, scoreRationale }) => ({
      id, title, url, source, publishedAt, rawText, scores, tier, scoreRationale,
    })),
    todayDate: todayIST(),
  });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const firstBlock = message.content[0];
  if (firstBlock.type !== "text") {
    throw new Error("Writer: unexpected non-text response from Claude");
  }

  const brief = parseWriterResponse(firstBlock.text);

  return {
    brief,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      totalTokens: message.usage.input_tokens + message.usage.output_tokens,
    },
  };
}
