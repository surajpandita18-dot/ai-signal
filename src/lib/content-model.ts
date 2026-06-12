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

export type TldrRow = { label: string; body: string }

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

export type Interview = {
  q_label: string
  q: string
  steps: { n: number; body_html: string }[]   // length 4
  tip_html: string
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
  closer: Closer
  poll: Poll
  foot: Foot
}
