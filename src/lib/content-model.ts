/**
 * Shared content model for AI, Basically.
 * Ported directly from ~/Downloads/ai-basically-FINAL.html.
 *
 * SOURCE OF TRUTH for:
 *   - Supabase JSONB columns on `issues` (Agent B)
 *   - Component prop types (Agent C)
 *   - Email template prop types (Agent E)
 *   - Pipeline generator output (Agent F, later)
 *
 * Strings whose names end in `_html` may carry inline markup (<em>, <strong>,
 * <br>, <code>, <span class="punch">). Everything else is plain text.
 */

export type Lens = 'builder' | 'product_biz' | 'secure_pro' | 'switcher'

export type IssueStatus = 'draft' | 'review' | 'published'

export type TldrRow = {
  label: string
  body: string
  // Anchor target to jump to when the TLDR row is clicked. "01"-"08" for
  // numbered sections, "bn" for Build Notes, "decoder", "closer". When
  // omitted, the row renders as plain text (no jump).
  target?: string
}

export type LensTake = {
  role: Lens
  label: string           // "Builder", "Product / Biz", "Secure Pro", "Switcher"
  caption: string         // "You ship the thing"
  body_html: string
  action: string          // "→ Do: ship a 'why' field with every answer next sprint."
  is_primary: boolean     // exactly one lens is primary per issue
}

export type OneThing = {
  head: string
  lede_html: string
  skip_list: { title: string; body: string }   // title = "Skip List"
}

export type SoWhat = {
  rotation_note: { primary: string; next: string; aside: string }
  lenses: LensTake[]      // length 4
}

export type BuildNotes = {
  title: string
  paper_ref: string
  paper_link: string
  eval_link: string
  skim_html: string
  struggle_html: string
  finding_html: string
  fix_html: string
  metric_html: string
  ship_this_week_html: string
  code: { lang: string; body: string }
  diagram_svg: string     // raw SVG
}

export type JobRow = { what_html: string; trend: 'up' | 'hot' }

export type Spotlight = {
  header: string
  stat: string
  stat_sub: string
  source: string
  sodo_html: string       // "↳ So do this: search LinkedIn for `…` …"
}

export type UpskillRung = { label: string; body_html: string }

export type Upskill = {
  title: string
  intro_html: string
  rungs: UpskillRung[]    // length 3
  note_html: string
}

/**
 * Interview prep brief.
 *
 * Dual surface:
 *   - In the Saturday issue's Job Signal section, this renders as a TIGHT
 *     teaser card (q_label + q + framework_name + 4 first-clause steps + CTA
 *     to the full brief on /interviews/<slug>).
 *   - On /interviews/<slug>, it renders as the FULL 8-section prep brief —
 *     see system/INTERVIEW-RUBRIC.md for the quality bar (Anthropic / OpenAI
 *     hire-level depth, 1250-2050 words).
 *
 * The deep fields below are optional so legacy issues (pre-brief-rewrite)
 * still type-check; when absent, /interviews/<slug> shows a graceful
 * "full prep brief coming soon" fallback using the q + steps + tip_html.
 */
export type InterviewCounter = {
  q: string                       // the follow-up question the interviewer asks
  strong_html: string             // the strong answer (1-3 sentences)
  weak_html: string               // the common weak answer
  why_weak_loses_html: string     // why the weak answer loses signal
}

export type InterviewTrap = {
  move: string                    // the specific wrong move (verbatim, scannable)
  signal_lost_html: string        // what seniority signal this move loses
}

export type Interview = {
  // teaser surface (always required)
  q_label: string                  // "AI PM · regulated stack"
  q: string                        // the FULL question, plain text fallback
  // Optional structured HTML version of the question for the brief page
  // hero. Renders the question as setup paragraph + trigger paragraph (with
  // <ul><li> when the trigger has parenthesized items) + the ask line —
  // instead of one 75-word run-on. Whitelisted tags: <p>, <ul>, <li>, <em>,
  // <strong>, <code>. When absent, brief page falls back to plain `q`.
  q_html?: string
  // Optional 1-2 sentence hand-written hook for the JobSignal teaser + the
  // /interviews library card. Editor curates this to capture the scenario
  // without dumping the whole 80-word question into a card. When absent,
  // surfaces fall back to the first sentence of `q`.
  teaser_q?: string
  steps: { n: number; body_html: string }[]   // length 4 — the framework steps
  tip_html: string                 // legacy meta-skill closer; superseded by meta_skill_html when present

  // full-brief fields (optional — present once the issue's brief is rewritten to rubric)
  framework_name?: string                // "Counterfactual → slice → observability → kill criteria"
  why_they_ask_html?: string             // section 2 — what they're really testing
  sample_answer_html?: string            // section 4 — first-person spoken, with inline [why this works] callouts
  // Optional eval deep-dive — teaches HOW to design / construct / validate / read
  // the eval the framework calls for. Most candidates know to log but not to
  // evaluate; this section closes that gap with the specific eval shape this
  // question's framework needs (sample size, scorer choice, ship-gate threshold).
  // Renders as its own section between Sample Answer and Depth Guide on
  // /interviews/<slug>; absent ⇒ section is skipped.
  eval_deep_dive_html?: string
  depth_guide_html?: string              // section 5 — what to lead with vs hold for probe
  counters?: InterviewCounter[]          // section 6 — 3-5 follow-ups
  traps?: InterviewTrap[]                // section 7 — 3-5 wrong moves
  good_vs_great_html?: string            // section 8 — strong-hire distinguisher
  meta_skill_html?: string               // the durable transferable skill
  read_time_min?: number                 // for /interviews/<slug> page header
}

export type JobSignal = {
  rows: JobRow[]
  spotlight: Spotlight
  upskill: Upskill
  interview: Interview
}

export type UnderTheHood = {
  question_html: string
  diagram_svg: string
  steps: { n: string; title: string; body_html: string }[]   // length 3
  source: { text: string; link: string }
}

export type ReaderWin = { quote: string; by: string; link: string }

export type TheRep = {
  type: 'audit' | 'build' | 'compare' | 'break'
  lite_html: string
  full_html: string
  done: string
  reader_win: ReaderWin
}

export type Toolbox = {
  tool_html: string
  try_html: string
} | null

export type RealityCheck = {
  harm_tag: string        // "environment" | "labor" | "bias" | "privacy" | "power"
  h3: string
  body_html: string
  honest_html: string
  source: string
}

export type IndiaSignalCard = {
  cat: string             // "Transport · Bengaluru"
  status: string          // "shipped", "open-source", "data drop"
  status_hot: boolean
  h4: string
  body: string
  why_you: string
  source_url?: string     // optional — when present, h4 renders as a link
}

export type IndiaSignal = {
  cards: IndiaSignalCard[]   // length 3
  foot: string
  foot_cta: string
  foot_cta_url: string
}

export type Sponsor = {
  brand_tag: string       // "Presented by — Acme"
  copy_html: string
  cta: string
  cta_url: string
} | null

export type Closer = {
  format: 'dark-joke' | 'absurd-true' | 'provocation'
  format_label: string    // "This week: the dark one"
  body_html: string       // includes <span class="punch">
}

export type Poll = {
  question: string
  options: string[]
}

export type Foot = {
  reply_prompt: string
  next_issue: string
}

export type DecoderTerm = {
  term: string             // "RAG"
  plain: string            // "Look-it-up-before-you-answer. The AI checks a notes file before answering."
}

// Optional jargon explainer at the bottom of each issue. Closed-fold on web;
// rendered open in email. Lives outside the numbered editorial spine so it
// doesn't bloat the scroll rhythm — it's an opt-in safety net for readers
// who hit a term they don't know.
export type Decoder = {
  intro: string            // "The jargon that showed up this week, in one line each."
  terms: DecoderTerm[]     // 4-8 terms ideal
} | null

export type IssueContent = {
  // identity
  issue_number: number
  slug: string                          // "001", "002"
  status: IssueStatus
  published_at: string | null           // ISO

  // hero + masthead
  date_display: string                  // "13.06.2026"
  read_time_min: number                 // 7
  streak_caption: string                // "Your Saturday ritual"
  hero_eyebrow: string                  // "AI, explained like a normal person would"
  hero_headline_html: string            // "This week, RBI<br>quietly <em>changed<br>the rules.</em>"
  hero_sub_html: string                 // long-form intro with <strong>
  tldr: TldrRow[]                       // length 4

  // 8 numbered sections + Build Notes band
  one_thing: OneThing
  so_what: SoWhat
  build_notes: BuildNotes
  job_signal: JobSignal
  under_the_hood: UnderTheHood
  the_rep: TheRep
  toolbox: Toolbox
  reality_check: RealityCheck
  india_signal: IndiaSignal

  // closing units
  sponsor: Sponsor
  decoder?: Decoder         // optional jargon explainer; closed-fold on web, open in email
  rabbit_hole?: RabbitHole  // optional weekend deeper read curated per issue
  closer: Closer
  poll: Poll
  foot: Foot
}

/**
 * Weekend Rabbit Hole — one curated resource per issue that pairs with the
 * week's One Thing for the reader who wants to dig deeper. Optional;
 * absent ⇒ section is skipped. Compounds into a library asset over time —
 * by week 26, /interviews-style index of these creates a real moat.
 *
 * `kind` is intentionally constrained to keep the visual treatment uniform.
 */
export type RabbitHoleKind = 'paper' | 'blog' | 'video' | 'repo' | 'podcast' | 'thread'

export type RabbitHole = {
  title: string            // verbatim title of the resource
  by: string               // author / publisher / channel
  url: string              // canonical link
  kind: RabbitHoleKind     // visual badge driver
  time_min: number         // estimated read/watch time
  why_html: string         // 1-2 sentences on why this pairs with the issue
}
