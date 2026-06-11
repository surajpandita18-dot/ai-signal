/**
 * Ship-gate rubric — heuristic, NOT an LLM call.
 *
 * Six axes from CLAUDE.md §"Ship-gate rubric":
 *   So-What · Actionability · Specificity/Sourcing · Freshness/Non-formula
 *   · Fairness-across-readers · Restraint/Trust
 *
 * Rule: no section ships below 3 on any axis. Issue average must be ≥ 4.0.
 *
 * The scorer is intentionally simple and explainable. It returns 5 by default
 * and *deducts* for specific failure modes (no source/year, hype tokens, etc).
 * Per §9 risks #4 in PLAN-aibasically-v1.md: this MUST fail noisily — any
 * axis < 3 surfaces as a blocker the human-gate has to clear.
 */

import type {
  IssueContent,
  SoWhat,
  BuildNotes,
  JobSignal,
  UnderTheHood,
  TheRep,
  Toolbox,
  RealityCheck,
  IndiaSignal,
  Closer,
} from '../content-model'
import type { RubricScore, RubricVerdict, GeneratableSectionName } from './types'

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Strip allowed inline tags down to plain text for token-level checks. */
function plain(html: string | undefined | null): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ')
}

/** Naive 4-digit year match (1990–2099). */
function hasYear(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text)
}

/** Match a digit anywhere — used for "carries a real number". */
function hasNumber(text: string): boolean {
  return /\d/.test(text)
}

/** Tokens that indicate a verb-first imperative the reader can do. */
const ACTION_VERBS = [
  'do',
  'ship',
  'run',
  'try',
  'audit',
  'add',
  'replace',
  'swap',
  'use',
  'paste',
  'open',
  'ask',
  'draft',
  'test',
  'measure',
  'pick',
  'read',
  'send',
  'sign',
  'wire',
  'tag',
  'list',
  'mark',
  'set',
  'name',
  'cite',
  'count',
  'reply',
  'note',
]

function startsWithVerb(s: string): boolean {
  const first = s.trim().toLowerCase().split(/[\s.,—:]/)[0] ?? ''
  // Strip the "→ Do:" marker if present.
  const stripped = first.replace(/^[→↳➤\->]+/g, '').trim()
  return ACTION_VERBS.includes(stripped)
}

/** Hype + slop markers that drop the restraint score. */
const HYPE_TOKENS = [
  'huge',
  'massive',
  'crazy',
  'insane',
  'mind-blown',
  'mind-blowing',
  'unbelievable',
  'don’t miss',
  "don't miss",
  'game-changer',
  'game changer',
  'revolutionary',
  'disrupt',
  'literally',
  '100x',
  'gonna',
  'totally',
]

function hasHypeTokens(text: string): boolean {
  const lc = text.toLowerCase()
  return HYPE_TOKENS.some((t) => lc.includes(t))
}

/** All-caps words 4+ chars long (excluding common acronyms allowed by convention). */
function hasAllCaps(text: string): boolean {
  const allowed = new Set([
    'AI',
    'API',
    'LLM',
    'GPU',
    'CPU',
    'RAG',
    'SLA',
    'P99',
    'CSV',
    'RBI',
    'SEBI',
    'GDPR',
    'NPS',
    'KYC',
    'OSS',
    'SDK',
    'URL',
    'JSON',
    'HTML',
    'CSS',
    'IST',
    'UTC',
    'PII',
    'CTO',
    'CEO',
    'PM',
    'ML',
    'NLP',
  ])
  return text
    .split(/\s+/)
    .some((w) => /^[A-Z]{4,}$/.test(w) && !allowed.has(w))
}

function hasExclamation(text: string): boolean {
  return /!/.test(text)
}

function hasEmoji(text: string): boolean {
  // Strip the three allowed marks first.
  const stripped = text.replace(/[↑⚡↳]/g, '')
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(stripped)
}

/** Looks like the section names a source (Author/Outlet/Org + year). */
function looksSourced(text: string): boolean {
  return hasYear(text) && /[A-Z][a-zA-Z]+/.test(text)
}

/* ── Per-section scorers ─────────────────────────────────────────────────── */

/**
 * Generic scaffold every section uses. Starts each axis at 5, deducts for
 * specific failures. Clamped to [1, 5].
 */
function clampAll(s: RubricScore): RubricScore {
  const c = (n: number) => Math.max(1, Math.min(5, n))
  return {
    so_what_score: c(s.so_what_score),
    actionability_score: c(s.actionability_score),
    specificity_score: c(s.specificity_score),
    freshness_score: c(s.freshness_score),
    fairness_score: c(s.fairness_score),
    restraint_score: c(s.restraint_score),
  }
}

function scoreSoWhat(s: SoWhat): RubricScore {
  let so_what = 5
  let actionability = 5
  let specificity = 5
  const freshness = 4 // no history available — default
  let fairness = 5
  let restraint = 5

  if (s.lenses.length !== 4) so_what -= 2
  const primaries = s.lenses.filter((l) => l.is_primary).length
  if (primaries !== 1) so_what -= 1

  for (const lens of s.lenses) {
    if (!lens.action.startsWith('→ Do:')) actionability -= 1
    const verb = lens.action.replace(/^→ Do:\s*/, '')
    if (!startsWithVerb(verb)) actionability -= 1
    const body = plain(lens.body_html)
    if (hasHypeTokens(body) || hasExclamation(body)) restraint -= 2
    if (hasAllCaps(body)) restraint -= 1
    if (hasEmoji(body)) restraint -= 1
    if (body.length < 40) so_what -= 1
  }

  // Fairness: the Switcher lens must be present and non-empty.
  const switcher = s.lenses.find((l) => l.role === 'switcher')
  if (!switcher || plain(switcher.body_html).length < 20) fairness -= 2

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreBuildNotes(s: BuildNotes): RubricScore {
  let so_what = 5
  let actionability = 5
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  // HARD: one number + one copyable artifact per CLAUDE.md.
  if (!hasNumber(plain(s.metric_html))) specificity -= 3
  if (!s.code || !s.code.body || s.code.body.trim().length < 20)
    specificity -= 3
  if (s.code && /TODO|FIXME|\.\.\.|<placeholder>/i.test(s.code.body))
    specificity -= 2

  if (!looksSourced(s.paper_ref)) specificity -= 1
  if (!s.paper_link || !/^https?:\/\//.test(s.paper_link)) specificity -= 1

  const ship = plain(s.ship_this_week_html)
  if (!startsWithVerb(ship)) actionability -= 2
  if (ship.length < 10) actionability -= 2

  // Fairness: BuildNotes is Nerd Lane — we don't penalize for being technical,
  // but we do penalize if it has no "so what" link at all.
  if (plain(s.skim_html).length < 20) so_what -= 2

  const allText = [
    s.title,
    plain(s.skim_html),
    plain(s.fix_html),
    plain(s.ship_this_week_html),
  ].join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreJobSignal(s: JobSignal): RubricScore {
  let so_what = 5
  let actionability = 5
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  if (s.rows.length < 3) so_what -= 1
  if (!hasNumber(s.spotlight.stat)) specificity -= 2
  if (!looksSourced(s.spotlight.source)) specificity -= 2

  if (!s.spotlight.sodo_html.startsWith('↳ So do this:')) actionability -= 2

  if (s.upskill.rungs.length !== 3) so_what -= 1
  for (const r of s.upskill.rungs) {
    const body = plain(r.body_html)
    if (!startsWithVerb(body)) actionability -= 1
  }

  if (s.interview.steps.length !== 4) so_what -= 1
  if (!s.interview.tip_html.toLowerCase().includes('copy-tip'))
    actionability -= 1

  // Fairness: Switcher rung must be at least mentioned somewhere; if none of
  // the rungs target an entry-level move, mark down a point.
  const allRungs = s.upskill.rungs.map((r) => plain(r.body_html)).join(' ')
  if (!/rung\s*1|first|start|entry|beginner/i.test(allRungs)) fairness -= 1

  const allText = [
    plain(s.spotlight.sodo_html),
    plain(s.interview.tip_html),
    ...s.upskill.rungs.map((r) => plain(r.body_html)),
  ].join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreUnderTheHood(s: UnderTheHood): RubricScore {
  let so_what = 5
  let actionability = 4 // hood is explanatory; baseline 4
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  if (s.steps.length !== 3) so_what -= 2
  const stepNs = s.steps.map((st) => st.n)
  if (
    stepNs[0] !== '01' ||
    (stepNs[1] && stepNs[1] !== '02') ||
    (stepNs[2] && stepNs[2] !== '03')
  )
    so_what -= 1

  const step0 = plain(s.steps[0]?.body_html ?? '')
  if (step0.length < 30) so_what -= 1
  // Looks for an analogy hook (dabba/chai/local/tiffin/cricket/etc).
  const analogyHooks = /\b(dabba|tiffin|chai|cricket|train|auto|rickshaw|kirana|sabzi|fan|family|wedding)\b/i
  if (!analogyHooks.test(step0)) {
    // Allow generic-but-clear analogies too if the step explicitly says "like a"
    if (!/like a /i.test(step0)) fairness -= 1
  }

  if (!s.source.text || !looksSourced(s.source.text)) specificity -= 2
  if (!s.source.link || !/^https?:\/\//.test(s.source.link)) specificity -= 2

  const allText = s.steps.map((st) => plain(st.body_html)).join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  // Fairness: this section's whole job is to bring non-tech along. If steps
  // are pure jargon, mark down.
  const jargonish = /\b(transformer|embedding|attention|tokeniz|backprop|gradient|softmax|RLHF|MoE)\b/gi
  const matches = allText.match(jargonish) ?? []
  if (matches.length > 3) fairness -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreTheRep(s: TheRep): RubricScore {
  let so_what = 5
  let actionability = 5
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  const lite = plain(s.lite_html)
  if (lite.length < 20) so_what -= 2
  if (!startsWithVerb(lite)) actionability -= 2

  const full = plain(s.full_html)
  if (full.length < 30) so_what -= 1

  if (!s.done || s.done.length < 5) actionability -= 1
  // "done" should name an observable artifact.
  if (
    !/\b(pager|csv|screenshot|doc|table|notes|chart|list|email|message|file|trace)\b/i.test(
      s.done,
    )
  )
    actionability -= 1

  if (!s.reader_win || !s.reader_win.quote || !s.reader_win.by) specificity -= 1

  const allText = [lite, full, s.done, s.reader_win?.quote ?? ''].join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreToolbox(s: Toolbox): RubricScore {
  // Toolbox is nullable; if null, score 5s across the board (graceful skip).
  if (s === null) {
    return {
      so_what_score: 5,
      actionability_score: 5,
      specificity_score: 5,
      freshness_score: 5,
      fairness_score: 5,
      restraint_score: 5,
    }
  }

  let so_what = 5
  let actionability = 5
  let specificity = 5
  const freshness = 4
  const fairness = 5
  let restraint = 5

  const tool = plain(s.tool_html)
  const tryT = plain(s.try_html)
  if (tool.length < 15) so_what -= 1
  if (tryT.length < 10) actionability -= 1
  // try_html should carry a concrete artifact (a prompt, URL, key combo, path).
  if (
    !/(https?:\/\/|cmd|ctrl|`[^`]+`|<code>|prompt:|paste|type)/i.test(tryT)
  )
    specificity -= 2

  const allText = [tool, tryT].join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreRealityCheck(s: RealityCheck): RubricScore {
  let so_what = 5
  let actionability = 4 // reality check is reflective; baseline 4
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  if (!s.harm_tag) so_what -= 2
  if (plain(s.body_html).length < 30) so_what -= 1
  if (!plain(s.honest_html) || plain(s.honest_html).length < 15)
    fairness -= 2

  if (!looksSourced(s.source)) specificity -= 2

  const allText = [plain(s.body_html), plain(s.honest_html)].join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1
  // Doom-posting check: pure negativity without honest_html drops fairness.
  if (!plain(s.honest_html)) fairness -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreIndiaSignal(s: IndiaSignal): RubricScore {
  let so_what = 5
  let actionability = 4
  let specificity = 5
  const freshness = 4
  let fairness = 5
  let restraint = 5

  if (s.cards.length !== 3) so_what -= 2

  // Rotation check: no two cards share a city or sector.
  const cats = s.cards.map((c) => c.cat.toLowerCase())
  const sectors = cats.map((c) => c.split('·')[0]?.trim())
  const cities = cats.map((c) => c.split('·')[1]?.trim())
  if (new Set(sectors).size < sectors.length) so_what -= 1
  if (new Set(cities).size < cities.length) so_what -= 1

  for (const card of s.cards) {
    if (!hasNumber(card.body)) specificity -= 1
    if (!card.why_you.toLowerCase().startsWith('why you care'))
      actionability -= 1
    if (!card.h4 || card.h4.length < 8) so_what -= 1
  }

  const allText = s.cards
    .map((c) => `${c.h4} ${c.body} ${c.why_you}`)
    .join(' ')
  if (hasHypeTokens(allText) || hasExclamation(allText)) restraint -= 2
  if (hasAllCaps(allText)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

function scoreCloser(s: Closer): RubricScore {
  let so_what = 5
  const actionability = 3 // closer isn't about actions
  let specificity = 4
  let freshness = 5 // format rotates by design
  const fairness = 5
  let restraint = 5

  const body = plain(s.body_html)
  if (!body) so_what -= 3
  if (body.length > 280) freshness -= 1
  if (!/<span class="punch">/.test(s.body_html)) specificity -= 2

  if (hasExclamation(body)) restraint -= 2
  if (hasAllCaps(body)) restraint -= 1
  if (hasEmoji(body)) restraint -= 1

  return clampAll({
    so_what_score: so_what,
    actionability_score: actionability,
    specificity_score: specificity,
    freshness_score: freshness,
    fairness_score: fairness,
    restraint_score: restraint,
  })
}

/* ── Public API ──────────────────────────────────────────────────────────── */

/**
 * Score a section. Throws if `section` doesn't match the named type — caller
 * is responsible for passing matched pairs.
 */
export function scoreSection(
  name: GeneratableSectionName | 'one_thing',
  section: unknown,
): RubricScore {
  switch (name) {
    case 'so_what':
      return scoreSoWhat(section as SoWhat)
    case 'build_notes':
      return scoreBuildNotes(section as BuildNotes)
    case 'job_signal':
      return scoreJobSignal(section as JobSignal)
    case 'under_the_hood':
      return scoreUnderTheHood(section as UnderTheHood)
    case 'the_rep':
      return scoreTheRep(section as TheRep)
    case 'toolbox':
      return scoreToolbox(section as Toolbox)
    case 'reality_check':
      return scoreRealityCheck(section as RealityCheck)
    case 'india_signal':
      return scoreIndiaSignal(section as IndiaSignal)
    case 'closer':
      return scoreCloser(section as Closer)
    case 'one_thing':
      // One Thing is human-written; we just check it isn't empty.
      return {
        so_what_score: 5,
        actionability_score: 4,
        specificity_score: 5,
        freshness_score: 5,
        fairness_score: 5,
        restraint_score: 5,
      }
  }
}

/**
 * Evaluate the full issue. Fails if any axis on any section is < 3, OR the
 * average score across all sections is < 4.
 */
export function evaluateIssue(content: IssueContent): RubricVerdict {
  const sections: Array<{ name: GeneratableSectionName | 'one_thing'; payload: unknown }> = [
    { name: 'one_thing', payload: content.one_thing },
    { name: 'so_what', payload: content.so_what },
    { name: 'build_notes', payload: content.build_notes },
    { name: 'job_signal', payload: content.job_signal },
    { name: 'under_the_hood', payload: content.under_the_hood },
    { name: 'the_rep', payload: content.the_rep },
    { name: 'toolbox', payload: content.toolbox },
    { name: 'reality_check', payload: content.reality_check },
    { name: 'india_signal', payload: content.india_signal },
    { name: 'closer', payload: content.closer },
  ]

  const blockers: RubricVerdict['blockers'] = []
  let total = 0
  let count = 0

  for (const s of sections) {
    const score = scoreSection(s.name, s.payload)
    const axes: Array<[keyof RubricScore, number]> = [
      ['so_what_score', score.so_what_score],
      ['actionability_score', score.actionability_score],
      ['specificity_score', score.specificity_score],
      ['freshness_score', score.freshness_score],
      ['fairness_score', score.fairness_score],
      ['restraint_score', score.restraint_score],
    ]
    for (const [axis, n] of axes) {
      total += n
      count += 1
      if (n < 3) {
        blockers.push({
          section: s.name,
          axis,
          score: n,
          reason: explainAxis(axis, n),
        })
      }
    }
  }

  const avg = count > 0 ? total / count : 0
  const passed = blockers.length === 0 && avg >= 4

  return { passed, blockers, avg }
}

function explainAxis(axis: keyof RubricScore, score: number): string {
  const base = `Score ${score} < 3 on ${axis}.`
  const hint: Record<keyof RubricScore, string> = {
    so_what_score: 'Section is missing its core point or shape (wrong count, empty body).',
    actionability_score:
      'No verb the reader can do this week. Add a "→ Do:" line or a concrete artifact.',
    specificity_score:
      'No named source + year, or no number. Replace "estimates suggest" with a real citation.',
    freshness_score: 'Reads like a template that could fit any week.',
    fairness_score:
      'Leaves non-tech (or Switcher) readers out, or doom-posts without an honest counterweight.',
    restraint_score:
      'Hype tokens, exclamation marks, all-caps, or unallowed emoji detected. Calm it down.',
  }
  return `${base} ${hint[axis]}`
}
