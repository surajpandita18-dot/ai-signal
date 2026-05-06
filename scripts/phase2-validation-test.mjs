/**
 * Phase 2 word-count validation test — Layer 3 of Mission 3
 *
 * Runs 3 article types through the production system prompt and validates
 * each output against the V11 word-count caps (same logic as word-count-validator.ts).
 *
 * Usage:
 *   node scripts/phase2-validation-test.mjs
 *
 * Output:
 *   .claude/intelligence/phase-2-test-results/{type}-validation.json
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// ── Load API key from .env.local ─────────────────────────────────────────────

const envRaw = readFileSync(join(ROOT, '.env.local'), 'utf-8')
const keyLine = envRaw.split('\n').find(l => l.startsWith('ANTHROPIC_API_KEY='))
if (!keyLine) throw new Error('ANTHROPIC_API_KEY not found in .env.local')
const apiKey = keyLine.slice('ANTHROPIC_API_KEY='.length).trim()
const client = new Anthropic({ apiKey })

// ── Extract constants from source files ──────────────────────────────────────

function extractTemplateLiteral(fileSrc, exportName) {
  const marker = `export const ${exportName} = \``
  const start = fileSrc.indexOf(marker)
  if (start === -1) throw new Error(`${exportName} not found in source`)
  const contentStart = start + marker.length
  // Find the closing backtick — look for "`\n" after a newline (on its own line or followed by \n\n)
  let pos = contentStart
  while (pos < fileSrc.length) {
    const tick = fileSrc.indexOf('`', pos)
    if (tick === -1) throw new Error(`No closing backtick for ${exportName}`)
    // Accept if the character after the backtick is \n or end-of-string
    const after = fileSrc[tick + 1]
    if (after === '\n' || after === undefined || after === '\r') {
      return fileSrc.slice(contentStart, tick)
    }
    pos = tick + 1
  }
  throw new Error(`Could not find closing backtick for ${exportName}`)
}

const jaSrc = readFileSync(join(ROOT, 'src/lib/journalist-agent.ts'), 'utf-8')
const QUALITY_RULES = extractTemplateLiteral(jaSrc, 'QUALITY_RULES')
const SELF_CHECK_QUESTIONS = extractTemplateLiteral(jaSrc, 'SELF_CHECK_QUESTIONS')

// ── System prompt (mirrors generate-signal.ts) ───────────────────────────────

const SYSTEM_PROMPT = `You are the editor of AI Signal — a daily single-story newsletter for senior PMs, founders, and engineers in the Indian tech ecosystem. Published at 06:14 IST. One pick. The story that matters most today.

Your job:
1. Pick the single most impactful story — prioritise: model releases, pricing changes, capability leaps, funding/acquisition, regulatory moves.
2. Write the full signal as JSON.
3. Document your editorial decision in pick_reason and rejected_alternatives.

${QUALITY_RULES}

Return ONLY valid JSON. No markdown fences. No explanation before or after.

{
  "category": "models"|"tools"|"business"|"policy"|"research",
  "headline": "Main article title. Sharp, verb-led, punchy. Target: 12 words. Hard cap: 14 words. No clickbait.",
  "summary": "TL;DR strip body. Two dense sentences: what happened + the forced action. Target: 25 words. Hard cap: 38 words.",
  "why_it_matters": "Two distinct paragraphs separated by \\n\\n. PARA 1: Target: 32 words. Hard cap: 38 words. PARA 2: Target: 38 words. Hard cap: 46 words. Bold key phrases with **double asterisks** in both paragraphs.",
  "pull_quote": "One killer editorial sentence — opinion not recap. Target: 20 words. Hard cap: 24 words. Wrap 1-3 key words in **bold**. Must not be null.",
  "lens_pm": "1-2 sentences for a PM.",
  "lens_founder": "1-2 sentences for a founder.",
  "lens_builder": "1-2 sentences for an engineer/builder.",
  "stats": [
    "MANDATORY for PRODUCT-PRICING, FUNDING, POLICY-REGULATION, RESEARCH-BENCHMARK. Each stat: label (hard cap 3w), value, delta (or null), detail (hard cap 10w)."
  ],
  "action_items": ["Action body. Target: 20-26 words. Hard cap: 31 words."],
  "counter_view": "Devil's advocate body. Target: 53 words. Hard cap: 62 words.",
  "counter_view_headline": "5-7 words",
  "sources": [{ "label": "Source name", "url": "full URL" }],
  "read_minutes": 4,
  "deeper_read": "URL",
  "editorial_take": "One sharp tweetable sentence.",
  "broadcast_phrases": [
    "LAYER 2 — exactly 3 Type A editorial phrases. Target: 6-12 words each. Hard cap: 16 words. DO NOT generate counter-style or backstory-style phrases.",
    "Phrase 2",
    "Phrase 3"
  ],
  "pick_reason": "1-2 sentence editorial reason.",
  "rejected_alternatives": [{"title": "Verbatim candidate title", "reason": "1-line reason"}],
  "extended_data": {
    "numbers_headline": "Block-title for 'By the Numbers'. Target: 5 words. Hard cap: 8 words. Specific to this signal — what broke, what was priced, what landed.",
    "matters_headline": "Block-title for 'Why It Matters'. Target: 6 words. Hard cap: 8 words. What the reader must rethink.",
    "tickers": [
      { "label": "Metric name + timeframe. Hard cap 6w.", "value": "Number", "change": { "direction": "down", "text": "↓ trend" }, "detail": "Context line. Hard cap 7w." },
      { "label": "Second metric. Hard cap 6w.", "value": "Number", "change": { "direction": "up", "text": "↑ trend" }, "detail": "Context. Hard cap 7w." },
      { "label": "Third metric. Hard cap 6w.", "value": "Number", "change": { "direction": "flat", "text": "stable" }, "detail": "Context. Hard cap 7w." }
    ],
    "preview_cards": [
      { "index": "01", "label": "By the numbers", "value": "8 words max. One sharp fact with the key number." },
      { "index": "02", "label": "Why it matters", "value": "8 words max. What assumption or dynamic just broke." },
      { "index": "03", "label": "The move", "value": "8 words max. One concrete action, time-boxed." }
    ],
    "did_you_know_facts": [
      "LAYER 6 — produce 8-12 facts. Target: 11-23 words each. Hard cap: 28 words. Stat-first opener. Quirky angle required.",
      { "category": "numbers", "text": "Stat-first fact. 11-23 words. Hard cap 28w." },
      { "category": "industry", "text": "Stat-first industry fact. 11-23 words. Hard cap 28w." },
      { "category": "trivia", "text": "Stat-first historical parallel. 11-23 words. Hard cap 28w." }
    ],
    "primary_chart": {
      "type": "comparison",
      "title": "Chart title",
      "subtitle": "Chart subtitle",
      "data": [
        { "label": "Item A", "value": "$X", "width_pct": 80, "fill_color": "signal" },
        { "label": "Item B", "value": "$Y", "width_pct": 50, "fill_color": "warm" },
        { "label": "Item C", "value": "$Z", "width_pct": 20, "fill_color": "mute" }
      ]
    },
    "insights_strip": [
      { "icon": "→", "label": "What changed", "text": "One sharp sentence. Target: 10-14 words. Hard cap: 17 words." },
      { "icon": "◐", "label": "Who's affected", "text": "One sharp sentence. Target: 10-14 words. Hard cap: 17 words." },
      { "icon": "⚡", "label": "Move by", "text": "One sharp sentence: action + timeframe. Target: 10-14 words. Hard cap: 17 words." }
    ],
    "cascade": {
      "direction": "forecast",
      "title": "What happens next",
      "subtitle": "Cascade subtitle. Target: 10 words. Hard cap: 12 words.",
      "steps": [
        { "marker": 1, "week": "This week", "event": "Declarative sentence. Target: 8-9 words. Hard cap: 11 words." },
        { "marker": 2, "week": "Week 2", "event": "8-9 words. Hard cap: 11 words." },
        { "marker": 3, "week": "Week 3", "event": "8-9 words. Hard cap: 11 words." },
        { "marker": 4, "week": "Week 4", "event": "8-9 words. Hard cap: 11 words." }
      ]
    },
    "stakeholders": {
      "frame": "win_lose",
      "title": "Winners and losers",
      "subtitle": "Target: 10 words. Hard cap: 14 words. Name the tension specific to this signal.",
      "cells": [
        { "type": "win", "who": "3-5 word role label. Hard cap 6w.", "why": "Impact. Target: 11-18 words. Hard cap: 22 words." },
        { "type": "win", "who": "3-5 word role label. Hard cap 6w.", "why": "Impact. 11-18 words. Hard cap 22w." },
        { "type": "lose", "who": "3-5 word role label. Hard cap 6w.", "why": "Impact. 11-18 words. Hard cap 22w." },
        { "type": "lose", "who": "3-5 word role label. Hard cap 6w.", "why": "Impact. 11-18 words. Hard cap 22w." }
      ]
    },
    "decision_aid": {
      "frame": "yes_no",
      "title": "Decision framing headline",
      "question": "Core yes/no question the reader faces",
      "rows": [
        { "q_num": "Q1", "question": "First qualifying question. Target: 8-10 words. Hard cap: 12 words.", "verdict": "go", "verdict_text": "Target: 3-4 words. Hard cap: 5 words." },
        { "q_num": "Q2", "question": "Second qualifying question. 8-10 words. Hard cap: 12 words.", "verdict": "wait", "verdict_text": "3-4 words. Hard cap: 5 words." },
        { "q_num": "Q3", "question": "Third qualifying question. 8-10 words. Hard cap: 12 words.", "verdict": "no", "verdict_text": "3-4 words. Hard cap: 5 words." }
      ],
      "final_verdict": "Synthesis verdict. Target: 10 words. Hard cap: 12 words."
    },
    "reactions": [
      "LAYER 5 — exactly 3 reactions. quote: Target 15-18 words. Hard cap: 22 words. Bold first 3-5 words. name + role combined: 8-10 words. Hard cap: 12 words. Include at least one skeptic.",
      { "quote": "**Bold first 3-5 words.** Rest of sentiment. 15-18 words. Hard cap 22w.", "name": "Role archetype", "role": "Context line" },
      { "quote": "**Bold first 3-5 words.** Different perspective. 15-18 words. Hard cap 22w.", "name": "Role archetype", "role": "Context" },
      { "quote": "**Bold first 3-5 words.** Skeptic/contrarian voice. 15-18 words. Hard cap 22w.", "name": "Role archetype", "role": "Context" }
    ],
    "standup_messages": {
      "slack": "Slack standup message",
      "email": "Email standup message",
      "whatsapp": "WhatsApp standup message",
      "linkedin": "LinkedIn post"
    },
    "tomorrow_drafts": [
      { "day": "TUE", "date": "May 7", "text": "Follow-on story angle", "status": "lead_candidate", "status_detail": "Signal to watch" },
      { "day": "WED", "date": "May 8", "text": "Second follow-on angle", "status": "sealed" },
      { "day": "THU", "date": "May 9", "text": "Third follow-on angle", "status": "sealed" }
    ]
  }
}

${SELF_CHECK_QUESTIONS}`

// ── Word-count validation (inlined — can't import TypeScript) ────────────────

const CAPS = {
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

function countWords(text) {
  return text.replace(/\*\*/g, '').trim().split(/\s+/).filter(t => t.length > 0).length
}

function checkField(violations, field, text, capKey) {
  const cap = CAPS[capKey ?? field]
  if (!cap) return
  const words = countWords(text)
  if (words <= cap.soft) return
  violations.push({ field, words, soft: cap.soft, hard: cap.hard,
    severity: words > cap.hard ? 'HARD' : 'SOFT', excerpt: text.slice(0, 70) })
}

function validateSignal(signal) {
  const violations = []

  if (signal.headline)     checkField(violations, 'headline',     signal.headline)
  if (signal.summary)      checkField(violations, 'summary',      signal.summary)
  if (signal.pull_quote)   checkField(violations, 'pull_quote',   signal.pull_quote)
  if (signal.counter_view) checkField(violations, 'counter_view', signal.counter_view)

  if (signal.why_it_matters) {
    const paras = signal.why_it_matters.split(/\n\n+/)
    if (paras[0]) checkField(violations, 'signal_block_body', paras[0], 'signal_block_body')
    if (paras[1]) checkField(violations, 'block_2_prose', paras[1], 'block_2_prose')
  }

  signal.broadcast_phrases?.forEach((p, i) => checkField(violations, `broadcast_phrase[${i}]`, p, 'broadcast_phrase'))
  signal.stats?.forEach((s, i) => {
    if (s.label)  checkField(violations, `stat_label[${i}]`,  s.label,  'stat_label')
    if (s.detail) checkField(violations, `stat_detail[${i}]`, s.detail, 'stat_detail')
  })
  signal.action_items?.forEach((a, i) => checkField(violations, `action_body[${i}]`, a, 'action_body'))

  const ed = signal.extended_data
  if (!ed) return buildReport(violations)

  if (ed.numbers_headline) checkField(violations, 'numbers_headline', ed.numbers_headline)
  if (ed.matters_headline) checkField(violations, 'matters_headline', ed.matters_headline)

  ed.tickers?.forEach((t, i) => {
    if (t.label)  checkField(violations, `ticker_label[${i}]`,  t.label,  'ticker_label')
    if (t.detail) checkField(violations, `ticker_detail[${i}]`, t.detail, 'ticker_detail')
  })

  ed.insights_strip?.forEach((c, i) => {
    if (c.text) checkField(violations, `insight_text[${i}]`, c.text, 'insight_text')
  })

  if (ed.cascade) {
    if (ed.cascade.subtitle) checkField(violations, 'cascade_subtitle', ed.cascade.subtitle)
    ed.cascade.steps?.forEach((s, i) => {
      if (s.event) checkField(violations, `cascade_step[${i}]`, s.event, 'cascade_step')
    })
  }

  if (ed.stakeholders) {
    if (ed.stakeholders.subtitle)
      checkField(violations, 'stakeholder_subtitle', ed.stakeholders.subtitle, 'stakeholder_subtitle')
    ed.stakeholders.cells?.forEach((c, i) => {
      if (c.who) checkField(violations, `stakeholder_who[${i}]`, c.who, 'stakeholder_who')
      if (c.why) checkField(violations, `stakeholder_why[${i}]`, c.why, 'stakeholder_why')
    })
  }

  if (ed.decision_aid) {
    ed.decision_aid.rows?.forEach((r, i) => {
      if (r.question)    checkField(violations, `decision_question[${i}]`,     r.question,    'decision_question')
      if (r.verdict_text) checkField(violations, `decision_verdict_text[${i}]`, r.verdict_text, 'decision_verdict_text')
    })
  }

  ed.reactions?.forEach((r, i) => {
    if (r.quote) checkField(violations, `reaction_quote[${i}]`, r.quote, 'reaction_quote')
    checkField(violations, `reaction_attribution[${i}]`, `${r.name} · ${r.role}`, 'reaction_attribution')
  })

  ed.did_you_know_facts?.forEach((f, i) => {
    if (f.text) checkField(violations, `did_you_know_fact[${i}]`, f.text, 'did_you_know_fact')
  })

  return buildReport(violations)
}

function buildReport(violations) {
  const hard = violations.filter(v => v.severity === 'HARD')
  const soft = violations.filter(v => v.severity === 'SOFT')
  return { pass: hard.length === 0, hard_violations: hard, soft_violations: soft,
    hard_count: hard.length, soft_count: soft.length, total: violations.length }
}

// ── Test candidate sets ───────────────────────────────────────────────────────

const CANDIDATES = {
  'PRODUCT-PRICING': {
    article_type: 'PRODUCT-PRICING',
    candidates: [
      {
        rank: 1, title: 'GPT-4.1 Mini: OpenAI slashes input costs by 83%, matching Gemini Flash pricing',
        url: 'https://openai.com/blog/gpt-4-1-mini', source: 'OpenAI Blog', tier: 5,
        engagement: 1240, ageHours: 4, score: 98.2,
        summary: 'OpenAI dropped GPT-4.1 Mini pricing from $0.15 to $0.04/1M input tokens — matching Google\'s Gemini Flash, ending weeks of cost competition rhetoric with a concrete move. Reasoning scores improved 12% on MMLU-Pro vs GPT-4o Mini.'
      },
      {
        rank: 2, title: 'Mistral Large 2 releases with 128K context and Apache 2 license',
        url: 'https://mistral.ai/news/mistral-large-2', source: 'Mistral AI', tier: 4,
        engagement: 420, ageHours: 18, score: 67.1,
        summary: 'Mistral releases an open-weight 123B model with 128K context and permissive licensing.'
      },
      {
        rank: 3, title: 'Cohere Command R+ now available on AWS Bedrock with SLA guarantees',
        url: 'https://techcrunch.com/cohere-bedrock', source: 'TechCrunch AI', tier: 4,
        engagement: 290, ageHours: 22, score: 51.8,
        summary: 'Enterprise AI model now accessible through AWS infrastructure.'
      }
    ]
  },
  'FUNDING': {
    article_type: 'FUNDING',
    candidates: [
      {
        rank: 1, title: 'Sierra raises $950M Series C at $4.5B valuation — enterprise AI agents hit escape velocity',
        url: 'https://techcrunch.com/sierra-series-c', source: 'TechCrunch AI', tier: 4,
        engagement: 890, ageHours: 6, score: 88.4,
        summary: 'Sierra AI (founded by Bret Taylor) closed $950M Series C at $4.5B, led by Greenoaks. The round is the largest for enterprise AI agents to date — and validates the thesis that CX automation is the first multi-billion-dollar applied AI vertical.'
      },
      {
        rank: 2, title: 'Glean secures $260M for enterprise search and AI assistant platform',
        url: 'https://techcrunch.com/glean-260m', source: 'TechCrunch AI', tier: 4,
        engagement: 340, ageHours: 14, score: 58.2,
        summary: 'Glean extends Series E for AI-powered enterprise search product.'
      }
    ]
  },
  'POLICY-REGULATION': {
    article_type: 'POLICY-REGULATION',
    candidates: [
      {
        rank: 1, title: 'EU AI Act enforcement begins August 2026 — high-risk AI systems face 4% global revenue fines',
        url: 'https://ec.europa.eu/ai-act-enforcement', source: 'MIT Tech Review', tier: 4,
        engagement: 670, ageHours: 8, score: 81.3,
        summary: 'The EU confirmed August 1, 2026 as the enforcement start date for high-risk AI system obligations under the EU AI Act. Companies with AI in hiring, credit, or law enforcement must complete conformity assessments or face fines up to 4% of global annual revenue.'
      },
      {
        rank: 2, title: 'FTC signals new guidance on AI-generated content disclosure requirements',
        url: 'https://venturebeat.com/ftc-ai-disclosure', source: 'VentureBeat AI', tier: 4,
        engagement: 280, ageHours: 20, score: 52.1,
        summary: 'FTC preliminary guidance expected to require disclosure labels on AI-generated marketing materials.'
      }
    ]
  }
}

// ── Run one article type ──────────────────────────────────────────────────────

async function runTest(articleType, testData) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`Testing: ${articleType}`)
  console.log('─'.repeat(60))

  const userContent = JSON.stringify({
    article_type: testData.article_type,
    candidates: testData.candidates,
    date: '2026-05-06',
    issueNumber: 999,
  }, null, 2)

  let rawResponse = ''
  let signal = null
  let parseError = null

  try {
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 10000,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userContent }],
    })

    rawResponse = resp.content[0]?.type === 'text' ? resp.content[0].text : ''
    console.log(`Response length: ${rawResponse.length} chars`)

    // Strip markdown fences if present
    const cleaned = rawResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    signal = JSON.parse(cleaned)
  } catch (e) {
    parseError = e.message
    console.error(`JSON parse failed: ${e.message}`)
  }

  const report = signal ? validateSignal(signal) : null

  if (report) {
    const icon = report.pass ? '✓' : '✗'
    console.log(`${icon} Word count: ${report.hard_count} HARD + ${report.soft_count} SOFT violations`)
    if (report.hard_violations.length) {
      report.hard_violations.forEach(v =>
        console.log(`  [HARD] ${v.field}: ${v.words}w (cap ${v.hard}) — "${v.excerpt}"`)
      )
    }
    if (report.soft_violations.length) {
      report.soft_violations.forEach(v =>
        console.log(`  [soft] ${v.field}: ${v.words}w (target ${v.soft}) — "${v.excerpt}"`)
      )
    }
  }

  return {
    article_type: articleType,
    timestamp: new Date().toISOString(),
    parse_ok: signal !== null,
    parse_error: parseError,
    validation: report,
    signal_sample: signal ? {
      headline: signal.headline,
      summary: signal.summary?.slice(0, 120),
      numbers_headline: signal.extended_data?.numbers_headline,
      matters_headline: signal.extended_data?.matters_headline,
      broadcast_phrases: signal.broadcast_phrases,
      cascade_steps: signal.extended_data?.cascade?.steps?.map(s => s.event),
      stakeholder_subtitle: signal.extended_data?.stakeholders?.subtitle,
    } : null,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const outDir = join(ROOT, '.claude/intelligence/phase-2-test-results')
mkdirSync(outDir, { recursive: true })

for (const [articleType, testData] of Object.entries(CANDIDATES)) {
  const result = await runTest(articleType, testData)
  const outPath = join(outDir, `${articleType.toLowerCase()}-validation.json`)
  writeFileSync(outPath, JSON.stringify(result, null, 2))
  console.log(`Saved → ${outPath}`)
}

console.log('\nAll tests complete.')
