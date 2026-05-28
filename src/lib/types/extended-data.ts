// V11 universal article structure — extended data types for 11 new sections

/** One-breath summary for the TL;DR strip (between author row and signal block) */
export type OneBreath = { text: string };

/** Three hero-zone live data tickers */
export type TickerData = {
  label: string;
  value: string;
  change: { direction: 'up' | 'down' | 'flat'; text: string };
  detail: string;
};

/** Three "what's inside today" preview cards in hero zone */
export type PreviewCard = {
  index: '01' | '02' | '03';
  label: 'By the numbers' | 'Why it matters' | 'The move' | 'The fact';
  value: string;
};

export type ComparisonRow = {
  label: string;
  value: string;
  width_pct: number;
  fill_color: 'signal' | 'warm' | 'mute';
  opacity?: number;
};

export type TrajectoryPoint = { date: string; value: number; label?: string };

export type CapFlowNode = { from: string; to: string; amount: string };

export type QuoteCallout = { quote: string; attribution: string };

/** Primary article infographic — type determines data shape */
export type ComparisonChart = {
  type: 'comparison' | 'trajectory' | 'cap_flow' | 'quote_callout';
  title: string;
  subtitle: string;
  data: ComparisonRow[] | TrajectoryPoint[] | CapFlowNode[] | QuoteCallout;
};

/** One cell in the 3-column insights strip */
export type InsightCell = {
  icon: '→' | '◐' | '⚡';
  label: 'What changed' | "Who's affected" | 'Move by';
  text: string;
};

/** One step in the 4-step cascade timeline */
export type CascadeStep = { marker: number; week: string; event: string };

/** 4-step forecast or history timeline */
export type CascadeData = {
  direction: 'forecast' | 'history';
  title: string;
  subtitle: string;
  steps: CascadeStep[];
};

/** One cell in the stakeholder 2x2 grid */
export type StakeholderCell = {
  type:
    | 'win'
    | 'lose'
    | 'evidence_strong'
    | 'evidence_weak'
    | 'open_question'
    | 'before'
    | 'after';
  who: string;
  why: string;
};

/** Stakeholder impact grid — frame determines layout */
export type StakeholdersData = {
  frame: 'win_lose' | 'evidence_grid' | 'before_after';
  title: string;
  subtitle: string;
  cells: StakeholderCell[];
};

/** One row in the decision aid flow */
export type DecisionRow = {
  q_num: string;
  question: string;
  verdict: 'go' | 'wait' | 'no' | 'segment_a' | 'segment_b' | 'segment_c';
  verdict_text: string;
};

/** 3-question decision aid with final verdict */
export type DecisionAid = {
  frame: 'yes_no' | 'segment_impact';
  title: string;
  question: string;
  rows: DecisionRow[];
  final_verdict: string;
};

/** Industry voice reaction quote */
export type Reaction = { quote: string; name: string; role: string };

/** Notebook "Did you know?" rotating fact */
export type DidYouKnowFact = {
  category: 'numbers' | 'trivia' | 'industry';
  text: string;
};

/** Pre-formatted standup messages for 4 platforms */
export type StandupMessages = {
  slack: string;
  email: string;
  whatsapp: string;
  linkedin: string;
};

/** One envelope in the "Tomorrow, probably" sidebar stack */
export type TomorrowDraft = {
  day: 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'MON';
  date: string;
  text: string;
  status: 'lead_candidate' | 'sealed';
  status_detail?: string;
};

/** The one unresolved question that changes everything about this story */
export type OpenQuestion = { text: string };

/** What a tool replaces vs. what it doesn't yet (tools category only) */
export type ReplacesData = { yes: string; not_yet: string };

/** How close research is to real-world deployment (research category only) */
export type ReadinessLevel = 'lab' | 'paper' | 'prototype' | 'product' | 'deployed';

/**
 * End-of-article bonus section.
 * type="prompt"  — models/tools: a copy-paste prompt related to today's story
 * type="quote"   — business/policy: sharp quote from a founder/thinker + why it applies today
 * type="fact"    — research: a surprising related fact that puts the research in context
 */
export type SignalBoost = {
  type: 'prompt' | 'quote' | 'fact'
  title: string         // e.g. "Try this prompt" / "Worth remembering" / "Puts it in context"
  content: string       // the prompt text / quote / fact
  attribution?: string  // for quotes only: "Sam Altman · OpenAI CEO"
  cta_text?: string     // optional: "Copy into ChatGPT →"
}

/** Extended data for V11 universal article structure — 13 sections stored as jsonb */
export type ExtendedData = {
  numbers_headline?: string;  // AI-generated block title for "By the numbers"
  matters_headline?: string;  // AI-generated block title for "Why it matters"
  one_breath?: OneBreath;     // 18-24 word punchy opener sentence
  tickers: TickerData[];
  preview_cards: PreviewCard[];
  did_you_know_facts: DidYouKnowFact[];
  primary_chart: ComparisonChart;
  insights_strip: InsightCell[];
  cascade: CascadeData;
  stakeholders: StakeholdersData;
  decision_aid: DecisionAid;
  reactions: Reaction[];
  standup_messages: StandupMessages;
  tomorrow_drafts: TomorrowDraft[];
  open_question?: string;
  replaces?: ReplacesData;
  readiness_level?: ReadinessLevel;
  signal_boost?: SignalBoost;
  suraj_note?: string;
};
