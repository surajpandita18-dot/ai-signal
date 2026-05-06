// Run word-count validation on existing signals — local validation script
// Usage: npx tsx scripts/run-wc-validation.ts

import { readFileSync, writeFileSync } from 'fs'
import { validateWordCounts, type WcSignalInput } from '../src/lib/word-count-validator'

const SIGNALS = ['signal-15', 'signal-16']

for (const label of SIGNALS) {
  const raw = readFileSync(`.claude/intelligence/local-validation/${label}-signal.json`, 'utf-8')
  const story = JSON.parse(raw)

  const input: WcSignalInput = {
    headline: story.headline,
    summary: story.summary,
    why_it_matters: story.why_it_matters,
    pull_quote: story.pull_quote,
    counter_view: story.counter_view,
    broadcast_phrases: story.broadcast_phrases ?? undefined,
    stats: story.stats ?? undefined,
    action_items: story.action_items ?? undefined,
    extended_data: story.extended_data ?? undefined,
  }

  const report = validateWordCounts(input)

  const output = {
    signal_id: story.id,
    issue_id: story.issue_id,
    category: story.category,
    headline: story.headline,
    tested_at: new Date().toISOString(),
    validation: {
      pass: report.pass,
      hard_count: report.hard_violations.length,
      soft_count: report.soft_violations.length,
      hard_violations: report.hard_violations,
      soft_violations: report.soft_violations,
    },
    // Word count snapshot for key fields
    field_counts: {
      headline: story.headline ? countWords(story.headline) : null,
      summary: story.summary ? countWords(story.summary) : null,
      pull_quote: story.pull_quote ? countWords(story.pull_quote) : null,
      counter_view: story.counter_view ? countWords(story.counter_view) : null,
      signal_block_body: story.why_it_matters ? countWords(story.why_it_matters.split(/\n\n+/)[0]) : null,
      block_2_prose: story.why_it_matters ? countWords(story.why_it_matters.split(/\n\n+/)[1] ?? '') : null,
      stats_count: story.stats?.length ?? 0,
      has_extended_data: !!story.extended_data,
      broadcast_phrase_count: story.broadcast_phrases?.length ?? 0,
    },
  }

  const outPath = `.claude/intelligence/local-validation/${label}-validation.json`
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  const icon = report.pass ? '✓' : '✗'
  console.log(`\n${icon} ${label} (${story.category}) — ${report.hard_violations.length} HARD + ${report.soft_violations.length} SOFT`)
  console.log(`  headline: ${output.field_counts.headline}w | summary: ${output.field_counts.summary}w | pull_quote: ${output.field_counts.pull_quote}w`)
  console.log(`  signal_block: ${output.field_counts.signal_block_body}w | block_2: ${output.field_counts.block_2_prose}w | counter_view: ${output.field_counts.counter_view}w`)

  if (report.hard_violations.length) {
    console.log('  HARD violations:')
    report.hard_violations.forEach(v =>
      console.log(`    [HARD] ${v.field}: ${v.words}w (cap ${v.hard}) — "${v.excerpt}"`)
    )
  }
  if (report.soft_violations.length) {
    console.log('  SOFT violations:')
    report.soft_violations.forEach(v =>
      console.log(`    [soft] ${v.field}: ${v.words}w (target ${v.soft}) — "${v.excerpt}"`)
    )
  }

  console.log(`  → Saved: ${outPath}`)
}

function countWords(text: string): number {
  return text.replace(/\*\*/g, '').trim().split(/\s+/).filter(t => t.length > 0).length
}
