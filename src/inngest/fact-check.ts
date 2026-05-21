import Anthropic from '@anthropic-ai/sdk'

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface FactCheckClaim {
  claim: string
  confidence: 'high' | 'medium' | 'low'
  category: 'number' | 'name' | 'date' | 'quote' | 'stat'
}

export interface FactCheckConcern {
  claim: string
  severity: 'high' | 'medium' | 'low'
  reason: string
  suggested_action: string
}

export interface FactCheckResult {
  verified_claims: FactCheckClaim[]
  concerns: FactCheckConcern[]
  overall_confidence: number
  block_publish: boolean
  summary: string
}

// Minimal input shape — only the fields that contain verifiable facts.
// Does not import GeneratedSignal or ExtendedData to keep this module self-contained.
export interface FactCheckInput {
  headline: string
  summary: string
  why_it_matters: string
  stats?: Array<{ label: string; value: string; detail?: string | null }> | null
  extended_data?: {
    tickers?: Array<{
      label: string
      value: string
      change?: { text: string } | null
    }> | null
  } | null
  sources?: Array<{ label: string; url: string }> | null
  deeper_read?: string | null
}

// ─── Prompt builder ──────────────────────────────────────────────────────────────

function buildPrompt(signal: FactCheckInput): string {
  const statsText = signal.stats?.length
    ? signal.stats.map(s => `  • ${s.label}: ${s.value}${s.detail ? ` (${s.detail})` : ''}`).join('\n')
    : '  (none)'

  const tickersText = signal.extended_data?.tickers?.length
    ? signal.extended_data.tickers
        .map(t => `  • ${t.label}: ${t.value}${t.change ? ` — ${t.change.text}` : ''}`)
        .join('\n')
    : '  (none)'

  const sourcesText = signal.sources?.length
    ? signal.sources.map(s => `  • ${s.label}: ${s.url}`).join('\n')
    : '  (none)'

  return `You are a fact-checking editor for AI Signal, a daily AI newsletter for senior builders and founders in the Indian tech ecosystem. One wrong number destroys credibility with this audience.

Your job is NOT to rewrite the article. Audit specific, verifiable claims and flag anything that could be factually wrong.

────────────────────────────────────────────
ARTICLE TO AUDIT
────────────────────────────────────────────
Headline: ${signal.headline}

Summary: ${signal.summary}

Why it matters: ${signal.why_it_matters}

Stats:
${statsText}

Tickers:
${tickersText}

Primary source: ${signal.deeper_read ?? '(not provided)'}
Additional sources:
${sourcesText}

────────────────────────────────────────────
TASK
────────────────────────────────────────────
Step 1 — Extract every specific, verifiable claim:
  • Dollar amounts, percentages, user/token counts, rankings
  • Company names and their affiliations (who owns what)
  • Dates, deadlines, timelines
  • Named research studies or publications
  • Quoted statements attributed to anyone

Step 1.5 — CRITICAL: Check for internal contradictions.
  Within the article itself, scan for:
  • Headline claim vs summary claim (do they align?)
  • Stat 1 vs Stat 2 (do numbers match each other?)
  • Why It Matters vs Headline (consistent message?)
  • Tickers vs Stats (same numbers where there is overlap?)
  Any internal contradiction = HIGH severity automatically.
  Reason format: "Internal inconsistency: [claim A] contradicts [claim B] within same article"

Step 2 — For each claim, assess:
  • confidence:
      "high"   = well-known fact, hard to get wrong
      "medium" = specific detail that could be misremembered or confused
      "low"    = precise number/date/name that could easily be hallucinated
  • category: "number" | "name" | "date" | "quote" | "stat"

Step 3 — For any claim with confidence < high, add to concerns:
  • severity:
      "high"   = you have strong reason to believe this is WRONG
                 (not just uncertain — actually incorrect based on your knowledge),
                 OR it is an internal contradiction found in Step 1.5
      "medium" = plausible but imprecise — the number or name might be off
      "low"    = minor uncertainty, likely fine but worth noting
  • reason: what specifically is suspicious or wrong
  • suggested_action: how to fix it — name the specific field (headline, summary,
                      signal_block_body for para 1 of why it matters,
                      block_2_prose for para 2 of why it matters, pull_quote)
                      and the corrected text

Step 4 — Set block_publish = true ONLY if:
  • You have HIGH confidence a specific claim is factually incorrect, OR
  • A company name or affiliation is demonstrably wrong, OR
  • An internal contradiction was found in Step 1.5
  Do NOT block for uncertainty alone. Block for known errors or contradictions.

────────────────────────────────────────────
OUTPUT — Return ONLY valid JSON. No markdown. No explanation.

CRITICAL JSON FORMATTING RULES:
  • All string values must use escaped double quotes (\\") inside them — never raw double quotes
  • The "claim", "reason", "suggested_action", and "summary" fields often contain quotes — escape ALL of them as \\"
  • Do not use single quotes anywhere in the JSON output
  • Ensure every string is properly terminated before the next key
────────────────────────────────────────────
{
  "verified_claims": [
    { "claim": "...", "confidence": "high|medium|low", "category": "number|name|date|quote|stat" }
  ],
  "concerns": [
    { "claim": "...", "severity": "high|medium|low", "reason": "...", "suggested_action": "..." }
  ],
  "overall_confidence": 0-100,
  "block_publish": boolean,
  "summary": "One sentence: what you found, or All claims verified with high confidence."
}`
}

// ─── Parse helpers ───────────────────────────────────────────────────────────────

function cleanJson(raw: string): string {
  // Strip ASCII control characters except tab and newline
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

function parseFactCheckJson(raw: string): FactCheckResult {
  const extracted = raw.match(/\{[\s\S]*\}/)
  if (!extracted) throw new Error('no JSON object found in response')

  // First attempt — clean then parse
  try {
    return JSON.parse(cleanJson(extracted[0])) as FactCheckResult
  } catch {
    // Second attempt — safety net: if block_publish=true is detectable, surface it
    const blockMatch = extracted[0].match(/"block_publish"\s*:\s*(true|false)/)
    if (blockMatch?.[1] === 'true') {
      return {
        verified_claims: [],
        concerns: [{
          claim: 'JSON parse failed',
          severity: 'high',
          reason: 'Fact-check model returned block_publish=true but response JSON was malformed',
          suggested_action: 'Manual review required before publish',
        }],
        overall_confidence: 0,
        block_publish: true,
        summary: 'JSON parse failed but block_publish=true detected — blocking as precaution',
      }
    }
    // block_publish=false or undetectable — re-throw so caller SKIPs
    throw new Error(`fact-check JSON parse failed: ${cleanJson(extracted[0]).slice(0, 120)}`)
  }
}

// ─── Core function ───────────────────────────────────────────────────────────────

export async function runFactCheck(
  signal: FactCheckInput,
  client: Anthropic,
): Promise<FactCheckResult> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(signal) }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
  return parseFactCheckJson(raw)
}
