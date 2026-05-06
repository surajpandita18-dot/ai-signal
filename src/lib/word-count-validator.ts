// Runtime word-count validator for V11 article fields.
// Validates extended_data and top-level editorial fields against V11 caps.
// Source: .claude/intelligence/phase-2-prompt-fixes.md + 5 post-dry-run adjustments.

import type { ExtendedData } from './types/extended-data'
import type { StoryStats } from '../../db/types/database'

// ─── Caps table — V11 word counts (soft target / hard cap) ──────────────────

const CAPS: Record<string, { soft: number; hard: number }> = {
  headline:              { soft: 12, hard: 14 },
  summary:               { soft: 25, hard: 38 },
  signal_block_body:     { soft: 36, hard: 48 },
  block_2_prose:         { soft: 38, hard: 50 },
  pull_quote:            { soft: 20, hard: 24 },
  counter_view:          { soft: 53, hard: 62 },
  broadcast_phrase:      { soft: 10, hard: 16 },
  numbers_headline:      { soft:  5, hard:  8 },
  matters_headline:      { soft:  6, hard:  8 },
  ticker_label:          { soft:  5, hard:  6 },
  ticker_detail:         { soft:  5, hard:  7 },
  stat_label:            { soft:  2, hard:  3 },
  stat_detail:           { soft:  7, hard: 10 },
  insight_text:          { soft: 12, hard: 17 },
  cascade_subtitle:      { soft: 10, hard: 12 },
  cascade_step:          { soft:  9, hard: 11 },
  stakeholder_subtitle:  { soft: 10, hard: 14 },
  stakeholder_who:       { soft:  4, hard:  8 },
  stakeholder_why:       { soft: 14, hard: 22 },
  decision_question:     { soft:  9, hard: 12 },
  decision_verdict_text: { soft:  3, hard:  5 },
  action_body:           { soft: 23, hard: 31 },
  reaction_quote:        { soft: 17, hard: 22 },
  reaction_attribution:  { soft:  9, hard: 12 },
  did_you_know_fact:     { soft: 17, hard: 28 },
}

// ─── Public interfaces ───────────────────────────────────────────────────────

export interface WcViolation {
  field: string      // e.g. "cascade_step[2]"
  words: number      // actual word count
  soft: number       // soft target
  hard: number       // hard cap
  severity: 'SOFT' | 'HARD'
  excerpt: string    // first 60 chars of offending text (for log readability)
}

export interface ValidationReport {
  pass: boolean      // true when no HARD violations
  hard_violations: WcViolation[]
  soft_violations: WcViolation[]
  all_violations: WcViolation[]
}

// Minimal signal shape this validator needs — avoids circular imports with generate-signal.ts
export interface WcSignalInput {
  headline?: string
  summary?: string
  why_it_matters?: string
  pull_quote?: string
  counter_view?: string
  broadcast_phrases?: string[]
  stats?: StoryStats[]
  action_items?: string[]
  extended_data?: ExtendedData
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text
    .replace(/\*\*/g, '')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0).length
}

function check(
  violations: WcViolation[],
  field: string,
  text: string,
  capKey: string = field,
): void {
  const cap = CAPS[capKey]
  if (!cap) return
  const words = countWords(text)
  if (words <= cap.soft) return
  violations.push({
    field,
    words,
    soft: cap.soft,
    hard: cap.hard,
    severity: words > cap.hard ? 'HARD' : 'SOFT',
    excerpt: text.slice(0, 60),
  })
}

function buildReport(violations: WcViolation[]): ValidationReport {
  const hard = violations.filter(v => v.severity === 'HARD')
  const soft = violations.filter(v => v.severity === 'SOFT')
  return {
    pass: hard.length === 0,
    hard_violations: hard,
    soft_violations: soft,
    all_violations: violations,
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function validateWordCounts(signal: WcSignalInput): ValidationReport {
  const violations: WcViolation[] = []

  // Top-level editorial fields
  if (signal.headline) check(violations, 'headline', signal.headline)
  if (signal.summary)  check(violations, 'summary',  signal.summary)

  // why_it_matters splits on double-newline:
  //   para 0 → signal_block_body (the lede paragraph inside .signal-block)
  //   para 1 → block_2_prose (second prose paragraph in "Why it matters")
  if (signal.why_it_matters) {
    const paras = signal.why_it_matters.split(/\n\n+/)
    if (paras[0]) check(violations, 'signal_block_body', paras[0], 'signal_block_body')
    if (paras[1]) check(violations, 'block_2_prose',     paras[1], 'block_2_prose')
  }

  if (signal.pull_quote)   check(violations, 'pull_quote',   signal.pull_quote)
  if (signal.counter_view) check(violations, 'counter_view', signal.counter_view)

  // Broadcast phrases — each phrase checked individually
  signal.broadcast_phrases?.forEach((phrase, i) => {
    check(violations, `broadcast_phrase[${i}]`, phrase, 'broadcast_phrase')
  })

  // Stats — label and detail per card (value/delta not editorial prose)
  signal.stats?.forEach((stat, i) => {
    if (stat.label)  check(violations, `stat_label[${i}]`,  stat.label,  'stat_label')
    if (stat.detail) check(violations, `stat_detail[${i}]`, stat.detail, 'stat_detail')
  })

  // Action items — body text only (Run/Flag/Check labels are hardcoded in StoryArticle.tsx)
  signal.action_items?.forEach((action, i) => {
    check(violations, `action_body[${i}]`, action, 'action_body')
  })

  const ed = signal.extended_data
  if (!ed) return buildReport(violations)

  // Headline fields
  if (ed.numbers_headline) check(violations, 'numbers_headline', ed.numbers_headline)
  if (ed.matters_headline) check(violations, 'matters_headline', ed.matters_headline)

  // Tickers
  ed.tickers?.forEach((t, i) => {
    if (t.label)  check(violations, `ticker_label[${i}]`,  t.label,  'ticker_label')
    if (t.detail) check(violations, `ticker_detail[${i}]`, t.detail, 'ticker_detail')
  })

  // Insights strip
  ed.insights_strip?.forEach((cell, i) => {
    if (cell.text) check(violations, `insight_text[${i}]`, cell.text, 'insight_text')
  })

  // Cascade timeline
  if (ed.cascade) {
    if (ed.cascade.subtitle) {
      check(violations, 'cascade_subtitle', ed.cascade.subtitle)
    }
    ed.cascade.steps?.forEach((step, i) => {
      if (step.event) check(violations, `cascade_step[${i}]`, step.event, 'cascade_step')
    })
  }

  // Stakeholders grid
  if (ed.stakeholders) {
    if (ed.stakeholders.subtitle) {
      check(violations, 'stakeholder_subtitle', ed.stakeholders.subtitle, 'stakeholder_subtitle')
    }
    ed.stakeholders.cells?.forEach((cell, i) => {
      if (cell.who) check(violations, `stakeholder_who[${i}]`, cell.who, 'stakeholder_who')
      if (cell.why) check(violations, `stakeholder_why[${i}]`, cell.why, 'stakeholder_why')
    })
  }

  // Decision aid
  if (ed.decision_aid) {
    ed.decision_aid.rows?.forEach((row, i) => {
      if (row.question)    check(violations, `decision_question[${i}]`,     row.question,    'decision_question')
      if (row.verdict_text) check(violations, `decision_verdict_text[${i}]`, row.verdict_text, 'decision_verdict_text')
    })
  }

  // Reactions — quote + combined attribution (name · role matches component rendering)
  ed.reactions?.forEach((reaction, i) => {
    if (reaction.quote) check(violations, `reaction_quote[${i}]`, reaction.quote, 'reaction_quote')
    const attribution = `${reaction.name} · ${reaction.role}`
    check(violations, `reaction_attribution[${i}]`, attribution, 'reaction_attribution')
  })

  // Did you know facts
  ed.did_you_know_facts?.forEach((fact, i) => {
    if (fact.text) check(violations, `did_you_know_fact[${i}]`, fact.text, 'did_you_know_fact')
  })

  return buildReport(violations)
}
