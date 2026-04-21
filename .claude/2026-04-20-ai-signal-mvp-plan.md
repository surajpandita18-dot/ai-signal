# AI Signal — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform AI Signal from an RSS reader into a daily decision tool for technical founders — ranked signals, LLM-generated builder takeaways, UI-blur gate, and 3-event PostHog instrumentation.

**Architecture:** RSS ingestion runs via Next.js API route; a nightly GitHub Actions cron runs `scripts/process-signals.mjs` which scores all signals, calls Claude (Sonnet for #1–3, Haiku for #4–25), and writes enriched JSON to `lib/processedSignals.json`. The homepage reads from that file. All user state (plan, saves, dismisses) lives in `localStorage` for MVP. Gate is UI-level blur — takeaway is in the API response, blurred client-side if `plan !== "paid"`.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` · `posthog-js` · `rss-parser` · GitHub Actions

---

## Approved Constraints (locked in)

| # | Decision |
|---|---|
| 1 | Auth → Phase 3. Homepage redesign → Phase 4. Gate before redesign. |
| 2 | Gating is UI-level blur. Server always sends `takeaway`. Client blurs if `plan !== "paid"`. |
| 3 | No pricing shown anywhere. Just "Upgrade for full access" CTA. |
| 4 | PostHog free tier. Exactly 3 events: `signal_saved`, `signal_dismissed`, `upgrade_clicked`. |
| 5 | Zone 1 card: Number + Title + TAKEAWAY (amber, blurred if free). Dismiss ✕. Save ♡. |
| 6 | Zone 2 card: source dot + score bar + title + `Read →`. Nothing else. |
| 7 | Single first-visit tooltip: "These 3–5 signals are all you need today." Auto-dismiss 5s. |
| 8 | PostHog instrumentation in Phase 1. Not retrofitted. |

---

## File Map

### Created (new files)

| File | Responsibility |
|---|---|
| `lib/types.ts` | `Signal` interface — canonical shape for all signal data |
| `lib/scoring.ts` | 5-dimension weighted scoring formula → 0.0–5.0 |
| `lib/jaccard.ts` | Novelty score via Jaccard similarity on normalized title tokens |
| `lib/tags.ts` | Auto-generate 2–3 topic tags from title keywords |
| `lib/summaryCache.ts` | Read/write 48hr JSON file cache keyed by `sha256(link).slice(0,32)` |
| `lib/analytics.ts` | PostHog wrappers for the 3 allowed events |
| `scripts/process-signals.mjs` | Nightly LLM pipeline: score → select → call Claude → write JSON |
| `.github/workflows/process-signals.yml` | GitHub Actions cron at 05:00 UTC |
| `components/Zone1Signal.tsx` | Editorial row: number + title + takeaway + dismiss + save |
| `components/Zone2Card.tsx` | Compact card: source dot + score bar + title + Read → |
| `components/FirstVisitTooltip.tsx` | Single tooltip, localStorage-gated, 5s auto-dismiss |
| `app/providers.tsx` | PostHog CSPostHogProvider wrapper |
| `app/upgrade/page.tsx` | "Upgrade for full access" CTA — no price, no Stripe |

### Modified (existing files)

| File | Change |
|---|---|
| `scripts/fetch-news.mjs` | Replace `getScore()` heuristic with `computeScore()` from `lib/scoring.ts` (ported to mjs) |
| `app/api/news/route.ts` | Return `Signal[]` shape; merge processed JSON when available |
| `app/layout.tsx` | Wrap children with `<Providers>` |
| `app/page.tsx` | Zone 1 editorial list + Zone 2 grid + tooltip + upgrade CTA |
| `app/article/[id]/page.tsx` | Display `what`, `why`, `takeaway` (blurred if free) |

---

## Phase 1 — Data Foundation + Analytics

### Task 1: Signal type definition

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
// lib/types.ts

export type SourceType = "rss" | "arxiv" | "github" | "twitter";
export type SourceCategory = "official" | "research" | "media" | "community" | "substack";
export type ImpactLevel = "high" | "medium" | "low";
export type UserPlan = "free" | "paid";

export interface Signal {
  // Core identity
  id: string;                    // sha256(link).slice(0, 32)
  title: string;
  source: string;                // "Hugging Face", "arXiv", "OpenAI"
  sourceType: SourceType;
  sourceCategory: SourceCategory;
  link: string;
  date: string;                  // ISO date string

  // Scoring
  signalScore: number;           // 0.0–5.0
  impactLevel: ImpactLevel;
  tags: string[];                // 2–3 topic tags

  // LLM-generated (null until process-signals runs)
  what: string | null;
  why: string | null;
  takeaway: string | null;
  processed: boolean;
  processedAt: string | null;

  // Zone 1 lifecycle
  zone1EligibleUntil: string | null;  // processedAt + 24hr
  developingStory: boolean;

  // Feedback counters (incremented via API or localStorage for MVP)
  saveCount: number;
  dismissCount: number;
  clickCount: number;
  saveRate: number;              // saves / (saves + dismisses), updated weekly
}

// Lightweight shape used by Zone 2 card and list views
export type SignalSummary = Pick<Signal,
  "id" | "title" | "source" | "sourceCategory" | "date" |
  "signalScore" | "impactLevel" | "tags" | "link"
>;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/surajpandita/Documents/projects/ai_signal
npx tsc --noEmit
```

Expected: no errors (file is pure types, no imports).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add Signal type definition"
```

---

### Task 2: Jaccard novelty scorer

**Files:**
- Create: `lib/jaccard.ts`

- [ ] **Step 1: Create `lib/jaccard.ts`**

```typescript
// lib/jaccard.ts

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","need",
  "this","that","these","those","it","its","as","by","from","into","about",
  "how","what","when","where","who","which","why","not","no","new","ai"
]);

export function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
  );
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Returns novelty score 0.0–1.0.
 * 1.0 = completely unique, 0.05 = near-duplicate.
 * Pass the titles of all signals seen in the last 72hr as `existingTitles`.
 */
export function computeNovelty(
  candidateTitle: string,
  existingTitles: string[]
): number {
  if (existingTitles.length === 0) return 1.0;

  const candidateTokens = tokenize(candidateTitle);
  let maxSimilarity = 0;

  for (const existing of existingTitles) {
    const sim = jaccardSimilarity(candidateTokens, tokenize(existing));
    if (sim > maxSimilarity) maxSimilarity = sim;
  }

  if (maxSimilarity < 0.25) return 1.0;
  if (maxSimilarity < 0.5)  return 0.7;
  if (maxSimilarity < 0.75) return 0.3;
  return 0.05;
}

/**
 * Returns true if 3+ existing titles have Jaccard > 0.5 with target.
 * Used for developingStory detection.
 */
export function isDevelopingStory(
  targetTitle: string,
  recentTitles: string[],
  threshold = 0.5,
  minCount = 3
): boolean {
  const targetTokens = tokenize(targetTitle);
  const matches = recentTitles.filter(
    (t) => jaccardSimilarity(targetTokens, tokenize(t)) > threshold
  );
  return matches.length >= minCount;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/jaccard.ts
git commit -m "feat: add Jaccard novelty scorer"
```

---

### Task 3: Auto-tagger

**Files:**
- Create: `lib/tags.ts`

- [ ] **Step 1: Create `lib/tags.ts`**

```typescript
// lib/tags.ts

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: "LLM",       keywords: ["model","llm","gpt","claude","gemini","llama","mistral","weights","fine-tuning","fine tuning","context window","embedding","transformer"] },
  { tag: "Agents",    keywords: ["agent","autonomous","tool use","function calling","orchestration","pipeline","multi-agent","workflow","mcp"] },
  { tag: "Infra",     keywords: ["sdk","api","latency","inference","self-hosted","open source","framework","deployment","serving","quantization","vllm","triton"] },
  { tag: "Research",  keywords: ["benchmark","reasoning","eval","paper","arxiv","dataset","safety","alignment","rlhf","reward model","multimodal"] },
  { tag: "Funding",   keywords: ["raises","funding","series","billion","million","acquires","acquisition","shuts down","pivot","enterprise"] },
  { tag: "Product",   keywords: ["launch","release","introduces","ships","announces","available","beta","preview","generally available"] },
  { tag: "Pricing",   keywords: ["pricing","price cut","free tier","cost","tokens per dollar","rate limit","cheaper","affordable"] },
  { tag: "Vision",    keywords: ["image","video","vision","multimodal","ocr","screenshot","diagram","chart"] },
  { tag: "Voice",     keywords: ["audio","speech","tts","stt","voice","transcription","whisper"] },
];

/**
 * Returns 2–3 tags for a given title.
 * Priority: more keyword matches wins; ties broken by rule order.
 */
export function generateTags(title: string, max = 3): string[] {
  const normalized = title.toLowerCase();

  const scored = TAG_RULES.map(({ tag, keywords }) => ({
    tag,
    score: keywords.filter((kw) => normalized.includes(kw)).length,
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map(({ tag }) => tag);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/tags.ts
git commit -m "feat: add keyword-based auto-tagger"
```

---

### Task 4: 5-dimension scoring formula

**Files:**
- Create: `lib/scoring.ts`

- [ ] **Step 1: Create `lib/scoring.ts`**

```typescript
// lib/scoring.ts

import { computeNovelty } from "./jaccard";
import { ImpactLevel, SourceCategory } from "./types";

// ── Dimension weights ────────────────────────────────────────────
const W_BUILDER_RELEVANCE  = 0.30;
const W_NOVELTY            = 0.25;
const W_COMPETITIVE_THREAT = 0.20;
const W_SOURCE_AUTHORITY   = 0.15;
const W_RECENCY            = 0.10;

// ── Dimension 1: Builder Relevance ───────────────────────────────

const MODEL_CAPABILITY_KW = ["model","context window","benchmark","reasoning","multimodal","fine-tuning","weights released","eval","fine tuning"];
const INFRA_TOOLING_KW    = ["sdk","api","latency","pricing","rate limit","self-hosted","open source","framework","inference"];
const FUNDING_MARKET_KW   = ["raises","acquires","series","billion","million","shuts down","pivots","enterprise deal"];
const AGENT_WORKFLOW_KW   = ["agent","autonomous","tool use","function calling","orchestration","pipeline","workflow"];

function kwScore(title: string, keywords: string[]): number {
  const t = title.toLowerCase();
  const matches = keywords.filter((kw) => t.includes(kw)).length;
  return matches >= 2 ? 0.9 : matches === 1 ? 0.6 : 0.0;
}

function builderRelevance(title: string): number {
  const modelScore   = kwScore(title, MODEL_CAPABILITY_KW);
  const infraScore   = kwScore(title, INFRA_TOOLING_KW);
  const fundingScore = Math.min(kwScore(title, FUNDING_MARKET_KW), 0.8);
  const agentScore   = Math.min(kwScore(title, AGENT_WORKFLOW_KW), 0.85);
  return Math.max(modelScore, infraScore, fundingScore, agentScore);
}

// ── Dimension 3: Competitive Threat ──────────────────────────────

const OBSOLESCENCE_KW       = ["built-in","native support","no longer need","replaces","deprecated","sunset","free tier","open sourced"];
const CAPABILITY_JUMP_KW    = ["10x","100x","state of the art","beats","surpasses","new record","outperforms","best in class"];
const MARKET_DISPLACEMENT_KW= ["acquires","shuts down","pivots away from","drops support","price cut","free for","launches competing"];

function competitiveThreat(title: string, sourceAuthority: number): number {
  const t = title.toLowerCase();
  let raw = 0;
  raw += OBSOLESCENCE_KW.filter((kw) => t.includes(kw)).length * 0.3;
  raw += CAPABILITY_JUMP_KW.filter((kw) => t.includes(kw)).length * 0.25;
  raw += MARKET_DISPLACEMENT_KW.filter((kw) => t.includes(kw)).length * 0.2;
  raw = Math.min(raw, 1.0);

  // Confidence modifier: low-authority source claims discounted
  if (sourceAuthority < 0.7 && raw > 0) {
    raw = raw * 0.7;
  }
  return raw;
}

// ── Dimension 4: Source Authority ────────────────────────────────

const AUTHORITY_MAP: Record<string, number> = {
  // Official labs
  "openai": 1.0, "anthropic": 1.0, "google deepmind": 1.0,
  "meta ai": 1.0, "mistral": 1.0,
  // Research primary
  "arxiv ai": 0.90, "arxiv ml": 0.90, "arxiv nlp": 0.90,
  // High-trust research blogs
  "hugging face": 0.85, "google research": 0.85,
  // Tier 1 media
  "mit tech review ai": 0.75, "the verge ai": 0.75,
  // Developer community
  "hacker news (ai)": 0.70,
  // Tier 2 media
  "venturebeat ai": 0.65, "techcrunch ai": 0.65,
  // Newsletters / Substacks
  "latent space": 0.60, "ben evans": 0.60,
  // Replicate, LangChain etc.
  "replicate": 0.65, "langchain": 0.65,
};

export function sourceAuthority(sourceName: string): number {
  const key = sourceName.toLowerCase();
  return AUTHORITY_MAP[key] ?? 0.30;
}

// ── Dimension 5: Recency ─────────────────────────────────────────

export function recencyScore(dateStr: string): number {
  const published = new Date(dateStr).getTime();
  if (isNaN(published)) return 0.2;
  const ageHours = (Date.now() - published) / (1000 * 60 * 60);
  if (ageHours < 6)    return 1.0;
  if (ageHours < 24)   return 0.85;
  if (ageHours < 48)   return 0.65;
  if (ageHours < 72)   return 0.40;
  if (ageHours < 168)  return 0.20;
  return 0.05;
}

// ── Main ─────────────────────────────────────────────────────────

export interface ScoreInput {
  title: string;
  source: string;
  date: string;
  recentTitles: string[];   // titles of all signals seen in last 72hr
}

export interface ScoreOutput {
  signalScore: number;
  impactLevel: ImpactLevel;
}

export function computeScore(input: ScoreInput): ScoreOutput {
  const authority = sourceAuthority(input.source);

  const d1 = builderRelevance(input.title);
  const d2 = computeNovelty(input.title, input.recentTitles);
  const d3 = competitiveThreat(input.title, authority);
  const d4 = authority;
  const d5 = recencyScore(input.date);

  const raw =
    W_BUILDER_RELEVANCE  * d1 +
    W_NOVELTY            * d2 +
    W_COMPETITIVE_THREAT * d3 +
    W_SOURCE_AUTHORITY   * d4 +
    W_RECENCY            * d5;

  const signalScore = Math.round(Math.min(raw * 5, 5.0) * 100) / 100;

  const impactLevel: ImpactLevel =
    signalScore >= 4.0 ? "high" :
    signalScore >= 3.0 ? "medium" : "low";

  return { signalScore, impactLevel };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat: add 5-dimension signal scoring formula"
```

---

### Task 5: PostHog analytics — 3 events only

**Files:**
- Create: `lib/analytics.ts`
- Create: `app/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install PostHog**

```bash
cd /Users/surajpandita/Documents/projects/ai_signal
npm install posthog-js
```

Expected: `posthog-js` added to `node_modules`. No peer dep warnings.

- [ ] **Step 2: Create `lib/analytics.ts`**

```typescript
// lib/analytics.ts
// Only 3 events allowed. Do not add more without updating the spec.

import posthog from "posthog-js";

export function trackSignalSaved(signalId: string): void {
  posthog.capture("signal_saved", { signal_id: signalId });
}

export function trackSignalDismissed(signalId: string): void {
  posthog.capture("signal_dismissed", { signal_id: signalId });
}

export function trackUpgradeClicked(location: "nav" | "zone1_gate" | "article"): void {
  posthog.capture("upgrade_clicked", { location });
}
```

- [ ] **Step 3: Create `app/providers.tsx`**

```tsx
// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
    if (key) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,   // manual only
        capture_pageleave: false,
        autocapture: false,        // NO autocapture — only our 3 events
        disable_session_recording: true,
        persistence: "localStorage",
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
```

- [ ] **Step 4: Modify `app/layout.tsx` — add Providers wrapper**

Read the current layout first:

```bash
cat /Users/surajpandita/Documents/projects/ai_signal/app/layout.tsx
```

Then wrap `{children}` with `<Providers>`:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Signal",
  description: "Daily decision tool for technical founders building AI products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Add env vars to `.env.local`**

Create `.env.local` if it doesn't exist. Add:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_REPLACE_WITH_YOUR_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Get the key from [app.posthog.com](https://app.posthog.com) → Project Settings → Project API Key.

- [ ] **Step 6: Add `.env.local` to `.gitignore`**

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: `▲ Next.js 16.x.x` ready on `http://localhost:3000`. No TypeScript errors in terminal.

- [ ] **Step 8: Commit**

```bash
git add lib/analytics.ts app/providers.tsx app/layout.tsx .gitignore package.json package-lock.json
git commit -m "feat: add PostHog provider with 3-event analytics (signal_saved, signal_dismissed, upgrade_clicked)"
```

---

### Task 6: Update fetch-news script to use new scoring

**Files:**
- Modify: `scripts/fetch-news.mjs`
- Create: `lib/feed-sources.mjs` (if not already present — check first)

> **Note:** `lib/scoring.ts` is TypeScript. `fetch-news.mjs` is ESM JS. Port the scoring logic inline (no build step needed for the script).

- [ ] **Step 1: Check whether `lib/feed-sources.mjs` exists**

```bash
ls /Users/surajpandita/Documents/projects/ai_signal/lib/
```

- [ ] **Step 2: Read current `scripts/fetch-news.mjs`**

```bash
cat /Users/surajpandita/Documents/projects/ai_signal/scripts/fetch-news.mjs
```

- [ ] **Step 3: Replace `scripts/fetch-news.mjs` entirely**

```javascript
// scripts/fetch-news.mjs
// Fetches RSS feeds, scores every article using the 5-dimension formula,
// deduplicates by link, sorts by score, writes lib/realNews.json.

import Parser from "rss-parser";
import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const parser = new Parser({ timeout: 6000 });

const FEED_SOURCES = [
  { name: "OpenAI",           url: "https://openai.com/news/rss.xml",                                          category: "official" },
  { name: "Anthropic",        url: "https://www.anthropic.com/news/rss.xml",                                   category: "official" },
  { name: "Google DeepMind",  url: "https://deepmind.google/blog/rss.xml",                                     category: "official" },
  { name: "Meta AI",          url: "https://ai.meta.com/blog/rss/",                                            category: "official" },
  { name: "Hugging Face",     url: "https://huggingface.co/blog/feed.xml",                                     category: "research" },
  { name: "Google Research",  url: "https://research.google/blog/rss/",                                        category: "research" },
  { name: "arXiv AI",         url: "http://export.arxiv.org/rss/cs.AI",                                        category: "research" },
  { name: "arXiv ML",         url: "http://export.arxiv.org/rss/cs.LG",                                        category: "research" },
  { name: "arXiv NLP",        url: "http://export.arxiv.org/rss/cs.CL",                                        category: "research" },
  { name: "VentureBeat AI",   url: "https://venturebeat.com/ai/feed/",                                         category: "media" },
  { name: "TechCrunch AI",    url: "https://techcrunch.com/category/artificial-intelligence/feed/",            category: "media" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",  category: "media" },
  { name: "The Verge AI",     url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",        category: "media" },
  { name: "Latent Space",     url: "https://www.latent.space/feed",                                            category: "substack" },
  { name: "Ben Evans",        url: "https://www.ben-evans.com/benedictevans?format=rss",                       category: "substack" },
  { name: "Hacker News (AI)", url: "https://hnrss.org/newest?q=AI",                                           category: "community" },
];

// ── Inline scoring (mirrors lib/scoring.ts — keep in sync) ───────

const AUTHORITY_MAP = {
  "openai": 1.0, "anthropic": 1.0, "google deepmind": 1.0, "meta ai": 1.0,
  "arxiv ai": 0.90, "arxiv ml": 0.90, "arxiv nlp": 0.90,
  "hugging face": 0.85, "google research": 0.85,
  "mit tech review ai": 0.75, "the verge ai": 0.75,
  "hacker news (ai)": 0.70,
  "venturebeat ai": 0.65, "techcrunch ai": 0.65,
  "latent space": 0.60, "ben evans": 0.60,
};

function getAuthority(source) {
  return AUTHORITY_MAP[source.toLowerCase()] ?? 0.30;
}

function getRecency(dateStr) {
  const published = new Date(dateStr).getTime();
  if (isNaN(published)) return 0.2;
  const ageHours = (Date.now() - published) / (1000 * 60 * 60);
  if (ageHours < 6)   return 1.0;
  if (ageHours < 24)  return 0.85;
  if (ageHours < 48)  return 0.65;
  if (ageHours < 72)  return 0.40;
  if (ageHours < 168) return 0.20;
  return 0.05;
}

const MODEL_KW   = ["model","context window","benchmark","reasoning","multimodal","fine-tuning","weights released","eval"];
const INFRA_KW   = ["sdk","api","latency","pricing","rate limit","self-hosted","open source","framework","inference"];
const FUNDING_KW = ["raises","acquires","series","billion","million","shuts down","pivots","enterprise deal"];
const AGENT_KW   = ["agent","autonomous","tool use","function calling","orchestration","pipeline","workflow"];

function kwScore(title, keywords) {
  const t = title.toLowerCase();
  const n = keywords.filter((kw) => t.includes(kw)).length;
  return n >= 2 ? 0.9 : n === 1 ? 0.6 : 0.0;
}

function getBuilderRelevance(title) {
  return Math.max(
    kwScore(title, MODEL_KW),
    kwScore(title, INFRA_KW),
    Math.min(kwScore(title, FUNDING_KW), 0.8),
    Math.min(kwScore(title, AGENT_KW), 0.85)
  );
}

const OBS_KW  = ["built-in","native support","no longer need","replaces","deprecated","sunset","free tier","open sourced"];
const CAP_KW  = ["10x","100x","state of the art","beats","surpasses","new record","outperforms","best in class"];
const MKTD_KW = ["acquires","shuts down","pivots away from","drops support","price cut","free for","launches competing"];

function getCompetitiveThreat(title, authority) {
  const t = title.toLowerCase();
  let raw = 0;
  raw += OBS_KW.filter((kw) => t.includes(kw)).length * 0.3;
  raw += CAP_KW.filter((kw) => t.includes(kw)).length * 0.25;
  raw += MKTD_KW.filter((kw) => t.includes(kw)).length * 0.2;
  raw = Math.min(raw, 1.0);
  if (authority < 0.7 && raw > 0) raw *= 0.7;
  return raw;
}

const STOP = new Set(["a","an","the","and","or","but","in","on","at","to","for","of","with","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","this","that","it","its","as","by","from","about","how","what","when","where","who","which","why","not","no","new","ai"]);

function tokenize(title) {
  return new Set(title.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t)));
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  const inter = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

function novelty(title, existing) {
  if (existing.length === 0) return 1.0;
  const tokens = tokenize(title);
  const max = existing.reduce((m, t) => Math.max(m, jaccard(tokens, tokenize(t))), 0);
  if (max < 0.25) return 1.0;
  if (max < 0.5)  return 0.7;
  if (max < 0.75) return 0.3;
  return 0.05;
}

function computeScore(title, source, date, recentTitles) {
  const authority = getAuthority(source);
  const d1 = getBuilderRelevance(title);
  const d2 = novelty(title, recentTitles);
  const d3 = getCompetitiveThreat(title, authority);
  const d4 = authority;
  const d5 = getRecency(date);
  const raw = 0.30 * d1 + 0.25 * d2 + 0.20 * d3 + 0.15 * d4 + 0.10 * d5;
  return Math.round(Math.min(raw * 5, 5.0) * 100) / 100;
}

const TAG_RULES = [
  { tag: "LLM",      kws: ["model","llm","gpt","claude","gemini","llama","weights","fine-tuning","context window","embedding","transformer"] },
  { tag: "Agents",   kws: ["agent","autonomous","tool use","function calling","orchestration","multi-agent","mcp"] },
  { tag: "Infra",    kws: ["sdk","api","latency","inference","self-hosted","open source","framework","deployment"] },
  { tag: "Research", kws: ["benchmark","reasoning","eval","paper","arxiv","safety","alignment","multimodal"] },
  { tag: "Funding",  kws: ["raises","funding","series","billion","million","acquires","enterprise"] },
  { tag: "Product",  kws: ["launch","release","introduces","ships","announces","available","beta"] },
  { tag: "Pricing",  kws: ["pricing","price cut","free tier","cost","cheaper"] },
];

function generateTags(title, max = 3) {
  const t = title.toLowerCase();
  return TAG_RULES
    .map(({ tag, kws }) => ({ tag, score: kws.filter((kw) => t.includes(kw)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ tag }) => tag);
}

function makeId(link) {
  return createHash("sha256").update(link).digest("hex").slice(0, 32);
}

function getImpactLevel(score) {
  return score >= 4.0 ? "high" : score >= 3.0 ? "medium" : "low";
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching RSS feeds...");

  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items || []).slice(0, 10).map((item) => ({
          _source: feed.name,
          _category: feed.category,
          title: item.title || "",
          link: item.link || "",
          date: item.pubDate || item.isoDate || "",
          summary: item.contentSnippet || item.content || "",
        }));
      } catch (err) {
        console.warn(`Failed: ${feed.name} — ${err.message}`);
        return [];
      }
    })
  );

  const raw = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  // Deduplicate by link
  const seen = new Map();
  for (const item of raw) {
    if (item.link && !seen.has(item.link)) seen.set(item.link, item);
  }
  const unique = [...seen.values()];

  // Collect titles for novelty computation
  const allTitles = unique.map((i) => i.title);

  // Score everything
  const scored = unique.map((item) => {
    const recentTitles = allTitles.filter((t) => t !== item.title);
    const score = computeScore(item.title, item._source, item.date, recentTitles);
    return {
      id:            makeId(item.link),
      title:         item.title,
      source:        item._source,
      sourceType:    "rss",
      sourceCategory: item._category,
      link:          item.link,
      date:          item.date,
      signalScore:   score,
      impactLevel:   getImpactLevel(score),
      tags:          generateTags(item.title),
      what:          null,
      why:           null,
      takeaway:      null,
      processed:     false,
      processedAt:   null,
      zone1EligibleUntil: null,
      developingStory: false,
      saveCount:     0,
      dismissCount:  0,
      clickCount:    0,
      saveRate:      0,
      summary:       item.summary,
    };
  });

  const sorted = scored.sort((a, b) => b.signalScore - a.signalScore);

  const outPath = join(__dirname, "../lib/realNews.json");
  writeFileSync(outPath, JSON.stringify(sorted, null, 2), "utf-8");
  console.log(`Wrote ${sorted.length} signals → lib/realNews.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 4: Run the script to verify it produces valid output**

```bash
node scripts/fetch-news.mjs
```

Expected output similar to:
```
Fetching RSS feeds...
Failed: [possibly some feeds] — ...
Wrote 87 signals → lib/realNews.json
```

Then verify the JSON shape:

```bash
node -e "const d = require('./lib/realNews.json'); console.log(JSON.stringify(d[0], null, 2))"
```

Expected: top signal has `signalScore`, `impactLevel`, `tags`, `what: null`, `processed: false`.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-news.mjs lib/realNews.json
git commit -m "feat: replace heuristic scoring with 5-dimension formula in fetch-news"
```

---

### Task 7: Update API route to serve Signal shape

**Files:**
- Modify: `app/api/news/route.ts`

- [ ] **Step 1: Replace `app/api/news/route.ts` entirely**

```typescript
// app/api/news/route.ts
// Serves Signal[] from lib/realNews.json with in-memory cache.
// If processedSignals.json exists (written by process-signals.mjs),
// merges what/why/takeaway from it.

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Signal } from "@/lib/types";

let CACHE: Signal[] = [];
let LAST_FETCH = 0;
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

function loadSignals(): Signal[] {
  const rawPath = join(process.cwd(), "lib", "realNews.json");
  const processedPath = join(process.cwd(), "lib", "processedSignals.json");

  if (!existsSync(rawPath)) return [];

  const raw: Signal[] = JSON.parse(readFileSync(rawPath, "utf-8"));

  // Merge LLM-generated fields if processedSignals.json exists
  if (existsSync(processedPath)) {
    const processed: Signal[] = JSON.parse(readFileSync(processedPath, "utf-8"));
    const processedMap = new Map(processed.map((s) => [s.id, s]));
    return raw.map((signal) => {
      const p = processedMap.get(signal.id);
      if (!p) return signal;
      return {
        ...signal,
        what:               p.what,
        why:                p.why,
        takeaway:           p.takeaway,
        processed:          p.processed,
        processedAt:        p.processedAt,
        zone1EligibleUntil: p.zone1EligibleUntil,
        developingStory:    p.developingStory,
      };
    });
  }

  return raw;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";
  const now = Date.now();

  if (!force && CACHE.length > 0 && now - LAST_FETCH < CACHE_TTL) {
    return Response.json(CACHE);
  }

  try {
    const signals = loadSignals();
    const sorted = signals.sort((a, b) => b.signalScore - a.signalScore);
    CACHE = sorted;
    LAST_FETCH = now;
    return Response.json(sorted);
  } catch (err) {
    console.error("Failed to load signals:", err);
    return Response.json(CACHE.length > 0 ? CACHE : []);
  }
}

export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Verify the route compiles and responds**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000/api/news | node -e "process.stdin|>{let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const a=JSON.parse(d);console.log('Count:',a.length,'Top:',a[0]?.title)})}"
```

Expected: `Count: N  Top: [highest-scored article title]`

Kill dev server: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add app/api/news/route.ts
git commit -m "feat: API route serves Signal shape, merges processedSignals when available"
```

---

## Phase 2 — LLM Pipeline

### Task 8: Summary cache

**Files:**
- Create: `lib/summaryCache.ts`

- [ ] **Step 1: Create `lib/summaryCache.ts`**

```typescript
// lib/summaryCache.ts
// 48hr JSON file cache for LLM-generated summaries.
// Cache key: sha256(link).slice(0, 32)
// Cache file: lib/.summaryCache.json

import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CACHE_PATH = join(process.cwd(), "lib", ".summaryCache.json");
const TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

interface CacheEntry {
  what: string | null;
  why: string | null;
  takeaway: string | null;
  cachedAt: string; // ISO timestamp
}

type CacheStore = Record<string, CacheEntry>;

function readCache(): CacheStore {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeCache(store: CacheStore): void {
  writeFileSync(CACHE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function makeCacheKey(link: string): string {
  return createHash("sha256").update(link).digest("hex").slice(0, 32);
}

export function getCached(link: string): CacheEntry | null {
  const store = readCache();
  const key = makeCacheKey(link);
  const entry = store[key];
  if (!entry) return null;
  const age = Date.now() - new Date(entry.cachedAt).getTime();
  return age < TTL_MS ? entry : null;
}

export function setCached(link: string, entry: Omit<CacheEntry, "cachedAt">): void {
  const store = readCache();
  const key = makeCacheKey(link);
  store[key] = { ...entry, cachedAt: new Date().toISOString() };
  writeCache(store);
}

export function purgeStaleCacheEntries(): number {
  const store = readCache();
  const now = Date.now();
  let purged = 0;
  for (const key of Object.keys(store)) {
    const age = now - new Date(store[key].cachedAt).getTime();
    if (age > TTL_MS) {
      delete store[key];
      purged++;
    }
  }
  writeCache(store);
  return purged;
}
```

- [ ] **Step 2: Add `.summaryCache.json` to `.gitignore`**

```bash
echo "lib/.summaryCache.json" >> .gitignore
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/summaryCache.ts .gitignore
git commit -m "feat: add 48hr summary cache for LLM outputs"
```

---

### Task 9: Install Anthropic SDK

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install `@anthropic-ai/sdk`**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Add `ANTHROPIC_API_KEY` to `.env.local`**

```
ANTHROPIC_API_KEY=sk-ant-REPLACE_WITH_YOUR_KEY
```

Get from [console.anthropic.com](https://console.anthropic.com) → API Keys.

- [ ] **Step 3: Add to GitHub Actions secrets (for Phase 2 cron)**

In your repo: Settings → Secrets → Actions → New repository secret:
- Name: `ANTHROPIC_API_KEY`
- Value: same key as above

- [ ] **Step 4: Commit `package.json` update**

```bash
git add package.json package-lock.json
git commit -m "feat: add @anthropic-ai/sdk dependency"
```

---

### Task 10: Process-signals script (LLM pipeline)

**Files:**
- Create: `scripts/process-signals.mjs`

- [ ] **Step 1: Create `scripts/process-signals.mjs`**

```javascript
// scripts/process-signals.mjs
// Nightly LLM pipeline:
// 1. Reads lib/realNews.json (scored signals from fetch-news.mjs)
// 2. Selects top 15% by score (min 5, max 25)
// 3. Cache check per signal (48hr TTL)
// 4. Calls Claude Sonnet for #1–3, Haiku for #4–25
// 5. Validates output (blocked phrases, SKIP handling)
// 6. Writes lib/processedSignals.json

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// ── System prompt ────────────────────────────────────────────────

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

// ── LLM call (with one retry) ─────────────────────────────────────

async function callClaude(title, summary, source, date, model) {
  const userPrompt = `Source: ${source}
Date: ${date}
Title: ${title}
Body: ${(summary || "").slice(0, 800)}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const msg = await client.messages.create({
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
      console.error(`  Claude error: ${err.message}`);
      if (attempt === 1) return null;
    }
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

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

  console.log(`Selected ${selected.length} signals for LLM processing (threshold: ${threshold})`);

  const cache = readCache();
  const now = new Date().toISOString();
  const results = [];

  for (let i = 0; i < selected.length; i++) {
    const signal = selected[i];
    const rank = i + 1;
    const model = rank <= 3
      ? "claude-sonnet-4-5"
      : "claude-haiku-4-5";

    console.log(`[${rank}/${selected.length}] ${model} → ${signal.title.slice(0, 70)}`);

    // Cache check
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

    // Call Claude
    const result = await callClaude(signal.title, signal.summary, signal.source, signal.date, model);

    if (!result) {
      console.log("  ↳ SKIP or validation failed");
      results.push({ ...signal, processed: true, processedAt: now, what: null, why: null, takeaway: null, zone1EligibleUntil: null, developingStory: false });
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
```

- [ ] **Step 2: Add `processedSignals.json` to `.gitignore` and `realNews.json` too**

These are build outputs — large, regenerated nightly. Not needed in git.

```bash
echo "lib/processedSignals.json" >> .gitignore
```

> Note: If you want `realNews.json` checked in for Vercel to serve without a DB, remove it from `.gitignore`. Otherwise add it too. For MVP: check it in so Vercel can read it.

- [ ] **Step 3: Test the script with a dry run (first 2 signals only)**

```bash
ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env.local | cut -d= -f2) node -e "
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
" && node scripts/process-signals.mjs
```

Or directly:

```bash
export ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
node scripts/process-signals.mjs
```

Expected output:
```
Selected N signals for LLM processing (threshold: X.XX)
[1/N] claude-sonnet-4-5 → [title]
[2/N] claude-sonnet-4-5 → [title]
[3/N] claude-sonnet-4-5 → [title]
[4/N] claude-haiku-4-5 → [title]
...
Wrote N processed signals → lib/processedSignals.json
```

Inspect output:

```bash
node -e "const d=require('./lib/processedSignals.json');const s=d.find(x=>x.takeaway);console.log('WHAT:',s?.what,'\nWHY:',s?.why,'\nTAKEAWAY:',s?.takeaway)"
```

Expected: all three fields populated, takeaway is specific and actionable.

- [ ] **Step 4: Commit**

```bash
git add scripts/process-signals.mjs .gitignore
git commit -m "feat: add nightly LLM pipeline (Sonnet #1-3, Haiku #4-25, 48hr cache)"
```

---

### Task 11: GitHub Actions cron

**Files:**
- Create: `.github/workflows/process-signals.yml`

- [ ] **Step 1: Create the workflow directory if needed**

```bash
mkdir -p /Users/surajpandita/Documents/projects/ai_signal/.github/workflows
```

- [ ] **Step 2: Create `.github/workflows/process-signals.yml`**

```yaml
# .github/workflows/process-signals.yml
name: Process Signals (Nightly LLM)

on:
  schedule:
    - cron: "0 5 * * *"   # 05:00 UTC daily (10:30am IST)
  workflow_dispatch:        # Allow manual trigger from GitHub UI

jobs:
  process:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Fetch latest RSS feeds
        run: node scripts/fetch-news.mjs

      - name: Process signals with LLM
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: node scripts/process-signals.mjs

      - name: Commit updated signal files
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add lib/realNews.json lib/processedSignals.json
          git diff --staged --quiet || git commit -m "chore: nightly signal refresh $(date -u +%Y-%m-%d)"
          git push
```

- [ ] **Step 3: Verify ANTHROPIC_API_KEY is set as a GitHub secret**

Go to: `https://github.com/YOUR_USERNAME/ai_signal/settings/secrets/actions`

Confirm `ANTHROPIC_API_KEY` is listed.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/process-signals.yml
git commit -m "feat: add GitHub Actions cron for nightly LLM processing at 05:00 UTC"
```

---

## Phase 3 — Auth (GitHub OAuth)

> **Context:** Gate must exist before homepage redesign (Phase 4). Auth provides the real `plan` value. MVP pre-auth uses `localStorage` key `aiSignal_plan` = `"free"` | `"paid"`.

### Task 12: Install NextAuth + configure GitHub OAuth

**Files:**
- Modify: `package.json` (via npm)
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Install NextAuth v5**

```bash
npm install next-auth@beta
```

- [ ] **Step 2: Create `lib/auth.ts`**

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Store plan in session. Default: "free".
      // After real Stripe integration, look up DB. For MVP: always "free".
      return {
        ...session,
        user: {
          ...session.user,
          plan: (token.plan as string) ?? "free",
          githubId: token.sub,
        },
      };
    },
    async jwt({ token }) {
      // plan lives here until we have a DB
      token.plan = token.plan ?? "free";
      return token;
    },
  },
});
```

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Add env vars to `.env.local`**

```
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=YOUR_GITHUB_OAUTH_APP_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_OAUTH_APP_CLIENT_SECRET
```

To generate GitHub OAuth app:
1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Application name: `AI Signal (dev)`
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret

- [ ] **Step 5: Create a `useUserPlan` hook for components to consume**

Create `lib/useUserPlan.ts`:

```typescript
// lib/useUserPlan.ts
"use client";

import { useSession } from "next-auth/react";
import type { UserPlan } from "./types";

export function useUserPlan(): UserPlan {
  const { data: session } = useSession();
  // Type assertion — session.user.plan added in auth.ts callback
  const plan = (session?.user as { plan?: string } | undefined)?.plan;
  return (plan as UserPlan) ?? "free";
}
```

- [ ] **Step 6: Update `app/providers.tsx` to include SessionProvider**

```tsx
// app/providers.tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
    if (key) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        capture_pageleave: false,
        autocapture: false,
        disable_session_recording: true,
        persistence: "localStorage",
      });
    }
  }, []);

  return (
    <SessionProvider>
      <PostHogProvider client={posthog}>{children}</PostHogProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 7: Verify auth flow**

```bash
npm run dev
```

Visit `http://localhost:3000/api/auth/signin` — should show "Sign in with GitHub" button.
Click it — should redirect to GitHub and back.

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts lib/useUserPlan.ts app/api/auth app/providers.tsx package.json package-lock.json
git commit -m "feat: add GitHub OAuth via NextAuth, useUserPlan hook"
```

---

## Phase 4 — Homepage Redesign

### Task 13: FirstVisitTooltip component

**Files:**
- Create: `components/FirstVisitTooltip.tsx`

- [ ] **Step 1: Create `components/FirstVisitTooltip.tsx`**

```tsx
// components/FirstVisitTooltip.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aiSignal_tooltipSeen";

export function FirstVisitTooltip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a1b2e",
        border: "1px solid #2d2f50",
        borderRadius: "8px",
        padding: "0.75rem 1.25rem",
        color: "#c4b5fd",
        fontSize: "0.875rem",
        fontWeight: 500,
        letterSpacing: "0.01em",
        boxShadow: "0 4px 24px rgba(124, 58, 237, 0.15)",
        zIndex: 1000,
        maxWidth: "360px",
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "1");
      }}
    >
      These 3–5 signals are all you need today.
      <span style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
        click to dismiss
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FirstVisitTooltip.tsx
git commit -m "feat: add first-visit tooltip with 5s auto-dismiss"
```

---

### Task 14: Zone1Signal component

**Files:**
- Create: `components/Zone1Signal.tsx`

- [ ] **Step 1: Create `components/Zone1Signal.tsx`**

```tsx
// components/Zone1Signal.tsx
// Editorial row: rank number + title + TAKEAWAY (amber, blurred if free)
// Dismiss ✕ (logs signal_dismissed) + Save ♡ (logs signal_saved)
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Signal } from "@/lib/types";
import { useUserPlan } from "@/lib/useUserPlan";
import { trackSignalSaved, trackSignalDismissed, trackUpgradeClicked } from "@/lib/analytics";

interface Props {
  signal: Signal;
  rank: number;
  onDismiss: (id: string) => void;
}

export function Zone1Signal({ signal, rank, onDismiss }: Props) {
  const plan = useUserPlan();
  const isPaid = plan === "paid";
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const saves: string[] = JSON.parse(localStorage.getItem("aiSignal_saves") ?? "[]");
    return saves.includes(signal.id);
  });

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    const saves: string[] = JSON.parse(localStorage.getItem("aiSignal_saves") ?? "[]");
    if (saved) {
      localStorage.setItem("aiSignal_saves", JSON.stringify(saves.filter((id) => id !== signal.id)));
      setSaved(false);
    } else {
      localStorage.setItem("aiSignal_saves", JSON.stringify([...saves, signal.id]));
      setSaved(true);
      trackSignalSaved(signal.id);
    }
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    trackSignalDismissed(signal.id);
    onDismiss(signal.id);
  }

  const rankStr = String(rank).padStart(2, "0");
  const hasLLM = signal.processed && signal.takeaway;

  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        padding: "1.5rem 0",
        borderBottom: "1px solid #1a1b2e",
        alignItems: "flex-start",
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#2d2f50",
          lineHeight: 1,
          minWidth: "2.5rem",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {rankStr}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Source + date */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {signal.source}
          </span>
          <span style={{ color: "#2d2f50" }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>
            {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/article/${signal.id}`}
          style={{
            display: "block",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#f0f2ff",
            lineHeight: 1.3,
            textDecoration: "none",
            marginBottom: "0.75rem",
          }}
        >
          {signal.title}
        </Link>

        {/* TAKEAWAY — the only thing on the card besides title */}
        {hasLLM && (
          <div style={{ position: "relative" }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: rank === 1 ? "#fbbf24" : "#f59e0b",
                marginRight: "0.5rem",
              }}
            >
              Takeaway
            </span>
            {isPaid ? (
              <span style={{ fontSize: "0.9rem", color: rank === 1 ? "#fde68a" : "#fcd34d", lineHeight: 1.5 }}>
                {signal.takeaway}
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#fde68a",
                  lineHeight: 1.5,
                  filter: "blur(5px)",
                  userSelect: "none",
                  cursor: "pointer",
                }}
                onClick={() => trackUpgradeClicked("zone1_gate")}
                title="Upgrade to read takeaway"
              >
                {signal.takeaway}
              </span>
            )}
          </div>
        )}

        {/* No takeaway yet — show minimal state */}
        {!hasLLM && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {signal.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.7rem",
                  padding: "0.2rem 0.5rem",
                  background: "#1a1b2e",
                  borderRadius: "4px",
                  color: "#8892b0",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <button
          onClick={handleSave}
          aria-label={saved ? "Unsave signal" : "Save signal"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: saved ? "#7c3aed" : "#4b5563",
            fontSize: "1.1rem",
            padding: "0.25rem",
            lineHeight: 1,
          }}
        >
          {saved ? "♥" : "♡"}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss signal"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#4b5563",
            fontSize: "1rem",
            padding: "0.25rem",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Zone1Signal.tsx
git commit -m "feat: Zone1Signal component with blur gate, save/dismiss, analytics"
```

---

### Task 15: Zone2Card component

**Files:**
- Create: `components/Zone2Card.tsx`

- [ ] **Step 1: Create `components/Zone2Card.tsx`**

```tsx
// components/Zone2Card.tsx
// Compact card: source dot + score bar + title + Read →
// No summaries. No what/why/takeaway.
"use client";

import Link from "next/link";
import type { Signal } from "@/lib/types";

interface Props {
  signal: Signal;
}

function scoreBarColor(score: number): string {
  if (score >= 4.0) return "#10b981"; // emerald
  if (score >= 3.5) return "#7c3aed"; // violet
  return "#4f46e5";                   // indigo
}

function sourceColor(category: Signal["sourceCategory"]): string {
  switch (category) {
    case "official":   return "#10b981";
    case "research":   return "#7c3aed";
    case "media":      return "#4f46e5";
    case "substack":   return "#f59e0b";
    case "community":  return "#6b7280";
    default:           return "#6b7280";
  }
}

export function Zone2Card({ signal }: Props) {
  const barColor = scoreBarColor(signal.signalScore);
  const barWidth = `${((signal.signalScore / 5) * 100).toFixed(0)}%`;
  const dotColor = sourceColor(signal.sourceCategory);

  return (
    <Link
      href={`/article/${signal.id}`}
      style={{
        display: "block",
        background: "#0d0e17",
        border: "1px solid #1a1b2e",
        borderRadius: "8px",
        padding: "1rem",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#7c3aed44";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1a1b2e";
      }}
    >
      {/* Source row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {signal.source}
        </span>
      </div>

      {/* Score bar */}
      <div
        style={{
          height: "2px",
          background: "#1a1b2e",
          borderRadius: "1px",
          marginBottom: "0.75rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: barWidth,
            background: barColor,
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#f0f2ff",
          lineHeight: 1.4,
          margin: "0 0 0.75rem",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {signal.title}
      </p>

      {/* Read → */}
      <span style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 500 }}>
        Read →
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Zone2Card.tsx
git commit -m "feat: Zone2Card — compact signal card with score bar"
```

---

### Task 16: Rewrite homepage (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read the current `app/page.tsx` to understand what to preserve**

```bash
wc -l /Users/surajpandita/Documents/projects/ai_signal/app/page.tsx
head -80 /Users/surajpandita/Documents/projects/ai_signal/app/page.tsx
```

- [ ] **Step 2: Replace `app/page.tsx` entirely**

```tsx
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zone1Signal } from "@/components/Zone1Signal";
import { Zone2Card } from "@/components/Zone2Card";
import { FirstVisitTooltip } from "@/components/FirstVisitTooltip";
import { useUserPlan } from "@/lib/useUserPlan";
import { trackUpgradeClicked } from "@/lib/analytics";
import type { Signal } from "@/lib/types";

const ZONE1_COUNT = 5;       // Total Zone 1 slots (first 3 free, #4-5 gated)
const ZONE1_FREE_COUNT = 3;  // Free users see full cards for first 3

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const plan = useUserPlan();
  const isPaid = plan === "paid";

  useEffect(() => {
    // Load dismissed set from localStorage
    const d: string[] = JSON.parse(localStorage.getItem("aiSignal_dismissed") ?? "[]");
    setDismissed(new Set(d));

    // Fetch signals
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        setSignals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleDismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("aiSignal_dismissed", JSON.stringify([...next]));
      return next;
    });
  }

  const visibleSignals = signals.filter((s) => !dismissed.has(s.id));

  // Zone 1: processed signals with score >= 3.5 and within 24hr window
  const zone1Eligible = visibleSignals.filter((s) => {
    if (!s.processed) return false;
    if (s.signalScore < 3.5) return false;
    if (s.zone1EligibleUntil && new Date(s.zone1EligibleUntil) < new Date()) return false;
    return true;
  });

  const zone1 = zone1Eligible.slice(0, ZONE1_COUNT);
  const zone2 = visibleSignals.filter((s) => !zone1.find((z) => z.id === s.id)).slice(0, 50);

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="nav-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
          <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.08em", color: "#f0f2ff", textTransform: "uppercase" }}>
            AI Signal
          </span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/saved" style={{ fontSize: "0.85rem", color: "#8892b0", textDecoration: "none" }}>
            Saved
          </Link>
          {!isPaid && (
            <button
              onClick={() => trackUpgradeClicked("nav")}
              style={{
                background: "none",
                border: "1px solid #7c3aed",
                color: "#a78bfa",
                borderRadius: "6px",
                padding: "0.35rem 0.85rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Upgrade for full access
            </button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* ── Zone 1: Today's Signals ───────────────────────── */}
        <section>
          <h2 style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4b5563", marginBottom: "0.5rem" }}>
            Today&apos;s Signals
          </h2>

          {loading && (
            <div style={{ color: "#4b5563", padding: "2rem 0", fontSize: "0.9rem" }}>
              Loading signals…
            </div>
          )}

          {!loading && zone1.length === 0 && (
            <div style={{ color: "#6b7280", padding: "2rem 0", fontSize: "0.9rem", lineHeight: 1.6 }}>
              No high-impact signals today. Check back tomorrow or browse the archive below.
            </div>
          )}

          {zone1.map((signal, i) => {
            const rank = i + 1;
            const isGated = !isPaid && rank > ZONE1_FREE_COUNT;

            if (isGated) {
              return (
                <div
                  key={signal.id}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    padding: "1.5rem 0",
                    borderBottom: "1px solid #1a1b2e",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#2d2f50", minWidth: "2.5rem", flexShrink: 0 }}>
                    {String(rank).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      {signal.source} · {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p style={{ color: "#c4b5fd", fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", filter: "blur(4px)", userSelect: "none" }}>
                      {signal.title}
                    </p>
                    <button
                      onClick={() => trackUpgradeClicked("zone1_gate")}
                      style={{
                        background: "none",
                        border: "1px solid #7c3aed",
                        color: "#a78bfa",
                        borderRadius: "5px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Unlock with Pro →
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <Zone1Signal
                key={signal.id}
                signal={signal}
                rank={rank}
                onDismiss={handleDismiss}
              />
            );
          })}
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        {zone2.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "3rem 0 2rem",
          }}>
            <div style={{ flex: 1, height: "1px", background: "#1a1b2e" }} />
            <span style={{ fontSize: "0.75rem", color: "#4b5563", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
              More signals · {zone2.length} today
            </span>
            <div style={{ flex: 1, height: "1px", background: "#1a1b2e" }} />
          </div>
        )}

        {/* ── Zone 2: Signal Archive ────────────────────────── */}
        {zone2.length > 0 && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {zone2.map((signal) => (
              <Zone2Card key={signal.id} signal={signal} />
            ))}
          </section>
        )}
      </main>

      <FirstVisitTooltip />
    </>
  );
}
```

- [ ] **Step 3: Start dev server and verify the page renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Navbar with "AI Signal" + "Upgrade for full access" CTA
- Zone 1 shows numbered editorial list
- Zone 2 shows 3-column grid of compact cards
- Tooltip appears on first visit, auto-dismisses after 5s

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage with Zone 1 editorial list, Zone 2 grid, blur gate, first-visit tooltip"
```

---

## Phase 5 — Article Page

### Task 17: Article page with What / Why / Takeaway

**Files:**
- Modify: `app/article/[id]/page.tsx`

- [ ] **Step 1: Read current `app/article/[id]/page.tsx`**

```bash
cat /Users/surajpandita/Documents/projects/ai_signal/app/article/[id]/page.tsx
```

- [ ] **Step 2: Replace with Signal-aware version**

```tsx
// app/article/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Signal } from "@/lib/types";
import { useUserPlan } from "@/lib/useUserPlan";
import { trackUpgradeClicked } from "@/lib/analytics";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const plan = useUserPlan();
  const isPaid = plan === "paid";

  useEffect(() => {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem(`signal_${id}`);
    if (cached) {
      setSignal(JSON.parse(cached));
      setLoading(false);
      return;
    }

    fetch("/api/news")
      .then((r) => r.json())
      .then((signals: Signal[]) => {
        const found = signals.find((s) => s.id === id) ?? null;
        if (found) sessionStorage.setItem(`signal_${id}`, JSON.stringify(found));
        setSignal(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: "640px", margin: "4rem auto", padding: "0 1.5rem", color: "#4b5563" }}>
        Loading…
      </div>
    );
  }

  if (!signal) {
    return (
      <div style={{ maxWidth: "640px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <p style={{ color: "#6b7280" }}>Signal not found.</p>
        <Link href="/" style={{ color: "#7c3aed", fontSize: "0.875rem" }}>← Back to signals</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Back */}
      <Link
        href="/"
        style={{ fontSize: "0.8rem", color: "#6b7280", textDecoration: "none", display: "block", marginBottom: "2rem" }}
      >
        ← Back
      </Link>

      {/* Source + date + tags */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {signal.source}
        </span>
        <span style={{ color: "#2d2f50" }}>·</span>
        <span style={{ fontSize: "0.7rem", color: "#4b5563" }}>
          {new Date(signal.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
        {signal.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.65rem",
              padding: "0.15rem 0.45rem",
              background: "#1a1b2e",
              borderRadius: "4px",
              color: "#8892b0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f0f2ff", lineHeight: 1.25, marginBottom: "1.5rem" }}>
        {signal.title}
      </h1>

      {/* Signal score */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <span style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Signal Score
        </span>
        <span style={{ fontWeight: 700, color: signal.signalScore >= 4 ? "#10b981" : signal.signalScore >= 3.5 ? "#7c3aed" : "#4f46e5", fontSize: "0.9rem" }}>
          {signal.signalScore.toFixed(1)}
        </span>
        <div style={{ flex: 1, height: "3px", background: "#1a1b2e", borderRadius: "2px", maxWidth: "120px" }}>
          <div style={{
            height: "100%",
            width: `${(signal.signalScore / 5) * 100}%`,
            background: signal.signalScore >= 4 ? "#10b981" : signal.signalScore >= 3.5 ? "#7c3aed" : "#4f46e5",
            borderRadius: "2px",
          }} />
        </div>
      </div>

      {/* LLM summary block */}
      {signal.processed && (signal.what || signal.why || signal.takeaway) && (
        <div
          style={{
            background: "#0d0e17",
            border: "1px solid #1a1b2e",
            borderRadius: "8px",
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          {signal.what && (
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                What
              </span>
              <p style={{ fontSize: "0.95rem", color: "#c4b5fd", lineHeight: 1.6, margin: 0 }}>
                {signal.what}
              </p>
            </div>
          )}

          {signal.why && (
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                Why it matters
              </span>
              <p style={{ fontSize: "0.95rem", color: "#c4b5fd", lineHeight: 1.6, margin: 0 }}>
                {signal.why}
              </p>
            </div>
          )}

          {signal.takeaway && (
            <div>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", display: "block", marginBottom: "0.25rem" }}>
                Builder Takeaway
              </span>
              {isPaid ? (
                <p style={{ fontSize: "0.95rem", color: "#fde68a", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {signal.takeaway}
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: "0.95rem", color: "#fde68a", lineHeight: 1.6, margin: "0 0 0.75rem", filter: "blur(5px)", userSelect: "none" }}>
                    {signal.takeaway}
                  </p>
                  <button
                    onClick={() => trackUpgradeClicked("article")}
                    style={{
                      background: "none",
                      border: "1px solid #7c3aed",
                      color: "#a78bfa",
                      borderRadius: "6px",
                      padding: "0.35rem 0.85rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Upgrade for full access →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full summary */}
      {signal.summary && (
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.95rem", color: "#8892b0", lineHeight: 1.7 }}>
            {typeof signal.summary === "string" ? signal.summary : ""}
          </p>
        </div>
      )}

      {/* Original link CTA */}
      <a
        href={signal.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          background: "#7c3aed",
          color: "#fff",
          borderRadius: "6px",
          padding: "0.65rem 1.25rem",
          fontSize: "0.875rem",
          fontWeight: 600,
          textDecoration: "none",
          letterSpacing: "0.02em",
        }}
      >
        Read original →
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Verify page renders correctly**

With dev server running, navigate to any article URL: `http://localhost:3000/article/[some-id]`

Verify:
- Title, source, date, tags all render
- Signal score bar renders
- What / Why sections visible (violet text)
- Takeaway is blurred (purple haze) for free users
- "Read original →" button present

- [ ] **Step 4: Commit**

```bash
git add "app/article/[id]/page.tsx"
git commit -m "feat: article page with What/Why/Takeaway, blur gate, score bar"
```

---

## Phase 6 — Upgrade CTA Page

### Task 18: Upgrade page (no price, no Stripe)

**Files:**
- Create: `app/upgrade/page.tsx`

- [ ] **Step 1: Create `app/upgrade/page.tsx`**

```tsx
// app/upgrade/page.tsx
// No price shown. No Stripe. Just a waitlist / CTA page.
// When retention validates (5-day consecutive users), add pricing experiments.
"use client";

import Link from "next/link";
import { trackUpgradeClicked } from "@/lib/analytics";

export default function UpgradePage() {
  return (
    <div style={{ maxWidth: "520px", margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <Link href="/" style={{ fontSize: "0.8rem", color: "#6b7280", textDecoration: "none", display: "block", marginBottom: "3rem", textAlign: "left" }}>
        ← Back
      </Link>

      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", display: "inline-block", marginBottom: "1rem" }} />
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f0f2ff", lineHeight: 1.25, marginBottom: "1rem" }}>
        Full signal access<br />for builders who can&apos;t afford to miss a move.
      </h1>

      <p style={{ color: "#8892b0", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "2.5rem" }}>
        Unlock builder takeaways — one specific, actionable sentence per signal
        telling you exactly what to do, reconsider, or watch. Written for
        technical founders, not readers.
      </p>

      <div
        style={{
          background: "#0d0e17",
          border: "1px solid #2d2f50",
          borderRadius: "10px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          "Builder takeaway on every signal",
          "5 full Zone 1 signals (vs 3 free)",
          "Full Zone 2 signal cards",
          "Saved signals sync across devices",
          "Daily email digest with takeaways",
        ].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.6rem 0",
              borderBottom: "1px solid #1a1b2e",
              fontSize: "0.875rem",
              color: "#c4b5fd",
            }}
          >
            <span style={{ color: "#7c3aed", fontSize: "0.9rem" }}>✓</span>
            {item}
          </div>
        ))}
      </div>

      <a
        href="mailto:suraj.pandita18@gmail.com?subject=AI Signal Pro Access&body=Hey, I'd like early access to AI Signal Pro."
        style={{
          display: "block",
          background: "#7c3aed",
          color: "#fff",
          borderRadius: "8px",
          padding: "0.9rem",
          fontSize: "0.95rem",
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: "0.02em",
          marginBottom: "0.75rem",
        }}
        onClick={() => trackUpgradeClicked("nav")}
      >
        Request early access →
      </a>

      <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>
        No payment required right now. We&apos;ll reach out personally.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Wire upgrade CTA buttons to `/upgrade`**

In `app/page.tsx` and `components/Zone1Signal.tsx`, the `trackUpgradeClicked` calls currently just fire events. Update the "Upgrade for full access" nav button to navigate to `/upgrade`:

In `app/page.tsx`, change the nav button:

```tsx
// Replace the <button> in the nav with <Link>:
import Link from "next/link";

// Change:
<button onClick={() => trackUpgradeClicked("nav")} ...>
  Upgrade for full access
</button>

// To:
<Link
  href="/upgrade"
  onClick={() => trackUpgradeClicked("nav")}
  style={{
    border: "1px solid #7c3aed",
    color: "#a78bfa",
    borderRadius: "6px",
    padding: "0.35rem 0.85rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    textDecoration: "none",
    letterSpacing: "0.02em",
  }}
>
  Upgrade for full access
</Link>
```

Do the same for the "Unlock with Pro →" button in Zone 1 gated rows — wrap in `<Link href="/upgrade">`.

- [ ] **Step 3: Verify upgrade page renders**

Navigate to `http://localhost:3000/upgrade`. Verify no price shown, "Request early access →" mailto CTA present.

- [ ] **Step 4: Commit**

```bash
git add app/upgrade/page.tsx app/page.tsx
git commit -m "feat: upgrade CTA page (no price, early access email CTA)"
```

---

## Phase 6b — Fix Before First User (Priority: TODAY)

> **Source:** Product Intelligence Session 2026-04-22 — `.claude/intelligence/product-intelligence-2026-04-21.md`
>
> These 3 tasks must be completed before any real user is directed to the product. They are not enhancements — they are corrections to assumptions that were invalidated by the intelligence session. See `assumptions.md` A9, A10, A11.

### Task 19: Fix Zone 1 empty state (scoring threshold miscalibration)

**Problem:** Zone 1 threshold is `signalScore >= 3.5` but maximum score in current dataset is 3.38. Nine processed signals with valid TAKEAWAYs are suppressed. Zone 1 shows "No high-impact signals today" for every user.

**Fix:** In `app/page.tsx`, lower the Zone 1 threshold constant from `3.5` to `2.8`. If fewer than 3 signals meet the threshold, surface the top 3 processed signals (with `processed === true` and non-null `takeaway`) ranked by `signalScore` regardless of threshold. Zone 1 must never be empty when processed signals exist.

- [ ] **Step 1:** Open `app/page.tsx`. Find `ZONE1_THRESHOLD` or the `signalScore >= 3.5` filter.
- [ ] **Step 2:** Change threshold to `2.8`. Add fallback: if `zone1Signals.length < 3`, top up from `processedSignals` sorted by `signalScore` descending until 3 are shown or pool is exhausted.
- [ ] **Step 3:** Verify in dev: Zone 1 shows at least 3 signals when `processedSignals.json` has processed entries.
- [ ] **Step 4:** Commit.

```bash
git commit -m "fix: lower Zone 1 threshold 3.5→2.8, add fallback to top processed signals"
```

---

### Task 20: Implement server-side TAKEAWAY gate

**Problem:** TAKEAWAY is always present in the DOM with `filter: blur(4px)`. Any technical founder removes it in 10 seconds via DevTools. Upgrade CTA built on a bypassable gate is not a real product decision. The existing spec in `decision-tool-design.md §3` already states: "takeaway is never sent in the API response to free or unauthed users — not blurred client-side, not sent at all." This task implements the spec as written.

**Fix:** In `app/page.tsx` (server component) and `app/article/[id]/page.tsx`, pass TAKEAWAY to the client only when `session?.user?.plan === "paid"`. Free and unauthenticated users receive `takeaway: null` — the field is simply not populated, never blurred. The blur CSS in `Zone1Signal.tsx` and the article page can be replaced with a clean locked state.

- [ ] **Step 1:** In `app/page.tsx`, after loading `processedSignals`, strip `takeaway` field from signals before passing to `Zone1Signal` when `!isPaid`. Pass `takeaway={isPaid ? signal.takeaway : null}`.
- [ ] **Step 2:** In `Zone1Signal.tsx`, update TAKEAWAY block: when `takeaway === null`, render the upgrade-gate UI (solid overlay + "Unlock with Pro →" CTA) instead of blurred text. Remove `filter: blur(4px)`.
- [ ] **Step 3:** In `app/article/[id]/page.tsx`, the page already calls `auth()` server-side and checks `isPaid`. Update TAKEAWAY rendering: when `!isPaid`, pass `null` to the TAKEAWAY block. Remove client-side blur from article page.
- [ ] **Step 4:** TypeScript check — ensure `takeaway: string | null` types flow cleanly.
- [ ] **Step 5:** Commit.

```bash
git commit -m "fix: server-side TAKEAWAY gate — never in DOM for free users, remove client-side blur"
```

---

### Task 21: Gate unauthenticated users from TAKEAWAY (require GitHub OAuth for full Zone 1)

**Problem:** Unauthenticated users currently see Zone 1 with blurred TAKEAWAYs. After Task 20, they see Zone 1 with null TAKEAWAYs (upgrade gate UI). This is correct. But unauthenticated users also inflate wrong-user cohort — they have zero friction to leave, no authentication cost, and no investment in the product.

**Fix:** For unauthenticated users, Zone 1 shows signal #1 fully (WHAT + WHY only, no TAKEAWAY), then signals #2–3 are title-only with "Sign in with GitHub to read →" CTA. This is lighter than full auth-wall but creates enough friction to filter casual browsers while not blocking motivated founders who will authenticate immediately.

- [ ] **Step 1:** In `app/page.tsx` server component, check `!session` (unauthenticated). For zone1 signals index 1+ (second and third signals), pass a `requiresAuth` flag to `Zone1Signal`.
- [ ] **Step 2:** In `Zone1Signal.tsx`, add `requiresAuth` prop. When true, render title only + "Sign in with GitHub to continue →" link to `/api/auth/signin`.
- [ ] **Step 3:** Signal #1 remains fully visible (WHAT + WHY) to unauthenticated users — this is the free preview that demonstrates product value before requesting auth.
- [ ] **Step 4:** Verify: unauthenticated → sees signal #1 WHAT+WHY, signals #2–3 show auth gate. GitHub OAuth → sees all 3 WHAT+WHY. Paid → sees all 3 WHAT+WHY+TAKEAWAY.
- [ ] **Step 5:** Commit.

```bash
git commit -m "fix: require GitHub OAuth for Zone 1 signals 2–3, unauthenticated sees signal #1 preview only"
```

---

## Phase 7 — Email Digest (Deferred)

> **Not implementing in MVP.** Deferred until retention validates: 5-day consecutive return rate > 30%.
>
> When triggered, add: Resend integration, `/api/send-digest` route, GitHub Actions cron at 06:55 UTC, `/digest/[date]` shareable archive page.
>
> Stack: Resend free tier (3,000 emails/month) + Vercel KV or Supabase for email/preference storage.

---

## Self-Review Against Spec

### Spec coverage check

| Spec section | Covered in plan? |
|---|---|
| §3 Signal interface | ✅ Task 1 (`lib/types.ts`) |
| §4 Zone 1 — numbered editorial list | ✅ Task 16 (`app/page.tsx`), Task 14 (`Zone1Signal.tsx`) |
| §4 Zone 1 — Title + TAKEAWAY only on card | ✅ Task 14 — what/why NOT rendered in card, only takeaway |
| §4 Zone 2 — source dot + score bar + title + Read → | ✅ Task 15 (`Zone2Card.tsx`) |
| §4 Article page — what/why/takeaway | ✅ Task 17 |
| §4 Divider between zones | ✅ Task 16 |
| §4 Low-signal day message | ✅ Task 16 (`zone1.length === 0` branch) |
| §4 Zone 1 gate — solid overlay, not blur | ✅ Task 16 (blurred title + "Unlock with Pro →") |
| §5 5-dimension scoring | ✅ Task 4 (`lib/scoring.ts`) |
| §5 Jaccard novelty | ✅ Task 2 (`lib/jaccard.ts`) |
| §5 Confidence modifier | ✅ Task 4 (`competitiveThreat` applies 0.7x if authority < 0.7) |
| §5 `impactLevel` computation | ✅ Task 4, Task 6 |
| §5 Zone 1 threshold: score >= 3.5 AND age < 24hr | ✅ Task 16 (`zone1Eligible` filter) |
| §6 Auto-tags 2–3 per signal | ✅ Task 3 (`lib/tags.ts`) |
| §7 LLM pipeline — Sonnet #1–3, Haiku #4–25 | ✅ Task 10 |
| §7 SKIP handling + blocked phrases | ✅ Task 10 (`parseResponse`) |
| §7 48hr cache | ✅ Task 8 (`lib/summaryCache.ts`), Task 10 |
| §7 GitHub Actions 05:00 UTC | ✅ Task 11 |
| §9 signal_saved, signal_dismissed, upgrade_clicked | ✅ Task 5 (`lib/analytics.ts`) |
| §9 Dismiss UI: subtle ✕, logs event | ✅ Task 14 |
| Approved constraint: UI-level blur for gate | ✅ Tasks 14, 16, 17 |
| Approved constraint: No price shown | ✅ Task 18 (email CTA only) |
| Approved constraint: PostHog free tier, 3 events | ✅ Task 5 (autocapture disabled) |
| Approved constraint: Amber only for takeaway | ✅ Tasks 14, 17 (amber on takeaway label + text only) |
| Approved constraint: Single first-visit tooltip | ✅ Task 13 |
| Approved constraint: Analytics in Phase 1 | ✅ Task 5 is Phase 1 |
| Auth → Phase 3 | ✅ Tasks 12 ordered after Tasks 1–11 |

### Type consistency check

| Type/function | Defined in | Used in |
|---|---|---|
| `Signal` | `lib/types.ts` Task 1 | Tasks 6, 7, 14, 15, 16, 17 |
| `UserPlan` | `lib/types.ts` Task 1 | `lib/useUserPlan.ts` Task 12 |
| `computeScore()` | `lib/scoring.ts` Task 4 | `scripts/fetch-news.mjs` Task 6 (inlined) |
| `computeNovelty()` | `lib/jaccard.ts` Task 2 | `lib/scoring.ts` Task 4 |
| `generateTags()` | `lib/tags.ts` Task 3 | `scripts/fetch-news.mjs` Task 6 (inlined) |
| `trackSignalSaved()` | `lib/analytics.ts` Task 5 | `Zone1Signal.tsx` Task 14 |
| `trackSignalDismissed()` | `lib/analytics.ts` Task 5 | `Zone1Signal.tsx` Task 14 |
| `trackUpgradeClicked()` | `lib/analytics.ts` Task 5 | Tasks 16, 17, 18 |
| `useUserPlan()` | `lib/useUserPlan.ts` Task 12 | Tasks 14, 16, 17 |
| `getCached()` / `setCached()` | `lib/summaryCache.ts` Task 8 | `scripts/process-signals.mjs` Task 10 (inlined) |
| `Zone1Signal` | `components/Zone1Signal.tsx` Task 14 | `app/page.tsx` Task 16 |
| `Zone2Card` | `components/Zone2Card.tsx` Task 15 | `app/page.tsx` Task 16 |
| `FirstVisitTooltip` | `components/FirstVisitTooltip.tsx` Task 13 | `app/page.tsx` Task 16 |
| `Providers` | `app/providers.tsx` Task 5 | `app/layout.tsx` Task 5 |
