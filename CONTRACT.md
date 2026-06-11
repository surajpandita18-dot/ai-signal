# Agent Contract — AI, Basically. rebuild

> Read this before writing any code. This is the coordination layer for the 4 parallel agents (A · B · C · E) building Phase 1 + 2 of AI, Basically.

## Single source of design truth

`~/Downloads/ai-basically-FINAL.html` (71KB, 784 lines, dated 2026-06-12). Pixel-perfect contract for layout, typography, colour, sections, and interactions. Inside it:
- The `<template id="issue">` block is the full HTML of one web issue, cloned into desktop + mobile mounts.
- The `<style>` block (~340 lines) is the bespoke CSS.
- The `<script>` block is the interactive JS (lens picker, folds, poll, copy buttons, share card, reading progress).
- The `<div class="email">` block is the email twin.

## Untouchable

- `/Users/surajpandita/ai_signal/ai-signal-v2/` — separate product, separate Vercel project. Never read, never write.

## Shared TypeScript content model

`/Users/surajpandita/ai_signal/src/lib/content-model.ts` is the single shape contract. **All four agents must import from it.** Do not redefine these types locally. If a field is missing, ask first (do not silently add).

## Branch + tag

- Working branch: `aibasically`
- Safety tag: `pre-aibasically-2026-06-12` on commit `0a929a7` (rollback point)
- `main` stays deploying the legacy product to `ai-signal-eta.vercel.app` until cutover.

## Canonical design tokens (already wired in `tailwind.config.ts`)

| Token (Tailwind + CSS var) | Hex | HTML source |
|---|---|---|
| `bg` / `--bg` | `#F4F1E8` | `--bg` |
| `ink` / `--ink` | `#191712` | `--ink` |
| `accent` / `--accent` | `#9C4A2E` | `--kesari` |
| `clay` / `--clay` | `#B5683E` | `--clay` |
| `sand` / `--sand` | `#E3DBC9` | `--sand` |
| `faint` / `--faint` | `#ECE7DA` | `--faint` |
| `hair` / `--hair` | `#DCD6C8` | `--hair` |
| `grey` / `--grey` | `#6F6A60` | `--grey` |
| `dark-band` / `--dark-band` | `#211E18` | `--tech` |

Outer page chrome (around the `viewport`) is `#E9E9E7` — only relevant if reproducing the "design board" frame; production has no chrome.

## Font stack (Google Fonts, loaded via `next/font` in `app/layout.tsx`)

| CSS var | Family | Weights |
|---|---|---|
| `--font-serif` | Fraunces | 400, 500, 600 (incl. italic 400, 500) |
| `--font-read` | Newsreader | 400, 500 (incl. italic 400) |
| `--font-sans` | Archivo | 400, 500, 600, 700 |
| `--font-narrow` | Archivo Narrow | 500, 600 |
| `--font-expanded` | Archivo Expanded | 600, 700, 800 |
| `--font-mono` | Spline Sans Mono | 400, 500, 600 |

Email template uses Georgia (serif) + Arial (sans) — system fonts, no web fonts.

## Canonical class names (port verbatim — do not rename)

The HTML uses these. The React components must render the exact same class names so the bespoke `styles/issue.css` selectors hit:

- Layout: `.grid` (max-width 1000px, padding 30px), `.mast`, `.brand`, `.wordmark`, `.dot`, `.tagline`, `.meta`, `.streak`, `.hero`, `.eyebrow`, `.sub`, `.tldr`, `.t-lab`
- Sections: `.sec`, `.sec.deep`, `.label`, `.n`, `.nm-lab`, `.hint`, `.head`, `.lede`
- Section 01: `.stamp` (with `<b>` for "Skip List" label)
- Section 02: `.rotation-note`, `.lens`, `.lens.primary`, `.who`, `.act`, `.step`
- Build Notes: `.buildnotes`, `.bn-top`, `.bn-top .tag`, `.paper`, `.bn-skim`, `.bn-foldbtn`, `.bn-fold`, `.bn-grid`, `.bn-box`, `.bn-takeaway`, `.bn-metric`, `.bn-link`, `.bn-svg`, `.codeblock`, `.codecopy`
- Section 03: `.jobs`, `.jobrow`, `.what`, `.trend`, `.trend.up`, `.trend.hot`, `.spotlight`, `.sp-h`, `.sp-b`, `.stat`, `.src`, `.sodo`, `.upskill`, `.ladder`, `.rung`, `.rl`, `.ladder-note`, `.interview`, `.iv-q`, `.iv-a`, `.lab`, `.q`, `.tip`
- Section 04: `.hood`, `.hood-svg`, `.foldbtn`, `.deepfold`, `.hood-steps`, `.hstep`, `.hn`, `.souse`
- Section 05: `.repbox`, `.rep-type`, `.rep-tier`, `.rt-lab`, `.done`, `.result`, `.steps`
- Section 06: `.toolbox`, `.tool`, `.try`
- Section 07: `.reality`, `.rc-top`, `.harm-tag`, `.harm-rot`, `.honest`
- Section 08: `.signal2`, `.sig`, `.sig-top`, `.sig-cat`, `.sig-tag`, `.sig-tag.hot`, `.sig-you`, `.signal-foot`
- Sponsor: `.sponsor`, `.sponsor-box`, `.sp-tag`, `.sp-copy`, `.sp-cta`
- Closer: `.closer-band`, `.cc-stack`, `.cc-item`, `.cc-tag`, `.cc-single`, `.joke`, `.joke2`, `.punch`, `.share-card`
- Referral: `.referral`, `.ref-head`, `.ref-sub`, `.ref-ladder`, `.ref-rung`, `.ref-n`, `.ref-actions`, `.ref-copy`, `.ref-count`
- Poll + Foot: `.poll`, `.opts`, `.opt`, `.foot`
- Progress: `.progress` (fixed top, 3px, --accent fill)
- Copy interaction: `.copyable`, `.copyable.copied`
- Reduced-motion: respect `prefers-reduced-motion`

## File ownership (no overlap)

### Agent A — Design System Foundation
- `src/styles/tokens.css`
- `src/styles/issue.css` (VERBATIM port of the HTML's `<style>` block, scoped under `.issue { … }`, MINUS the chrome rules: `.board-head`, `.frame`, `.frame-label`, `.viewport`, `.vp-mobile`, `.vp-email`)
- `src/app/layout.tsx` (fonts via `next/font/google` → CSS vars; import tokens.css + issue.css + globals.css)
- `src/app/globals.css` (Tailwind directives + body chrome only)
- `src/app/page.tsx` (landing — brand + tagline + sub + subscribe input + 4 value props)
- `src/app/about/page.tsx` (simple about page — voice in CLAUDE.md)

### Agent B — Data & Backend
- `supabase/migrations/20260612000000_initial_aibasically.sql` (drop legacy tables + create new schema per `system/PLAN-aibasically-v1.md` §4)
- `db/types/database.ts` (TS types matching the schema)
- `src/lib/anthropic.ts`, `src/lib/resend.ts`, `src/lib/referral.ts`, `src/lib/issue-id.ts`
- `src/app/api/subscribe/route.ts` (POST {email, role?, source?})
- `src/app/api/referral/route.ts` (GET ?code= → count; POST {email, action:'unlock_check'})
- `src/app/api/poll/route.ts` (POST {issue_id, choice, email?})
- `src/app/r/[code]/route.ts` (GET → set cookie, 302 to /)
- `content/issues/001.json` (Issue 001 content extracted faithfully from the HTML, conforming to `IssueContent`)
- `db/seed.sql` (insert Issue 001 from 001.json)

### Agent C — Issue Page & Sections
- `src/components/issue/Masthead.tsx`, `Hero.tsx`, `SectionLabel.tsx`, `Section.tsx`, `Foot.tsx`, `ReadingProgress.tsx`
- `src/components/sections/OneThing.tsx`, `SoWhat.tsx`, `BuildNotes.tsx`, `JobSignal.tsx`, `UnderTheHood.tsx`, `TheRep.tsx`, `Toolbox.tsx`, `RealityCheck.tsx`, `IndiaSignal.tsx`, `Sponsor.tsx`, `Closer.tsx`, `Referral.tsx`, `Poll.tsx`
- `src/app/i/[issue]/page.tsx` (server component: fetch issue by slug → render all sections inside `<div className="issue">…<div className="grid">…`)
- `src/app/i/[issue]/not-found.tsx`
- `src/app/archive/page.tsx` (subscriber gate UI; calls `/api/referral` for unlock check)

### Agent E — Email Twin
- `emails/IssueEmail.tsx` (react-email; table-based; Georgia/Arial; inline styles; no `<script>`, no external images; no Tailwind)
- Renders the same `IssueContent` shape as the web. Match the `<div class="email">` block from the HTML verbatim in structure + inline styles.

## Cross-agent rules

- Import shared types from `@/lib/content-model` only. Do not redefine.
- Class names must be **verbatim** from the HTML. No CSS modules, no renaming.
- If a component needs interactivity (folds, picker, poll, copy, share, progress) — Agent C scaffolds the server-rendered markup with the right class names + ARIA attributes; Agent D (Phase 3) will add the `'use client'` wrappers later. Do not block on D.
- TypeScript strict. `npx tsc --noEmit` must pass before reporting done.
- No `any`, no unsafe casts, no placeholder URLs (`#` is OK only where the HTML uses `#` as a known stub — keep the stub, mark with `/* TODO real-url */` comment so we can grep later).
- Server components by default. `'use client'` only when the component itself owns interactivity.

## Reporting back

Each agent ends with a short summary:
1. Files written (paths only).
2. Any deviation from the brief + why.
3. `npx tsc --noEmit` result (pass / error count).
4. Anything ARIA must do for integration.
