import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { StoryCategory, StoryStats, StorySource } from '../../db/types/database'
import { validateArticle } from '@/lib/article-validator'
import { fixWithHaiku, reviewWithSonnet } from '@/lib/editor-agent'
import type { GeneratedSignal as ValidatorSignal } from '@/lib/journalist-agent'
import { QUALITY_RULES, SELF_CHECK_QUESTIONS } from '@/lib/journalist-agent'
import { inngest, type DailyTriggerData } from './client'
import type { ExtendedData } from '@/lib/types/extended-data'
import { validateWordCounts, type WcSignalInput } from '@/lib/word-count-validator'
import { runFactCheck, type FactCheckInput } from './fact-check'
import { dailyNewsletterEmail } from '@/lib/email-templates'

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
  extended_data?: ExtendedData
}

interface RecentStory {
  category: string
  headline: string
  deeper_read: string | null
  sources: Array<{ label: string; url: string }>
}

// ─── Source registry ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  // ── Tier 5: official lab / major platform blogs ──────────────────────────
  { name: 'OpenAI Blog',        url: 'https://openai.com/blog/rss.xml',                                        tier: 5, aiOnly: true  },
  { name: 'Anthropic Blog',     url: 'https://www.anthropic.com/rss.xml',                                      tier: 5, aiOnly: true  },
  { name: 'Google AI',          url: 'https://blog.google/technology/ai/rss/',                                  tier: 5, aiOnly: true  },
  { name: 'DeepMind',           url: 'https://deepmind.google/discover/blog/rss.xml',                          tier: 5, aiOnly: true  },
  { name: 'Meta AI',            url: 'https://ai.meta.com/blog/rss/',                                          tier: 5, aiOnly: true  },
  { name: 'Microsoft AI',       url: 'https://blogs.microsoft.com/ai/feed/',                                   tier: 5, aiOnly: true  },
  // ── Tier 4: major labs, infrastructure, high-signal media ────────────────
  { name: 'Mistral AI',         url: 'https://mistral.ai/news/rss.xml',                                        tier: 4, aiOnly: true  },
  { name: 'Stability AI',       url: 'https://stability.ai/blog/rss',                                          tier: 4, aiOnly: true  },
  { name: 'Hugging Face',       url: 'https://huggingface.co/blog/feed.xml',                                   tier: 4, aiOnly: true  },
  { name: 'Google Research',    url: 'https://research.google/blog/rss/',                                      tier: 4, aiOnly: true  },
  { name: 'NVIDIA Developer',   url: 'https://developer.nvidia.com/blog/feed/',                                tier: 4, aiOnly: true  },
  { name: 'AWS ML Blog',        url: 'https://aws.amazon.com/blogs/machine-learning/feed/',                    tier: 4, aiOnly: true  },
  { name: 'VentureBeat AI',     url: 'https://venturebeat.com/category/ai/feed/',                              tier: 4, aiOnly: true  },
  { name: 'TechCrunch AI',      url: 'https://techcrunch.com/category/artificial-intelligence/feed/',          tier: 4, aiOnly: true  },
  { name: 'MIT Tech Review',    url: 'https://www.technologyreview.com/feed/',                                 tier: 4, aiOnly: false },
  { name: 'Wired AI',           url: 'https://www.wired.com/feed/category/artificial-intelligence/rss',       tier: 4, aiOnly: true  },
  { name: 'Latent Space',       url: 'https://www.latent.space/feed',                                          tier: 4, aiOnly: true  },
  { name: 'Simon Willison',     url: 'https://simonwillison.net/atom/everything/',                             tier: 4, aiOnly: false },
  { name: 'The Batch',          url: 'https://www.deeplearning.ai/the-batch/rss/',                             tier: 4, aiOnly: true  },
  { name: 'Ahead of AI',        url: 'https://magazine.sebastianraschka.com/feed',                            tier: 4, aiOnly: true  },
  // ── Tier 4: high-signal researchers / thought leaders ────────────────────
  { name: 'Lilian Weng',        url: 'https://lilianweng.github.io/index.xml',                                tier: 4, aiOnly: true  },
  { name: 'One Useful Thing',   url: 'https://www.oneusefulthing.org/feed',                                   tier: 4, aiOnly: true  },
  // ── Tier 4: builder-focused deep signal ──────────────────────────────────
  { name: 'Interconnects',      url: 'https://www.interconnects.ai/feed',                                     tier: 4, aiOnly: true  }, // Nathan Lambert — RLHF, open models, training
  { name: 'Cohere Blog',        url: 'https://cohere.com/blog/rss',                                           tier: 4, aiOnly: true  }, // enterprise RAG, embeddings
  // ── Tier 4: practitioner blogs + VC + developer platforms ────────────────
  { name: 'a16z Blog',          url: 'https://a16z.com/feed/',                                                tier: 4, aiOnly: false }, // VC lens — deal context, market thesis
  { name: 'GitHub Blog',        url: 'https://github.blog/feed/',                                             tier: 4, aiOnly: false }, // Copilot, Actions, model announcements
  { name: 'Chip Huyen',         url: 'https://huyenchip.com/feed.xml',                                       tier: 4, aiOnly: true  }, // ML systems, production inference
  { name: 'Eugene Yan',         url: 'https://eugeneyan.com/feed.xml',                                       tier: 4, aiOnly: true  }, // applied ML, LLM evals
  { name: 'Pragmatic Engineer', url: 'https://newsletter.pragmaticengineer.com/feed',                         tier: 4, aiOnly: false }, // engineering leadership, highest-signal eng newsletter
  { name: 'Apple ML Research',  url: 'https://machinelearning.apple.com/research.rss',                       tier: 4, aiOnly: true  }, // on-device ML, privacy-preserving inference
  // ── Tier 3: newsletters, community, tooling ───────────────────────────────
  { name: 'Import AI',          url: 'https://importai.substack.com/feed',                                    tier: 3, aiOnly: true  },
  { name: 'The Gradient',       url: 'https://thegradient.pub/rss/',                                          tier: 3, aiOnly: true  }, // research analysis for practitioners
  { name: 'The Verge Tech',     url: 'https://www.theverge.com/tech/rss/index.xml',                           tier: 3, aiOnly: false },
  { name: 'LangChain Blog',     url: 'https://blog.langchain.dev/rss/',                                       tier: 3, aiOnly: true  },
  { name: 'Towards AI',         url: 'https://pub.towardsai.net/feed',                                        tier: 3, aiOnly: true  },
  { name: 'Weights & Biases',   url: 'https://wandb.ai/site/articles/feed',                                   tier: 3, aiOnly: true  }, // MLOps, LLMOps engineering
  { name: 'ProductHunt AI',     url: 'https://www.producthunt.com/feed?category=artificial-intelligence',     tier: 3, aiOnly: true  },
  // ── Tier 2: aggregators (useful for viral signal, not primary source) ─────
  { name: "Ben's Bites",        url: 'https://bensbites.beehiiv.com/feed',                                    tier: 2, aiOnly: true  }, // aggregator — downgraded; useful for viral stories
  { name: 'TLDR AI',            url: 'https://tldr.tech/api/rss/ai',                                         tier: 2, aiOnly: true  }, // aggregator — downgraded
  { name: 'The Rundown AI',     url: 'https://therundown.beehiiv.com/feed',                                   tier: 2, aiOnly: true  }, // aggregator — downgraded
]

const AI_KEYWORDS = [
  // labs & models
  'openai','anthropic','claude','gpt','gemini','llm','large language',
  'ai model','neural network','mistral','meta ai','deepmind','google ai',
  'machine learning','deep learning','diffusion','transformer','agi',
  'inference','fine-tun','multimodal','chatgpt','copilot','ai agent',
  'foundation model','generative ai','stable diffusion','hugging face',
  'nvidia ai','artificial intelligence','language model','grok',
  'perplexity','devin','sora','dall-e','midjourney','llama 3','llama 4',
  'qwen','gemma','phi-','claude code','claude opus','claude sonnet',
  'gemini 2','gemini flash','gpt-5','gpt-4o',
  // tools & infra
  'cursor','windsurf','groq','openrouter','cerebras','together ai',
  'replicate','vercel ai','langchain','llamaindex','dspy',
  // concepts
  'ai startup','ai funding','ai regulation','ai safety','alignment',
  'benchmark','reasoning model','context window','rag','o1','o3','o4',
  'papers with code','open source model','weights','tokenizer',
  'agents','agentic','vibe coding','parameters','compute cluster',
  'ai policy','ai governance','ai chip','model weights',
  'mcp','model context protocol','computer use','tool use',
  'test-time compute','test time scaling','multimodal agent',
]

// Tiered impact bonuses — higher weight = more decision-forcing
// Each array: [keywords, bonus]. Applied additively (a story can score multiple tiers).
const IMPACT_TIERS: Array<{ keywords: string[]; bonus: number }> = [
  // Tier A (+35) — forces immediate product/cost/compliance decision
  {
    keywords: ['cuts price','price cut','pricing change','cost per','$/million','per million tokens',
               'deprecat','end of life','breaking change','migration required','shutting down',
               'now free','open source weights','open-source weights','weights released',
               'context window increase','rate limit lifted','rate limit removed'],
    bonus: 35,
  },
  // Tier B (+20) — new capability or release that changes the stack
  {
    keywords: ['new model','model release','general availability','ga release','now available',
               'open weights','beats gpt','surpasses','new sota','state-of-the-art','benchmark',
               'acqui','acquires','shuts down','bans','regulatory deadline','compliance required'],
    bonus: 20,
  },
  // Tier C (+8) — awareness with some product implication
  {
    keywords: ['raises','funding','launch','releases','breakthrough','partners with'],
    bonus: 8,
  },
]

function impactBonus(title: string): number {
  const t = title.toLowerCase()
  return IMPACT_TIERS.reduce((sum, tier) =>
    tier.keywords.some(kw => t.includes(kw)) ? sum + tier.bonus : sum, 0
  )
}

// Keep for backward compat — not used directly anymore
const IMPACT_BONUS_KEYWORDS: string[] = IMPACT_TIERS.flatMap(t => t.keywords)

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

// Stories that pass isAIRelevant but are NOT actionable for AI builders.
// Applied as a hard pre-filter before scoring — these never reach Claude.
const BUILDER_REJECT_PATTERNS = [
  // Consumer subscription / social media features — not builder-actionable
  'paid subscription', 'subscription tier', 'subscription model', 'subscription plan',
  'instagram', 'facebook messenger', 'whatsapp subscription', 'twitter blue', 'x premium',
  // Stock / financial news with no model/API news
  'stock price', 'share price', 'market cap', 'quarterly earnings', 'q1 earnings', 'q2 earnings',
  'q3 earnings', 'q4 earnings', 'revenue beat', 'revenue miss',
  // Layoffs unless tied to a pivot
  'mass layoff', 'lays off', '% of workforce',
  // Consumer AI features in social/entertainment products
  'ai filter', 'beauty filter', 'snapchat ai', 'instagram ai', 'tiktok ai',
  // Pure opinion / think-piece patterns
  'will ai replace', 'ai will take', 'ai threatens', 'fears about ai',
  // Conference/event announcements — awareness not signal
  'annual conference', 'summit 2026', 'summit 2025', 'keynote at', 'speaking at',
  'will present at', 'registration open', 'call for papers', 'cfp deadline',
  // Vague "AI is changing X" think-pieces with no concrete product
  'ai is transforming', 'ai is revolutionizing', 'ai is reshaping', 'ai is changing the way',
  'future of ai in', 'ai in healthcare is', 'ai in education is',
  // Hiring / job posts disguised as news
  'is hiring', 'now hiring', 'job opening', 'open roles', 'join our team',
  // Awards and rankings with no product news
  'best ai company', 'top ai startup', 'ranked #1', 'named a leader in',
  'magic quadrant', 'gartner report',
  // Consumer product UI updates with no API/platform implication
  'new look', 'redesigned interface', 'dark mode', 'ui refresh', 'accessibility update',
]

// Builder-actionable signal must have at least one of these.
// Prevents think-pieces and vague "AI is changing X" stories from slipping through.
const BUILDER_SIGNAL_REQUIRED = [
  'api', 'model', 'pric', 'cost', 'benchmark', 'release', 'launch', 'open source',
  'open-source', 'weight', 'inference', 'fine-tun', 'train', 'tool', 'framework',
  'agent', 'rag', 'research', 'paper', 'regulation', 'compliance', 'deploy',
  'performance', 'token', 'context window', 'accuracy', 'speed', 'latency',
]

function isBuilderActionable(title: string): boolean {
  const t = title.toLowerCase()
  if (BUILDER_REJECT_PATTERNS.some(p => t.includes(p))) return false
  return BUILDER_SIGNAL_REQUIRED.some(p => t.includes(p))
}

// impactBonus is defined above with the IMPACT_TIERS constant

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
        if (!isBuilderActionable(item.title)) continue
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
    'AI OR LLM OR GPT OR Claude OR Gemini OR OpenAI OR Anthropic OR "language model" OR Mistral OR MCP OR Cursor OR Groq OR "vibe coding" OR "AI agent"'
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
    if (!isBuilderActionable(hit.title)) continue
    const eng = hit.points + Math.round(Math.log10((hit.num_comments ?? 0) + 1) * 20)
    candidates.push({
      title: hit.title, url, source: 'Hacker News', sourceTier: 3,
      engagement: eng, ageHours: Math.round(ageHours * 10) / 10,
      finalScore: computeScore(3, eng, ageHours, hit.title),
    })
  }
  return candidates
}

async function fetchFromGitHub(): Promise<Candidate[]> {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0]
  const res = await fetchWithTimeout(
    `https://api.github.com/search/repositories?q=topic:llm+OR+topic:ai+OR+topic:machine-learning+created:>${since}&sort=stars&order=desc&per_page=15`,
    8000
  ).catch(() => null)
  if (!res?.ok) return []

  interface GHRepo {
    full_name: string; description: string | null; html_url: string
    stargazers_count: number; created_at: string; pushed_at: string
  }
  interface GHResponse { items?: GHRepo[] }
  const json = await res.json() as GHResponse
  if (!json.items?.length) return []

  const now = Date.now()
  return json.items
    .filter(r => r.description && isAIRelevant(r.full_name + ' ' + (r.description ?? '')))
    .map(r => {
      const title = `[GitHub] ${r.full_name} — ${r.description ?? ''}`
      const ageHours = (now - new Date(r.created_at).getTime()) / 3_600_000
      return {
        title: title.slice(0, 140),
        url: r.html_url,
        source: 'GitHub',
        sourceTier: 3,
        engagement: r.stargazers_count,
        ageHours: Math.round(ageHours * 10) / 10,
        finalScore: computeScore(3, r.stargazers_count, ageHours, title),
      }
    })
}

async function fetchFromReddit(): Promise<Candidate[]> {
  const subreddits = 'MachineLearning+LocalLLaMA+artificial+OpenAI+ChatGPT+ArtificialIntelligence+ClaudeAI+GoogleGemini+singularity+mlscaling'
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
    .filter((c) => c.ageHours <= 48 && isAIRelevant(c.title) && isBuilderActionable(c.title))
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
    if (ageHours > 96) continue
    candidates.push({
      title, url: url.replace('/pdf/', '/abs/').replace(/v\d+$/, ''),
      source: 'arXiv', sourceTier: 3, engagement: 0,
      ageHours: Math.round(ageHours * 10) / 10,
      finalScore: computeScore(3, 0, ageHours, title),
    })
  }
  return candidates
}

// High-signal accounts and the tier to assign them
const NITTER_ACCOUNTS: Array<{ handle: string; tier: number }> = [
  // Tier 5 — lab leaders, every tweet is potential news
  { handle: 'sama',          tier: 5 }, // Sam Altman — OpenAI CEO
  { handle: 'DarioAmodei',   tier: 5 }, // Dario Amodei — Anthropic CEO
  { handle: 'ilyasut',       tier: 5 }, // Ilya Sutskever — SSI, ex-OpenAI chief scientist
  { handle: 'emollick',      tier: 5 }, // Ethan Mollick — Wharton, best practical AI research coverage

  // Tier 4 — primary signal, shapes roadmaps
  { handle: 'karpathy',      tier: 4 }, // Andrej Karpathy — gold standard for builders
  { handle: 'ylecun',        tier: 4 }, // Yann LeCun — Meta AI chief, contrarian views that matter
  { handle: 'fchollet',      tier: 4 }, // François Chollet — deep AI thinking
  { handle: 'demishassabis', tier: 4 }, // Demis Hassabis — Google DeepMind CEO
  { handle: 'gdb',           tier: 4 }, // Greg Brockman — OpenAI
  { handle: 'SemiAnalysis_', tier: 4 }, // Dylan Patel — semiconductor + AI infrastructure
  { handle: 'simonw',        tier: 4 }, // Simon Willison — most reliable practical AI tools coverage
  { handle: 'benedictevans', tier: 4 }, // Benedict Evans — strategic tech analysis, VC must-read
  { handle: 'paulg',         tier: 4 }, // Paul Graham — YC, shapes startup thinking on AI
  { handle: 'sriramk',       tier: 4 }, // Sriram Krishnan — a16z, Indian-American, very relevant
  { handle: 'hwchase17',     tier: 4 }, // Harrison Chase — LangChain CEO, agentic ecosystem
  { handle: 'jerryjliu0',    tier: 4 }, // Jerry Liu — LlamaIndex CEO, RAG/enterprise AI
  { handle: 'levelsio',      tier: 4 }, // Pieter Levels — what's actually shipping and making money

  // Tier 3 — practitioner signal
  { handle: 'swyx',          tier: 3 }, // swyx — AI engineering community
  { handle: '_philschmid',   tier: 3 }, // Philipp Schmid — HuggingFace
  { handle: 'mckaywrigley',  tier: 3 }, // McKay Wrigley — AI tools builder
  { handle: 'skirano',       tier: 3 }, // Pietro Schirano — design + AI intersection
  { handle: 'reach_vb',      tier: 3 }, // Vaibhav Srivastava — AI community
]

// Public Nitter instances — tried in order, first success wins per account
const NITTER_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.cz',
  'https://lightbrd.com',
]

async function fetchFromNitter(): Promise<Candidate[]> {
  const now = Date.now()
  const candidates: Candidate[] = []

  await Promise.allSettled(
    NITTER_ACCOUNTS.map(async ({ handle, tier }) => {
      for (const instance of NITTER_INSTANCES) {
        try {
          const res = await fetchWithTimeout(`${instance}/${handle}/rss`, 6000)
          if (!res.ok) continue
          const xml = await res.text()
          if (!xml.includes('<item') && !xml.includes('<entry')) continue

          for (const match of xml.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)) {
            const block = match[1]
            const rawTitle = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]
            const title = rawTitle?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
            const url = block.match(/<link[^>]*>(https?:\/\/[^<]+)<\/link>/i)?.[1]?.trim()
              ?? block.match(/<link[^>]*\shref=["'](https?:\/\/[^"']+)["']/i)?.[1]
            const dateStr = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim()
              ?? block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim()

            if (!title || !url) continue
            // skip retweets and replies — look for original content
            if (title.startsWith('RT @') || title.startsWith('R to @')) continue
            if (!isAIRelevant(title)) continue

            const publishedAt = dateStr ? new Date(dateStr) : new Date()
            const ageHours = (now - publishedAt.getTime()) / 3_600_000
            if (ageHours > 48) continue

            candidates.push({
              title: `[${handle}] ${title}`.slice(0, 160),
              url,
              source: `@${handle}`,
              sourceTier: tier,
              engagement: 0,
              ageHours: Math.round(ageHours * 10) / 10,
              finalScore: computeScore(tier, 0, ageHours, title),
            })
          }
          break // success — no need to try next instance for this account
        } catch {
          // instance down, try next
        }
      }
    })
  )
  return candidates
}

async function fetchAllCandidates(): Promise<Candidate[]> {
  const [rss, hn, reddit, arxiv, github, nitter] = await Promise.allSettled([
    fetchFromRSS(), fetchFromHN(), fetchFromReddit(), fetchFromArXiv(), fetchFromGitHub(), fetchFromNitter(),
  ])
  const all: Candidate[] = [
    ...(rss.status === 'fulfilled' ? rss.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(arxiv.status === 'fulfilled' ? arxiv.value : []),
    ...(github.status === 'fulfilled' ? github.value : []),
    ...(nitter.status === 'fulfilled' ? nitter.value : []),
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
    if (capped.length === 30) break
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
1. Pick the single story that forces the most important decision for Indian AI builders today.

DECISION-FORCING HIERARCHY — apply this in order. Pick the highest tier story present:

  TIER A — Pick immediately if present (forces a decision TODAY):
  • Pricing or cost change on any model/API builders actively use
  • API deprecation, breaking change, or migration deadline
  • Model weights released open-source (changes build-vs-buy instantly)
  • Regulatory compliance deadline with concrete penalty
  • Rate limit change that affects production systems

  TIER B — Pick if no Tier A exists (changes the roadmap this week):
  • New model release with benchmarks that beat the current default
  • Capability leap that unlocks a previously impossible use case
  • Major acquisition that changes platform dependencies
  • Open-source tool release that replaces a paid API

  TIER C — Pick if no Tier A or B exists (changes how you think, not just what you know):
  • Research paper with clear product implication (not just academic)
  • Benchmark result that inverts an assumption builders had
  • Strategic move that reveals where the market is going in 6 months

  TIER D — Last resort only (awareness, not action):
  • Funding rounds, hiring news, partnerships with no product/API change
  • Consumer product updates with no API or platform implication

Prefer tier 5 > tier 4 > tier 3 sources, but a Tier A story from a tier-3 source beats a Tier D story from tier-5. Age matters: same story older than 36h is stale.

MANDATORY EDITORIAL TEST: "Would a senior Indian PM or engineer do something DIFFERENT in their product, stack, or workflow in the next 48 hours because of this story?" If the answer is NO, it is Tier D — only pick if nothing better exists.

HARD REJECT — never pick these story types even from tier-5 sources:
- Consumer subscription tiers, social media features, or engagement metrics (Meta/Instagram subscriptions, Twitter Blue, TikTok AI features) — these are platform business stories, not AI builder stories
- Stock price moves, quarterly earnings, or market cap news unless a model/API announcement is bundled
- Layoffs or headcount cuts with no AI capability or strategic pivot tied to them
- "AI will change X industry" think-pieces with no concrete product, paper, or pricing news
- Consumer AI features (AI photo filters, AI recommendations) with no API or platform implication for builders
- Funding rounds for AI startups with no model, product, or pricing news — money raised alone is not signal

2. Write the full signal as JSON.
3. Document your editorial decision in two metadata fields alongside the article fields:

   - pick_reason: REQUIRED FORMAT — name the Decision-Forcing Tier (A, B, C, or D) the winner satisfies, the specific criterion, and why the runner-up lost. 1-2 sentences.
     BAD: "Most impactful story today." / "Chosen for builder relevance."
     GOOD: "Tier A — pricing change forces cost forecast revision TODAY for any team billing on this API. Runner-up was a Tier C benchmark result: changes how you think but not what you build this week."
     If you cannot name a Tier and a runner-up, keep writing until you can.

   - rejected_alternatives: Array of 2-4 candidates you did NOT pick. Each entry MUST include the Tier label in the reason field. Keep reasons sharp.
     Format: [{"title": "...", "reason": "Tier B — new model, but no pricing data yet; can't reprice unit economics without the benchmark."}]
     BAD reason: "Less relevant." / "Not as impactful."
     GOOD reason: "Tier C — benchmark result inverts an assumption but no 48h action follows; Tier A pricing story beats it."

${QUALITY_RULES}

Return ONLY valid JSON. No markdown fences. No explanation before or after.

{
  "category": "models"|"tools"|"business"|"policy"|"research",
  "headline": "Main article title. Sharp, verb-led, punchy. Target: 12 words. Hard cap: 14 words. No clickbait. E.g. 'GPT-5 Mini cuts API costs by 10×, repricing every AI product budget.'",
  "summary": "TL;DR strip body. Two dense sentences: what happened + the forced action. Target: 25 words. Hard cap: 38 words. Bold 2+ key phrases with **double asterisks** on specific numbers, named entities, or the key implication. E.g. '**GPT-5 Mini** ships at **10× cheaper**, +12% smarter than GPT-4 Turbo, with zero fanfare. Switch defaults this week — competitors will match by Friday.'",
  "why_it_matters": "MANDATORY: 2 paragraphs separated by \\n\\n — DO NOT write a single block, the UI will break. PARA 1 (2 sentences, 30-40w): what shifted and why it matters NOW. Hard cap: 48 words. PARA 2 (2 sentences, 30-40w): the reframe — what the reader must build or decide tomorrow. Hard cap: 50 words. Bold at least 3 key phrases with **double asterisks** across both paragraphs — numbers, named entities, or key claims. These two paragraphs flank the pull_quote in the rendered design.",
  "pull_quote": "One killer editorial sentence — opinion not recap. Target: 20 words. Hard cap: 24 words. Wrap 1–3 key words in **bold** for punch phrase emphasis (e.g. 'The default model is no longer capability — it\\'s **who notices the price change first**'). Bold the punch phrase, not entire clauses. Word count excludes asterisks. Must not be null.",
  "lens_pm": "1–2 sentences for a PM. Concrete. What should they rethink or do?",
  "lens_founder": "1–2 sentences for a founder. Competitive or strategic lens.",
  "lens_builder": "1–2 sentences for an engineer/builder. Stack, API, or workflow implication.",
  "stats": [
    LAYER 3 — Populate 3 stats based on article_type. MANDATORY (non-null) for PRODUCT-PRICING, FUNDING, POLICY-REGULATION, RESEARCH-BENCHMARK — override the conditional rule for these types. Each stat: label (1-2 words, hard cap 3w), value (headline number or fact), delta (trend or null), detail (5-8 word context line, hard cap 10w).
    PRODUCT-PRICING → [cost change, performance delta, release mode]. E.g. [{"label":"Input cost","value":"$0.04/1M tokens","delta":"↓ 10× vs GPT-4o Mini","detail":"Down from $0.40 — switch this week"},{"label":"Reasoning","value":"+12%","delta":"↑ vs GPT-4 Turbo","detail":"MMLU-Pro benchmark gain"},{"label":"Release mode","value":"Silent","delta":null,"detail":"Pricing page only, no press cycle"}]
    FUNDING → [raise amount, runway implication, comparable round]. E.g. [{"label":"Raise","value":"$950M Series C","delta":null,"detail":"Largest enterprise AI agent round of 2026"},{"label":"Runway","value":"~18 months","delta":null,"detail":"At current burn rate"},{"label":"Comparable","value":"$124M","delta":null,"detail":"Anthropic at same stage, Series B"}]
    POLICY-REGULATION → [deadline, scope, penalty]. E.g. [{"label":"Deadline","value":"Aug 1, 2026","delta":null,"detail":"EU AI Act enforcement start date"},{"label":"Scope","value":">$10M ARR","delta":null,"detail":"All AI/ML companies above threshold"},{"label":"Penalty","value":"4% revenue","delta":null,"detail":"Of global annual turnover, per violation"}]
    RESEARCH-BENCHMARK → [SOTA result, compute cost, reproducibility]. E.g. [{"label":"SOTA","value":"84.5% MMLU","delta":"↑ from 81.2%","detail":"Prior best was Gemini Ultra"},{"label":"Compute","value":"8K H100s","delta":null,"detail":"3-month training run"},{"label":"Repro","value":"Public","delta":null,"detail":"Code and weights on HuggingFace"}]
    If article_type does not match any above, set stats to null — the section will hide gracefully.
  ],
  "action_items": [
    "Action body. Bold the key verb phrase at the start. Target: 20-26 words per item. Hard cap: 31 words. Action type labels (Run / Flag / Check) are assigned by position in the component — do NOT include them in the string. E.g. '**Re-run your unit economics** on every feature gated by token cost. There\\'s likely one feature you killed last quarter that just became profitable.'",
    "Second action body — different action verb, different consequence. 20-26 words. Hard cap 31.",
    "Third action body — closes with the ownership or narrative move. 20-26 words. Hard cap 31."
  ],
  "counter_view": "Devil's advocate body. 3–4 sentences. Genuine pushback — not a strawman. Target: 53 words. Hard cap: 62 words. Present the strongest case against the signal's main claim.",
  "counter_view_headline": "5–7 words for the counter view headline",
  "sources": [
    { "label": "Source name", "url": "full URL" }
  ],
  "read_minutes": 4,
  "deeper_read": "URL of the primary source article",
  "editorial_take": "One sharp tweetable sentence — AI Signal's editorial opinion on this story. Standalone. Not a recap of facts. e.g., 'The default model is no longer a question of capability — it's a question of who notices the price change first.'",
  "broadcast_phrases": [
    LAYER 2 — Generate exactly 3 Type A editorial phrases. These are article-specific editorial commentary in the AI Signal voice. Target: 6-12 words each. Hard cap: 16 words (POLICY-REGULATION stories may need up to 16w for contextual precision). DO NOT generate counter-style phrases ('X tokens processed today', 'X startups registered') or backstory-style phrases ('Why 06:14 IST?') — those are platform templates hardcoded in the JS, not Sonnet's output.
    Type A pattern: one editorial sentence, present-tense, specific to this story's implication.
    Examples (do not copy): "Today's signal: pricing economics shifted overnight." | "OpenAI quietly cut model costs by 10×. Most teams haven't noticed yet." | "If you ship AI products, your unit economics changed today."
    "Phrase 1: framing — what shifted and why it matters (start with 'Today\\'s signal:' or story-specific hook)",
    "Phrase 2: the specific number or named fact that anchors the story",
    "Phrase 3: the implication — consequence for the reader's decisions"
  ],
  "pick_reason": "REQUIRED: name the Decision-Forcing Tier (A/B/C/D), the specific criterion, and why the runner-up lost. E.g. 'Tier A — API pricing change forces cost reforecast TODAY. Tier C benchmark story loses: changes thinking, not the 48h build queue.'",
  "rejected_alternatives": [{"title": "Verbatim candidate title", "reason": "Include Tier label. E.g. 'Tier C — research paper; no 48h action. Tier A pricing story outranks it.'"}],
  "extended_data": {
    "numbers_headline": "Block-title for 'By the Numbers'. Target: 5 words. Hard cap: 8 words. What the numbers PRICE or VALIDATE (FUNDING), what ASSUMPTION just broke (PRODUCT-PRICING), what CONSTRAINT landed (POLICY), what BASELINE cracked (RESEARCH). Specific to this signal. Do not use 'the data shifted overnight' or 'by the numbers'.",
    "matters_headline": "Block-title for 'Why It Matters'. Target: 6 words. Hard cap: 8 words. What the reader needs to rethink — their budget, roadmap, assumption, or decision. Specific to this signal. Do not use 'the bigger picture' or 'why it matters'.",
    "tickers": [
      Exactly 3 tickers. label: 4-5 word metric name + timeframe (hard cap 6w). detail: 4-6 word context line (hard cap 7w).
      { "label": "Input cost", "value": "$0.04", "change": { "direction": "down", "text": "↓ 10×" }, "detail": "Per million tokens vs GPT-4 Turbo" },
      { "label": "Reasoning delta", "value": "+12%", "change": { "direction": "up", "text": "↑ vs GPT-4 Turbo" }, "detail": "MMLU-Pro benchmark" },
      { "label": "Window to act", "value": "48h", "change": { "direction": "flat", "text": "before competitors move" }, "detail": "Historical lag after OpenAI pricing changes" }
    ],
    "preview_cards": [
      { "index": "01", "label": "By the numbers", "value": "≤8 words. One sharp fact with the key number. E.g. '$950M — largest enterprise AI agent round of 2026'" },
      { "index": "02", "label": "Why it matters", "value": "≤8 words. What assumption or dynamic just broke. E.g. 'Enterprise agent layer just went winner-take-most.'" },
      { "index": "03", "label": "The move", "value": "≤8 words. One concrete action, time-boxed. E.g. 'Map your product overlap with Sierra this week.'" }
    ],
    "did_you_know_facts": [
      LAYER 6 — Produce 8-12 facts. Each fact MUST be a complete sentence — never truncate mid-word or mid-clause. VOICE: write as if you are genuinely excited to tell the reader this fact — not a dry statement, not a headline. Think "Here's the wild part:" energy. Wrap ALL numbers, figures, and key stats in <span class="nb-num">value</span> HTML. Build from the story's core data and its ecosystem ripples — no generic AI trivia.
      Example voice: "Elon's Colossus cluster has over <span class=\"nb-num\">100,000</span> H100s in a single building. It is the GPU equivalent of a power station — and Anthropic just plugged in." NOT: "xAI's Colossus cluster is one of the largest GPU installations."
      FACTUAL ACCURACY: verify company names and affiliations. xAI and SpaceX are separate companies. Do not conflate them or assign subsidiaries incorrectly.
      { "category": "numbers", "text": "Excited voice, complete sentence, nb-num spans on all numbers. 11-23 words. Hard cap 28w." },
      { "category": "industry", "text": "Excited voice, complete sentence. Counterintuitive industry fact specific to this signal. 11-23 words. Hard cap 28w." },
      { "category": "trivia", "text": "Excited voice, complete sentence. Historical parallel or analogy. 11-23 words. Hard cap 28w." }
    ],
    "primary_chart": {
      "type": "comparison",
      "title": "Cost per million tokens — major models",
      "subtitle": "April 2026 input pricing",
      "data": [
        { "label": "GPT-5 Mini", "value": "$0.04", "width_pct": 4, "fill_color": "signal" },
        { "label": "GPT-4o Mini", "value": "$0.15", "width_pct": 15, "fill_color": "warm" },
        { "label": "GPT-4 Turbo", "value": "$0.40", "width_pct": 40, "fill_color": "mute", "opacity": 0.7 }
      ]
    },
    "one_breath": {
      "text": "One punchy sentence — different from the summary. Name the entity, name the shift, name the consequence. Bold 2 key phrases with **double asterisks**. Target: 18-24 words. Hard cap: 28 words. E.g. '**Anthropic** just bought compute from a competitor — if your product depends on **Claude capacity**, your architecture assumptions just changed.'"
    },
    "insights_strip": [
      Exactly 3 cells. text: one sharp sentence. Target: 10-14 words. Hard cap: 17 words. Must fit a single scannable cell — no dependent clauses. REQUIRED: wrap exactly 1 key phrase per cell in ==double equals== to highlight it (e.g. "A ==10× cost drop== on the default reasoning model — silently shipped.").
      ORIGINALITY RULE: each cell must say something the headline does NOT say. A cell that recaps the headline event in different words is a failure — push to the implication, the mechanism, or the closing window. Test: if the cell could be a sub-headline on the same article, rewrite it deeper.
      { "icon": "→", "label": "What changed", "text": "A ==key change== — context sentence. 10-14 words. Hard cap 17w." },
      { "icon": "◐", "label": "Who's affected", "text": "The ==specific audience== that must act — consequence. 10-14 words. Hard cap 17w." },
      { "icon": "⚡", "label": "Move by", "text": "==Concrete action== by [timeframe] — closing window. 10-14 words. Hard cap 17w." }
    ],
    "cascade": {
      "direction": "forecast",
      "title": "What happens next",
      "subtitle": "LAYER 7 — subtitle: Target 10 words. Hard cap: 12 words. E.g. 'The cascade has a shape. Read it before competitors do.'",
      "steps": [
        LAYER 7 — Exactly 4 steps, logical sequence (This week → Week 2 → Week 3 → Week 4, or Day 1 → Week 1 → Month 1 → Quarter 1 pattern). Each event: 1 declarative sentence. Target: 8-9 words. Hard cap: 11 words. No filler words ('essentially', 'basically', 'in essence'). No dependent clauses.
        { "marker": 1, "week": "This week", "event": "8-9 words. Declarative. Fastest-moving teams act NOW. E.g. 'Competing vendors launch preemptive pricing conversations.'" },
        { "marker": 2, "week": "Week 2", "event": "8-9 words. Second-order move. E.g. 'Enterprise buyers use this round as negotiation leverage.'" },
        { "marker": 3, "week": "Week 3", "event": "8-9 words. Market or ecosystem response. E.g. 'Open-source equivalents close the gap further.'" },
        { "marker": 4, "week": "Week 4", "event": "8-9 words. Structural shift. E.g. 'Pricing pages refresh again. Floor is the new ceiling.'" }
      ]
    },
    "stakeholders": {
      "frame": "win_lose",
      "title": "Winners and losers",
      "subtitle": "Target: 10 words. Hard cap: 14 words. Name who is IN the 2x2 grid by naming the tension specific to this signal. Do not use 'stakeholders', 'first-order impact', or 'winners and losers' as phrasing.",
      "cells": [
        who: 3-5 word role/persona label (hard cap 8w). why: 1-2 sentence impact. Target: 11-18 words. Hard cap: 22 words. REQUIRED: bold exactly 1 key phrase per why using **text** markers.
        { "type": "win", "who": "3-5 word winner group label", "why": "They gain **concrete benefit** — specific outcome here." },
        { "type": "win", "who": "3-5 word second winner label", "why": "**Key advantage** lands here — downstream effect." },
        { "type": "lose", "who": "3-5 word loser group label", "why": "Their **structural weakness** is now exposed — consequence." },
        { "type": "lose", "who": "3-5 word second loser label", "why": "**Risk vector** materialises — specific harm." }
      ]
    },
    "decision_aid": {
      "frame": "yes_no",
      "title": "Decision framing headline (e.g. 'Should you switch your default model?')",
      "question": "The core yes/no question the reader faces right now",
      "rows": [
        question: yes/no qualifying question. Target: 8-10 words. Hard cap: 12 words. verdict_text: action-first pill label. Target: 3-4 words. Hard cap: 5 words.
        { "q_num": "Q1", "question": "First qualifying question — most common use case. 8-10 words, hard cap 12.", "verdict": "go", "verdict_text": "3-4 words. E.g. 'Yes → Go', 'Switch now'" },
        { "q_num": "Q2", "question": "Second qualifying question — edge case or caveat. 8-10 words, hard cap 12.", "verdict": "wait", "verdict_text": "3-4 words. E.g. 'Run evals first', 'Audit overlap'" },
        { "q_num": "Q3", "question": "Third qualifying question — the laggard signal. 8-10 words, hard cap 12.", "verdict": "no", "verdict_text": "3-4 words. E.g. 'Wait — no urgency', 'Hold position'" }
      ],
      "final_verdict": "One sentence synthesis verdict. Target: 10 words. Hard cap: 12 words. E.g. 'Switch defaults this week if cost-bound. Run evals if quality-bound.'"
    },
    "reactions": [
      LAYER 5 — Exactly 3 reactions. CRITICAL: every quote MUST be a grammatically complete sentence — never stop mid-word, mid-clause, or mid-thought. A truncated quote is a hard failure. quote: Target 15-20 words. Hard cap: 26 words. Bold the first 3-5 words to draw the eye (e.g. '**This is the iPhone-moment** for inference cost.'). name: role archetype, not a real name. role: specific context line. name + role combined: 8-10 words. Hard cap: 12 words. Include at least one skeptic voice among the 3.
      { "quote": "**Bold first 3-5 words.** Rest of punchy industry sentiment. Complete sentence. 15-20 words. Hard cap 26w.", "name": "Role archetype (not a real name)", "role": "Specific context: Series A CTO, indie hacker, principal PM" },
      { "quote": "**Bold first 3-5 words.** Different perspective, more specific to Indian market. Complete sentence. 15-20 words. Hard cap 26w.", "name": "Role archetype", "role": "Specific context" },
      { "quote": "**Bold first 3-5 words.** Skeptic or contrarian voice — genuine pushback. Complete sentence. 15-20 words. Hard cap 26w.", "name": "Role archetype", "role": "Specific context" }
    ],
    "standup_messages": {
      "slack": "🧠 AI Signal · [Date e.g. May 6, 2026]\n\n[One sentence: what happened + the key number.]\n\n→ Why it matters: [One sentence on the implication for the team.]\n→ What I'd do: [One concrete action, time-boxed.]\n\n[X] min read · aisignal.so/signal/[N]",
      "email": "Hey —\n\nQuick share from this morning's AI Signal: [What happened, 1 sentence.]\n\nThe implication: [Why it matters to them, 1 sentence.]\n\n[One concrete action suggestion.]\n\nFull read ([X] min): aisignal.so/signal/[N]\n\n— shared via AI Signal",
      "whatsapp": "AI Signal · [Date] 📍\n\n[Lead with the specific number or fact. Bold the key figure.] [10× cheaper / $950M / 40 min deployment.]\n\n[Why the contact cares, 1 sentence.]\n\naisignal.so/signal/[N]",
      "linkedin": "[Hook: the pattern this represents, 1 declarative sentence.]\n\n[What happened + why it matters, 2 sentences.]\n\nThree things winning teams are doing this week:\n\n→ [Action 1 — specific, doable in 2h]\n\n→ [Action 2 — specific, doable in 2h]\n\n→ [Action 3 — specific, doable in 2h]\n\n[Reframe sentence: the old default is now the wrong choice / the window is narrowing.]\n\n—\nRead this morning's AI Signal — one AI story every day at 6:14 AM IST. For people who ship.\n\naisignal.so"
    },
    "tomorrow_drafts": [
      { "day": "TUE", "date": "Apr 29", "text": "Headline-style story angle that follows logically from today's story", "status": "lead_candidate", "status_detail": "What signal you are watching to confirm this story develops" },
      { "day": "WED", "date": "Apr 30", "text": "Second follow-on angle — second-order consequence of today's story", "status": "sealed" },
      { "day": "THU", "date": "May 1", "text": "Third follow-on angle — broader market or competitive implication", "status": "sealed" }
    ],
    "open_question": "The single unresolved question that changes everything about this story. Forward-looking, specific to this signal. Must feel genuinely uncertain — not rhetorical. Target: 12-20 words. Hard cap: 25 words. Must end with ?",
    "signal_boost": { "see SIGNAL_BOOST RULES below" }
    [IF category=tools, also add: "replaces": { "yes": "...", "not_yet": "..." }]
    [IF category=research, also add: "readiness_level": "lab|paper|prototype|product|deployed"]
  }
}

CATEGORY-SPECIFIC FIELDS — generate these only when category matches:

IF category = "tools":
  Add to extended_data: "replaces": { "yes": "What workflow or behavior this tool concretely replaces. Be specific — name the tool or process. 8-15 words.", "not_yet": "The specific gap that keeps the old way alive — what it still can't do. 8-15 words." }

IF category = "research":
  Add to extended_data: "readiness_level": "One of: lab | paper | prototype | product | deployed. lab=initial experiments only, paper=published findings but no build yet, prototype=working demo exists, product=limited/beta release, deployed=in production at scale."

SIGNAL_BOOST RULES — always produce signal_boost, every article:
signal_boost is the "bonus at the end" — a quick-win the reader can act on in the next 5 minutes, directly tied to today's story. Choose type based on category:

IF category = "models" OR category = "tools":
  type = "prompt"
  title = "Try this prompt" (or a more specific variant if it fits better)
  content = A concrete copy-paste prompt (for Claude/ChatGPT) that lets the reader immediately explore or apply the story's core insight. 2-4 sentences. Should feel like: "Given today's story, here's the first thing a smart PM/builder would actually type."
  cta_text = "Copy into Claude →" or "Copy into ChatGPT →" depending on the story

IF category = "business" OR category = "policy":
  type = "quote"
  title = "Worth remembering"
  content = A sharp, real quote from a well-known person (founder, investor, thinker) that reframes today's story in a memorable way. Must be a real quote, properly attributed. 15-30 words.
  attribution = "Full Name · Role · Affiliation" (e.g. "Jeff Bezos · Founder · Amazon")

IF category = "research":
  type = "fact"
  title = "Puts it in context"
  content = One surprising, specific fact from the broader ecosystem that makes this research feel more real or more urgent. Not from the article itself — a related data point the reader probably doesn't know. 1-2 sentences.

SIGNAL_BOOST CONSTRAINTS:
- content must be directly tied to THIS story — not generic AI trivia.
- For prompts: the prompt must be immediately runnable. Avoid vague asks like "tell me about X". Write the actual prompt a PM would send.
- For quotes: real person only, real quote only. Do not invent quotes. If no good quote exists, default to type="fact" instead.
- For facts: surprising and specific. Numbers preferred. "As of 2024" or equivalent temporal anchor required.

OPEN_QUESTION RULES:
- Must be unique to THIS story — if it could appear unchanged on any AI article, rewrite it.
- Name the specific entity, capability, or outcome this story hinges on.
- Do NOT use generic templates like "Will X succeed?" or "How will Y respond?"

EXTENDED_DATA FALLBACK RULES — apply when story data is thin or the default structure does not fit:
- primary_chart.type = "quote_callout" when there is no comparison, trajectory, or capital flow data. LAYER 4: quote_callout data MUST be an object, NOT an array: { "quote": "15-25 word single sentence — use editorial_take or pull_quote", "attribution": "Name · Role · Affiliation" }. If no good quote is available, set primary_chart to null rather than generating an empty quote_callout. NEVER omit primary_chart — it is required unless explicitly null.
- stakeholders.frame = "evidence_grid" when there are no clear winners/losers (policy ambiguity, early-stage research, opinion pieces). Use "evidence_strong", "evidence_weak", and "open_question" cell types.
- stakeholders.frame = "before_after" when the story describes a transition or product change with clear before/after states. Use "before" and "after" cell types.
- decision_aid.frame = "segment_impact" when the story has no clear yes/no decision but affects different audience segments differently. Use "segment_a", "segment_b", "segment_c" verdict types.
- cascade.direction = "history" for retrospectives or post-mortems; "forecast" for forward-looking developments (default).
- tickers: if the story has fewer than 3 concrete numbers, derive a relevant third from context (market size, time window, comparison figure). Always produce exactly 3 tickers.
- did_you_know_facts: always produce 8–12 facts. If the story is thin, draw from the broader ecosystem — pricing history, adjacent market data, audience-relevant benchmarks for Indian tech PMs/founders/engineers.
- reactions: write as realistic industry archetypes. Do NOT use real names. Include at least one skeptic among the 3 voices.

## DYNAMIC HEADLINE FIELDS

Generate numbers_headline, matters_headline, and stakeholders.subtitle per signal.
These are NOT templates and NOT type-level lookups. Examples below illustrate
the rhetorical MOVE (the kind of implication being drawn), not the wording.
Do not reuse phrases like "moat compounded", "sets the floor", or "budget is now
wrong" across signals — those are illustrative of the move, not a vocabulary to
draw from. Each headline should sound like it was written for this one signal alone.

### Rhetorical lens by article_type

FUNDING
  Lens: What does this raise PRICE or VALIDATE?
  The raise is evidence. What does it prove about a market, a thesis,
  a category, or a competitive position?

PRODUCT-PRICING
  Lens: What ASSUMPTION, BUDGET, or DECISION just broke?
  The product/price change is a forcing function. What does the reader
  need to revisit because of it?

POLICY-REGULATION
  Lens: What DEADLINE, CONSTRAINT, or SHIFT just landed?
  The policy is operational. What is now true, or now required, that
  wasn't true yesterday?

RESEARCH-BENCHMARK
  Lens: What BASELINE, APPROACH, or ASSUMPTION just cracked?
  The research moved a number. What was someone relying on that no
  longer holds?

### numbers_headline examples (do not copy):

FUNDING:
  "Sierra's $950M sets the enterprise agent floor."
  "Cohere's enterprise pivot got a $2.1B rationale."
  "The seed round is now $50M in foundation models."
  "Enterprise AI agents aren't a pilot anymore."

PRODUCT-PRICING:
  "GPT-4o Mini just made your current model choice wrong."
  "Gemini's $0.00 tier eliminated your free-tier moat."
  "At these prices, your model router is now legacy."

POLICY-REGULATION:
  "The EU AI Act has a compliance date. It's six months out."
  "The FTC audit rule adds 30 days to every enterprise deal."

RESEARCH-BENCHMARK:
  "The MMLU ceiling isn't the ceiling anymore."
  "Your eval suite was measuring the wrong dimension."

### matters_headline examples (do not copy):

FUNDING:
  "Your CX roadmap's AI timeline just compressed."
  "The 'wait for the market to mature' window just closed."
  "Every enterprise AI procurement process has a reference price now."

PRODUCT-PRICING:
  "Every Q1 budget is now wrong."
  "Procurement just lost its leverage at the negotiating table."
  "Your model vendor lock-in just got cheaper to break."

POLICY-REGULATION:
  "Legal teams now own product roadmap."
  "Your enterprise deals just got 60 days slower."
  "The compliance clock starts Friday. Your backlog doesn't reflect that yet."

RESEARCH-BENCHMARK:
  "The model you chose last quarter may not be the right one now."
  "RLHF assumptions in your eval setup need revisiting."

### stakeholders.subtitle examples (do not copy):

8–16 words. Name who is IN the 2x2 grid by naming the tension or
relationship specific to this signal.

FUNDING:
  "The enterprises writing CX checks, and the incumbents about to feel it."
  "Series A founders in the same space, and VCs recalibrating their bets."
  "Open-source maintainers who lost a funding argument, and enterprises who gained a vendor."

PRODUCT-PRICING:
  "The vendors who held pricing power, and the buyers now holding it back."
  "Teams who budgeted this quarter on last quarter's model prices."

POLICY-REGULATION:
  "The legal teams who don't know yet, and the compliance vendors who do."
  "Enterprise AI buyers under review, and the startups that just became compliant infrastructure."

RESEARCH-BENCHMARK:
  "The labs that set the baseline, and the teams that built on it."
  "Applied ML engineers whose eval suites just got updated specs."

### POLICY-REGULATION — Bet/Burn fallback

If article_type is POLICY-REGULATION and neither bet/burn card maps cleanly
to a product or market bet (the framing feels forced — it is a compliance
constraint, not a choice someone is making), set that card's content to:

  [FORCED — review before publish: this signal is a constraint, not a bet.
  Bet/Burn framing may not apply. Editor should consider Adapter/Sufferer
  variant in Phase 2.]

Do not rationalize a fit. The flag is the correct output.

### Self-check before finalizing headline fields

For each of the three generated fields, ask:
  "Would a different signal in the same article_type produce a noticeably
   different version of this headline?"

If the answer is no — if the headline could appear unchanged on any FUNDING
signal or any PRODUCT signal — identify which specific fact from this signal
makes the implication unique and rewrite once around that fact.

If the rewrite still fails the test, output the headline with [GENERIC — review]
prepended and continue. Do not loop further.

${SELF_CHECK_QUESTIONS}`

  const msg = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 10000,
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

  const outputTokens = msg.usage?.output_tokens ?? 0
  const tokenPct = Math.round((outputTokens / 10000) * 100)
  const tokenTag = tokenPct >= 95 ? 'ERROR' : tokenPct >= 90 ? 'WARN' : 'OK'
  console.log(`[token-usage] output=${outputTokens} / 10000 (${tokenPct}%) [${tokenTag}]`)
  if (tokenPct >= 95) console.error('[token-usage] >95% of cap — schema may be overflowing. Consider trimming extended_data examples.')
  else if (tokenPct >= 90) console.warn('[token-usage] >90% of cap — monitor closely. Next schema change could break generation.')

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
  return normalizeSignalNewlines(signal)
}

// ─── Newline normalizer ─────────────────────────────────────────────────────────
// Claude consistently outputs \n (single newline) in JSON strings; the validator
// and frontend both split why_it_matters on \n\n. This normalizes at the data
// boundary — applied after every JSON.parse of a signal, including fixer outputs.
function normalizeSignalNewlines(s: GeneratedSignal): GeneratedSignal {
  if (!s.why_it_matters) return s
  const paras = s.why_it_matters.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0)
  if (paras.length < 2) return s // genuinely single paragraph — let cascade handle structurally
  return { ...s, why_it_matters: paras.join('\n\n') }
}

// ─── Word-count enforcement ──────────────────────────────────────────────────────

function applyFieldPatch(signal: GeneratedSignal, field: string, value: string): GeneratedSignal {
  const indexed = field.match(/^(.+)\[(\d+)\]$/)
  const base = indexed ? indexed[1] : field
  const idx  = indexed ? parseInt(indexed[2], 10) : -1
  const ed   = signal.extended_data

  switch (base) {
    case 'headline':     return { ...signal, headline: value }
    case 'summary':      return { ...signal, summary: value }
    case 'pull_quote':   return { ...signal, pull_quote: value }
    case 'counter_view': return { ...signal, counter_view: value }

    case 'signal_block_body': {
      const paras = (signal.why_it_matters ?? '').split(/\n\n+/)
      paras[0] = value
      return { ...signal, why_it_matters: paras.join('\n\n') }
    }
    case 'block_2_prose': {
      const paras = (signal.why_it_matters ?? '').split(/\n\n+/)
      paras[1] = value
      return { ...signal, why_it_matters: paras.join('\n\n') }
    }

    case 'broadcast_phrase': {
      if (idx < 0 || !signal.broadcast_phrases) return signal
      const arr = [...signal.broadcast_phrases]; arr[idx] = value
      return { ...signal, broadcast_phrases: arr }
    }
    case 'stat_label': {
      if (idx < 0 || !signal.stats) return signal
      const arr = [...signal.stats]; arr[idx] = { ...arr[idx], label: value }
      return { ...signal, stats: arr }
    }
    case 'stat_detail': {
      if (idx < 0 || !signal.stats) return signal
      const arr = [...signal.stats]; arr[idx] = { ...arr[idx], detail: value }
      return { ...signal, stats: arr }
    }
    case 'action_body': {
      if (idx < 0 || !signal.action_items) return signal
      const arr = [...signal.action_items]; arr[idx] = value
      return { ...signal, action_items: arr }
    }

    case 'numbers_headline': return ed ? { ...signal, extended_data: { ...ed, numbers_headline: value } } : signal
    case 'matters_headline': return ed ? { ...signal, extended_data: { ...ed, matters_headline: value } } : signal

    case 'ticker_label': {
      if (idx < 0 || !ed?.tickers) return signal
      const arr = [...ed.tickers]; arr[idx] = { ...arr[idx], label: value }
      return { ...signal, extended_data: { ...ed, tickers: arr } }
    }
    case 'ticker_detail': {
      if (idx < 0 || !ed?.tickers) return signal
      const arr = [...ed.tickers]; arr[idx] = { ...arr[idx], detail: value }
      return { ...signal, extended_data: { ...ed, tickers: arr } }
    }
    case 'insight_text': {
      if (idx < 0 || !ed?.insights_strip) return signal
      const arr = [...ed.insights_strip]; arr[idx] = { ...arr[idx], text: value }
      return { ...signal, extended_data: { ...ed, insights_strip: arr } }
    }
    case 'cascade_subtitle':
      return ed?.cascade ? { ...signal, extended_data: { ...ed, cascade: { ...ed.cascade, subtitle: value } } } : signal
    case 'cascade_step': {
      if (idx < 0 || !ed?.cascade?.steps) return signal
      const arr = [...ed.cascade.steps]; arr[idx] = { ...arr[idx], event: value }
      return { ...signal, extended_data: { ...ed, cascade: { ...ed.cascade, steps: arr } } }
    }
    case 'stakeholder_subtitle':
      return ed?.stakeholders ? { ...signal, extended_data: { ...ed, stakeholders: { ...ed.stakeholders, subtitle: value } } } : signal
    case 'stakeholder_who': {
      if (idx < 0 || !ed?.stakeholders?.cells) return signal
      const arr = [...ed.stakeholders.cells]; arr[idx] = { ...arr[idx], who: value }
      return { ...signal, extended_data: { ...ed, stakeholders: { ...ed.stakeholders, cells: arr } } }
    }
    case 'stakeholder_why': {
      if (idx < 0 || !ed?.stakeholders?.cells) return signal
      const arr = [...ed.stakeholders.cells]; arr[idx] = { ...arr[idx], why: value }
      return { ...signal, extended_data: { ...ed, stakeholders: { ...ed.stakeholders, cells: arr } } }
    }
    case 'decision_question': {
      if (idx < 0 || !ed?.decision_aid?.rows) return signal
      const arr = [...ed.decision_aid.rows]; arr[idx] = { ...arr[idx], question: value }
      return { ...signal, extended_data: { ...ed, decision_aid: { ...ed.decision_aid, rows: arr } } }
    }
    case 'decision_verdict_text': {
      if (idx < 0 || !ed?.decision_aid?.rows) return signal
      const arr = [...ed.decision_aid.rows]; arr[idx] = { ...arr[idx], verdict_text: value }
      return { ...signal, extended_data: { ...ed, decision_aid: { ...ed.decision_aid, rows: arr } } }
    }
    case 'reaction_quote': {
      if (idx < 0 || !ed?.reactions) return signal
      const arr = [...ed.reactions]; arr[idx] = { ...arr[idx], quote: value }
      return { ...signal, extended_data: { ...ed, reactions: arr } }
    }
    // reaction_attribution is composite (name · role) — cannot patch individual fields
    case 'did_you_know_fact': {
      if (idx < 0 || !ed?.did_you_know_facts) return signal
      const arr = [...ed.did_you_know_facts]; arr[idx] = { ...arr[idx], text: value }
      return { ...signal, extended_data: { ...ed, did_you_know_facts: arr } }
    }
    default:
      console.warn(`[VALIDATE] unknown patch field: ${field}`)
      return signal
  }
}

async function enforceWordCounts(signal: GeneratedSignal, client: Anthropic): Promise<GeneratedSignal> {
  const report = validateWordCounts(signal as unknown as WcSignalInput)

  if (report.all_violations.length === 0) {
    console.log('[VALIDATE-PASS] all word counts within caps')
    return signal
  }

  const hardCount = report.hard_violations.length
  const softCount = report.soft_violations.length
  console.log(`[VALIDATE-WARN] ${hardCount} HARD + ${softCount} SOFT word-count violations`)
  report.all_violations.forEach(v =>
    console.log(`  [${v.severity}] ${v.field}: ${v.words}w (soft:${v.soft} hard:${v.hard}) — "${v.excerpt}"`)
  )

  if (hardCount === 0) {
    console.log('[VALIDATE-PASS] no HARD violations — soft warnings logged, proceeding')
    return signal
  }

  // reaction_attribution is composite — cannot patch, skip from regen targets
  const regenTargets = report.hard_violations.filter(v => !v.field.startsWith('reaction_attribution'))
  if (regenTargets.length === 0) {
    console.log('[VALIDATE-WARN] only attribution violations — cannot patch, proceeding')
    return signal
  }

  const fieldLines = regenTargets.map(v =>
    `  "${v.field}" (${v.words} words → hard cap ${v.hard}): ${v.text}`
  ).join('\n')

  const regenPrompt = `Trim each article field below to meet its word-count hard cap. Return ONLY valid JSON — no markdown fences, no extra text. Keys must exactly match the field names shown (including [N] index notation).

Fields to trim:
${fieldLines}

Rules:
- HARD REQUIREMENT: Preserve ALL **bold markers** exactly as they appear. NEVER remove a **word** wrapped in asterisks. Word count includes bolded words.
- Keep editorial voice and meaning — cut filler, not information
- Return only the listed fields`

  try {
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: regenPrompt }],
    })

    const raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[REGEN-FAIL] no JSON in Sonnet response — keeping original')
      return signal
    }

    const patches = JSON.parse(jsonMatch[0]) as Record<string, string>
    let patched = signal
    for (const [field, value] of Object.entries(patches)) {
      if (typeof value === 'string') patched = applyFieldPatch(patched, field, value)
    }

    const recheck = validateWordCounts(patched as unknown as WcSignalInput)
    const stillHard = recheck.hard_violations.length
    if (stillHard === 0) {
      console.log('[REGEN-SUCCESS] all HARD violations fixed')
    } else {
      console.warn(`[REGEN-FAIL] ${stillHard} HARD violations remain:`,
        recheck.hard_violations.map(v => v.field).join(', '))
    }

    // Layer B: Post-trim bold count regression check.
    // signal_block_body / block_2_prose patches reconstruct why_it_matters.
    // The word-trim regen can drop bold markers — catch and restore (1 retry max).
    const wyiPatched = Object.keys(patches).some(
      f => f === 'signal_block_body' || f === 'block_2_prose'
    )
    if (wyiPatched) {
      const boldCheck = validateArticle(patched as unknown as ValidatorSignal)
      const boldViolations = boldCheck.violations.filter(v => v.type === 'BOLD_COUNT')
      if (boldViolations.length > 0) {
        console.warn('[BOLD-REGRESSION] bold count dropped after word-count trim:',
          boldViolations.map(v => `${v.field}: ${v.message}`).join(' | '))
        const boldFix = await fixWithHaiku(patched as unknown as ValidatorSignal, boldViolations, client)
        if (boldFix.fixed && boldFix.signal) {
          const boldFixed = boldFix.signal as unknown as GeneratedSignal
          const boldRecheck = validateArticle(boldFixed as unknown as ValidatorSignal)
          if (boldRecheck.violations.filter(v => v.type === 'BOLD_COUNT').length === 0) {
            console.log('[BOLD-REGRESSION] bold count restored via Haiku fix')
            return boldFixed
          }
        }
        console.warn('[BOLD-REGRESSION] bold count still regressed after Haiku retry — proceeding')
      }
    }

    return patched
  } catch (e) {
    console.warn('[REGEN-FAIL] error during word-count regen:', e)
    return signal
  }
}

// ─── Paragraph-split enforcer ────────────────────────────────────────────────────
// Runs after enforceWordCounts. If why_it_matters has no \n\n, calls Sonnet once
// to split it. Fail-open — logs a warning and returns original if split fails.

async function enforceParagraphSplit(signal: GeneratedSignal, client: Anthropic): Promise<GeneratedSignal> {
  const paras = signal.why_it_matters.split('\n\n').map(p => p.trim()).filter(p => p.length > 0)
  if (paras.length >= 2) return signal

  console.warn('[PARA-SPLIT] why_it_matters is single paragraph — attempting split')

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Split the text below into exactly 2 paragraphs separated by \\n\\n.
PARA 1 (2 sentences, 30-40w): what shifted and why it matters NOW.
PARA 2 (2 sentences, 30-40w): the reframe — what builders/founders must do tomorrow.
Preserve meaning and editorial voice exactly. Return ONLY the two paragraphs with \\n\\n between them. No other text.

Text:
${signal.why_it_matters}`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const fixed = text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0)

    if (fixed.length >= 2) {
      console.log('[PARA-SPLIT] split succeeded')
      return { ...signal, why_it_matters: fixed.slice(0, 2).join('\n\n') }
    }

    console.warn('[PARA-SPLIT] split attempt still returned single paragraph — quality gate will catch it')
    return signal
  } catch (e) {
    console.warn('[PARA-SPLIT] error during split attempt:', e)
    return signal
  }
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

async function markIssuePending(issueId: string, reason: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient()
    await supabase
      .from('issues')
      .update({
        status: 'pending',
        editor_note: `[FACT-CHECK] ${reason.slice(0, 200)}`,
      })
      .eq('id', issueId)
    console.warn(`[inngest] issue ${issueId} held for manual review: ${reason.slice(0, 100)}`)
  } catch (e) {
    console.error('[inngest] markIssuePending itself failed:', e)
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

      // Strip extended_data before passing to cascade fixers. The full signal with
      // extended_data is ~6000 tokens — fixer output was silently truncating at max_tokens:8000,
      // causing JSON parse failures and leaving violations unfixed. Re-attached below.
      const writerExtData = current.extended_data
      current = { ...current, extended_data: undefined }

      const v1 = validateArticle(current as unknown as ValidatorSignal)
      console.log('[cascade] Layer 1 (validator):', v1.pass ? 'PASS' : `FAIL — ${v1.violations.length} violations`)

      if (!v1.pass) {
        console.log('[cascade] violations:', v1.violations.map(v => `${v.field}:${v.type}`).join(', '))
        console.log('[cascade] Layer 2 (Haiku fixer) attempting fix...')
        const haikuResult = await fixWithHaiku(current as unknown as ValidatorSignal, v1.violations, anthropicClient)

        if (haikuResult.fixed) {
          current = normalizeSignalNewlines(haikuResult.signal as unknown as GeneratedSignal)
          path = 'haiku-fix'
          const v2 = validateArticle(current as unknown as ValidatorSignal)
          console.log('[cascade] Layer 2 result:', v2.pass ? 'PASS' : `STILL FAILING — ${v2.violations.length} violations`)

          if (!v2.pass) {
            console.log('[cascade] Layer 3 (Sonnet review) attempting full review...')
            const sonnetResult = await reviewWithSonnet(current as unknown as ValidatorSignal, v2.violations, anthropicClient)
            current = normalizeSignalNewlines(sonnetResult.signal as unknown as GeneratedSignal)
            path = 'sonnet-review'
            console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
          }
        } else {
          console.log('[cascade] Layer 2 failed, escalating to Layer 3...')
          const sonnetResult = await reviewWithSonnet(current as unknown as ValidatorSignal, v1.violations, anthropicClient)
          current = normalizeSignalNewlines(sonnetResult.signal as unknown as GeneratedSignal)
          path = 'sonnet-review'
          console.log('[cascade] Layer 3 reasoning:', sonnetResult.reasoning)
        }
      }

      const finalValidation = validateArticle(current as unknown as ValidatorSignal)
      if (!finalValidation.pass) {
        console.warn('[cascade] PERSISTENT VIOLATIONS after ' + path + ':',
          finalValidation.violations.map(v => `${v.field}:${v.type}`).join(', '))
      }
      console.log(`[inngest] step "cascade" complete: path=${path}, violations_remaining=${finalValidation.violations.length}`)
      return { finalSignal: { ...current, extended_data: writerExtData }, qualityPath: path }
    })) as { finalSignal: GeneratedSignal; qualityPath: string }

    // ── Step 4a: Word-count enforcement (memoized — safe on retry)
    const wcSignal = (await step.run('enforce-word-counts', async () => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      return await enforceWordCounts(finalSignal, client)
    })) as GeneratedSignal

    // ── Step 4b: Paragraph-split enforcement (memoized — safe on retry)
    const splitSignal = (await step.run('enforce-paragraph-split', async () => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      return await enforceParagraphSplit(wcSignal, client)
    })) as GeneratedSignal

    // ── Step 4c: Fact-check audit — warn-only, all logging inside step
    await step.run('fact-check-audit', async () => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
      try {
        const fcResult = await runFactCheck(splitSignal as unknown as FactCheckInput, client)

        console.log('[FACT-CHECK]', JSON.stringify({
          issueId,
          overall_confidence: fcResult.overall_confidence,
          claim_count: fcResult.verified_claims.length,
          concern_count: fcResult.concerns.length,
          block_publish: fcResult.block_publish,
          summary: fcResult.summary,
          timestamp: new Date().toISOString(),
        }))

        if (fcResult.overall_confidence < 30) {
          console.warn('[FACT-CHECK-SKIP]', JSON.stringify({
            issueId, reason: 'low_confidence',
            overall_confidence: fcResult.overall_confidence,
            timestamp: new Date().toISOString(),
          }))
        } else {
          const highConcerns   = fcResult.concerns.filter(c => c.severity === 'high')
          const mediumConcerns = fcResult.concerns.filter(c => c.severity === 'medium')
          const lowConcerns    = fcResult.concerns.filter(c => c.severity === 'low')

          if (fcResult.block_publish || highConcerns.length > 0) {
            console.error('[FACT-CHECK-ALERT]', JSON.stringify({
              issueId,
              high_concerns: highConcerns,
              block_publish: fcResult.block_publish,
              summary: fcResult.summary,
              timestamp: new Date().toISOString(),
            }))
          } else if (mediumConcerns.length >= 4) {
            console.warn('[FACT-CHECK-FIX-SKIPPED]', JSON.stringify({
              issueId,
              medium_concerns: mediumConcerns,
              summary: fcResult.summary,
              timestamp: new Date().toISOString(),
            }))
          } else if (mediumConcerns.length > 0 || lowConcerns.length > 0) {
            console.warn('[FACT-CHECK-WARN]', JSON.stringify({
              issueId,
              medium_concerns: mediumConcerns,
              low_concerns: lowConcerns,
              overall_confidence: fcResult.overall_confidence,
              timestamp: new Date().toISOString(),
            }))
          }
        }
      } catch (fcErr) {
        console.warn('[FACT-CHECK-SKIP]', JSON.stringify({
          issueId,
          reason: fcErr instanceof SyntaxError ? 'parse_error' : 'api_error',
          error: String(fcErr).slice(0, 200),
          timestamp: new Date().toISOString(),
        }))
      }
    })

    // ── Tiered quality gate — intentionally outside steps ─────────────────────
    // Fast: no API calls, won't cause timeout. Kept outside so a blocking throw
    // kills the function immediately — no step retries on structurally broken articles.
    const finalValidation = validateArticle(splitSignal as unknown as ValidatorSignal)

    if (finalValidation.violations.length > 0) {
      type ViolationType = (typeof finalValidation.violations)[number]['type']

      const ALWAYS_BLOCK = new Set<ViolationType>([
        'FORBIDDEN_STAT',           // factual accuracy
        'PRESS_RELEASE',            // journalistic integrity
        'EXTENDED_DATA_SHAPE_INVALID', // crashes extended UI sections
        'WHY_IT_MATTERS_SINGLE_PARA',  // body renders empty in component
        'PULL_QUOTE_REQUIRED',      // missing content between paragraphs
        'EDITORIAL_TAKE_MISSING',   // missing editorial section
      ])

      const WARN_ONLY = new Set<ViolationType>([
        'LENGTH_BLOAT',   // wordy but readable
        'BOLD_COUNT',     // missing emphasis but readable
        'GENERIC_INDIA',  // phrasing preference
      ])

      const alwaysBlock  = finalValidation.violations.filter(v => ALWAYS_BLOCK.has(v.type))
      const warnOnly     = finalValidation.violations.filter(v => WARN_ONLY.has(v.type))
      const structural   = finalValidation.violations.filter(v => !ALWAYS_BLOCK.has(v.type) && !WARN_ONLY.has(v.type))

      if (alwaysBlock.length > 0 || structural.length >= 2) {
        const blocking = [...alwaysBlock, ...structural]
        console.error('[QUALITY-BLOCK] article failed quality gate:',
          blocking.map(v => `${v.field}:${v.type}`).join(', '))
        const gateSupabase = createAdminSupabaseClient()
        await gateSupabase.from('issues').update({ status: 'failed' }).eq('id', issueId)
        throw new Error(
          `Quality gate: ${alwaysBlock.length} factual/structural + ${structural.length} other violations. ` +
          blocking.map(v => `${v.field}:${v.type} — ${v.message}`).join(' | ')
        )
      }

      if (warnOnly.length > 0 || structural.length === 1) {
        console.warn('[QUALITY-WARN] publishing with minor violations:', JSON.stringify({
          issueId,
          warnOnly: warnOnly.map(v => ({ field: v.field, type: v.type, message: v.message })),
          structural: structural.map(v => ({ field: v.field, type: v.type, message: v.message })),
          timestamp: new Date().toISOString(),
        }))
      }
    }

    // ── Step 5: Publish — update issue + insert story ──────────────────────────
    await step.run('publish', async () => {
      const supabase = createAdminSupabaseClient()

      // Idempotency guard — Inngest may retry this step on transient failure
      const { data: existingStory } = await supabase
        .from('stories')
        .select('id')
        .eq('issue_id', issueId)
        .maybeSingle()

      if (existingStory) {
        console.log('[inngest] publish: story already exists, skipping insert')
      } else {
        const { error: storyErr } = await supabase.from('stories').insert({
          issue_id: issueId,
          position: 1,
          category: splitSignal.category,
          headline: splitSignal.headline,
          summary: splitSignal.summary,
          why_it_matters: splitSignal.why_it_matters,
          pull_quote: splitSignal.pull_quote ?? null,
          lens_pm: splitSignal.lens_pm ?? null,
          lens_founder: splitSignal.lens_founder ?? null,
          lens_builder: splitSignal.lens_builder ?? null,
          sources: splitSignal.sources ?? [],
          read_minutes: splitSignal.read_minutes ?? 4,
          deeper_read: splitSignal.deeper_read ?? null,
          editorial_take: splitSignal.editorial_take ?? null,
          broadcast_phrases: splitSignal.broadcast_phrases?.length ? splitSignal.broadcast_phrases : null,
          stats: splitSignal.stats?.length ? splitSignal.stats : null,
          action_items: splitSignal.action_items?.length ? splitSignal.action_items : null,
          counter_view: splitSignal.counter_view ?? null,
          counter_view_headline: splitSignal.counter_view_headline ?? null,
          extended_data: splitSignal.extended_data ?? null,
        })
        if (storyErr) throw new Error(`Story insert failed: ${storyErr.message}`)
      }

      // neq guard: no-op if already published (idempotent on retry)
      await supabase
        .from('issues')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          pick_reason: splitSignal.pick_reason ?? null,
          rejected_alternatives: splitSignal.rejected_alternatives?.length
            ? splitSignal.rejected_alternatives
            : null,
        })
        .eq('id', issueId)
        .neq('status', 'published')

      console.log(`[inngest] step "publish" complete: issue ${issueNumber} published`)
    })

    // ── Step 6: Send newsletter to active subscribers ──────────────────────────
    await step.run('send-newsletter', async () => {
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        console.warn('[inngest] send-newsletter: RESEND_API_KEY not set — skipping')
        return
      }

      const supabase = createAdminSupabaseClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aisignal.so'
      const emailFrom = process.env.EMAIL_FROM ?? 'AI Signal <onboarding@resend.dev>'
      const resend = new Resend(resendKey)

      const { data: allSubscribers, error: subErr } = await supabase
        .from('subscribers')
        .select('email, unsubscribe_token')
        .eq('status', 'active')
      if (subErr || !allSubscribers?.length) {
        console.log(`[inngest] send-newsletter: no active subscribers or fetch error — ${subErr?.message ?? 'empty list'}`)
        return
      }

      // Test-only mode: send to owner email only (set NEWSLETTER_TEST_ONLY=true in Vercel)
      const testOnly = process.env.NEWSLETTER_TEST_ONLY === 'true'
      const ownerEmail = process.env.NEWSLETTER_OWNER_EMAIL ?? 'surajpandita18@gmail.com'
      const subscribers = testOnly
        ? allSubscribers.filter(s => s.email === ownerEmail)
        : allSubscribers
      if (testOnly) {
        console.log(`[inngest] send-newsletter: TEST_ONLY mode — sending only to ${ownerEmail}`)
      }

      const now = new Date()
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: 'long', day: 'numeric',
      })

      const story = {
        headline: splitSignal.headline,
        summary: splitSignal.summary,
        read_minutes: splitSignal.read_minutes ?? 4,
        category: splitSignal.category,
        extended_data: splitSignal.extended_data ?? null,
        editorial_take: splitSignal.editorial_take ?? null,
      }
      const subscriberCount = subscribers.length

      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
      let ok = 0, fail = 0
      for (const sub of subscribers) {
        try {
          const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${sub.unsubscribe_token}`
          const { subject, html, text } = dailyNewsletterEmail(story, issueNumber, unsubscribeUrl, dateStr, subscriberCount)
          await resend.emails.send({ from: emailFrom, to: sub.email, subject, html, text })
          ok++
          await sleep(600) // stay under Resend 2 req/s limit
        } catch (err) {
          console.error(`[inngest] send-newsletter: failed for ${sub.email} — ${String(err)}`)
          fail++
        }
      }
      console.log(`[inngest] send-newsletter: sent ${ok}, failed ${fail} of ${subscribers.length}`)
    })

    return { ok: true, issueId, issueNumber, qualityPath }
  }
)
