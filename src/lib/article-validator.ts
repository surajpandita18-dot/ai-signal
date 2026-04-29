import type { GeneratedSignal } from './journalist-agent'

export interface ValidationResult {
  pass: boolean
  violations: Violation[]
}

export interface Violation {
  field: string
  type: 'BOLD_COUNT' | 'FORBIDDEN_STAT' | 'PRESS_RELEASE' |
        'GENERIC_INDIA' | 'LENGTH_BLOAT' | 'COUNTER_LABEL' |
        'ACTION_ITEM_TOO_LONG' | 'ACTION_ITEM_NO_BOLD_VERB' | 'STATS_COUNT_WRONG'
  message: string
  current?: string
}

const FORBIDDEN_STAT_WORDS = [
  'Age', 'Story', 'Window', 'Freshness', 'Confidence',
  'Sources', 'Stale', 'Recency', 'Batch'
]

const PRESS_RELEASE_PATTERNS = [
  /^[A-Z][a-z]+ has (announced|launched|officially)/,
  /now available (on|directly on)/i,
  /enabling (developers|teams|enterprises|users) to/i,
  /deeply embeds/i,
  /dramatically (lowering|reducing|increasing)/i,
  /this represents a significant/i,
  /a major step forward/i,
]

const GENERIC_INDIA_PATTERNS = [
  /\bIndian companies\b/i,
  /\bIndian builders should\b/i,
  /\bthis affects India\b/i,
  /\bIndian users\b/i,
]

const COUNTER_LABEL_PATTERNS = [
  /^(another perspective|the counter view|but consider|on the other hand|however)/i,
  /^there are (also )?(risks|concerns|challenges)/i,
]

const LONG_FORM_FIELDS = [
  'summary', 'why_it_matters', 'lens_pm', 'lens_founder',
  'lens_builder', 'counter_view'
] as const

const MIN_BOLD_PER_FIELD: Record<string, number> = {
  summary: 2,
  why_it_matters: 3,
  lens_pm: 1,
  lens_founder: 1,
  lens_builder: 1,
  counter_view: 1,
}

const MAX_WORD_COUNT: Record<string, number> = {
  summary: 45,
  why_it_matters: 60,
  lens_pm: 60,
  lens_founder: 60,
  lens_builder: 60,
}

const ACTION_ITEM_MAX_WORDS = 22

function countBold(text: string): number {
  const matches = text.match(/\*\*[^*]+\*\*/g)
  return matches ? matches.length : 0
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

export function validateArticle(signal: GeneratedSignal): ValidationResult {
  const violations: Violation[] = []

  // Check 1: Bold count in long-form fields
  for (const field of LONG_FORM_FIELDS) {
    const text = signal[field] as string | undefined
    if (!text) continue
    const count = countBold(text)
    const required = MIN_BOLD_PER_FIELD[field]
    if (count < required) {
      violations.push({
        field,
        type: 'BOLD_COUNT',
        message: `${field} has ${count} bold instance(s), needs ${required}+. Add **bold** to numbers, named entities, or key insight phrases.`,
        current: text,
      })
    }
  }

  // Check 2: Forbidden stat labels
  if (signal.stats && signal.stats.length > 0) {
    for (const stat of signal.stats) {
      const hasForbiddenWord = FORBIDDEN_STAT_WORDS.some(w =>
        stat.label.toLowerCase().includes(w.toLowerCase())
      )
      if (hasForbiddenWord) {
        violations.push({
          field: 'stats',
          type: 'FORBIDDEN_STAT',
          message: `stat "${stat.label}" contains a forbidden meta-data word. Story metadata is never a stat — remove it.`,
          current: stat.label,
        })
      }
    }
  }

  // Check 3: Press-release lede in summary
  if (signal.summary) {
    for (const pattern of PRESS_RELEASE_PATTERNS) {
      if (pattern.test(signal.summary)) {
        violations.push({
          field: 'summary',
          type: 'PRESS_RELEASE',
          message: 'summary uses a press-release pattern. Rewrite implication-first using one of the 4 story-type templates.',
          current: signal.summary.slice(0, 200),
        })
        break
      }
    }
  }

  // Check 4: Generic India references in long-form fields
  for (const field of LONG_FORM_FIELDS) {
    const text = signal[field] as string | undefined
    if (!text) continue
    for (const pattern of GENERIC_INDIA_PATTERNS) {
      if (pattern.test(text)) {
        violations.push({
          field,
          type: 'GENERIC_INDIA',
          message: `${field} uses a generic India phrase. Name a specific category: Indian SaaS teams / Bengaluru pre-A / Indian BFSI compliance / Indian enterprise procurement.`,
          current: text.slice(0, 150),
        })
        break
      }
    }
  }

  // Check 5: Length bloat
  for (const field of Object.keys(MAX_WORD_COUNT)) {
    const text = signal[field as keyof GeneratedSignal] as string | undefined
    if (!text) continue
    const words = wordCount(text)
    const max = MAX_WORD_COUNT[field]
    if (words > max) {
      violations.push({
        field,
        type: 'LENGTH_BLOAT',
        message: `${field} has ${words} words (max ${max}). Cut to one idea per sentence.`,
        current: text,
      })
    }
  }

  // Check 6: Counter-view headline is a label, not a claim
  if (signal.counter_view_headline) {
    for (const pattern of COUNTER_LABEL_PATTERNS) {
      if (pattern.test(signal.counter_view_headline)) {
        violations.push({
          field: 'counter_view_headline',
          type: 'COUNTER_LABEL',
          message: 'counter_view_headline is a label, not a claim. Rewrite as a declarative claim that rebuts the signal.',
          current: signal.counter_view_headline,
        })
        break
      }
    }
  }

  // Check 7: Stats must be exactly 3 or empty
  if (signal.stats && signal.stats.length > 0 && signal.stats.length !== 3) {
    violations.push({
      field: 'stats',
      type: 'STATS_COUNT_WRONG',
      message: `stats has ${signal.stats.length} entries. Must be exactly 3 (visual grid symmetry) or [] (empty). 2 stats look broken in the 3-card layout.`,
    })
  }

  // Check 8: Action item word length
  if (signal.action_items && signal.action_items.length > 0) {
    for (let i = 0; i < signal.action_items.length; i++) {
      const item = signal.action_items[i]
      if (typeof item !== 'string') continue
      const words = wordCount(item)
      if (words > ACTION_ITEM_MAX_WORDS) {
        violations.push({
          field: 'action_items',
          type: 'ACTION_ITEM_TOO_LONG',
          message: `action_items[${i}] has ${words} words (max ${ACTION_ITEM_MAX_WORDS}). Cut conditional setup. Trust the reader.`,
          current: item.slice(0, 120),
        })
      }
    }
  }

  // Check 9: Action items must start with **bold action verb**
  if (signal.action_items && signal.action_items.length > 0) {
    for (let i = 0; i < signal.action_items.length; i++) {
      const action = signal.action_items[i]
      if (typeof action !== 'string') continue
      if (!/^\*\*[^*]+\*\*/.test(action.trim())) {
        violations.push({
          field: 'action_items',
          type: 'ACTION_ITEM_NO_BOLD_VERB',
          message: `action_items[${i}] must start with **bold action verb**. e.g., '**Re-run your unit economics** on...'`,
          current: action.slice(0, 100),
        })
      }
    }
  }

  return {
    pass: violations.length === 0,
    violations,
  }
}
