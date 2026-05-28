/**
 * patch-new-fields.mjs
 * Backfills open_question, replaces (tools only), readiness_level (research only)
 * for all existing stories that are missing these fields.
 *
 * Usage: node scripts/patch-new-fields.mjs
 *        node scripts/patch-new-fields.mjs --dry-run   (prints JSON, no DB writes)
 *        node scripts/patch-new-fields.mjs --id <uuid>  (single story)
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE_ID = (() => {
  const idx = process.argv.indexOf('--id')
  return idx !== -1 ? process.argv[idx + 1] : null
})()

const sb = createClient(
  'https://xswfsnnghloslzynkwni.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'
)

const claude = new Anthropic({
  apiKey: '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',
})

// ─── Fetch stories ──────────────────────────────────────────────────────────────

async function fetchStories() {
  let query = sb
    .from('stories')
    .select('id, category, headline, summary, why_it_matters, editorial_take, extended_data')

  if (SINGLE_ID) {
    query = query.eq('id', SINGLE_ID)
  }

  const { data, error } = await query
  if (error) throw new Error(`Supabase fetch failed: ${error.message}`)
  return data ?? []
}

// ─── Generate new fields via Claude ────────────────────────────────────────────

async function generateNewFields(story) {
  const isTools    = story.category === 'tools'
  const isResearch = story.category === 'research'

  const prompt = `You are generating 3 editorial fields for an AI newsletter article. Return ONLY valid JSON — no markdown, no explanation.

STORY CONTEXT:
Category: ${story.category}
Headline: ${story.headline}
Summary: ${story.summary}
Why it matters: ${story.why_it_matters}
${story.editorial_take ? `Editorial take: ${story.editorial_take}` : ''}

REQUIRED OUTPUT — JSON object with these fields:

{
  "open_question": "The single unresolved question that changes everything about this story. The question a thoughtful reader is left holding after reading. It should be forward-looking, specific to this story (not generic), and feel genuinely uncertain — not rhetorical. Target: 12-20 words. Hard cap: 25 words. Must end with a question mark."
  ${isTools ? `,
  "replaces": {
    "yes": "What specific workflow, tool, or behavior this replaces for builders. Be concrete — name the thing being replaced. Target: 8-15 words.",
    "not_yet": "What it still cannot do — the specific gap that keeps the old way alive. Target: 8-15 words."
  }` : ''}
  ${isResearch ? `,
  "readiness_level": "One of: lab | paper | prototype | product | deployed. Choose based on how far this research is from real-world use: lab=initial experiments, paper=published findings, prototype=working demo, product=limited release, deployed=in production use."` : ''}
}

Rules:
- open_question must be unique to THIS story. If it could appear on any AI article, rewrite it.
- open_question must end with "?"
${isTools ? '- replaces.yes and replaces.not_yet must be about THIS specific tool, not generic AI capability claims.' : ''}
${isResearch ? '- readiness_level must reflect actual deployment status based on the summary.' : ''}
- Return valid JSON only. No extra keys.`

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`No JSON in Claude output: ${text.slice(0, 200)}`)

  return JSON.parse(jsonMatch[0])
}

// ─── Check if story already has all applicable fields ──────────────────────────

function needsPatching(story) {
  const ext = story.extended_data ?? {}
  if (!ext.open_question) return true
  if (story.category === 'tools'    && !ext.replaces)        return true
  if (story.category === 'research' && !ext.readiness_level) return true
  return false
}

// ─── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[patch-new-fields] DRY_RUN=${DRY_RUN} SINGLE_ID=${SINGLE_ID ?? 'all'}`)
  const stories = await fetchStories()
  console.log(`[patch-new-fields] fetched ${stories.length} stories`)

  const toProcess = stories.filter(needsPatching)
  console.log(`[patch-new-fields] ${toProcess.length} stories need patching`)

  let ok = 0, fail = 0

  for (const story of toProcess) {
    const missingFields = []
    const ext = story.extended_data ?? {}
    if (!ext.open_question)                                    missingFields.push('open_question')
    if (story.category === 'tools'    && !ext.replaces)        missingFields.push('replaces')
    if (story.category === 'research' && !ext.readiness_level) missingFields.push('readiness_level')

    console.log(`\n[${story.id}] category=${story.category} missing=[${missingFields.join(', ')}]`)
    console.log(`  headline: ${story.headline.slice(0, 70)}...`)

    try {
      const generated = await generateNewFields(story)
      console.log(`  generated: ${JSON.stringify(generated)}`)

      const mergedExt = {
        ...ext,
        open_question: generated.open_question ?? ext.open_question,
        ...(generated.replaces        ? { replaces: generated.replaces }               : {}),
        ...(generated.readiness_level ? { readiness_level: generated.readiness_level } : {}),
      }

      if (DRY_RUN) {
        console.log(`  [dry-run] would update extended_data`)
      } else {
        const { error } = await sb
          .from('stories')
          .update({ extended_data: mergedExt })
          .eq('id', story.id)

        if (error) throw new Error(`Supabase update failed: ${error.message}`)
        console.log(`  ✓ updated`)
      }

      ok++
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`)
      fail++
    }
  }

  console.log(`\n[patch-new-fields] done: ${ok} ok, ${fail} failed`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
