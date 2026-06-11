/**
 * Pipeline-internal types.
 *
 * Builds ON TOP of IssueContent (do not redefine the section shapes here —
 * the public content model lives in /Users/surajpandita/ai_signal/src/lib/content-model.ts).
 *
 * These types describe the *generation flow*: raw inputs Suraj feeds in,
 * the rotating per-issue context the prompts need, per-section results that
 * carry a rubric verdict, and the human-gate states the One Thing moves
 * through.
 */

import type {
  IssueContent,
  Lens,
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

/* ── Raw input ───────────────────────────────────────────────────────────── */

/**
 * Raw source material Suraj feeds into the pipeline. One entry per primary
 * link, paper, repo, launch, or signal worth a take. `editor_note` is the
 * editor's pre-write framing — guides the rotating lens, the harm angle, the
 * India spin. Optional.
 */
export type GenerationInput = {
  sources: Array<{
    title: string
    body: string                 // dumped text — paper abstract, blog post, launch note
    url: string
    source_newsletter?: string   // attribution chain (Stratechery, Import AI, etc.)
  }>
  editor_note?: string
}

/* ── Per-issue context ──────────────────────────────────────────────────── */

/**
 * Rotating context the prompts need to keep the issue fresh and
 * voice-consistent. `primary_lens` rotates per issue; everything else either
 * carries the current draft state or remembers what's locked.
 */
export type GenerationContext = {
  issue_number: number
  slug: string                       // "001", "002"
  primary_lens: Lens                 // rotates each issue
  /** Sections whose drafts are already locked by the editor — skip regen. */
  locked_sections?: GeneratableSectionName[]
  /** Optional: the One Thing draft, for downstream sections that need to align. */
  one_thing_lede?: string
  /** Current draft (partial allowed — generators may read sibling sections). */
  draft?: Partial<IssueContent>
}

/* ── Rubric ──────────────────────────────────────────────────────────────── */

/**
 * Six-axis ship-gate rubric from CLAUDE.md §"Ship-gate rubric".
 * Each axis scored 1–5. No section ships below 3 on any axis.
 */
export type RubricScore = {
  so_what_score: number          // does the section name a real "so what"?
  actionability_score: number    // is there a verb a reader can do this week?
  specificity_score: number      // named source + year, copyable artifact
  freshness_score: number        // not a recycled template from last 4 issues
  fairness_score: number         // doesn't leave non-tech in the cold
  restraint_score: number        // calm tone, no FOMO, jargon glossed
}

export type RubricVerdict = {
  passed: boolean
  blockers: Array<{
    section: string
    axis: keyof RubricScore
    score: number
    reason: string
  }>
  avg: number
}

/* ── Generation result ──────────────────────────────────────────────────── */

/**
 * Discriminated union mapping each generatable section name to its concrete
 * IssueContent type, so `GenerationResult` is typed end-to-end.
 */
export type GeneratableSectionName =
  | 'so_what'
  | 'build_notes'
  | 'job_signal'
  | 'under_the_hood'
  | 'the_rep'
  | 'toolbox'
  | 'reality_check'
  | 'india_signal'
  | 'closer'

export type GeneratedSectionPayload =
  | { name: 'so_what'; section: SoWhat }
  | { name: 'build_notes'; section: BuildNotes }
  | { name: 'job_signal'; section: JobSignal }
  | { name: 'under_the_hood'; section: UnderTheHood }
  | { name: 'the_rep'; section: TheRep }
  | { name: 'toolbox'; section: Toolbox }              // Toolbox is nullable
  | { name: 'reality_check'; section: RealityCheck }
  | { name: 'india_signal'; section: IndiaSignal }
  | { name: 'closer'; section: Closer }

export type GenerationResult =
  | (GeneratedSectionPayload & { ok: true; score: RubricScore })
  | { name: GeneratableSectionName; ok: false; error: string }

/* ── Human gate ──────────────────────────────────────────────────────────── */

export type HumanGateStatus =
  | 'pending_one_thing'        // Suraj hasn't written The One Thing yet
  | 'pending_review'           // Generated; rubric or editor still has work
  | 'approved'                 // Cleared to publish
