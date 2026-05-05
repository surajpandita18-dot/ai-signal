import type { GeneratedSignal } from './journalist-agent'
import type { ExtendedData } from './types/extended-data'

export interface ValidationResult {
  pass: boolean
  violations: Violation[]
}

export interface Violation {
  field: string
  type: 'BOLD_COUNT' | 'FORBIDDEN_STAT' | 'PRESS_RELEASE' |
        'GENERIC_INDIA' | 'LENGTH_BLOAT' | 'COUNTER_LABEL' |
        'ACTION_ITEM_TOO_LONG' | 'ACTION_ITEM_NO_BOLD_VERB' | 'STATS_COUNT_WRONG' |
        'WHY_IT_MATTERS_SINGLE_PARA' | 'EDITORIAL_TAKE_MISSING' | 'BROADCAST_PHRASES_INVALID' |
        'PULL_QUOTE_REQUIRED' | 'EXTENDED_DATA_SHAPE_INVALID'
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
  why_it_matters: 80,
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

const VALID_CHART_TYPES = ['comparison', 'trajectory', 'cap_flow', 'quote_callout']
const VALID_CASCADE_DIRECTIONS = ['forecast', 'history']
const VALID_STAKEHOLDER_FRAMES = ['win_lose', 'evidence_grid', 'before_after']
const VALID_DECISION_AID_FRAMES = ['yes_no', 'segment_impact']
const VALID_PREVIEW_LABELS = ['By the numbers', 'Why it matters', 'The move', 'The fact']
const VALID_FACT_CATEGORIES = ['numbers', 'trivia', 'industry']
const VALID_INSIGHT_ICONS = ['→', '◐', '⚡']
const STANDUP_PLATFORMS = ['slack', 'email', 'whatsapp', 'linkedin']

function asObj(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as Record<string, unknown>
}

export function validateExtendedData(data: unknown): ValidationResult {
  const violations: Violation[] = []

  if (data === null || data === undefined) {
    return { pass: true, violations: [] }
  }

  const d = asObj(data)
  if (!d) {
    violations.push({ field: 'extended_data', type: 'EXTENDED_DATA_SHAPE_INVALID', message: 'extended_data is not an object' })
    return { pass: false, violations }
  }

  // tickers: exactly 3, each must have label/value/delta/detail
  const tickers = d['tickers']
  if (!Array.isArray(tickers) || tickers.length !== 3) {
    violations.push({ field: 'extended_data.tickers', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `tickers must be exactly 3, got ${Array.isArray(tickers) ? tickers.length : 'non-array'}` })
  } else {
    tickers.forEach((t, i) => {
      const obj = asObj(t)
      if (!obj) { violations.push({ field: `extended_data.tickers[${i}]`, type: 'EXTENDED_DATA_SHAPE_INVALID', message: `tickers[${i}] is not an object` }); return }
      const missing = ['label', 'value', 'detail'].filter(k => !obj[k])
      if (!asObj(obj['delta'])) missing.push('delta')
      if (missing.length > 0) violations.push({ field: `extended_data.tickers[${i}]`, type: 'EXTENDED_DATA_SHAPE_INVALID', message: `tickers[${i}] missing required fields: ${missing.join(', ')}` })
    })
  }

  // preview_cards: exactly 3, label must match enum
  const cards = d['preview_cards']
  if (!Array.isArray(cards) || cards.length !== 3) {
    violations.push({ field: 'extended_data.preview_cards', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `preview_cards must be exactly 3, got ${Array.isArray(cards) ? cards.length : 'non-array'}` })
  } else {
    cards.forEach((c, i) => {
      const obj = asObj(c)
      const label = typeof obj?.['label'] === 'string' ? obj['label'] : undefined
      if (!label || !VALID_PREVIEW_LABELS.includes(label)) {
        violations.push({ field: `extended_data.preview_cards[${i}]`, type: 'EXTENDED_DATA_SHAPE_INVALID', message: `preview_cards[${i}].label "${label ?? 'missing'}" is not valid. Must be one of: ${VALID_PREVIEW_LABELS.join(', ')}`, current: label })
      }
    })
  }

  // did_you_know_facts: 8-12 items, category must match enum
  const facts = d['did_you_know_facts']
  if (!Array.isArray(facts) || facts.length < 8 || facts.length > 12) {
    violations.push({ field: 'extended_data.did_you_know_facts', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `did_you_know_facts must be 8–12 items, got ${Array.isArray(facts) ? facts.length : 'non-array'}` })
  } else {
    facts.forEach((f, i) => {
      const obj = asObj(f)
      const cat = typeof obj?.['category'] === 'string' ? obj['category'] : undefined
      if (!cat || !VALID_FACT_CATEGORIES.includes(cat)) {
        violations.push({ field: `extended_data.did_you_know_facts[${i}]`, type: 'EXTENDED_DATA_SHAPE_INVALID', message: `did_you_know_facts[${i}].category "${cat ?? 'missing'}" is not valid. Must be: numbers, trivia, or industry` })
      }
    })
  }

  // primary_chart: type must be valid enum, data must be non-empty
  const chart = asObj(d['primary_chart'])
  const chartType = typeof chart?.['type'] === 'string' ? chart['type'] : undefined
  if (!chart || !chartType || !VALID_CHART_TYPES.includes(chartType)) {
    violations.push({ field: 'extended_data.primary_chart', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `primary_chart.type must be one of: ${VALID_CHART_TYPES.join(', ')}. Got: ${chartType ?? 'missing'}`, current: chartType })
  } else if (Array.isArray(chart['data']) && (chart['data'] as unknown[]).length === 0) {
    violations.push({ field: 'extended_data.primary_chart', type: 'EXTENDED_DATA_SHAPE_INVALID', message: 'primary_chart.data is empty. Use type "quote_callout" with an editorial pull quote when no chart data exists.' })
  }

  // insights_strip: exactly 3, icon must match enum
  const strip = d['insights_strip']
  if (!Array.isArray(strip) || strip.length !== 3) {
    violations.push({ field: 'extended_data.insights_strip', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `insights_strip must be exactly 3, got ${Array.isArray(strip) ? strip.length : 'non-array'}` })
  } else {
    strip.forEach((cell, i) => {
      const obj = asObj(cell)
      const icon = typeof obj?.['icon'] === 'string' ? obj['icon'] : undefined
      if (!icon || !VALID_INSIGHT_ICONS.includes(icon)) {
        violations.push({ field: `extended_data.insights_strip[${i}]`, type: 'EXTENDED_DATA_SHAPE_INVALID', message: `insights_strip[${i}].icon "${icon ?? 'missing'}" is not valid. Must be one of: → ◐ ⚡` })
      }
    })
  }

  // cascade: direction enum, steps must be exactly 4
  const cascade = asObj(d['cascade'])
  const cascadeDir = typeof cascade?.['direction'] === 'string' ? cascade['direction'] : undefined
  if (!cascade || !cascadeDir || !VALID_CASCADE_DIRECTIONS.includes(cascadeDir)) {
    violations.push({ field: 'extended_data.cascade', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `cascade.direction must be "forecast" or "history", got: ${cascadeDir ?? 'missing'}` })
  }
  const cascadeSteps = cascade?.['steps']
  if (!Array.isArray(cascadeSteps) || cascadeSteps.length !== 4) {
    violations.push({ field: 'extended_data.cascade.steps', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `cascade.steps must be exactly 4, got ${Array.isArray(cascadeSteps) ? cascadeSteps.length : 'non-array'}` })
  }

  // stakeholders: frame enum, cells must be exactly 4
  const stakeholders = asObj(d['stakeholders'])
  const stakeholderFrame = typeof stakeholders?.['frame'] === 'string' ? stakeholders['frame'] : undefined
  if (!stakeholders || !stakeholderFrame || !VALID_STAKEHOLDER_FRAMES.includes(stakeholderFrame)) {
    violations.push({ field: 'extended_data.stakeholders', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `stakeholders.frame must be one of: ${VALID_STAKEHOLDER_FRAMES.join(', ')}. Got: ${stakeholderFrame ?? 'missing'}` })
  }
  const stakeholderCells = stakeholders?.['cells']
  if (!Array.isArray(stakeholderCells) || stakeholderCells.length !== 4) {
    violations.push({ field: 'extended_data.stakeholders.cells', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `stakeholders.cells must be exactly 4, got ${Array.isArray(stakeholderCells) ? stakeholderCells.length : 'non-array'}` })
  }

  // decision_aid: frame enum, rows must be exactly 3
  const aid = asObj(d['decision_aid'])
  const aidFrame = typeof aid?.['frame'] === 'string' ? aid['frame'] : undefined
  if (!aid || !aidFrame || !VALID_DECISION_AID_FRAMES.includes(aidFrame)) {
    violations.push({ field: 'extended_data.decision_aid', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `decision_aid.frame must be "yes_no" or "segment_impact", got: ${aidFrame ?? 'missing'}` })
  }
  const aidRows = aid?.['rows']
  if (!Array.isArray(aidRows) || aidRows.length !== 3) {
    violations.push({ field: 'extended_data.decision_aid.rows', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `decision_aid.rows must be exactly 3, got ${Array.isArray(aidRows) ? aidRows.length : 'non-array'}` })
  }

  // reactions: exactly 3
  const reactions = d['reactions']
  if (!Array.isArray(reactions) || reactions.length !== 3) {
    violations.push({ field: 'extended_data.reactions', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `reactions must be exactly 3, got ${Array.isArray(reactions) ? reactions.length : 'non-array'}` })
  }

  // standup_messages: all 4 platform keys must be present and non-empty
  const sm = asObj(d['standup_messages'])
  if (!sm) {
    violations.push({ field: 'extended_data.standup_messages', type: 'EXTENDED_DATA_SHAPE_INVALID', message: 'standup_messages is missing or not an object' })
  } else {
    const missing = STANDUP_PLATFORMS.filter(p => !sm[p])
    if (missing.length > 0) {
      violations.push({ field: 'extended_data.standup_messages', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `standup_messages missing or empty platforms: ${missing.join(', ')}` })
    }
  }

  // tomorrow_drafts: exactly 3
  const drafts = d['tomorrow_drafts']
  if (!Array.isArray(drafts) || drafts.length !== 3) {
    violations.push({ field: 'extended_data.tomorrow_drafts', type: 'EXTENDED_DATA_SHAPE_INVALID', message: `tomorrow_drafts must be exactly 3, got ${Array.isArray(drafts) ? drafts.length : 'non-array'}` })
  }

  return { pass: violations.length === 0, violations }
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

  // Check 11: why_it_matters must have 2-3 paragraphs split on \n\n
  if (signal.why_it_matters && typeof signal.why_it_matters === 'string') {
    const paragraphs = signal.why_it_matters
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
    if (paragraphs.length < 2) {
      violations.push({
        field: 'why_it_matters',
        type: 'WHY_IT_MATTERS_SINGLE_PARA',
        message: `why_it_matters has only ${paragraphs.length} paragraph. The component splits on \\n\\n. Single paragraph renders an empty body below the pull quote. Required: 2 paragraphs separated by \\n\\n, each 2 sentences max (~30-40w each). PARA 1: what shifted and why it matters now. PARA 2: the reframe and what it means for decisions tomorrow.`,
        current: signal.why_it_matters.slice(0, 200),
      })
    }
  }

  // Check 11b: pull_quote must be present and at least 5 words
  if (!signal.pull_quote || wordCount(signal.pull_quote) < 5) {
    violations.push({
      field: 'pull_quote',
      type: 'PULL_QUOTE_REQUIRED',
      message: `pull_quote is missing or too short. Write one killer editorial sentence under 25 words — opinion not recap. It renders between the two why_it_matters paragraphs in the design.`,
      current: signal.pull_quote ?? '',
    })
  }

  // Check 12: editorial_take must be present and at least 5 words
  if (!signal.editorial_take || wordCount(signal.editorial_take) < 5) {
    violations.push({
      field: 'editorial_take',
      type: 'EDITORIAL_TAKE_MISSING',
      message: `editorial_take is missing or too short. Write one sharp tweetable sentence as AI Signal Editorial — opinion not recap, min 5 words.`,
      current: signal.editorial_take ?? '',
    })
  }

  // Check 13: broadcast_phrases must be exactly 3, each 6-14 words,
  // each starting with anchor (number, currency, or capital letter)
  if (!Array.isArray(signal.broadcast_phrases) || signal.broadcast_phrases.length !== 3) {
    violations.push({
      field: 'broadcast_phrases',
      type: 'BROADCAST_PHRASES_INVALID',
      message: `broadcast_phrases must be exactly 3 phrases, got ${
        Array.isArray(signal.broadcast_phrases) ? signal.broadcast_phrases.length : 0
      }`,
    })
  } else {
    signal.broadcast_phrases.forEach((phrase, i) => {
      if (typeof phrase !== 'string') return
      const words = wordCount(phrase)
      if (words < 6 || words > 14) {
        violations.push({
          field: 'broadcast_phrases',
          type: 'BROADCAST_PHRASES_INVALID',
          message: `broadcast_phrases[${i}] must be 6-14 words, got ${words}: "${phrase.slice(0, 80)}"`,
        })
      }
      const startsWithAnchor = /^(Today's signal:\s+)?[A-Z0-9$₹]/.test(phrase.trim())
      if (!startsWithAnchor) {
        violations.push({
          field: 'broadcast_phrases',
          type: 'BROADCAST_PHRASES_INVALID',
          message: `broadcast_phrases[${i}] must start with a number, currency, or named entity (capital letter). Generic openers not allowed.`,
        })
      }
    })
  }

  // Check 14: extended_data — soft-fail if missing, hard-fail if present and malformed
  const extData = (signal as unknown as { extended_data?: unknown }).extended_data
  if (extData === undefined || extData === null) {
    console.warn('[validator] extended_data missing — soft-fail during rollout, extended checks skipped')
  } else {
    const extResult = validateExtendedData(extData)
    violations.push(...extResult.violations)
  }

  return {
    pass: violations.length === 0,
    violations,
  }
}
