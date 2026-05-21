/**
 * Fact-check validation test — runs against 3 real published articles.
 * Read-only. Does NOT touch the DB or production pipeline.
 * Run: npx tsx scripts/test-fact-check.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { runFactCheck, type FactCheckInput } from '../src/inngest/fact-check'
import * as fs from 'fs'
import * as path from 'path'

for (const line of fs.readFileSync(path.resolve('./.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const ISSUE_NUMBERS = [22, 21, 16]

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { data: issues } = await sb
    .from('issues')
    .select('id, issue_number')
    .in('issue_number', ISSUE_NUMBERS)

  if (!issues?.length) { console.error('No issues found'); process.exit(1) }

  const { data: stories } = await sb
    .from('stories')
    .select('*')
    .in('issue_id', issues.map((i: { id: string }) => i.id))

  const issueMap = Object.fromEntries(issues.map((i: { id: string; issue_number: number }) => [i.id, i.issue_number]))
  const storyByIssue = Object.fromEntries(
    (stories ?? []).map((s: Record<string, unknown>) => [issueMap[s.issue_id as string], s])
  )

  for (const num of ISSUE_NUMBERS) {
    const story = storyByIssue[num]
    if (!story) { console.log(`\n#${num}: no story found\n`); continue }

    const input: FactCheckInput = {
      headline:       story.headline as string,
      summary:        story.summary as string,
      why_it_matters: story.why_it_matters as string,
      stats:          story.stats as FactCheckInput['stats'],
      extended_data:  story.extended_data as FactCheckInput['extended_data'],
      sources:        story.sources as FactCheckInput['sources'],
      deeper_read:    story.deeper_read as string | null,
    }

    console.log(`\n${'═'.repeat(70)}`)
    console.log(`ARTICLE #${num} — ${(story.headline as string).slice(0, 60)}`)
    console.log(`Category: ${story.category}`)
    console.log('═'.repeat(70))

    const t0 = Date.now()
    let result
    try {
      result = await runFactCheck(input, client)
    } catch (err) {
      console.log(`ERROR: ${err}`)
      continue
    }
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

    const highC   = result.concerns.filter(c => c.severity === 'high')
    const mediumC = result.concerns.filter(c => c.severity === 'medium')
    const lowC    = result.concerns.filter(c => c.severity === 'low')

    // Warn-only mode: article ALWAYS publishes. Log tag mirrors generate-signal.ts.
    let logTag: string
    if (result.overall_confidence < 30) {
      logTag = '[FACT-CHECK-SKIP] low_confidence'
    } else if (result.block_publish || highC.length > 0) {
      logTag = '[FACT-CHECK-ALERT] HIGH concerns — review recommended'
    } else if (mediumC.length >= 4) {
      logTag = '[FACT-CHECK-FIX-SKIPPED] 4+ MEDIUM concerns'
    } else if (mediumC.length > 0 || lowC.length > 0) {
      logTag = '[FACT-CHECK-WARN]'
    } else {
      logTag = '[FACT-CHECK] all clear'
    }

    console.log(`\nPUBLISHES:         YES (warn-only mode — never blocks)`)
    console.log(`Log tag:           ${logTag}`)
    console.log(`Overall confidence: ${result.overall_confidence}/100`)
    console.log(`block_publish:      ${result.block_publish}`)
    console.log(`Summary:            ${result.summary}`)
    console.log(`\nClaims found: ${result.verified_claims.length}`)
    console.log(`  HIGH confidence:   ${result.verified_claims.filter(c => c.confidence === 'high').length}`)
    console.log(`  MEDIUM confidence: ${result.verified_claims.filter(c => c.confidence === 'medium').length}`)
    console.log(`  LOW confidence:    ${result.verified_claims.filter(c => c.confidence === 'low').length}`)
    console.log(`\nConcerns: ${result.concerns.length}`)
    if (result.concerns.length > 0) {
      for (const c of result.concerns) {
        console.log(`  [${c.severity.toUpperCase()}] ${c.claim.slice(0, 80)}`)
        console.log(`         Reason: ${c.reason.slice(0, 100)}`)
        console.log(`         Fix:    ${c.suggested_action.slice(0, 100)}`)
      }
    } else {
      console.log('  (none)')
    }

    console.log(`\nTiming: ${elapsed}s`)
    // Rough cost: sonnet input ~$3/1M tokens, output ~$15/1M tokens
    // Prompt ~800 tokens input, response ~600 tokens output
    console.log(`Est. cost: ~$0.01–0.02 per call`)
  }

  console.log(`\n${'═'.repeat(70)}\nDone.\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
