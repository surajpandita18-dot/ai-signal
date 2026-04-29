import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { StoryCategory, StoryStats, StorySource } from '../../../../../db/types/database'
import { validateArticle } from '@/lib/article-validator'
import { fixWithHaiku, reviewWithSonnet } from '@/lib/editor-agent'
import type { GeneratedSignal as ValidatorSignal } from '@/lib/journalist-agent'
import { QUALITY_RULES, SELF_CHECK_QUESTIONS } from '@/lib/journalist-agent'

// Vercel Pro: 60s. Hobby plan cap is 10s — upgrade if cron times out.
export const maxDuration = 60

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Candidate {
  title: string
  url: string
  source: string
  sourceTier: number
  engagement: number  // HN points / Reddit upvotes / 0 for RSS
  ageHours: number
  finalScore: number
}

interface GeneratedSignal {
  category: StoryCategory
  headline: string
  summary: string
  why_it_matters: string
  pull_quote: string
  lens_pm: string
  lens_founder: string
  lens_builder: string
  stats: StoryStats[]
  action_items: string[]
  counter_view: string
  counter_view_headline: string
  sources: StorySource[]
  read_minutes: number
  deeper_read: string
  editorial_take: string
  broadcast_phrases?: string[]
}

// ─── Source registry ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  // Tier 5 — official company blogs: new model/product/pricing = instant signal
  { name: 'OpenAI Blog',      url: 'https://openai.com/blog/rss.xml',                                   tier: 5, aiOnly: true  },
  { name: 'Anthropic Blog',   url: 'https://www.anthropic.com/rss.xml',                                 tier: 5, aiOnly: true  },
  { name: 'Google AI',        url: 'https://blog.google/technology/ai/rss/',                             tier: 5, aiOnly: true  },
  { name: 'DeepMind',         url: 'https://deepmind.google/discover/blog/rss.xml',                     tier: 5, aiOnly: true  },
  { name: 'Meta AI',          url: 'https://ai.meta.com/blog/rss/',                                     tier: 5, aiOnly: true  },
  { name: 'Mistral AI',       url: 'https://mistral.ai/news/rss.xml',                                   tier: 4, aiOnly: true  },
  { name: 'Stability AI',     url: 'https://stability.ai/blog/rss',                                     tier: 4, aiOnly: true  },
  { name: 'Hugging Face',     url: 'https://huggingface.co/blog/feed.xml',                              tier: 4, aiOnly: true  },
  // Tier 4 — dedicated AI beat reporters
  { name: 'VentureBeat AI',   url: 'https://venturebeat.com/category/ai/feed/',                         tier: 4, aiOnly: true  },
  { name: 'TechCrunch AI',    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',     tier: 4, aiOnly: true  },
  { name: 'MIT Tech Review',  url: 'https://www.technologyreview.com/feed/',                            tier: 4, aiOnly: false },
  { name: 'Wired AI',         url: 'https://www.wired.com/feed/category/artificial-intelligence/rss',  tier: 4, aiOnly: true  },
  { name: 'Latent Space',     url: 'https://www.latent.space/feed',                                     tier: 4, aiOnly: true  },
  { name: 'Simon Willison',   url: 'https://simonwillison.net/atom/everything/',                        tier: 4, aiOnly: false },
  { name: 'The Batch',        url: 'https://www.deeplearning.ai/the-batch/rss/',                        tier: 4, aiOnly: true  },
  { name: 'Ahead of AI',      url: 'https://magazine.sebastianraschka.com/feed',                        tier: 4, aiOnly: true  },
  // Tier 3 — newsletters, indie analysts
  { name: "Ben's Bites",      url: 'https://bensbites.beehiiv.com/feed',                                tier: 3, aiOnly: true  },
  { name: 'Import AI',        url: 'https://importai.substack.com/feed',                                tier: 3, aiOnly: true  },
  { name: 'The Verge Tech',   url: 'https://www.theverge.com/tech/rss/index.xml',                      tier: 3, aiOnly: false },
]

const AI_KEYWORDS = [
  'openai','anthropic','claude','gpt','gemini','llm','large language',
  'ai model','neural network','mistral','meta ai','deepmind','google ai',
  'machine learning','deep learning','diffusion','transformer','agi',
  'inference','fine-tun','multimodal','chatgpt','copilot','ai agent',
  'foundation model','generative ai','stable diffusion','hugging face',
  'nvidia ai','artificial intelligence','language model','grok',
  'perplexity','cursor ai','devin','sora','dall-e','midjourney',
  'ai startup','ai funding','ai regulation','ai safety','alignment',
  'benchmark','reasoning model','context window','rag','o1','o3',
  'papers with code','open source model','weights','tokenizer',
  'agents','agentic','vibe coding','parameters','compute cluster',
  'ai policy','ai governance','ai chip','model weights',
]

// High-impact verbs/events that signal "this changes things today"
const IMPACT_BONUS_KEYWORDS = [
  'releases','launch','acqui','raises','funding','bans',
  'cuts price','price cut','new model','breakthrough','surpasses',
  'beats gpt','open source','open-source','layoffs','shuts down',
  'general availability','ga release','open weights',
]

// ─── Scoring v3 — tuned by 2000-experiment autoresearch loop ─────────────────
// Key findings applied:
//   recencyHalfLife 12h → 6h: FOMO newsletter, news goes stale 2x faster than assumed
//   tier5Range 60 → 95: wider spread makes fresh official blogs far more dominant
//   tier4Min 100 → 140: raises tier-4 floor, better separation from tier-3
//   tier4Range 58 → 90: wider spread for tech journalists
//   impactBonus 45 → 20: tier bands now carry the separation, 45 was overcounting events

const TIER_BANDS: Record<number, { min: number; max: number }> = {
  5: { min: 150, max: 245 },  // range 95 (was 60) — official company blogs fully dominant
  4: { min: 140, max: 230 },  // range 90 (was 58), floor 140 (was 100) — closer to tier-5
  3: { min: 80,  max: 135 },  // tier4Min-60=80, proportional spread
  2: { min: 50,  max: 79  },  // tier4Min-90=50, proportional spread
}
// Score halves every 6h — 2000-experiment loop found 12h was too slow for a FOMO newsletter
const RECENCY_DECAY = Math.LN2 / 6  // ≈ 0.1155 (was Math.LN2/12)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isAIRelevant(title: string): boolean {
  const t = title.toLowerCase()
  return AI_KEYWORDS.some((kw) => t.includes(kw))
}

function impactBonus(title: string): number {
  const t = title.toLowerCase()
  // 20 pts — 2000-experiment run found 45 overcounts when tier bands are wide (reverted)
  return IMPACT_BONUS_KEYWORDS.some((kw) => t.includes(kw)) ? 20 : 0
}

function computeScore(tier: number, engagement: number, ageHours: number, title: string): number {
  const band = TIER_BANDS[tier] ?? TIER_BANDS[3]
  // Recency slides score within the tier band — 0h = max, 12h = midpoint, 24h ≈ min+25%
  const recency = Math.exp(-RECENCY_DECAY * ageHours)
  const base = band.min + recency * (band.max - band.min)
  // Engagement bonus capped at 15 — can't cross tier boundary
  const eng = engagement > 0 ? Math.min(Math.log10(engagement + 1) * 5, 15) : 0
  const impact = impactBonus(title)
  return Math.round(base + eng + impact)
}

// True Jaccard similarity (intersection/union) — prevents over-absorption at 0.4 threshold
function titleSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 3))
  const wa = words(a)
  const wb = words(b)
  const union = new Set([...wa, ...wb])
  if (union.size === 0) return 0
  const intersection = [...wa].filter((w) => wb.has(w)).length
  return intersection / union.size
}

// Extract base domain for per-domain cap (ignores subdomains like www/m/mobile)
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^(www|m|mobile)\./, '')
  } catch {
    return url
  }
}

function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController()
  // Timer is NOT cleared on header receipt so it also covers body streaming
  setTimeout(() => ctrl.abort(), ms)
  return fetch(url, {
    signal: ctrl.signal,
    headers: { 'User-Agent': 'AI-Signal-Bot/1.0 (https://aisignal.so)' },
    next: { revalidate: 0 },
  })
}

// Parses both RSS 2.0 and Atom feeds
function parseXMLFeed(xml: string): Array<{ title: string; url: string; publishedAt: Date }> {
  const results: Array<{ title: string; url: string; publishedAt: Date }> = []

  for (const match of xml.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)) {
    const block = match[1]

    const rawTitle = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]
    const title = rawTitle
      ?.replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#8211;/g, '–')
      .trim()

    // RSS link (text content), then Atom link href, then guid
    let url =
      block.match(/<link[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)/i)?.[1] ??
      block.match(/<link[^>]*\shref=["'](https?:\/\/[^"'#][^"']*?)["']/i)?.[1] ??
      block.match(/<guid[^>]*isPermaLink="true"[^>]*>([^<]+)<\/guid>/i)?.[1] ??
      block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i)?.[1]

    const dateStr =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ??
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim() ??
      block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1]?.trim()

    if (!title || !url) continue
    const publishedAt = dateStr ? new Date(dateStr) : new Date()
    if (isNaN(publishedAt.getTime())) continue

    results.push({ title, url, publishedAt })
  }
  return results
}

// ─── Source fetchers ───────────────────────────────────────────────────────────

async function fetchFromRSS(): Promise<Candidate[]> {
  const now = Date.now()
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async (src) => {
      const res = await fetchWithTimeout(src.url)
      if (!res.ok) return []
      const xml = await res.text()
      const items = parseXMLFeed(xml)
      const candidates: Candidate[] = []

      for (const item of items) {
        const ageHours = (now - item.publishedAt.getTime()) / 3_600_000
        if (ageHours > 48) continue
        if (!src.aiOnly && !isAIRelevant(item.title)) continue

        candidates.push({
          title: item.title,
          url: item.url,
          source: src.name,
          sourceTier: src.tier,
          engagement: 0,
          ageHours: Math.round(ageHours * 10) / 10,
          finalScore: computeScore(src.tier, 0, ageHours, item.title),
        })
      }
      return candidates
    })
  )

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

async function fetchFromHN(): Promise<Candidate[]> {
  // Single Algolia API call — returns scored results, no per-item fetching needed
  const since = Math.floor(Date.now() / 1000) - 48 * 3600
  const query = encodeURIComponent(
    'AI OR LLM OR GPT OR Claude OR Gemini OR OpenAI OR Anthropic OR "language model" OR "machine learning"'
  )
  const res = await fetchWithTimeout(
    `https://hn.algolia.com/api/v1/search?tags=story&query=${query}&hitsPerPage=40&numericFilters=created_at_i>${since},points>2`,
    8000
  ).catch(() => null)
  if (!res?.ok) return []

  interface HNHit {
    objectID: string
    title: string
    url?: string
    story_url?: string
    points: number
    num_comments: number
    created_at_i: number
  }

  const json = await res.json() as { hits?: HNHit[] }
  if (!json.hits?.length) return []

  const now = Date.now() / 1000
  const candidates: Candidate[] = []
  for (const hit of json.hits) {
    const url = hit.url ?? hit.story_url
    if (!url) continue
    const ageHours = (now - hit.created_at_i) / 3600
    if (ageHours > 48) continue
    if (!isAIRelevant(hit.title)) continue
    const eng = hit.points + Math.round(Math.log10((hit.num_comments ?? 0) + 1) * 20)
    candidates.push({
      title: hit.title,
      url,
      source: 'Hacker News',
      sourceTier: 3,
      engagement: eng,
      ageHours: Math.round(ageHours * 10) / 10,
      finalScore: computeScore(3, eng, ageHours, hit.title),
    })
  }
  return candidates
}

async function fetchFromReddit(): Promise<Candidate[]> {
  const subreddits = 'MachineLearning+LocalLLaMA+artificial+OpenAI+ChatGPT+ArtificialIntelligence+ClaudeAI'
  const res = await fetchWithTimeout(
    `https://www.reddit.com/r/${subreddits}/top.json?t=day&limit=30&raw_json=1`
  ).catch(() => null)
  if (!res?.ok) return []

  const raw = await res.json() as unknown
  if (
    !raw ||
    typeof raw !== 'object' ||
    !('data' in raw) ||
    !(raw as { data: unknown }).data ||
    !Array.isArray((raw as { data: { children?: unknown } }).data.children)
  ) return []

  const json = raw as {
    data: { children: Array<{ data: { title: string; url: string; score: number; created_utc: number; is_self: boolean; permalink: string } }> }
  }

  const now = Date.now() / 1000
  return json.data.children
    .map(({ data: p }) => {
      const ageHours = (now - p.created_utc) / 3600
      const url = p.is_self ? `https://reddit.com${p.permalink}` : p.url
      return {
        title: p.title,
        url,
        source: 'Reddit',
        sourceTier: 2,
        engagement: p.score,
        ageHours: Math.round(ageHours * 10) / 10,
        finalScore: computeScore(2, p.score, ageHours, p.title),
      }
    })
    .filter((c) => c.ageHours <= 48 && isAIRelevant(c.title))
}

async function fetchFromArXiv(): Promise<Candidate[]> {
  const res = await fetchWithTimeout(
    'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG+OR+cat:cs.CV&sortBy=submittedDate&sortOrder=descending&max_results=20',
    8000
  ).catch(() => null)
  if (!res?.ok) return []

  const xml = await res.text()
  const now = Date.now()
  const candidates: Candidate[] = []

  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    const block = match[1]
    const rawTitle = block.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
    const title = rawTitle?.replace(/\s+/g, ' ').trim()
    const url = block.match(/<id>(https?:\/\/[^<]+)<\/id>/i)?.[1]
    const dateStr = block.match(/<published>([\s\S]*?)<\/published>/i)?.[1]?.trim()

    if (!title || !url) continue
    const publishedAt = dateStr ? new Date(dateStr) : new Date()
    const ageHours = (now - publishedAt.getTime()) / 3_600_000
    if (ageHours > 72) continue

    candidates.push({
      title,
      url: url.replace('/pdf/', '/abs/').replace(/v\d+$/, ''),  // abstract page, strip version suffix
      source: 'arXiv',
      sourceTier: 3,
      engagement: 0,
      ageHours: Math.round(ageHours * 10) / 10,
      finalScore: computeScore(3, 0, ageHours, title),
    })
  }
  return candidates
}

// ─── Aggregator ────────────────────────────────────────────────────────────────

async function fetchAllCandidates(): Promise<Candidate[]> {
  const [rss, hn, reddit, arxiv] = await Promise.allSettled([
    fetchFromRSS(),
    fetchFromHN(),
    fetchFromReddit(),
    fetchFromArXiv(),
  ])

  const all: Candidate[] = [
    ...(rss.status === 'fulfilled' ? rss.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(arxiv.status === 'fulfilled' ? arxiv.value : []),
  ]

  // Pass 1: URL dedup — normalise URL to catch mobile/www/amp variants, keep highest score
  function normalizeUrl(url: string): string {
    return url
      .replace(/^https?:\/\/(m\.|mobile\.|www\.)/, 'https://')
      .replace(/\/amp\/?$/, '/')
      .split('?')[0]
      .toLowerCase()
  }
  const byUrl = new Map<string, Candidate>()
  for (const c of all) {
    const key = normalizeUrl(c.url)
    const existing = byUrl.get(key)
    if (!existing || c.finalScore > existing.finalScore) byUrl.set(key, c)
  }
  // Sort by score DESC before clustering so the highest-scored version becomes the representative
  const deduped = Array.from(byUrl.values()).sort((a, b) => b.finalScore - a.finalScore)

  // Pass 2: Title-similarity clustering — true Jaccard ≥ 0.4, boost representative by 25
  // Multi-outlet coverage signals a story that genuinely moved the needle
  const boosted = new Set<number>()
  for (let i = 0; i < deduped.length; i++) {
    if (boosted.has(i)) continue
    for (let j = i + 1; j < deduped.length; j++) {
      if (boosted.has(j)) continue
      if (titleSimilarity(deduped[i].title, deduped[j].title) >= 0.45) {  // 0.4→0.45 per 2000-exp loop
        deduped[i].finalScore += 25
        boosted.add(j)
      }
    }
  }
  const unique = deduped.filter((_, idx) => !boosted.has(idx))

  // Pass 3: Domain-based cap — max 2 from any single domain (not source name)
  // Prevents one outlet flooding the list with multiple articles on the same story
  const domainCounts = new Map<string, number>()
  const capped: Candidate[] = []
  for (const c of unique) {  // already sorted by score DESC
    const domain = extractDomain(c.url)
    const count = domainCounts.get(domain) ?? 0
    if (count >= 2) continue
    domainCounts.set(domain, count + 1)
    capped.push(c)
    if (capped.length === 18) break  // increased from 15 — gives Claude more candidates
  }

  return capped
}

// ─── Claude generation ──────────────────────────────────────────────────────────

async function generateSignal(candidates: Candidate[]): Promise<GeneratedSignal> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. [${c.source} | tier:${c.sourceTier} | score:${c.finalScore} | age:${c.ageHours}h | engagement:${c.engagement}]\n   ${JSON.stringify(c.title)}\n   ${c.url}`
    )
    .join('\n\n')

  // system block is static per deploy — eligible for prompt caching after 2nd call
  const SYSTEM_PROMPT = `You are the editor of AI Signal — a daily single-story newsletter for senior PMs, founders, and engineers in the Indian tech ecosystem. Published at 06:14 IST. One pick. The story that matters most today.

Your job:
1. Pick the single most impactful story — prioritise: model releases, pricing changes, capability leaps, funding/acquisition, regulatory moves. Prefer tier 5 > tier 4 > tier 3, but a viral tier-3 story beats a stale tier-5 one. Age matters: same story older than 36h is stale.
2. Write the full signal as JSON.

${QUALITY_RULES}

Return ONLY valid JSON. No markdown fences. No explanation before or after.

{
  "category": "models"|"tools"|"business"|"policy"|"research",
  "headline": "Sharp, specific, max 12 words. No clickbait.",
  "summary": "2 dense sentences. What happened and why it matters. No padding.",
  "why_it_matters": "3–4 sentences. The deeper implication. What shifts. Bold key phrases with **double asterisks**.",
  "pull_quote": "One killer sentence — from the story or a sharp editorial take. Max 25 words.",
  "lens_pm": "1–2 sentences for a PM. Concrete. What should they rethink or do?",
  "lens_founder": "1–2 sentences for a founder. Competitive or strategic lens.",
  "lens_builder": "1–2 sentences for an engineer/builder. Stack, API, or workflow implication.",
  "stats": [
    { "label": "short label", "value": "number with unit", "delta": "trend or null", "detail": "one line context" }
  ],
  "action_items": [
    "Concrete action to take today or this week",
    "Second action",
    "Third action"
  ],
  "counter_view": "1–2 sentences. Strongest steelman of the opposite view. Honest.",
  "counter_view_headline": "5–7 words for the counter view headline",
  "sources": [
    { "label": "Source name", "url": "full URL" }
  ],
  "read_minutes": 4,
  "deeper_read": "URL of the primary source article",
  "editorial_take": "One sharp tweetable sentence — AI Signal's editorial opinion on this story. Standalone. Not a recap of facts. e.g., 'The default model is no longer a question of capability — it's a question of who notices the price change first.'",
  "broadcast_phrases": ["Phrase 1 (6-14 words, starts with Today's signal: + data anchor)", "Phrase 2 (6-14 words, pure data anchor — number, currency, or named entity)", "Phrase 3 (6-14 words, pure data anchor — implication or consequence)"]
}

${SELF_CHECK_QUESTIONS}`

  const msg = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Sources fetched from ${candidates.length} candidates across company blogs, tech news, HN, Reddit, arXiv:\n\n${list}`,
        },
      ],
    },
    { headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' } }
  )

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Claude returned no JSON. Raw: ${text.slice(0, 300)}`)

  let signal: GeneratedSignal
  try {
    signal = JSON.parse(jsonMatch[0]) as GeneratedSignal
  } catch (parseErr) {
    throw new Error(`Claude JSON parse failed: ${String(parseErr)}. Raw: ${jsonMatch[0].slice(0, 500)}`)
  }
  const required: (keyof GeneratedSignal)[] = ['category', 'headline', 'summary', 'why_it_matters']
  for (const field of required) {
    if (!signal[field]) throw new Error(`Claude JSON missing required field: ${field}`)
  }
  // Coerce array fields to correct types — guards against Claude returning wrong shapes
  if (!Array.isArray(signal.stats)) signal.stats = []
  if (!Array.isArray(signal.action_items)) signal.action_items = []
  if (!Array.isArray(signal.sources)) signal.sources = []
  if (!Array.isArray(signal.broadcast_phrases)) signal.broadcast_phrases = []
  return signal
}

// ─── Route handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const force = url.searchParams.get('force') === 'true'

  const supabase = createAdminSupabaseClient()

  // Skip only if today's issue AND its story both exist
  // en-CA locale gives YYYY-MM-DD format — correct for any server timezone
  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

  const { data: existing } = await supabase
    .from('issues')
    .select('id, issue_number, stories(id)')
    .gte('published_at', `${todayIST}T00:00:00+05:30`)
    .lt('published_at', `${todayIST}T23:59:59+05:30`)
    .maybeSingle()

  if (!force && existing && (existing.stories as unknown[]).length > 0) {
    return NextResponse.json({ ok: true, skipped: true, issue_number: existing.issue_number })
  }

  // If issue exists but story is missing, delete the partial issue and redo
  if (existing && (existing.stories as unknown[]).length === 0) {
    await supabase.from('issues').delete().eq('id', existing.id)
  }

  // Next issue number
  const { data: last } = await supabase
    .from('issues')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (last?.issue_number ?? 0) + 1

  // Fetch from all sources
  let candidates: Candidate[]
  try {
    candidates = await fetchAllCandidates()
  } catch (e) {
    return NextResponse.json({ error: 'Fetch failed', detail: String(e) }, { status: 500 })
  }

  // No qualifying stories today
  if (candidates.length === 0) {
    await supabase.from('issues').insert({
      issue_number: nextNumber,
      slug: `signal-${nextNumber}`,
      status: 'no_signal',
      published_at: new Date().toISOString(),
      editor_note: 'Nothing cleared the bar today. Back tomorrow.',
    })
    return NextResponse.json({ ok: true, no_signal: true, issue_number: nextNumber })
  }

  // Generate signal with Claude
  let signal: GeneratedSignal
  try {
    signal = await generateSignal(candidates)
  } catch (e) {
    return NextResponse.json({ error: 'Claude failed', detail: String(e) }, { status: 500 })
  }

  // ── CASCADE QUALITY GATE ──────────────────────────────────────────────────────
  const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  let qualityPath = 'writer-direct'

  // Layer 1: code validator — free, <1ms
  const validation1 = validateArticle(signal as unknown as ValidatorSignal)
  console.log(
    '[cascade] Layer 1 (validator):',
    validation1.pass ? 'PASS' : `FAIL — ${validation1.violations.length} violations`
  )

  if (!validation1.pass) {
    console.log('[cascade] violations:', validation1.violations.map(v => `${v.field}:${v.type}`).join(', '))

    // Layer 2: Haiku fixer — targeted fix for specific violations
    console.log('[cascade] Layer 2 (Haiku fixer) attempting fix...')
    const haikuResult = await fixWithHaiku(signal as unknown as ValidatorSignal, validation1.violations, anthropicClient)

    if (haikuResult.fixed) {
      signal = haikuResult.signal as unknown as GeneratedSignal
      qualityPath = 'haiku-fix'

      // Re-validate after Haiku fix
      const validation2 = validateArticle(signal as unknown as ValidatorSignal)
      console.log(
        '[cascade] Layer 2 result:',
        validation2.pass ? 'PASS' : `STILL FAILING — ${validation2.violations.length} violations`
      )

      if (!validation2.pass) {
        // Layer 3: Sonnet holistic review
        console.log('[cascade] Layer 3 (Sonnet review) attempting full review...')
        const sonnetResult = await reviewWithSonnet(signal as unknown as ValidatorSignal, validation2.violations, anthropicClient)
        signal = sonnetResult.signal as unknown as GeneratedSignal
        qualityPath = 'sonnet-review'
        console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
        const finalCheck1 = validateArticle(signal as unknown as ValidatorSignal)
        if (!finalCheck1.pass) {
          console.warn('[cascade] Sonnet output still has violations:', finalCheck1.violations.map(v => `${v.field}/${v.type}`).join(', '))
        }
      }
    } else {
      // Haiku couldn't fix — escalate directly to Sonnet
      console.log('[cascade] Layer 2 failed, escalating to Layer 3...')
      const sonnetResult = await reviewWithSonnet(signal as unknown as ValidatorSignal, validation1.violations, anthropicClient)
      signal = sonnetResult.signal as unknown as GeneratedSignal
      qualityPath = 'sonnet-review'
      console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
      const finalCheck2 = validateArticle(signal as unknown as ValidatorSignal)
      if (!finalCheck2.pass) {
        console.warn('[cascade] Sonnet output still has violations:', finalCheck2.violations.map(v => `${v.field}/${v.type}`).join(', '))
      }
    }
  }

  console.log('[cascade] FINAL PATH:', qualityPath)
  // ── END CASCADE ───────────────────────────────────────────────────────────────

  // Insert issue
  const { data: issue, error: issueErr } = await supabase
    .from('issues')
    .insert({
      issue_number: nextNumber,
      slug: `signal-${nextNumber}`,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (issueErr || !issue) {
    return NextResponse.json({ error: issueErr?.message ?? 'Issue insert failed' }, { status: 500 })
  }

  // Insert story
  const { error: storyErr } = await supabase.from('stories').insert({
    issue_id: issue.id,
    position: 1,
    category: signal.category,
    headline: signal.headline,
    summary: signal.summary,
    why_it_matters: signal.why_it_matters,
    pull_quote: signal.pull_quote ?? null,
    lens_pm: signal.lens_pm ?? null,
    lens_founder: signal.lens_founder ?? null,
    lens_builder: signal.lens_builder ?? null,
    sources: signal.sources ?? [],
    read_minutes: signal.read_minutes ?? 4,
    deeper_read: signal.deeper_read ?? null,
    editorial_take: signal.editorial_take ?? null,
    broadcast_phrases: signal.broadcast_phrases?.length ? signal.broadcast_phrases : null,
    stats: signal.stats?.length ? signal.stats : null,
    action_items: signal.action_items?.length ? signal.action_items : null,
    counter_view: signal.counter_view ?? null,
    counter_view_headline: signal.counter_view_headline ?? null,
  })

  if (storyErr) {
    return NextResponse.json({ error: storyErr.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    issue_number: nextNumber,
    headline: signal.headline,
    category: signal.category,
    sources_checked: candidates.length,
    top_source: candidates[0]?.source,
    top_score: candidates[0]?.finalScore,
    quality_path: qualityPath,
  })
}
