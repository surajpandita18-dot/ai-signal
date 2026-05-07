import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://xswfsnnghloslzynkwni.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd2Zzbm5naGxvc2x6eW5rd25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5NzgxOCwiZXhwIjoyMDkyNzczODE4fQ.P0ghCk98rYuZFq_XAInyVbQat-xW_BexDBhLnBFIMao'
)
const STORY_ID = '3b5a8392-af3f-4f79-bcf7-6054ed7eb1bc'

const { data: story, error: fetchErr } = await sb
  .from('stories').select('extended_data').eq('id', STORY_ID).single()
if (fetchErr) { console.error(fetchErr); process.exit(1) }

const ext = story.extended_data

// ── Rewrite all 10 did_you_know_facts ──────────────────────────────────────
// Rules: excited/engaged voice, not dry statements, nb-num spans on numbers,
// fact 8 was incomplete, fact 9 had wrong "SpaceX's compute arm" label

ext.did_you_know_facts = [
  {
    text: 'Scale this: Anthropic\'s last training run needed <span class="nb-num">tens of thousands</span> of GPUs. Fewer than <span class="nb-num">5</span> providers on Earth can supply that. No wonder they went to xAI.',
    category: 'numbers',
  },
  {
    text: 'The number-one reason developers added GPT-4o as a fallback? Claude\'s <span class="nb-num">429</span> rate-limit error — not quality, not cost, just a ceiling. That ceiling just moved.',
    category: 'industry',
  },
  {
    text: 'Elon\'s Colossus cluster in Memphis has over <span class="nb-num">100,000</span> Nvidia H100s in a single building. It\'s the GPU equivalent of a power station — and Anthropic just plugged in.',
    category: 'trivia',
  },
  {
    text: 'Perplexity\'s <span class="nb-num">$400M</span> Snap deal collapsed. That\'s <span class="nb-num">$400M</span> in enterprise AI contracts back on the open market — and every lab is circling it.',
    category: 'numbers',
  },
  {
    text: 'Capacity problems are Anthropic\'s oldest story: Claude 2 and Claude 3 both launched with waitlists before general access. This xAI deal is attempt number three to fix that.',
    category: 'industry',
  },
  {
    text: 'Rival AI labs sharing infrastructure is older than you think. In the early days, OpenAI and DeepMind ran experiments side-by-side on the same AWS clusters. History is repeating.',
    category: 'trivia',
  },
  {
    text: 'India is one of Anthropic\'s fastest-growing API markets right now. A rate-limit change at HQ hits harder here than almost anywhere else in the world.',
    category: 'numbers',
  },
  {
    // was cut off at "there is no pu..." — now complete
    text: 'GPU rental markets have no public pricing index. You cannot Google how much Anthropic paid xAI per GPU-hour. That opacity is deliberate — and worth factoring into your vendor analysis.',
    category: 'industry',
  },
  {
    // was wrong: "SpaceX's compute arm (xAI)" — xAI and SpaceX are separate companies
    text: 'xAI and Anthropic are backed by rival venture groups. The compute rental deal literally crossed competing VC portfolio lines — the kind of thing that makes lawyers very busy.',
    category: 'trivia',
  },
  {
    text: 'No price hike, higher limits. That quietly means your cost-per-usable-token just dropped for teams on fixed Claude plans — a unit economics win Anthropic didn\'t bother to announce.',
    category: 'numbers',
  },
]

// ── Fix truncated reactions ─────────────────────────────────────────────────
// reactions[1] was cut at "But if it ships hig"
// reactions[2] was cut at "This is an infrastructure patch,"

ext.reactions[1].quote = '**Renting from Elon is a strange flex.** But if it ships higher limits with zero price change, I\'ll use the API and ask questions later.'

ext.reactions[2].quote = '**Capacity is not a moat.** This is an infrastructure patch, not a strategy. The moment xAI has surplus capacity, they\'ll be competing for the same developers Anthropic is trying to lock in.'

// ── Write ───────────────────────────────────────────────────────────────────

const { error: updateErr } = await sb.from('stories').update({
  extended_data: ext,
}).eq('id', STORY_ID)

if (updateErr) { console.error(updateErr); process.exit(1) }

console.log('✓ did_you_know_facts: 10 facts rewritten')
console.log('✓ reactions[1]:', ext.reactions[1].quote.slice(0, 70))
console.log('✓ reactions[2]:', ext.reactions[2].quote.slice(0, 70))
