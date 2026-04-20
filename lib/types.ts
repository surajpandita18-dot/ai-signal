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
