/**
 * Generation orchestrator.
 *
 * Calls Anthropic with each section's prompt, parses the JSON, validates with
 * a minimal type-predicate (no Zod — no new deps), scores against the rubric,
 * and inserts the draft issue.
 *
 * Model choice for v1: claude-sonnet-4-6 (per task spec). The brief flags
 * opus-4-7 as a future cost/quality tier-up if the rubric flags axes < 4.
 */

import { anthropic } from '../anthropic'
import { createAdminSupabaseClient } from '../supabase-admin'
import {
  soWhatPrompt,
  buildNotesPrompt,
  jobSignalPrompt,
  underTheHoodPrompt,
  theRepPrompt,
  toolboxPrompt,
  realityCheckPrompt,
  indiaSignalPrompt,
  closerPrompt,
} from './prompts'
import { scoreSection, evaluateIssue } from './rubric'
import type {
  GenerationInput,
  GenerationContext,
  GenerationResult,
  GeneratableSectionName,
} from './types'
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
  Lens,
} from '../content-model'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 2_000

/* ── Prompt registry ─────────────────────────────────────────────────────── */

const PROMPTS: Record<
  GeneratableSectionName,
  (input: GenerationInput, ctx: GenerationContext) => string
> = {
  so_what: soWhatPrompt,
  build_notes: buildNotesPrompt,
  job_signal: jobSignalPrompt,
  under_the_hood: underTheHoodPrompt,
  the_rep: theRepPrompt,
  toolbox: toolboxPrompt,
  reality_check: realityCheckPrompt,
  india_signal: indiaSignalPrompt,
  closer: closerPrompt,
}

/* ── JSON extraction ─────────────────────────────────────────────────────── */

/**
 * Pull a JSON object/null from the model output. Anthropic occasionally wraps
 * JSON in a fence even when told not to — strip that. We also accept the
 * literal string "null" for the Toolbox skip-this-week case.
 */
function extractJson(raw: string): unknown {
  let s = raw.trim()
  // Strip ```json … ``` fences if the model added them.
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  if (s === 'null') return null
  // Find the first '{' or '[' — drop any preamble.
  const firstBrace = Math.min(
    ...['{', '['].map((c) => {
      const i = s.indexOf(c)
      return i === -1 ? Number.POSITIVE_INFINITY : i
    }),
  )
  if (Number.isFinite(firstBrace) && firstBrace > 0) s = s.slice(firstBrace)
  return JSON.parse(s)
}

/* ── Type predicates (minimal — no Zod) ──────────────────────────────────── */

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}
function isStr(x: unknown): x is string {
  return typeof x === 'string'
}
function isArr(x: unknown): x is unknown[] {
  return Array.isArray(x)
}

function isLens(x: unknown): x is Lens {
  return (
    x === 'builder' ||
    x === 'product_biz' ||
    x === 'secure_pro' ||
    x === 'switcher'
  )
}

function isSoWhat(x: unknown): x is SoWhat {
  if (!isObj(x)) return false
  if (!isObj(x.rotation_note)) return false
  const rn = x.rotation_note as Record<string, unknown>
  if (!isStr(rn.primary) || !isStr(rn.next) || !isStr(rn.aside)) return false
  if (!isArr(x.lenses) || x.lenses.length !== 4) return false
  for (const lens of x.lenses) {
    if (!isObj(lens)) return false
    if (!isLens(lens.role)) return false
    if (
      !isStr(lens.label) ||
      !isStr(lens.caption) ||
      !isStr(lens.body_html) ||
      !isStr(lens.action) ||
      typeof lens.is_primary !== 'boolean'
    )
      return false
  }
  return true
}

function isBuildNotes(x: unknown): x is BuildNotes {
  if (!isObj(x)) return false
  const need: Array<keyof BuildNotes> = [
    'title',
    'paper_ref',
    'paper_link',
    'eval_link',
    'skim_html',
    'struggle_html',
    'finding_html',
    'fix_html',
    'metric_html',
    'ship_this_week_html',
    'diagram_svg',
  ]
  for (const k of need) {
    if (!isStr(x[k as string])) return false
  }
  if (!isObj(x.code)) return false
  const code = x.code as Record<string, unknown>
  if (!isStr(code.lang) || !isStr(code.body)) return false
  return true
}

function isJobSignal(x: unknown): x is JobSignal {
  if (!isObj(x)) return false
  if (!isArr(x.rows)) return false
  for (const r of x.rows) {
    if (!isObj(r) || !isStr(r.what_html)) return false
    if (r.trend !== 'up' && r.trend !== 'hot') return false
  }
  if (!isObj(x.spotlight)) return false
  const sp = x.spotlight as Record<string, unknown>
  if (
    !isStr(sp.header) ||
    !isStr(sp.stat) ||
    !isStr(sp.stat_sub) ||
    !isStr(sp.source) ||
    !isStr(sp.sodo_html)
  )
    return false
  if (!isObj(x.upskill)) return false
  const us = x.upskill as Record<string, unknown>
  if (
    !isStr(us.title) ||
    !isStr(us.intro_html) ||
    !isArr(us.rungs) ||
    us.rungs.length !== 3 ||
    !isStr(us.note_html)
  )
    return false
  for (const r of us.rungs) {
    if (!isObj(r) || !isStr(r.label) || !isStr(r.body_html)) return false
  }
  if (!isObj(x.interview)) return false
  const iv = x.interview as Record<string, unknown>
  if (!isStr(iv.q_label) || !isStr(iv.q) || !isArr(iv.steps) || iv.steps.length !== 4)
    return false
  for (const s of iv.steps) {
    if (!isObj(s) || typeof s.n !== 'number' || !isStr(s.body_html)) return false
  }
  if (!isStr(iv.tip_html)) return false
  return true
}

function isUnderTheHood(x: unknown): x is UnderTheHood {
  if (!isObj(x)) return false
  if (!isStr(x.question_html) || !isStr(x.diagram_svg)) return false
  if (!isArr(x.steps) || x.steps.length !== 3) return false
  for (const s of x.steps) {
    if (!isObj(s) || !isStr(s.n) || !isStr(s.title) || !isStr(s.body_html))
      return false
  }
  if (!isObj(x.source)) return false
  const src = x.source as Record<string, unknown>
  if (!isStr(src.text) || !isStr(src.link)) return false
  return true
}

function isTheRep(x: unknown): x is TheRep {
  if (!isObj(x)) return false
  if (
    x.type !== 'audit' &&
    x.type !== 'build' &&
    x.type !== 'compare' &&
    x.type !== 'break'
  )
    return false
  if (!isStr(x.lite_html) || !isStr(x.full_html) || !isStr(x.done)) return false
  if (!isObj(x.reader_win)) return false
  const rw = x.reader_win as Record<string, unknown>
  if (!isStr(rw.quote) || !isStr(rw.by) || !isStr(rw.link)) return false
  return true
}

function isToolbox(x: unknown): x is Toolbox {
  if (x === null) return true
  if (!isObj(x)) return false
  return isStr(x.tool_html) && isStr(x.try_html)
}

function isRealityCheck(x: unknown): x is RealityCheck {
  if (!isObj(x)) return false
  return (
    isStr(x.harm_tag) &&
    isStr(x.h3) &&
    isStr(x.body_html) &&
    isStr(x.honest_html) &&
    isStr(x.source)
  )
}

function isIndiaSignal(x: unknown): x is IndiaSignal {
  if (!isObj(x)) return false
  if (!isArr(x.cards) || x.cards.length !== 3) return false
  for (const c of x.cards) {
    if (!isObj(c)) return false
    if (
      !isStr(c.cat) ||
      !isStr(c.status) ||
      typeof c.status_hot !== 'boolean' ||
      !isStr(c.h4) ||
      !isStr(c.body) ||
      !isStr(c.why_you)
    )
      return false
  }
  return (
    isStr(x.foot) && isStr(x.foot_cta) && isStr(x.foot_cta_url)
  )
}

function isCloser(x: unknown): x is Closer {
  if (!isObj(x)) return false
  if (
    x.format !== 'dark-joke' &&
    x.format !== 'absurd-true' &&
    x.format !== 'provocation'
  )
    return false
  return isStr(x.format_label) && isStr(x.body_html)
}

const PREDICATES: Record<GeneratableSectionName, (x: unknown) => boolean> = {
  so_what: isSoWhat,
  build_notes: isBuildNotes,
  job_signal: isJobSignal,
  under_the_hood: isUnderTheHood,
  the_rep: isTheRep,
  toolbox: isToolbox,
  reality_check: isRealityCheck,
  india_signal: isIndiaSignal,
  closer: isCloser,
}

/* ── Anthropic call ──────────────────────────────────────────────────────── */

async function callAnthropic(prompt: string): Promise<string> {
  const client = anthropic()
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  })
  // Concatenate text blocks; ignore tool_use / thinking blocks.
  const text = msg.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
  return text
}

/* ── Section generator ──────────────────────────────────────────────────── */

/**
 * Build the section payload for a successful generation, narrowed by `name`.
 * Keeps the discriminated union of GenerationResult honest.
 */
function buildOkResult(
  name: GeneratableSectionName,
  section: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): GenerationResult & { ok: true } {
  // The caller has already run the matching predicate, so the cast is sound.
  switch (name) {
    case 'so_what':
      return {
        name,
        section: section as SoWhat,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'build_notes':
      return {
        name,
        section: section as BuildNotes,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'job_signal':
      return {
        name,
        section: section as JobSignal,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'under_the_hood':
      return {
        name,
        section: section as UnderTheHood,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'the_rep':
      return {
        name,
        section: section as TheRep,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'toolbox':
      return {
        name,
        section: section as Toolbox,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'reality_check':
      return {
        name,
        section: section as RealityCheck,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'india_signal':
      return {
        name,
        section: section as IndiaSignal,
        ok: true,
        score: scoreSection(name, section),
      }
    case 'closer':
      return {
        name,
        section: section as Closer,
        ok: true,
        score: scoreSection(name, section),
      }
  }
}

export async function generateSection(
  name: GeneratableSectionName,
  input: GenerationInput,
  ctx: GenerationContext,
): Promise<GenerationResult> {
  try {
    const prompt = PROMPTS[name](input, ctx)
    const raw = await callAnthropic(prompt)
    const parsed = extractJson(raw)
    const ok = PREDICATES[name](parsed)
    if (!ok) {
      return {
        name,
        ok: false,
        error: `Output failed type predicate for section "${name}".`,
      }
    }
    return buildOkResult(name, parsed)
  } catch (err) {
    return {
      name,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/* ── Whole-issue generator ──────────────────────────────────────────────── */

/**
 * Run every generatable section in parallel via Promise.allSettled. Failures
 * are returned as null IssueContent fields with the error logged to stderr —
 * never thrown.
 */
export async function generateDraftSections(
  input: GenerationInput,
  ctx: GenerationContext,
): Promise<Record<GeneratableSectionName, GenerationResult>> {
  const names: GeneratableSectionName[] = [
    'so_what',
    'build_notes',
    'job_signal',
    'under_the_hood',
    'the_rep',
    'toolbox',
    'reality_check',
    'india_signal',
    'closer',
  ]
  const locked = new Set(ctx.locked_sections ?? [])

  const promises = names
    .filter((n) => !locked.has(n))
    .map(async (n) => {
      const result = await generateSection(n, input, ctx)
      if (!result.ok) {
        console.error(
          `[pipeline] section "${n}" failed: ${result.error}`,
        )
      }
      return result
    })

  const settled = await Promise.allSettled(promises)
  const out = {} as Record<GeneratableSectionName, GenerationResult>
  let i = 0
  for (const n of names) {
    if (locked.has(n)) continue
    const s = settled[i++]
    if (s.status === 'fulfilled') {
      out[n] = s.value
    } else {
      console.error(`[pipeline] section "${n}" rejected: ${String(s.reason)}`)
      out[n] = { name: n, ok: false, error: String(s.reason) }
    }
  }
  return out
}

/* ── Entry point: startNewIssue ─────────────────────────────────────────── */

type EditorInputs = {
  /** Hand-written One Thing lede HTML — required by hard editorial rule. */
  one_thing_lede: string
  /** Hand-written One Thing head (title line). */
  one_thing_head?: string
  hero_eyebrow: string
  hero_headline_html: string
  hero_sub_html: string
  /** Optional pre-set Skip List block; defaults to a stock skip note. */
  skip_list?: { title: string; body: string }
  /** Optional date_display ("13.06.2026") — defaults to today. */
  date_display?: string
  /** Optional read_time_min — defaults to 7. */
  read_time_min?: number
  /** Optional streak caption. */
  streak_caption?: string
  /** Rotating primary lens for this issue. */
  primary_lens?: Lens
}

type StartNewIssueResult = {
  issue_id: string
  issue_number: number
  slug: string
  status: 'review'
  rubric: ReturnType<typeof evaluateIssue>
  failed_sections: GeneratableSectionName[]
  rubric_flags: Array<{
    section: string
    axis: string
    score: number
    reason: string
  }>
}

/**
 * Suraj-facing entry. Inserts a draft row with status='review', the editor's
 * hand-written One Thing pre-filled, and every other section generated.
 *
 * If any section fails generation, that section is left as a minimal stub
 * (an empty-but-typed object) on the inserted row, the failure is recorded in
 * `failed_sections`, and status remains 'review'.
 *
 * If the rubric finds any axis < 3, status also stays 'review' and the
 * blockers are returned in `rubric_flags`.
 */
export async function startNewIssue(
  input: GenerationInput,
  editor: EditorInputs,
): Promise<StartNewIssueResult> {
  const supabase = createAdminSupabaseClient()

  // Next issue number = max(issue_number) + 1
  const { data: maxRow, error: maxErr } = await supabase
    .from('issues')
    .select('issue_number')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (maxErr) throw new Error(`couldn't read max issue_number: ${maxErr.message}`)
  const next = (maxRow?.issue_number ?? 0) + 1
  const slug = String(next).padStart(3, '0')

  const ctx: GenerationContext = {
    issue_number: next,
    slug,
    primary_lens: editor.primary_lens ?? 'builder',
    one_thing_lede: editor.one_thing_lede,
  }

  const results = await generateDraftSections(input, ctx)

  // Assemble IssueContent. Failed sections fall back to a minimal stub.
  const content = assembleIssueContent(next, slug, editor, results)

  // Run the rubric on the assembled content.
  const rubric = evaluateIssue(content)

  const failed_sections = (Object.keys(results) as GeneratableSectionName[]).filter(
    (k) => !results[k].ok,
  )

  // Insert the draft row with status='review'.
  const { data: inserted, error: insErr } = await supabase
    .from('issues')
    .insert({
      issue_number: next,
      slug,
      status: 'review',
      hero_eyebrow: content.hero_eyebrow,
      hero_headline_html: content.hero_headline_html,
      hero_sub_html: content.hero_sub_html,
      date_display: content.date_display,
      read_time_min: content.read_time_min,
      streak_caption: content.streak_caption,
      tldr: content.tldr,
      one_thing: content.one_thing,
      so_what: content.so_what,
      build_notes: content.build_notes,
      job_signal: content.job_signal,
      under_the_hood: content.under_the_hood,
      the_rep: content.the_rep,
      toolbox: content.toolbox,
      reality_check: content.reality_check,
      india_signal: content.india_signal,
      sponsor: content.sponsor,
      closer: content.closer,
      poll: content.poll,
      foot: content.foot,
    })
    .select('id')
    .single()

  if (insErr || !inserted) {
    throw new Error(`couldn't insert issue: ${insErr?.message ?? 'no row'}`)
  }

  // TODO(migration follow-up): once `_rubric` JSONB exists on `issues`,
  // write the verdict + blockers back to the row so the editor UI can read it.
  // For now we just return the verdict in the function result; nothing
  // touches the migration file.

  return {
    issue_id: inserted.id,
    issue_number: next,
    slug,
    status: 'review',
    rubric,
    failed_sections,
    rubric_flags: rubric.blockers,
  }
}

/* ── Stub helpers ────────────────────────────────────────────────────────── */

function assembleIssueContent(
  issue_number: number,
  slug: string,
  editor: EditorInputs,
  results: Record<GeneratableSectionName, GenerationResult>,
): IssueContent {
  // Per-section pickers — keep the discriminated union narrow without
  // fighting TS' generic-K variance issues.
  const pickSoWhat = (): SoWhat => {
    const r = results.so_what
    return r && r.ok && r.name === 'so_what' ? r.section : SO_WHAT_STUB
  }
  const pickBuildNotes = (): BuildNotes => {
    const r = results.build_notes
    return r && r.ok && r.name === 'build_notes' ? r.section : BUILD_NOTES_STUB
  }
  const pickJobSignal = (): JobSignal => {
    const r = results.job_signal
    return r && r.ok && r.name === 'job_signal' ? r.section : JOB_SIGNAL_STUB
  }
  const pickUnderTheHood = (): UnderTheHood => {
    const r = results.under_the_hood
    return r && r.ok && r.name === 'under_the_hood'
      ? r.section
      : UNDER_THE_HOOD_STUB
  }
  const pickTheRep = (): TheRep => {
    const r = results.the_rep
    return r && r.ok && r.name === 'the_rep' ? r.section : THE_REP_STUB
  }
  const pickToolbox = (): Toolbox => {
    const r = results.toolbox
    return r && r.ok && r.name === 'toolbox' ? r.section : null
  }
  const pickRealityCheck = (): RealityCheck => {
    const r = results.reality_check
    return r && r.ok && r.name === 'reality_check'
      ? r.section
      : REALITY_CHECK_STUB
  }
  const pickIndiaSignal = (): IndiaSignal => {
    const r = results.india_signal
    return r && r.ok && r.name === 'india_signal'
      ? r.section
      : INDIA_SIGNAL_STUB
  }
  const pickCloser = (): Closer => {
    const r = results.closer
    return r && r.ok && r.name === 'closer' ? r.section : CLOSER_STUB
  }

  return {
    issue_number,
    slug,
    status: 'review',
    published_at: null,

    date_display: editor.date_display ?? formatToday(),
    read_time_min: editor.read_time_min ?? 7,
    streak_caption: editor.streak_caption ?? 'Your Saturday ritual',
    hero_eyebrow: editor.hero_eyebrow,
    hero_headline_html: editor.hero_headline_html,
    hero_sub_html: editor.hero_sub_html,

    // TLDR is templated/derived later by the editor; start empty.
    tldr: [],

    one_thing: {
      head: editor.one_thing_head ?? 'The One Thing',
      lede_html: editor.one_thing_lede,
      skip_list:
        editor.skip_list ?? {
          title: 'Skip List',
          body: 'If you read nothing else this week, read this one.',
        },
    },

    so_what: pickSoWhat(),
    build_notes: pickBuildNotes(),
    job_signal: pickJobSignal(),
    under_the_hood: pickUnderTheHood(),
    the_rep: pickTheRep(),
    toolbox: pickToolbox(),
    reality_check: pickRealityCheck(),
    india_signal: pickIndiaSignal(),

    sponsor: null,
    closer: pickCloser(),

    poll: {
      question: 'What did you do with this issue?',
      options: ['Did the Rep', 'Skimmed', 'Saved for later', 'Not for me'],
    },
    foot: {
      reply_prompt: 'Reply and tell me — did you do the Rep?',
      next_issue: 'Next: Saturday 08:00 IST',
    },
  }
}

function formatToday(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

/* ── Minimal typed stubs (used when a section fails to generate) ────────── */

const SO_WHAT_STUB: SoWhat = {
  rotation_note: { primary: '', next: '', aside: '' },
  lenses: [
    { role: 'builder', label: 'Builder', caption: '', body_html: '', action: '→ Do: ', is_primary: true },
    { role: 'product_biz', label: 'Product / Biz', caption: '', body_html: '', action: '→ Do: ', is_primary: false },
    { role: 'secure_pro', label: 'Secure Pro', caption: '', body_html: '', action: '→ Do: ', is_primary: false },
    { role: 'switcher', label: 'Switcher', caption: '', body_html: '', action: '→ Do: ', is_primary: false },
  ],
}

const BUILD_NOTES_STUB: BuildNotes = {
  title: '',
  paper_ref: '',
  paper_link: '',
  eval_link: '',
  skim_html: '',
  struggle_html: '',
  finding_html: '',
  fix_html: '',
  metric_html: '',
  ship_this_week_html: '',
  code: { lang: 'python', body: '' },
  diagram_svg: '',
}

const JOB_SIGNAL_STUB: JobSignal = {
  rows: [],
  spotlight: { header: '', stat: '', stat_sub: '', source: '', sodo_html: '' },
  upskill: {
    title: '',
    intro_html: '',
    rungs: [
      { label: 'Rung 1', body_html: '' },
      { label: 'Rung 2', body_html: '' },
      { label: 'Rung 3', body_html: '' },
    ],
    note_html: '',
  },
  interview: {
    q_label: 'Interview prompt',
    q: '',
    steps: [
      { n: 1, body_html: '' },
      { n: 2, body_html: '' },
      { n: 3, body_html: '' },
      { n: 4, body_html: '' },
    ],
    tip_html: '',
  },
}

const UNDER_THE_HOOD_STUB: UnderTheHood = {
  question_html: '',
  diagram_svg: '',
  steps: [
    { n: '01', title: '', body_html: '' },
    { n: '02', title: '', body_html: '' },
    { n: '03', title: '', body_html: '' },
  ],
  source: { text: '', link: '' },
}

const THE_REP_STUB: TheRep = {
  type: 'audit',
  lite_html: '',
  full_html: '',
  done: '',
  reader_win: { quote: '', by: '', link: '' },
}

const REALITY_CHECK_STUB: RealityCheck = {
  harm_tag: 'power',
  h3: '',
  body_html: '',
  honest_html: '',
  source: '',
}

const INDIA_SIGNAL_STUB: IndiaSignal = {
  cards: [
    { cat: '', status: '', status_hot: false, h4: '', body: '', why_you: '' },
    { cat: '', status: '', status_hot: false, h4: '', body: '', why_you: '' },
    { cat: '', status: '', status_hot: false, h4: '', body: '', why_you: '' },
  ],
  foot: '',
  foot_cta: '',
  foot_cta_url: '',
}

const CLOSER_STUB: Closer = {
  format: 'provocation',
  format_label: 'This week: a provocation',
  body_html: '',
}
