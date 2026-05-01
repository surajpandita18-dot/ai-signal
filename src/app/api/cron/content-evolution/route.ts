/**
 * Content Evolution — journalist agent experiment runner
 *
 * Tests all 16 combinations of the journalist agent's content config:
 *   4 personas × 4 lead styles = 16 variants
 *
 * For each variant:
 *   1. Generate the story using Claude Haiku (fast, cheap)
 *   2. Judge the output using Claude Haiku (separate call, independent view)
 *
 * All 16 generations run in parallel, then all 16 judgments run in parallel.
 * Total time: ~8-12s (well within Vercel's 60s limit).
 *
 * Fixed story premise (like autoresearch's fixed dataset):
 *   GPT-5 Mini price cut — a real event type we cover frequently.
 *   Using a fixed premise makes results comparable across variants.
 */

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  CONTENT_EXPERIMENT_GRID,
  generateSignalWithConfig,
  buildSystemPrompt,
  type ContentConfig,
  type StoryPremise,
  type GeneratedSignal,
} from '@/lib/journalist-agent'

export const maxDuration = 60

// ─── Fixed story premise — the "dataset" for content experiments ─────────────────
// Mirrors the top pick from the formula-evolution pool.
// Fixed across all 16 variants so results are directly comparable.

const STORY_PREMISE: StoryPremise = {
  headline: 'OpenAI cuts GPT-5 Mini API pricing by 10× to $0.04/M tokens',
  facts: [
    '$0.04 per million input tokens — down from $0.40 for GPT-4o Mini',
    'Outperforms GPT-4 Turbo on MMLU-Pro reasoning benchmark by 12%',
    'Released silently via the pricing page — no keynote, no press cycle',
    'Available immediately via the existing GPT-4o Mini endpoint with model parameter change',
    'OpenAI cited "infrastructure efficiency improvements" in the changelog footnote',
  ],
  source: 'OpenAI Pricing Page',
  sourceUrl: 'https://openai.com/pricing',
  ageHours: 3,
  category: 'business',
}

// ─── Judge prompt ─────────────────────────────────────────────────────────────────

function buildJudgePrompt(signal: GeneratedSignal, config: ContentConfig): string {
  return `You are a senior editorial director judging a draft newsletter story for AI Signal.

Audience: Indian tech PMs, founders, engineers — shipped products at scale, short on time.
Published 06:14 IST. One story. 24h FOMO. Subscribers open it before standup.

Config under test: persona="${config.persona}", lead="${config.leadStyle}", india="${config.indiaContext}", counter="${config.counterViewStyle}"

DRAFT:
Headline: ${signal.headline}
Summary: ${signal.summary}
Why it matters: ${signal.why_it_matters}
Pull quote: ${signal.pull_quote ?? 'none'}
Lens PM: ${signal.lens_pm ?? 'none'}
Lens founder: ${signal.lens_founder ?? 'none'}
Lens builder: ${signal.lens_builder ?? 'none'}
Action items: ${signal.action_items?.join(' | ') ?? 'none'}
Counter view: ${signal.counter_view ?? 'none'}

Rate 0–20 total. Return JSON only:
{
  "clarity": <0-5>,
  "relevance": <0-5>,
  "actionability": <0-5>,
  "fomo": <0-5>,
  "total": <0-20>,
  "strongest": "one sentence — what this config does best",
  "weakest": "one sentence — biggest gap",
  "headline_verdict": "sharp|good|weak"
}`
}

interface JudgeScore {
  clarity: number
  relevance: number
  actionability: number
  fomo: number
  total: number
  strongest: string
  weakest: string
  headline_verdict: 'sharp' | 'good' | 'weak'
}

// ─── Route handler ────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  const client = new Anthropic({ apiKey })
  const startMs = Date.now()
  const configs = CONTENT_EXPERIMENT_GRID  // 16 combinations

  // ── Phase 1: Generate all 16 variants in parallel ────────────────────────────
  const generationResults = await Promise.allSettled(
    configs.map((config) =>
      generateSignalWithConfig(STORY_PREMISE, config, apiKey, 'claude-haiku-4-5-20251001')
    )
  )

  // ── Phase 2: Judge all successful generations in parallel ────────────────────
  const judgmentResults = await Promise.allSettled(
    generationResults.map(async (result, idx) => {
      if (result.status !== 'fulfilled') return null
      const signal = result.value
      const config = configs[idx]

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildJudgePrompt(signal, config) }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return null
      return JSON.parse(match[0]) as JudgeScore
    })
  )

  // ── Compile results ──────────────────────────────────────────────────────────
  type ExperimentRecord = {
    n: number
    config: ContentConfig
    score: number | null
    judgeScores: JudgeScore | null
    headline: string | null
    generationError: string | null
    promptPreview: string
  }

  const results: ExperimentRecord[] = configs.map((config, idx) => {
    const gen = generationResults[idx]
    const judg = judgmentResults[idx]

    const signal = gen.status === 'fulfilled' ? gen.value : null
    const judge = judg.status === 'fulfilled' ? judg.value : null

    return {
      n: idx + 1,
      config,
      score: judge?.total ?? null,
      judgeScores: judge,
      headline: signal?.headline ?? null,
      generationError: gen.status === 'rejected' ? String(gen.reason).slice(0, 100) : null,
      promptPreview: buildSystemPrompt(config).slice(0, 120) + '…',
    }
  })

  const successful = results.filter((r) => r.score !== null)
  const ranked = [...successful].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = ranked[0]
  const elapsedMs = Date.now() - startMs

  // ── Persona summary — which persona performs best on average ─────────────────
  const personaAvg = (['signal-editor', 'beat-reporter', 'insider', 'strategist'] as const).map((persona) => {
    const personaResults = successful.filter((r) => r.config.persona === persona)
    const avg = personaResults.length
      ? personaResults.reduce((s, r) => s + (r.score ?? 0), 0) / personaResults.length
      : 0
    return { persona, avg: Math.round(avg * 10) / 10, count: personaResults.length }
  }).sort((a, b) => b.avg - a.avg)

  // ── Lead style summary ───────────────────────────────────────────────────────
  const leadAvg = (['impact', 'news', 'question', 'scene'] as const).map((lead) => {
    const leadResults = successful.filter((r) => r.config.leadStyle === lead)
    const avg = leadResults.length
      ? leadResults.reduce((s, r) => s + (r.score ?? 0), 0) / leadResults.length
      : 0
    return { leadStyle: lead, avg: Math.round(avg * 10) / 10, count: leadResults.length }
  }).sort((a, b) => b.avg - a.avg)

  return NextResponse.json({
    ok: true,
    run_at: new Date().toISOString(),
    elapsed_ms: elapsedMs,
    total_variants: configs.length,
    successful: successful.length,
    failed: results.length - successful.length,
    story_premise: STORY_PREMISE.headline,

    winner: winner
      ? {
          rank: 1,
          config: winner.config,
          score: winner.score,
          headline: winner.headline,
          judgeScores: winner.judgeScores,
        }
      : null,

    ranked_results: ranked.map((r, i) => ({
      rank: i + 1,
      score: r.score,
      persona: r.config.persona,
      leadStyle: r.config.leadStyle,
      indiaContext: r.config.indiaContext,
      counterViewStyle: r.config.counterViewStyle,
      headline: r.headline,
      strongest: r.judgeScores?.strongest,
      weakest: r.judgeScores?.weakest,
      headlineVerdict: r.judgeScores?.headline_verdict,
    })),

    persona_ranking: personaAvg,
    lead_style_ranking: leadAvg,

    recommendation: winner
      ? `Best config: persona="${winner.config.persona}", lead="${winner.config.leadStyle}", india="${winner.config.indiaContext}", counter="${winner.config.counterViewStyle}" — score ${winner.score}/20.`
      : 'No successful experiments.',
  })
}
