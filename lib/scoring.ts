// lib/scoring.ts

import { computeNovelty } from "./jaccard";
import type { ImpactLevel } from "./types";

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

function competitiveThreat(title: string, authority: number): number {
  const t = title.toLowerCase();
  let raw = 0;
  raw += OBSOLESCENCE_KW.filter((kw) => t.includes(kw)).length * 0.3;
  raw += CAPABILITY_JUMP_KW.filter((kw) => t.includes(kw)).length * 0.25;
  raw += MARKET_DISPLACEMENT_KW.filter((kw) => t.includes(kw)).length * 0.2;
  raw = Math.min(raw, 1.0);

  // Confidence modifier: low-authority source claims discounted
  if (authority < 0.7 && raw > 0) {
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
  if (isNaN(published)) return 0.05; // treat unparseable dates as oldest bucket
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
