import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedSignal } from './journalist-agent'
import type { Violation } from './article-validator'

export interface EditorResult {
  fixed: boolean
  signal: GeneratedSignal
  reasoning?: string
  cost_tier: 'haiku' | 'sonnet' | 'none'
}

const HAIKU_FIXER_PROMPT = `You are a precision editor for AI Signal articles. Your job: fix the SPECIFIC violations listed below in the article. Do not refactor anything else.

You receive:
1. The full article JSON
2. A list of violations with field names and instructions

You must:
- Fix ONLY the listed violations
- Preserve all other fields exactly
- Keep the same headline, category, sources, structure
- Return the full article JSON with corrections

DO NOT:
- Add fabricated facts
- Change the picked story
- Refactor working sections
- Add new sections

Return ONLY valid JSON in this format:
{
  "fixed": true|false,
  "reasoning": "what I changed and why",
  "signal": { ...full corrected article JSON... }
}

If you cannot fix all violations cleanly, return "fixed": false with reasoning.`

const SONNET_REVIEWER_PROMPT = `You are the senior editor for AI Signal. The writer agent and Haiku fixer have produced this article but quality is still uncertain. Do a holistic taste review.

Score the article on 6 dimensions (1-5 each):

1. VOICE_CONSISTENCY (1=multiple writer voices, 5=one unified voice)
2. NARRATIVE_ARC (1=disconnected silos, 5=tight thread lede→counter)
3. BOLD_DISCIPLINE (1=zero/random bold, 5=2-4 bolds per long-form field on numbers/entities/insights)
4. RHYTHM (1=walls of text, 5=alternating dense/breath)
5. SPECIFICITY (1=generic, 5=named categories/numbers throughout)
6. CLAIM_DEFENSE (1=signal claim unsupported, 5=signal claim defended by why_it_matters and addressed by counter_view)

If ALL scores >= 4: PASS — return signal unchanged.
If ANY score < 4: REVISE — return corrected signal.

You may rewrite any field, add bold, empty stats, tighten prose, re-thread sections.
DO NOT change picked story, category, or headline (unless it is press-release style).

Return ONLY valid JSON:
{
  "pass": boolean,
  "scores": { "voice_consistency": 1-5, "narrative_arc": 1-5, "bold_discipline": 1-5, "rhythm": 1-5, "specificity": 1-5, "claim_defense": 1-5 },
  "reasoning": "what I changed and why",
  "signal": { ...full article JSON... }
}`

export async function fixWithHaiku(
  signal: GeneratedSignal,
  violations: Violation[],
  client: Anthropic
): Promise<EditorResult> {
  const violationsText = violations
    .map(v => `- [${v.field}] ${v.type}: ${v.message}`)
    .join('\n')

  const userMessage = `Article JSON:\n${JSON.stringify(signal, null, 2)}\n\nViolations to fix:\n${violationsText}\n\nFix these specific issues and return the full corrected article JSON.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      system: HAIKU_FIXER_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { fixed: false, signal, cost_tier: 'haiku' }
    }

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) {
      return { fixed: false, signal, cost_tier: 'haiku' }
    }

    const result = JSON.parse(match[0]) as {
      fixed: boolean
      reasoning?: string
      signal?: GeneratedSignal
    }

    if (result.fixed && result.signal) {
      return {
        fixed: true,
        signal: result.signal,
        reasoning: result.reasoning,
        cost_tier: 'haiku',
      }
    }

    return { fixed: false, signal, reasoning: result.reasoning, cost_tier: 'haiku' }
  } catch (err) {
    console.error('[editor:haiku] error:', err)
    return { fixed: false, signal, cost_tier: 'haiku' }
  }
}

export async function reviewWithSonnet(
  signal: GeneratedSignal,
  violations: Violation[],
  client: Anthropic
): Promise<EditorResult> {
  const violationsText = violations
    .map(v => `- [${v.field}] ${v.type}: ${v.message}`)
    .join('\n')

  const userMessage = `Review this article holistically AND fix the validation issues below.

VALIDATION VIOLATIONS (must fix in your output):
${violationsText}

═══

Article JSON to review:
${JSON.stringify(signal, null, 2)}

═══

Output the corrected article JSON. Address ALL validation violations above in addition to applying your holistic 6-dimension review.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SONNET_REVIEWER_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { fixed: false, signal, cost_tier: 'sonnet' }
    }

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) {
      return { fixed: false, signal, cost_tier: 'sonnet' }
    }

    const result = JSON.parse(match[0]) as {
      pass: boolean
      scores: Record<string, number>
      reasoning?: string
      signal?: GeneratedSignal
    }

    if (result.signal) {
      console.log('[editor:sonnet] scores:', result.scores)
      return {
        fixed: !result.pass,
        signal: result.signal,
        reasoning: result.reasoning,
        cost_tier: 'sonnet',
      }
    }

    return { fixed: false, signal, cost_tier: 'sonnet' }
  } catch (err) {
    console.error('[editor:sonnet] error:', err)
    return { fixed: false, signal, cost_tier: 'sonnet' }
  }
}
