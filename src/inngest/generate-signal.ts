import Anthropic from '@anthropic-ai/sdk'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { StoryCategory, StoryStats, StorySource } from '../../db/types/database'
import { validateArticle } from '@/lib/article-validator'
import { fixWithHaiku, reviewWithSonnet } from '@/lib/editor-agent'
import type { GeneratedSignal as ValidatorSignal } from '@/lib/journalist-agent'
import { QUALITY_RULES, SELF_CHECK_QUESTIONS } from '@/lib/journalist-agent'
import { inngest, type DailyTriggerData } from './client'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Candidate {
  title: string
  url: string
  source: string
  sourceTier: number
  engagement: number
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
  pick_reason?: string
  rejected_alternatives?: Array<{ title: string; reason: string }>
}

interface RecentStory {
  category: string
  headline: string
  deeper_read: string | null
  sources: Array<{ label: string; url: string }>
}

// ─── Source registry ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  { name: 'OpenAI Blog',      url: 'https://openai.com/blog/rss.xml',                                   tier: 5, aiOnly: true  },
  { name: 'Anthropic Blog',   url: 'https://www.anthropic.com/rss.xml',                                 tier: 5, aiOnly: true  },
  { name: 'Google AI',        url: 'https://blog.google/technology/ai/rss/',                             tier: 5, aiOnly: true  },
  { name: 'DeepMind',         url: 'https://deepmind.google/discover/blog/rss.xml',                     tier: 5, aiOnly: true  },
  { name: 'Meta AI',          url: 'https://ai.meta.com/blog/rss/',                                     tier: 5, aiOnly: true  },
  { name: 'Mistral AI',       url: 'https://mistral.ai/news/rss.xml',                                   tier: 4, aiOnly: true  },
  { name: 'Stability AI',     url: 'https://stability.ai/blog/rss',                                     tier: 4, aiOnly: true  },
  { name: 'Hugging Face',     url: 'https://huggingface.co/blog/feed.xml',                              tier: 4, aiOnly: true  },
  { name: 'VentureBeat AI',   url: 'https://venturebeat.com/category/ai/feed/',                         tier: 4, aiOnly: true  },
  { name: 'TechCrunch AI',    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',     tier: 4, aiOnly: true  },
  { name: 'MIT Tech Review',  url: 'https://www.technologyreview.com/feed/',                            tier: 4, aiOnly: false },
  { name: 'Wired AI',         url: 'https://www.wired.com/feed/category/artificial-intelligence/rss',  tier: 4, aiOnly: true  },
  { name: 'Latent Space',     url: 'https://www.latent.space/feed',                                     tier: 4, aiOnly: true  },
  { name: 'Simon Willison',   url: 'https://simonwillison.net/atom/everything/',                        tier: 4, aiOnly: false },
  { name: 'The Batch',        url: 'https://www.deeplearning.ai/the-batch/rss/',                        tier: 4, aiOnly: true  },
  { name: 'Ahead of AI',      url: 'https://magazine.sebastianraschka.com/feed',                        tier: 4, aiOnly: true  },
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

const IMPACT_BONUS_KEYWORDS = [
  'releases','launch','acqui','raises','funding','bans',
  'cuts price','price cut','new model','breakthrough','surpasses',
  'beats gpt','open source','open-source','layoffs','shuts down',
  'general availability','ga release','open weights',
]

const TIER_BANDS: Record<number, { min: number; max: number }> = {
  5: { min: 150, max: 245 },
  4: { min: 140, max: 230 },
  3: { min: 80,  max: 135 },
  2: { min: 50,  max: 79  },
}
const RECENCY_DECAY = Math.LN2 / 6

// ─── Scoring helpers ────────────────────────────────────────────────────────────

function isAIRelevant(title: string): boolean {
  const t = title.toLowerCase()
  return AI_KEYWORDS.some((kw) => t.includes(kw))
}

function impactBonus(title: string): number {
  const t = title.toLowerCase()
  return IMPACT_BONUS_KEYWORDS.some((kw) => t.includes(kw)) ? 20 : 0
}

function computeScore(tier: number, engagement: number, ageHours: number, title: string): number {
  const band = TIER_BANDS[tier] ?? TIER_BANDS[3]
  const recency = Math.exp(-RECENCY_DECAY * ageHours)
  const base = band.min + recency * (band.max - band.min)
  const eng = engagement > 0 ? Math.min(Math.log10(engagement + 1) * 5, 15) : 0
  return Math.round(base + eng + impactBonus(title))
}

function titleSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter((w) => w.length > 3))
  const wa = words(a)
  const wb = words(b)
  const union = new Set([...wa, ...wb])
  if (union.size === 0) return 0
  return [...wa].filter((w) => wb.has(w)).length / union.size
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^(www|m|mobile)\./, '')
  } catch {
    return url
  }
}

function extractConcepts(text: string): string[] {
  const lower = text.toLowerCase()
  return AI_KEYWORDS.filter(kw => lower.includes(kw))
}

function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController()
  setTimeout(() => ctrl.abort(), ms)
  return fetch(url, {
    signal: ctrl.signal,
    headers: { 'User-Agent': 'AI-Signal-Bot/1.0 (https://aisignal.so)' },
    next: { revalidate: 0 },
  })
}

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
    objectID: string; title: string; url?: string; story_url?: string
    points: number; num_comments: number; created_at_i: number
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
      title: hit.title, url, source: 'Hacker News', sourceTier: 3,
      engagement: eng, ageHours: Math.round(ageHours * 10) / 10,
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
    !raw || typeof raw !== 'object' || !('data' in raw) ||
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
        title: p.title, url, source: 'Reddit', sourceTier: 2,
        engagement: p.score, ageHours: Math.round(ageHours * 10) / 10,
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
      title, url: url.replace('/pdf/', '/abs/').replace(/v\d+$/, ''),
      source: 'arXiv', sourceTier: 3, engagement: 0,
      ageHours: Math.round(ageHours * 10) / 10,
      finalScore: computeScore(3, 0, ageHours, title),
    })
  }
  return candidates
}

async function fetchAllCandidates(): Promise<Candidate[]> {
  const [rss, hn, reddit, arxiv] = await Promise.allSettled([
    fetchFromRSS(), fetchFromHN(), fetchFromReddit(), fetchFromArXiv(),
  ])
  const all: Candidate[] = [
    ...(rss.status === 'fulfilled' ? rss.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(arxiv.status === 'fulfilled' ? arxiv.value : []),
  ]

  function normalizeUrl(url: string): string {
    return url
      .replace(/^https?:\/\/(m\.|mobile\.|www\.)/, 'https://')
      .replace(/\/amp\/?$/, '/')
      .split('?')[0].toLowerCase()
  }
  const byUrl = new Map<string, Candidate>()
  for (const c of all) {
    const key = normalizeUrl(c.url)
    const existing = byUrl.get(key)
    if (!existing || c.finalScore > existing.finalScore) byUrl.set(key, c)
  }
  const deduped = Array.from(byUrl.values()).sort((a, b) => b.finalScore - a.finalScore)

  const boosted = new Set<number>()
  for (let i = 0; i < deduped.length; i++) {
    if (boosted.has(i)) continue
    for (let j = i + 1; j < deduped.length; j++) {
      if (boosted.has(j)) continue
      if (titleSimilarity(deduped[i].title, deduped[j].title) >= 0.45) {
        deduped[i].finalScore += 25
        boosted.add(j)
      }
    }
  }
  const unique = deduped.filter((_, idx) => !boosted.has(idx))

  const domainCounts = new Map<string, number>()
  const capped: Candidate[] = []
  for (const c of unique) {
    const domain = extractDomain(c.url)
    const count = domainCounts.get(domain) ?? 0
    if (count >= 2) continue
    domainCounts.set(domain, count + 1)
    capped.push(c)
    if (capped.length === 18) break
  }
  return capped
}

// ─── Saturation penalty ──────────────────────────────────────────────────────────

async function fetchRecentStories(supabase: ReturnType<typeof createAdminSupabaseClient>): Promise<RecentStory[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const { data } = await supabase
    .from('issues')
    .select('stories(category, headline, deeper_read, sources)')
    .gte('published_at', sevenDaysAgo)
    .eq('status', 'published')
    .order('published_at', { ascending: true })
  if (!data) return []
  return (data as Array<{ stories: RecentStory[] }>).flatMap(issue => issue.stories ?? [])
}

function applySaturationPenalties(candidates: Candidate[], recentStories: RecentStory[]): Candidate[] {
  if (recentStories.length === 0) return candidates

  const penaltyMultiplier = Math.min(1.0, recentStories.length / 7)
  const last3 = recentStories.slice(-3)

  const recentDomains3 = new Set<string>()
  for (const story of last3) {
    if (story.deeper_read) recentDomains3.add(extractDomain(story.deeper_read))
    for (const src of story.sources) {
      if (src.url) recentDomains3.add(extractDomain(src.url))
    }
  }

  const last3Concepts = last3.map(s => extractConcepts(s.headline))
  const last7Concepts = recentStories.map(s => extractConcepts(s.headline))

  return candidates.map(c => {
    const domainPenalty = recentDomains3.has(extractDomain(c.url))
      ? Math.round(30 * penaltyMultiplier) : 0
    const candidateConcepts = extractConcepts(c.title)
    const categoryPenalty = last3Concepts.some(
      rc => candidateConcepts.filter(kw => rc.includes(kw)).length >= 2
    ) ? Math.round(20 * penaltyMultiplier) : 0
    const keywordPenalty = last7Concepts.some(
      rc => candidateConcepts.filter(kw => rc.includes(kw)).length >= 2
    ) ? Math.round(15 * penaltyMultiplier) : 0
    const cappedPenalty = Math.min(domainPenalty + categoryPenalty + keywordPenalty, 50)
    console.log(
      `[scout] candidate "${c.title.slice(0, 40)}": base ${c.finalScore}, domain -${domainPenalty}, category -${categoryPenalty}, keyword -${keywordPenalty}, multiplier ${penaltyMultiplier.toFixed(2)}, total -${cappedPenalty}, final ${c.finalScore - cappedPenalty}`
    )
    return { ...c, finalScore: c.finalScore - cappedPenalty }
  }).sort((a, b) => b.finalScore - a.finalScore)
}

// ─── Claude writer ──────────────────────────────────────────────────────────────

async function generateSignal(candidates: Candidate[]): Promise<GeneratedSignal> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const list = candidates
    .map((c, i) =>
      `${i + 1}. [${c.source} | tier:${c.sourceTier} | score:${c.finalScore} | age:${c.ageHours}h | engagement:${c.engagement}]\n   ${JSON.stringify(c.title)}\n   ${c.url}`
    )
    .join('\n\n')

  const SYSTEM_PROMPT = `You are the editor of AI Signal — a daily single-story newsletter for senior PMs, founders, and engineers in the Indian tech ecosystem. Published at 06:14 IST. One pick. The story that matters most today.

Your job:
1. Pick the single most impactful story — prioritise: model releases, pricing changes, capability leaps, funding/acquisition, regulatory moves. Prefer tier 5 > tier 4 > tier 3, but a viral tier-3 story beats a stale tier-5 one. Age matters: same story older than 36h is stale.
2. Write the full signal as JSON.
3. Document your editorial decision in two metadata fields alongside the article fields:

   - pick_reason: 1-2 sentence explanation of WHY this story beat the others. Be specific about the editorial criterion (e.g., "Highest leverage for Indian SaaS unit economics — pricing disruption beats scaling stories this week. Anthropic funding story loses because funding rounds are rarely 48h-actionable for builders.").

   - rejected_alternatives: Array of 2-4 candidates you did NOT pick, each with title (verbatim from the input list) and a 1-line editorial reason. Keep reasons sharp and decision-quality.
     Format: [{"title": "...", "reason": "..."}, ...]

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
  "broadcast_phrases": ["Phrase 1 (6-14 words, starts with Today's signal: + data anchor)", "Phrase 2 (6-14 words, pure data anchor — number, currency, or named entity)", "Phrase 3 (6-14 words, pure data anchor — implication or consequence)"],
  "pick_reason": "1-2 sentence editorial reason this story was chosen over the others. Name the specific criterion.",
  "rejected_alternatives": [{"title": "Verbatim candidate title", "reason": "1-line editorial reason this candidate lost"}]
}

${SELF_CHECK_QUESTIONS}`

  const msg = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Sources fetched from ${candidates.length} candidates across company blogs, tech news, HN, Reddit, arXiv:\n\n${list}`,
      }],
    },
    { headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' } }
  )

  if (msg.stop_reason === 'max_tokens') {
    console.error('[generateSignal] Claude output truncated — hit max_tokens limit. Raise the cap or shrink output schema.')
    throw new Error('Claude output truncated at max_tokens. Raise the cap.')
  }

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
  if (!Array.isArray(signal.stats)) signal.stats = []
  if (!Array.isArray(signal.action_items)) signal.action_items = []
  if (!Array.isArray(signal.sources)) signal.sources = []
  if (!Array.isArray(signal.broadcast_phrases)) signal.broadcast_phrases = []
  return signal
}

// ─── Failure helper ─────────────────────────────────────────────────────────────

async function markIssueFailed(issueId: string, reason: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient()
    await supabase
      .from('issues')
      .update({
        status: 'failed',
        editor_note: `Pipeline failed: ${reason.slice(0, 200)}`,
      })
      .eq('id', issueId)
    console.error(`[inngest] issue ${issueId} marked as failed: ${reason.slice(0, 100)}`)
  } catch (e) {
    console.error('[inngest] markIssueFailed itself failed:', e)
  }
}

// ─── Inngest function ───────────────────────────────────────────────────────────

export const generateDailySignal = inngest.createFunction(
  {
    id: 'generate-daily-signal',
    retries: 2,
    triggers: [{ event: 'signal/daily.trigger' as const }],
    onFailure: async ({ event, error }: { event: { data: { event: { data: unknown } } }; error: Error }) => {
      const data = (event.data.event as { data: DailyTriggerData }).data
      await markIssueFailed(data.issueId, error.message)
    },
  },
  async ({ event, step }: { event: { data: unknown }; step: import('inngest').GetStepTools<typeof inngest> }) => {
    const { issueId, issueNumber } = event.data as unknown as DailyTriggerData

    // ── Step 1: Scout — fetch candidates + saturation penalty ──────────────────
    const candidates = (await step.run('scout', async () => {
      const supabase = createAdminSupabaseClient()
      const all = await fetchAllCandidates()

      if (all.length === 0) {
        await supabase
          .from('issues')
          .update({
            status: 'no_signal',
            published_at: new Date().toISOString(),
            editor_note: 'Nothing cleared the bar today. Back tomorrow.',
          })
          .eq('id', issueId)
        console.log(`[inngest] step "scout" complete: 0 candidates → no_signal`)
        return [] as Candidate[]
      }

      const recentStories = await fetchRecentStories(supabase).catch(() => {
        console.warn('[inngest] saturation check failed, skipping penalty')
        return [] as RecentStory[]
      })
      console.log(`[inngest] saturation check: ${recentStories.length} recent stories loaded`)
      const penalised = applySaturationPenalties(all, recentStories)
      console.log(`[inngest] step "scout" complete: ${penalised.length} candidates`)
      return penalised
    })) as Candidate[]

    if (candidates.length === 0) return { ok: true, no_signal: true, issueId }

    // ── Step 2: Write — Claude Sonnet generates the signal ─────────────────────
    const signal = (await step.run('write', async () => {
      const s = await generateSignal(candidates as Candidate[])
      console.log('[inngest] step "write" complete: signal generated')
      return s
    })) as GeneratedSignal

    // ── Step 3: Cascade — validator → Haiku fixer → Sonnet reviewer ────────────
    const { finalSignal, qualityPath } = (await step.run('cascade', async () => {
      const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      let current = signal
      let path = 'writer-direct'

      const v1 = validateArticle(current as unknown as ValidatorSignal)
      console.log('[cascade] Layer 1 (validator):', v1.pass ? 'PASS' : `FAIL — ${v1.violations.length} violations`)

      if (!v1.pass) {
        console.log('[cascade] violations:', v1.violations.map(v => `${v.field}:${v.type}`).join(', '))
        console.log('[cascade] Layer 2 (Haiku fixer) attempting fix...')
        const haikuResult = await fixWithHaiku(current as unknown as ValidatorSignal, v1.violations, anthropicClient)

        if (haikuResult.fixed) {
          current = haikuResult.signal as unknown as GeneratedSignal
          path = 'haiku-fix'
          const v2 = validateArticle(current as unknown as ValidatorSignal)
          console.log('[cascade] Layer 2 result:', v2.pass ? 'PASS' : `STILL FAILING — ${v2.violations.length} violations`)

          if (!v2.pass) {
            console.log('[cascade] Layer 3 (Sonnet review) attempting full review...')
            const sonnetResult = await reviewWithSonnet(current as unknown as ValidatorSignal, v2.violations, anthropicClient)
            current = sonnetResult.signal as unknown as GeneratedSignal
            path = 'sonnet-review'
            console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
          }
        } else {
          console.log('[cascade] Layer 2 failed, escalating to Layer 3...')
          const sonnetResult = await reviewWithSonnet(current as unknown as ValidatorSignal, v1.violations, anthropicClient)
          current = sonnetResult.signal as unknown as GeneratedSignal
          path = 'sonnet-review'
          console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
        }
      }

      console.log(`[inngest] step "cascade" complete: path ${path}`)
      return { finalSignal: current, qualityPath: path }
    })) as { finalSignal: GeneratedSignal; qualityPath: string }

    // ── Step 4: Publish — update issue + insert story ──────────────────────────
    await step.run('publish', async () => {
      const supabase = createAdminSupabaseClient()

      await supabase
        .from('issues')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          pick_reason: finalSignal.pick_reason ?? null,
          rejected_alternatives: finalSignal.rejected_alternatives?.length
            ? finalSignal.rejected_alternatives
            : null,
        })
        .eq('id', issueId)

      const { error: storyErr } = await supabase.from('stories').insert({
        issue_id: issueId,
        position: 1,
        category: finalSignal.category,
        headline: finalSignal.headline,
        summary: finalSignal.summary,
        why_it_matters: finalSignal.why_it_matters,
        pull_quote: finalSignal.pull_quote ?? null,
        lens_pm: finalSignal.lens_pm ?? null,
        lens_founder: finalSignal.lens_founder ?? null,
        lens_builder: finalSignal.lens_builder ?? null,
        sources: finalSignal.sources ?? [],
        read_minutes: finalSignal.read_minutes ?? 4,
        deeper_read: finalSignal.deeper_read ?? null,
        editorial_take: finalSignal.editorial_take ?? null,
        broadcast_phrases: finalSignal.broadcast_phrases?.length ? finalSignal.broadcast_phrases : null,
        stats: finalSignal.stats?.length ? finalSignal.stats : null,
        action_items: finalSignal.action_items?.length ? finalSignal.action_items : null,
        counter_view: finalSignal.counter_view ?? null,
        counter_view_headline: finalSignal.counter_view_headline ?? null,
      })

      if (storyErr) throw new Error(`Story insert failed: ${storyErr.message}`)

      console.log(`[inngest] step "publish" complete: issue ${issueNumber} published`)
    })

    return { ok: true, issueId, issueNumber, qualityPath }
  }
)
