// scripts/process-signals.mjs
// Nightly LLM pipeline:
// 1. Reads lib/realNews.json (scored signals from fetch-news.mjs)
// 2. Selects top 15% by score (min 5, max 25)
// 3. Cache check per signal (48hr TTL)
// 4. Routes to LLM provider by priority:
//      Priority 1: ANTHROPIC_API_KEY → Claude (Sonnet #1-3, Haiku #4-25)
//      Priority 2: GEMINI_API_KEY    → Gemini 1.5 Flash (all ranks)
//      Priority 3: Neither set       → error, skip processing
// 5. Validates output (blocked phrases, SKIP handling)
// 6. Writes lib/processedSignals.json

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Provider detection ────────────────────────────────────────────

const HAS_ANTHROPIC = !!process.env.ANTHROPIC_API_KEY;
const HAS_GEMINI    = !!process.env.GEMINI_API_KEY;

let anthropicClient = null;
let geminiModel     = null;

if (HAS_ANTHROPIC) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log("Provider: Anthropic (Claude Sonnet #1-3, Haiku #4-25)");
} else if (HAS_GEMINI) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  geminiModel = genai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: undefined, // set per-call below
  });
  console.log("Provider: Google Gemini (gemini-1.5-flash, all ranks)");
} else {
  console.error("ERROR: Neither ANTHROPIC_API_KEY nor GEMINI_API_KEY is set.");
  console.error("Set at least one in .env.local to run the pipeline.");
  process.exit(1);
}

// ── Cache ─────────────────────────────────────────────────────────

const CACHE_PATH = join(ROOT, "lib", ".summaryCache.json");
const TTL_MS = 48 * 60 * 60 * 1000;

function readCache() {
  if (!existsSync(CACHE_PATH)) return {};
  try { return JSON.parse(readFileSync(CACHE_PATH, "utf-8")); }
  catch { return {}; }
}

function writeCache(store) {
  writeFileSync(CACHE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function makeCacheKey(link) {
  return createHash("sha256").update(link).digest("hex").slice(0, 32);
}

function getCached(cache, link) {
  const entry = cache[makeCacheKey(link)];
  if (!entry) return null;
  return Date.now() - new Date(entry.cachedAt).getTime() < TTL_MS ? entry : null;
}

function setCached(cache, link, entry) {
  cache[makeCacheKey(link)] = { ...entry, cachedAt: new Date().toISOString() };
}

// ── Prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an intelligence analyst writing for technical founders at early-stage AI startups.
Produce exactly three sentences — no more, no less.

Rules:
- What: One factual sentence. What shipped, happened, or was announced. No opinions.
- Why it matters: One sentence on market or competitive context.
- Builder takeaway: One specific, actionable sentence. What a technical founder should do, reconsider, or watch. Never generic. If you cannot write a specific takeaway, output SKIP.

Output format (exactly this, no extra text):
WHAT: [sentence]
WHY: [sentence]
TAKEAWAY: [sentence]

If input is not a meaningful signal (job listing, opinion with no new info, duplicate), output only: SKIP`;

const BLOCKED_PHRASES = [
  "could impact", "broadly", "across the industry", "worth watching",
  "may affect", "signals a shift", "important development", "worth noting",
  "could be significant", "players in this space",
];

function parseResponse(text) {
  if (text.trim() === "SKIP") return null;

  const whatMatch     = text.match(/^WHAT:\s*(.+)$/m);
  const whyMatch      = text.match(/^WHY:\s*(.+)$/m);
  const takeawayMatch = text.match(/^TAKEAWAY:\s*(.+)$/m);

  if (!whatMatch || !whyMatch || !takeawayMatch) return null;

  const takeaway = takeawayMatch[1].trim();
  const lowerTakeaway = takeaway.toLowerCase();
  if (BLOCKED_PHRASES.some((p) => lowerTakeaway.includes(p))) return null;

  return {
    what:     whatMatch[1].trim(),
    why:      whyMatch[1].trim(),
    takeaway: takeaway,
  };
}

function buildUserPrompt(title, summary, source, date) {
  return `Source: ${source}
Date: ${date}
Title: ${title}
Body: ${(summary || "").slice(0, 800)}`;
}

// ── LLM callers ───────────────────────────────────────────────────

async function callClaude(title, summary, source, date, model) {
  const userPrompt = buildUserPrompt(title, summary, source, date);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const msg = await anthropicClient.messages.create({
        model,
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });
      const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
      const parsed = parseResponse(text);
      if (parsed || attempt === 1) return parsed;
      console.log(`  Retry for: ${title.slice(0, 60)}`);
    } catch (err) {
      console.error(`  Claude error (attempt ${attempt + 1}): ${err.message}`);
      if (attempt === 1) return null;
    }
  }
  return null;
}

async function callGemini(title, summary, source, date) {
  const userPrompt = buildUserPrompt(title, summary, source, date);
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await geminiModel.generateContent(fullPrompt);
      const text = result.response.text().trim();
      const parsed = parseResponse(text);
      if (parsed || attempt === 1) return parsed;
      console.log(`  Retry for: ${title.slice(0, 60)}`);
    } catch (err) {
      console.error(`  Gemini error (attempt ${attempt + 1}): ${err.message}`);
      if (attempt === 1) return null;
    }
  }
  return null;
}

// ── Unified LLM dispatch ─────────────────────────────────────────

async function callLLM(title, summary, source, date, rank) {
  if (HAS_ANTHROPIC) {
    const model = rank <= 3 ? "claude-sonnet-4-5" : "claude-haiku-4-5";
    return callClaude(title, summary, source, date, model);
  }
  // Gemini fallback — same quality prompt, same validation
  return callGemini(title, summary, source, date);
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  const rawPath = join(ROOT, "lib", "realNews.json");
  if (!existsSync(rawPath)) {
    throw new Error("lib/realNews.json not found — run fetch-news.mjs first");
  }

  const signals = JSON.parse(readFileSync(rawPath, "utf-8"));
  const sorted = [...signals].sort((a, b) => b.signalScore - a.signalScore);

  // 85th percentile threshold
  const p85Index = Math.floor(sorted.length * 0.15);
  const threshold = sorted[p85Index]?.signalScore ?? 0;
  const candidates = sorted.filter((s) => s.signalScore >= threshold).slice(0, 25);
  const selected = candidates.length < 5 ? sorted.slice(0, 5) : candidates;

  console.log(`Selected ${selected.length} signals (threshold: ${threshold.toFixed(2)})`);

  const cache = readCache();
  const now = new Date().toISOString();
  const results = [];

  for (let i = 0; i < selected.length; i++) {
    const signal = selected[i];
    const rank = i + 1;
    const provider = HAS_ANTHROPIC
      ? (rank <= 3 ? "sonnet" : "haiku")
      : "gemini-flash";

    console.log(`[${rank}/${selected.length}] ${provider} → ${signal.title.slice(0, 70)}`);

    // Cache check — unchanged
    const cached = getCached(cache, signal.link);
    if (cached) {
      console.log("  ↳ cache hit");
      results.push({
        ...signal,
        what:               cached.what,
        why:                cached.why,
        takeaway:           cached.takeaway,
        processed:          true,
        processedAt:        cached.cachedAt,
        zone1EligibleUntil: new Date(new Date(cached.cachedAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        developingStory:    false,
      });
      continue;
    }

    // LLM call
    const result = await callLLM(signal.title, signal.summary, signal.source, signal.date, rank);

    if (!result) {
      console.log("  ↳ SKIP or validation failed");
      results.push({
        ...signal,
        processed: true,
        processedAt: now,
        what: null,
        why: null,
        takeaway: null,
        zone1EligibleUntil: null,
        developingStory: false,
      });
      continue;
    }

    setCached(cache, signal.link, result);

    const processedAt = now;
    results.push({
      ...signal,
      what:               result.what,
      why:                result.why,
      takeaway:           result.takeaway,
      processed:          true,
      processedAt,
      zone1EligibleUntil: new Date(new Date(processedAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      developingStory:    false,
    });

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  writeCache(cache);

  const outPath = join(ROOT, "lib", "processedSignals.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nWrote ${results.length} processed signals → lib/processedSignals.json`);
  console.log(`Cache entries: ${Object.keys(cache).length}`);
}

main().catch((err) => {
  console.error("process-signals failed:", err);
  process.exit(1);
});
