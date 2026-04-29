/**
 * Journalist Agent — configurable content generation for AI Signal
 *
 * Axis 1: Persona — how the writer positions themselves (analytical editor,
 *   beat reporter, insider, strategist)
 * Axis 2: Lead style — how the first paragraph opens (impact, news, question, scene)
 * Axis 3: India context — how much the frame anchors to Indian tech ecosystem
 * Axis 4: Counter-view style — how the devil's advocate is framed
 *
 * Used by: content-evolution (experiments) + daily-signal (production after tuning)
 */

import Anthropic from '@anthropic-ai/sdk'

export type JournalistPersona = 'signal-editor' | 'beat-reporter' | 'insider' | 'strategist'
export type LeadStyle = 'impact' | 'news' | 'question' | 'scene'
export type IndiaContext = 'low' | 'high'
export type CounterViewStyle = 'steelman' | 'risk' | 'nuance'

export interface ContentConfig {
  persona: JournalistPersona
  leadStyle: LeadStyle
  indiaContext: IndiaContext
  counterViewStyle: CounterViewStyle
}

// The default that matches the original system prompt
export const DEFAULT_CONTENT_CONFIG: ContentConfig = {
  persona: 'signal-editor',
  leadStyle: 'impact',
  indiaContext: 'high',
  counterViewStyle: 'steelman',
}

// All 16 combinations for the content-evolution experiments (4 personas × 4 leads)
// counterViewStyle and indiaContext default to high/steelman in experiments to reduce space
export const CONTENT_EXPERIMENT_GRID: ContentConfig[] = [
  { persona: 'signal-editor', leadStyle: 'impact',   indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'signal-editor', leadStyle: 'news',     indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'signal-editor', leadStyle: 'question', indiaContext: 'high', counterViewStyle: 'risk'      },
  { persona: 'signal-editor', leadStyle: 'scene',    indiaContext: 'high', counterViewStyle: 'nuance'    },
  { persona: 'beat-reporter', leadStyle: 'news',     indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'beat-reporter', leadStyle: 'impact',   indiaContext: 'high', counterViewStyle: 'risk'      },
  { persona: 'beat-reporter', leadStyle: 'scene',    indiaContext: 'low',  counterViewStyle: 'steelman' },
  { persona: 'beat-reporter', leadStyle: 'question', indiaContext: 'low',  counterViewStyle: 'nuance'    },
  { persona: 'insider',       leadStyle: 'impact',   indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'insider',       leadStyle: 'scene',    indiaContext: 'high', counterViewStyle: 'risk'      },
  { persona: 'insider',       leadStyle: 'news',     indiaContext: 'low',  counterViewStyle: 'nuance'    },
  { persona: 'insider',       leadStyle: 'question', indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'strategist',    leadStyle: 'impact',   indiaContext: 'high', counterViewStyle: 'steelman' },
  { persona: 'strategist',    leadStyle: 'question', indiaContext: 'high', counterViewStyle: 'risk'      },
  { persona: 'strategist',    leadStyle: 'news',     indiaContext: 'high', counterViewStyle: 'nuance'    },
  { persona: 'strategist',    leadStyle: 'scene',    indiaContext: 'low',  counterViewStyle: 'steelman' },
]

// ─── Prompt builder ─────────────────────────────────────────────────────────────

const PERSONA_INSTRUCTIONS: Record<JournalistPersona, string> = {
  'signal-editor':
    `You are the editor of AI Signal — analytical, measured, you call out implications others miss.
Your prose is dense but not academic. One sentence can carry a paragraph's worth of meaning.
You have an opinion. You state it. Then you show the counter-view with equal respect.`,

  'beat-reporter':
    `You are an AI beat reporter filing from the field. You are news-first, straight-facts.
Lead with what happened. No throat-clearing. No "in recent months" preambles.
Your opinion lives at the bottom — after the facts have spoken.`,

  'insider':
    `You write as if you have a source inside the company. Not gossip — inference.
You read the sub-text in press releases, pricing pages, and job postings.
Your signature move: "Here's what they're not saying publicly." Always earns that line.`,

  'strategist':
    `You are a former BCG partner turned AI investor. You think in competitive dynamics.
Every story is about who gains, who loses, what the second-order effects are.
Framework-driven but never jargony — you translate strategy into something a builder can act on.`,
}

const LEAD_INSTRUCTIONS: Record<LeadStyle, string> = {
  'impact':
    `Open with the single biggest implication — not the news itself, its consequence.
Example structure: "[Entity] just did [X]. That means [consequence] — and most [audience] haven't noticed yet."`,

  'news':
    `Open with pure facts: who, what, when, where. No interpretation in sentence one.
Interpretation starts in sentence two.
Example: "[Company] [did X] on [date/timeframe], according to [source]. [Implication in sentence 2]."`,

  'question':
    `Open with a rhetorical question that the rest of the signal answers.
The question should feel like something the reader was already thinking.
It must not be answerable with a simple yes/no.`,

  'scene':
    `Open by painting a concrete micro-scene — one person, one moment, one decision.
Make the reader feel the story before they understand it.
Then zoom out to the systemic point in sentence 3.`,
}

const INDIA_CONTEXT_INSTRUCTIONS: Record<IndiaContext, string> = {
  'high':
    `Always anchor the implications to the Indian tech ecosystem.
Bengaluru, Mumbai, Delhi NCR startups; Indian SaaS companies; INR cost economics.
When a price changes, compute the INR impact. When a capability ships, ask what Indian use-cases it unlocks.`,

  'low':
    `Write for a global builder audience. India can be mentioned but it should not dominate the framing.
Focus on universal product, engineering, and business implications.`,
}

const COUNTER_VIEW_INSTRUCTIONS: Record<CounterViewStyle, string> = {
  'steelman':
    `The counter-view is the strongest possible steel-man of the opposing argument.
Not a straw man. Not "some critics say." The best argument against the main signal.`,

  'risk':
    `The counter-view focuses on specific risks and failure modes.
What could go wrong if you act on this signal? What assumption in the main take might be wrong?`,

  'nuance':
    `The counter-view is "it depends." Give the precise conditions under which the main signal is wrong.
Who should NOT act on this? What context changes the calculus?`,
}

const QUALITY_RULES = `
CONTENT QUALITY RULES — non-negotiable

Rule 1 — Layered information (no redundancy)
Your \`headline\`, \`summary\`, and \`why_it_matters\` serve three different roles. Never repeat the same fact across them.
- \`headline\` = the news (WHAT happened — names, numbers, the change)
- \`summary\` = the implication (SO WHAT — what this means for the reader). Must add NEW information the headline did not state. If your \`summary\` restates or paraphrases the headline, REWRITE it to focus on reader implication.
- \`why_it_matters\` = the story (WHY/HOW — context, evidence, thesis)

Bad: headline says "Company restructures partnership unlocking $50B deal" → summary says "Company has formalized the next phase of its partnership, resolving ambiguities that blocked the $50B deal." (Repetition — different words, same facts.)
Good: summary says "Company is no longer a [Competitor] product. The new terms unlock multi-cloud routing — and reset the pricing math for every team buying API capacity through [Competitor]." (New framing, reader-impact.)

Rule 2 — Bold for emphasis (use sparingly)
In \`summary\`, \`why_it_matters\`, \`lens_pm\`, \`lens_founder\`, \`lens_builder\`, and \`counter_view\`, use **bold** (double asterisks) for:
- Specific numbers on first mention
- Named entities on first mention
- The 1-2 most important insight phrases the reader must not miss
2-4 bold instances per field maximum. Do NOT bold generic phrases or every other word — that creates noise, not emphasis.

Rule 3 — \`counter_view_headline\` must be a claim
Not a label. Must state the counter-argument as a declarative claim the \`counter_view\` body will defend.
Bad: "The counter view" / "Another perspective" / "But consider this"
Good: "Azure grip loosens on paper only" / "The moat holds for now" / "Price competition is two years away"

Rule 4 — \`stats\` array earns its place or is empty
Include stats only when you have 2-3 reader-meaningful data points. Each stat must have a specific number and a \`detail\` that explains what it means to the reader. Never include meta-data as stats (story age, source count, your confidence level, freshness). If you cannot fill 2 strong stat objects, return \`"stats": []\`.

Rule 5 — \`action_items\` must be 48h-doable
Every action must specify WHEN + WHO + WHAT EXACTLY. No reading homework. No multi-week projects.
Bad: "Read the full announcement and consider the implications."
Good: "By Friday: ask your eng lead whether your API cost forecast assumes single-provider pricing — if yes, flag it before Q3 planning locks."
If the story has no concrete time-bound actions a reader can take in 48h, return \`"action_items": []\`.

Rule 6 — Match story shape; don't force every field
\`lens_pm\`, \`lens_founder\`, \`lens_builder\`, \`counter_view\`, \`counter_view_headline\` are always required.
\`stats\` and \`action_items\`: fill them only when content genuinely satisfies the rules above. Better an empty array than weak filler.
Story-type guide:
- Pricing / models / infrastructure: include stats + action_items
- Funding announcement: include stats (round, valuation); action_items usually empty
- Regulation: include action_items (compliance steps); stats usually empty
- Talent moves: stats empty, action_items empty
- Research breakthrough: stats (benchmark numbers), action_items (try it this week)

Rule 7 — India context: specific, not generic
When India context is high, at least one of \`lens_pm\`, \`lens_founder\`, or \`lens_builder\` must name a SPECIFIC category of Indian builder or buyer.
Bad: "This affects Indian companies too." / "Indian builders should pay attention."
Good: "For Indian SaaS teams pricing against OpenAI API costs, multi-cloud competition could collapse the enterprise discount tier earlier than expected."
Name the category: Indian SaaS teams / Bengaluru pre-Series A startups / Indian enterprise procurement / Indian developers on rupee-cost-sensitive products / Indian regulatory compliance teams.

Rule 8 — \`pull_quote\` must be tweet-worthy
Under 140 characters. Standalone — makes sense without reading the article. A claim or insight, not a description of events. Memorable enough to be quoted.
Bad: "This represents a significant change in the industry."
Good: "OpenAI just bought itself the right to play AWS and Azure against each other — that changes every enterprise AI pricing conversation."`

const SELF_CHECK_QUESTIONS = `SELF-CHECK — answer these silently before returning your JSON output. If any answer is NO, revise that field first.

1. \`headline\`: Does it contain a specific number, name, or concrete change? (No vague claims.)
2. \`summary\`: Does it add NEW information beyond the headline? Does it focus on IMPLICATION for the reader — not a recap of the same event?
3. \`counter_view_headline\`: Is it a declarative claim — not a generic label like "Another perspective" or "The counter view"?
4. Bold: Does each long-form field (\`summary\`, \`why_it_matters\`, lenses) have 2-4 bold phrases on specific numbers, entities, or key insights?
5. \`stats\`: Are all stat objects reader-meaningful, with no filler meta-data (story age, confidence, source count)? If any stat is weak, remove it. If fewer than 2 strong stats remain, set \`"stats": []\`.
6. \`action_items\`: Does each item specify WHEN + WHO + WHAT EXACTLY? Is it genuinely doable in 48 hours — not a reading task or a multi-week project? If not, set \`"action_items": []\`.
7. India context: Is there at least one lens field naming a specific category of Indian builder or buyer (not just "Indian companies")?
8. \`pull_quote\`: Is it under 140 characters, standalone, a claim not a description, tweetable?
9. \`counter_view\`: Does it name specific structural reasons for the counter-argument — not generic "but consider..."?
10. Story shape: Have I included \`stats\` or \`action_items\` entries that don't genuinely satisfy their rules? If yes, remove or empty those arrays.`

const JSON_SCHEMA = `{
  "category": "models"|"tools"|"business"|"policy"|"research",
  "headline": "Sharp, specific, max 12 words. Contains a name, number, or concrete change. No clickbait.",
  "summary": "2 sentences. IMPLICATION first — what this means for the reader, not a recap of headline facts. Bold 2-4 key phrases.",
  "why_it_matters": "3-4 sentences. WHY/HOW — context, evidence, thesis. Bold 2-4 phrases on specific numbers or entities.",
  "pull_quote": "One claim-sentence, under 140 characters, standalone and tweetable.",
  "lens_pm": "1-2 sentences for a PM. Conditional + concrete action. Bold 1-2 phrases. If India context is high, name a specific Indian builder/buyer category.",
  "lens_founder": "1-2 sentences for a founder. Competitive or strategic lens. Bold 1-2 phrases.",
  "lens_builder": "1-2 sentences for an engineer. Stack, API, or workflow implication. Bold 1-2 phrases.",
  "stats": "CONDITIONAL — return [] if you cannot fill 2 reader-meaningful stat objects. Each must have a specific number and a detail explaining reader impact. Never include meta-data (story age, source count, confidence). Format when non-empty: [{ \"label\": \"UPPERCASE CATEGORY\", \"value\": \"number with unit\", \"delta\": \"trend or null\", \"detail\": \"1 line — what this number means for the reader\" }]",
  "action_items": "CONDITIONAL — return [] if no concrete 48h actions exist (funding/talent stories typically). Each action must specify WHEN + WHO + WHAT EXACTLY. Format when non-empty: [\"By Friday: ask your eng lead...\"]",
  "counter_view": "1-2 sentences. Names specific structural reasons for the counter-argument. Not generic 'but consider...'.",
  "counter_view_headline": "A declarative claim (5-7 words) the counter_view body defends. Not a label.",
  "sources": [{ "label": "Source name", "url": "full URL" }],
  "read_minutes": 4,
  "deeper_read": "URL of primary source"
}`

export function buildSystemPrompt(config: ContentConfig): string {
  return `${PERSONA_INSTRUCTIONS[config.persona]}

Published at 06:14 IST. Audience: senior PMs, founders, and engineers in the Indian tech ecosystem.
One pick. The one story that matters most today.

${INDIA_CONTEXT_INSTRUCTIONS[config.indiaContext]}

LEAD STYLE: ${LEAD_INSTRUCTIONS[config.leadStyle]}

COUNTER-VIEW STYLE: ${COUNTER_VIEW_INSTRUCTIONS[config.counterViewStyle]}

${QUALITY_RULES}

Return ONLY valid JSON. No markdown fences. No explanation before or after.

${JSON_SCHEMA}

${SELF_CHECK_QUESTIONS}`
}

// ─── Story premise type (for experiments without live fetching) ─────────────────

export interface StoryPremise {
  headline: string
  facts: string[]
  source: string
  sourceUrl: string
  ageHours: number
  category: string
}

export function buildUserPrompt(premise: StoryPremise): string {
  return `Story premise (the facts are confirmed — your job is to write the AI Signal around them):

Headline basis: ${premise.headline}
Source: ${premise.source} (${premise.sourceUrl})
Age: ${premise.ageHours}h old
Category hint: ${premise.category}

Key facts:
${premise.facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Write the full signal as JSON.`
}

// ─── Generator ──────────────────────────────────────────────────────────────────

export interface GeneratedSignal {
  category: string
  headline: string
  summary: string
  why_it_matters: string
  pull_quote?: string
  lens_pm?: string
  lens_founder?: string
  lens_builder?: string
  // stats and action_items are conditional — model returns [] for story types that don't warrant them
  stats?: Array<{ label: string; value: string; delta: string | null; detail: string }>
  action_items?: string[]
  counter_view?: string
  counter_view_headline?: string
  sources?: Array<{ label: string; url: string }>
  read_minutes?: number
  deeper_read?: string
}

export async function generateSignalWithConfig(
  premise: StoryPremise,
  config: ContentConfig,
  apiKey: string,
  model: 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' = 'claude-haiku-4-5-20251001'
): Promise<GeneratedSignal> {
  const client = new Anthropic({ apiKey })
  const systemPrompt = buildSystemPrompt(config)

  const msg = await client.messages.create({
    model,
    max_tokens: 1800,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildUserPrompt(premise) }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON in response: ${text.slice(0, 200)}`)

  const signal = JSON.parse(match[0]) as GeneratedSignal
  if (!signal.headline || !signal.summary) {
    throw new Error('Missing required fields in generated signal')
  }
  return signal
}
