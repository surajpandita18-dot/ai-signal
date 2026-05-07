import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://xswfsnnghloslzynkwni.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'
)
const STORY_ID = '3b5a8392-af3f-4f79-bcf7-6054ed7eb1bc'

const { data: story, error: fetchErr } = await sb
  .from('stories').select('*').eq('id', STORY_ID).single()
if (fetchErr) { console.error(fetchErr); process.exit(1) }

const ext = story.extended_data

// ── Story-level fields ──────────────────────────────────────────────────────

// 1. summary: "buying" → "renting", "SpaceX's xAI" → "Elon Musk's xAI"
story.summary = '**Anthropic is renting compute from Elon Musk\'s xAI** to relieve capacity pressure — and the immediate payoff is **higher usage limits across Claude plans**. If you\'ve been hitting rate-limit walls, those walls just moved.'

// 2. why_it_matters: remove SpaceX, fix tense
story.why_it_matters = 'Anthropic just paid a **direct competitor** (xAI) to keep Claude running at scale. For **Indian teams building on Claude API**, higher limits arrive today — and the rate-limit ceiling is the single most-cited reason teams added **GPT-4o as fallback**.\n\nThat justification just weakened. But Anthropic\'s **compute dependency** is now a documented constraint — meaning vendor-risk belongs in your architecture review, not just your backlog.'

// 3. pull_quote: "bought" → "rented from Elon Musk's xAI"
story.pull_quote = 'Anthropic just rented compute from Elon Musk\'s xAI. **Dependency is now the story** — not just capability.'

// ── Extended data fields ────────────────────────────────────────────────────

// 4. insights[1] sentence fragment fix
ext.insights_strip[1].text = 'Every Claude user who was hitting daily rate caps now has more headroom.'

// 5. stakeholder WIN "xAI / SpaceX infrastructure" → "xAI infrastructure"
ext.stakeholders.cells[1].who = 'xAI infrastructure'

// ── Write both story fields and extended_data ──────────────────────────────

const { error: updateErr } = await sb.from('stories').update({
  summary:         story.summary,
  why_it_matters:  story.why_it_matters,
  pull_quote:      story.pull_quote,
  extended_data:   ext,
}).eq('id', STORY_ID)

if (updateErr) { console.error(updateErr); process.exit(1) }

console.log('✓ summary:          ', story.summary.slice(0, 70))
console.log('✓ why_it_matters:   ', story.why_it_matters.slice(0, 70))
console.log('✓ pull_quote:       ', story.pull_quote.slice(0, 70))
console.log('✓ insights[1]:      ', ext.insights_strip[1].text)
console.log('✓ stakeholder win 2:', ext.stakeholders.cells[1].who)
