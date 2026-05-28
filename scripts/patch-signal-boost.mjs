/**
 * patch-signal-boost.mjs
 * Backfills extended_data.signal_boost for all published stories missing it.
 *
 * Usage: node scripts/patch-signal-boost.mjs
 *        node scripts/patch-signal-boost.mjs --dry-run
 *        node scripts/patch-signal-boost.mjs --id <uuid>
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN   = process.argv.includes('--dry-run')
const SINGLE_ID = (() => { const i = process.argv.indexOf('--id'); return i !== -1 ? process.argv[i+1] : null })()

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://xswfsnnghloslzynkwni.supabase.co'
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'

const sb     = createClient(SB_URL, SB_KEY)
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateSignalBoost(story) {
  const category = story.category.toLowerCase()
  const typeHint = (category === 'models' || category === 'tools')
    ? 'prompt'
    : (category === 'business' || category === 'policy')
    ? 'quote'
    : 'fact'

  const prompt = `You are generating a "Signal Boost" section for an AI newsletter article.

Article details:
- Category: ${story.category}
- Headline: ${story.headline}
- Summary: ${story.summary}
- Why it matters: ${story.why_it_matters?.slice(0, 400) ?? ''}

Generate a signal_boost JSON object. The type should be "${typeHint}" based on the category.

Rules:
${typeHint === 'prompt' ? `type = "prompt"
title: "Try this prompt" (or more specific variant)
content: A concrete copy-paste prompt (2-4 sentences) the reader can paste into Claude or ChatGPT RIGHT NOW to explore this story's core insight. Must be immediately runnable. Not vague. Think "what would a smart PM/builder actually type?"
cta_text: "Copy into Claude →" or "Copy into ChatGPT →"` : ''}
${typeHint === 'quote' ? `type = "quote"
title: "Worth remembering"
content: A REAL, properly attributed quote from a well-known person that reframes today's story. 15-30 words. MUST be a real quote — do not invent.
attribution: "Full Name · Role · Affiliation"` : ''}
${typeHint === 'fact' ? `type = "fact"
title: "Puts it in context"
content: One surprising, specific fact from the broader ecosystem that makes this research feel real or urgent. NOT from the article itself. Must include a number and a temporal anchor (e.g. "As of 2024"). 1-2 sentences.` : ''}

Respond with ONLY valid JSON, no explanation:
{
  "type": "${typeHint}",
  "title": "...",
  "content": "...",
  ${typeHint === 'quote' ? '"attribution": "...",' : ''}
  ${typeHint === 'prompt' ? '"cta_text": "..."' : '"cta_text": null'}
}`

  const resp = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = resp.content[0].text.trim()
  const json = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'))
  return JSON.parse(json.slice(0, json.lastIndexOf('}') + 1))
}

async function run() {
  let query = sb
    .from('stories')
    .select('id, category, headline, summary, why_it_matters, extended_data')

  if (SINGLE_ID) {
    query = query.eq('id', SINGLE_ID)
  }

  const { data: stories, error } = await query
  if (error) { console.error('Fetch error:', error.message); process.exit(1) }

  const toProcess = stories.filter(s => {
    const ext = s.extended_data
    return !ext || typeof ext !== 'object' || !('signal_boost' in ext)
  })

  console.log(`${stories.length} stories total, ${toProcess.length} missing signal_boost`)
  if (DRY_RUN) console.log('DRY RUN — no writes')

  let ok = 0, fail = 0
  for (const story of toProcess) {
    try {
      const boost = await generateSignalBoost(story)
      console.log(`  [${story.category}] ${story.headline.slice(0, 60)}`)
      console.log(`       → ${boost.type}: "${boost.title}"`)
      if (DRY_RUN) { ok++; continue }

      const existing = (story.extended_data && typeof story.extended_data === 'object') ? story.extended_data : {}
      const { error: updateErr } = await sb
        .from('stories')
        .update({ extended_data: { ...existing, signal_boost: boost } })
        .eq('id', story.id)

      if (updateErr) throw new Error(updateErr.message)
      ok++
    } catch (err) {
      console.error(`  FAIL [${story.id}]: ${err.message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed`)
}

run()
