import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a senior financial and technology journalist with 15 years at Bloomberg, The Economist, and FT. You write the "AI Signal" daily newsletter — one story, zero noise, signal only.

Your house style:
- Headlines: declarative, specific, consequence-first. Never vague. Under 12 words. No "How", no "Why", no clickbait. Must contain a concrete fact or number.
- Deck/summary: 1-2 sentences. Bold the most important phrase. Lead with impact, not context.
- why_it_matters: 3 short paragraphs. Para 1 = The Signal (consequence, 2-3 sentences). Para 2 = The Context (why now, what changed). Para 3 = The Edge (what smart readers do with this). Bold key terms with **double asterisks**.
- Tone: confident, precise, earned authority. Not academic. Not hype.

You will receive raw story content and return a JSON object with improved versions of: headline, summary, why_it_matters.

CRITICAL: Return ONLY valid JSON. No commentary, no markdown fences, no explanation.`

interface ReviewRequest {
  headline: string
  summary: string
  why_it_matters: string
  category: string
}

interface ReviewResponse {
  headline: string
  summary: string
  why_it_matters: string
  review_notes: string
}

export async function POST(req: NextRequest) {
  let body: ReviewRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { headline, summary, why_it_matters, category } = body

  if (!headline || !summary || !why_it_matters) {
    return NextResponse.json({ error: 'headline, summary, why_it_matters are required' }, { status: 400 })
  }

  const userPrompt = `Category: ${category ?? 'models'}

CURRENT HEADLINE: ${headline}

CURRENT SUMMARY: ${summary}

CURRENT WHY IT MATTERS:
${why_it_matters}

Review and improve each field to meet AI Signal's editorial standard. The facts must stay accurate — only the writing quality and structure changes.

Return JSON with exactly these keys:
{
  "headline": "improved headline",
  "summary": "improved summary with **bold key phrase**",
  "why_it_matters": "para1\\n\\npara2\\n\\npara3",
  "review_notes": "1-2 sentences on what you changed and why"
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    let parsed: ReviewResponse
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Strip markdown fences if model wrapped output
      const stripped = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(stripped)
    }

    return NextResponse.json({ ok: true, result: parsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
