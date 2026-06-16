# CLAUDE.md — AI, Basically.

Persistent behavioral rules for the AI, Basically. codebase.
Owner: Suraj (solo founder, non-technical PM background).
Stack: Next.js 15 (App Router) · TS strict · Tailwind 3.4 · Supabase · Resend + react-email · Anthropic API · Vercel + Vercel Cron.

> Brand: **AI, Basically.** · tagline `Explained like a normal person would.` · the `.` in the wordmark is the accent (oxblood, `#9C4A2E`). Cadence: **weekly, Saturday 08:00 IST**. Replaces the prior "AI Signal" daily product.

---

## Hard rules

1. **The design contract is `~/Downloads/ai-basically-FINAL.html`.** Port its actual CSS and structure. Do not re-style from scratch or "improve" the design. If something is ambiguous, match the file.
2. **Twin-template discipline.** Web and email are two renderers of the same content. Email is table-based, inline-styled, Georgia-serif, no JS, no external images. Web is the full interactive version.
3. **No Inngest.** Weekly cron uses **Vercel Cron + a single serverless route** (`/api/cron/send/route.ts`).
4. **Sibling project `ai-signal-v2/` is untouchable.** Separate product, separate Vercel project. Never modify.
5. **Working branch is `aibasically`.** `main` still runs the legacy daily product on `ai-signal-eta.vercel.app` until cutover. Safety tag: `pre-aibasically-2026-06-12`.

## Voice rules (apply to all editorial content + UI copy)

- Calm confidence. Never fear, urgency, or FOMO.
- Anti-slop: no recycled LinkedIn takes, no hype, no purple-gradient energy.
- One smart, honest friend explaining things. Hinglish only when Suraj writes; product copy stays in English.
- Brand name is English; section labels are English.

## Ship-gate rubric (every section, every issue, scored 1–5)

`So-What · Actionability · Specificity/Sourcing · Freshness/Non-formula · Fairness-across-readers · Restraint/Trust`
No section ships below 3 on any axis. Issue average ≥ 4.0.

## Hard editorial rules

- "The One Thing" first draft is **always human-written** — never fully automated.
- Every stat = a specific named source + year, or it's cut. No "estimates suggest".
- Build Notes carries **one real number + one copyable artifact** every issue.
- Jargon term → 4-word plain-English gloss on first use. Build Notes is the only "Nerd Lane" and non-tech readers are told to skip guilt-free.
- "Absurd but true" facts are fact-checked to the same standard as Reality Check.
- No lens take, Rep, or tip that would fit the last 4 issues unchanged.

---

## Read before shipping: `system/MISTAKES.md`

Suraj has flagged that repeating the same class of mistake burns trust. Before any change to **email templates, content-model schema, cron route, OG image, or parallel-agent worktree setup**, open `/system/MISTAKES.md` and check the relevant category. If a mistake recurs after being logged there, that's a worse failure than the original — fix structurally (add the check) rather than fixing once. When a new mistake surfaces during a session, log it in `system/MISTAKES.md` *before* moving to the next task.

---

## Rule 1 — Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs. State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. Suraj is non-technical; silent assumptions cost the most. Ask in plain English (or Hinglish if conversation is in it).

## Rule 2 — Simplicity First

Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No flexibility/configurability that wasn't requested. If 200 lines could be 50, rewrite.

## Rule 3 — Surgical Changes

Touch only what you must. Match existing style. Every changed line traces directly to Suraj's request.

---

## Architecture

```
src/
  app/
    layout.tsx              # root layout, fonts, global tokens
    page.tsx                # landing — latest issue hero + subscribe
    i/[issue]/page.tsx      # web issue renderer (interactive)
    archive/page.tsx        # subscriber-only; gate for non-subs
    about/page.tsx
    r/[code]/route.ts       # referral attribution → cookie + redirect
    og/[issue]/route.tsx    # OG image
    api/
      subscribe/route.ts
      referral/route.ts
      poll/route.ts
      cron/send/route.ts    # Vercel Cron, Sat 02:30 UTC = 08:00 IST
  components/
    issue/                  # Masthead, Eyebrow, Hero, TLDR, Foot, ProgressBar
    sections/               # OneThing, SoWhat, BuildNotes, JobSignal,
                            # UnderTheHood, TheRep, Toolbox, RealityCheck,
                            # IndiaSignal, Sponsor, Closer, Referral, Poll
    interactive/            # LensTrackPicker, Fold, Poll, CopyButton,
                            # ShareCard, ReadingProgress
  lib/
    supabase.ts / -server.ts / -admin.ts    (kept)
    anthropic.ts            # generation client
    resend.ts               # send wrapper
    referral.ts             # code mint, count, unlock-tier
    issue-id.ts             # zero-padded slug helpers
    pipeline/
      generate.ts           # 9-section orchestrator
      rubric.ts             # scorer
      human-gate.ts         # holds One Thing draft
  styles/
    tokens.css              # design tokens
    issue.css               # bespoke per-section CSS, ported 1:1 from HTML
emails/
  IssueEmail.tsx            # react-email; table-based; Georgia; inline-styled
supabase/migrations/
db/types/database.ts
content/issues/             # JSON per issue
system/, design/, qa/       # ARIA workflow scaffolding
```

## Design tokens (canonical)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F4F1E8` | paper background |
| `--ink` | `#191712` | warm black text + dark band base |
| `--accent` | `#9C4A2E` | oxblood — eyebrows, accents, section numbers, dot in wordmark |
| `--clay` | `#B5683E` | Skip List stamp + closer punch only |
| `--sand` | `#E3DBC9` | reserved |
| `--faint` | `#ECE7DA` | tinted blocks |
| `--hair` | `#DCD6C8` | hairline dividers |
| `--grey` | `#6F6A60` | meta labels |
| `--dark-band` | `#211E18` | Build Notes background |

Fonts: Fraunces (display/serif), Newsreader (body serif), Archivo + Archivo Narrow + Archivo Expanded (sans/labels), Spline Sans Mono (code). Email: Georgia serif, Arial sans.

## Sections (from HTML — locked)

01 The One Thing (deep) · 02 So What For Me? · **Build Notes** (full-bleed dark band, unnumbered) · 03 Job Signal · 04 Under the Hood (deep) · 05 The Rep (Reader Win embedded as `.result`) · 06 Toolbox · 07 Reality Check (deep) · 08 India Signal · Sponsor · Closer (full-bleed dark band) · Referral (full-bleed dark band) · Poll · Foot.

## ARIA workflow

When non-trivial work begins:
1. Classify task (DECIDED / EXPLORING / BROKEN / STUCK).
2. Write a brief at `/system/briefs/[YYYY-MM-DD]_[task-slug].md`.
3. Delegate to FORGE (`/src/`), SEED (`/db/`, `/supabase/`), or SAGE (`/content/`).
4. After ship: LENS code review (`/qa/`) + VEIL design review (`/design/`) for UI tasks.
5. Update `STATE.md` and `PLAN.md` after each task.

For autonomous Claude Code sessions spawning subagents in parallel: each subagent gets its own scope per `CONTRACT.md` at repo root.

## What NOT to do

- No Inngest. No daily-cadence anything.
- No `<script>` or external images in `emails/IssueEmail.tsx`.
- No Tailwind-ifying the bespoke `styles/issue.css` — port verbatim, scoped under `.issue`.
- No placeholder `#` links or demo URLs in production paths.
- No touching `ai-signal-v2/`.
