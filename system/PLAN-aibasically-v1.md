# AI, Basically. — Phase 0 Plan & Audit

**Owner:** Suraj · **Drafted by:** ARIA · **Date:** 2026-06-12
**Status:** AWAITING APPROVAL — no implementation code written yet.
**Design contract:** `~/Downloads/ai-basically-FINAL.html` (71KB, 784 lines, read in full)
**Source repo (to be transformed):** `/Users/surajpandita/ai_signal/`
**Untouchable sibling:** `/Users/surajpandita/ai_signal/ai-signal-v2/`

---

## 1. Repo audit (what's actually in the old AI Signal)

### Stack
- Next.js **15.3.9** (App Router) · React 18 · TS strict · Tailwind 3.4
- Supabase (`@supabase/ssr` + `supabase-js`)
- Anthropic SDK (`@anthropic-ai/sdk` 0.91)
- Resend 6.12
- **Inngest 4.2** (the pain point — daily-signal cron triggers a multi-step Inngest function for generation)
- Playwright (devDep)
- Deploy: Vercel, cron at `44 0 * * *` UTC → `/api/cron/daily-signal`

### Surfaces (`src/app/`)
- `/` (page.tsx, HomePageClient) — daily signal hero, expiry countdown, three states
- `/signal/[number]` — individual signal by sequential number + not-found
- `/issue/[slug]` — legacy issue route (older daily/weekly model)
- `/archive`, `/about`, `/feedback`, `/sponsor`
- `/goto/[number]` (redirect helper), `/pay` route
- `/og/[number]`, `/og/default` — OG image generation
- `/api/subscribe`, `/api/feedback`, `/api/journalist-review`, `/api/inngest`
- `/api/cron/daily-signal`, `/api/cron/content-evolution`, `/api/cron/formula-evolution`

### Components (40+ in `src/components/`)
Tied to the daily-signal FOMO product: ExpiryBadge, SignalGate, SignalExpired, SignalPageClient, HeroBroadcast, HeroBridge, HeroPreviewStrip, HeroTickers, HeroZone, NotebookFacts, NotebookStrip, StoryCard, StoryArticle, LongRead, IssueHeader, ReadingSidebar, ReadingStreak, RoleLenses, TrackRecord, SubscribeInput, SubscribeSection, SiteNav, SiteFooter, SidebarScoreCard, SidebarProbablyCard, TheWire, ArchiveSection, CascadeTimeline, ChaiButton, CounterView, DecisionAid, EditorialQuote, FeedbackForm, HomePageClient, InlineChaiStrip, InsightsStrip, PMAngle, PrimaryChart, QuirkyFactBanner, ReactionsPanel, BuilderCard, StakeholdersGrid.

### `src/lib/` (8 files)
`supabase.ts`, `supabase-server.ts`, `supabase-admin.ts` (well-wired SSR pattern, **keep**), `fonts.ts`, `utils.ts`, `ai-facts.ts`, `article-validator.ts`, `email-templates.ts`, `prompts.ts`, `journalist-agent.ts`, `editor-agent.ts`, `word-count-validator.ts`, `types/extended-data.ts`. Most of these encode the **daily** editorial model and are dead weight under the new brief.

### `src/inngest/`
`client.ts`, `generate-signal.ts`, `fact-check.ts`. Per §1.6 hard rule → **delete**, replaced by a single Vercel Cron route.

### `db/`
13 migrations (`20260427000000_initial_schema.sql` through `20260528000001_add_feedback_table.sql`) — wholesale rewrite for the new schema. `seed.sql` + `types/database.ts` regenerated. `CLAUDE.md` for SEED specialist exists.

### `system/`, `design/`, `qa/`, `content/`, `scripts/`
ARIA-workflow scaffolding (briefs/, proposals/, reviews/, postmortems/, CLAUDE.md files per specialist). **Keep the scaffolding**, archive the old briefs.

### Env vars in `.env.local` (already provisioned)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_HOST`, plus legacy Inngest/Gemini/NextAuth/GitHub OAuth keys (to remove).

---

## 2. Keep / Remove / Replace table

| Area | Action | Notes |
|---|---|---|
| Next.js 15 + Tailwind + TS scaffold + Vercel deploy + `next.config.mjs` security headers | **Keep** | Working, current. |
| `src/lib/supabase*.ts` (3 clients) | **Keep** | Solid SSR pattern. |
| `src/lib/utils.ts` (`isWithin24h` only) | **Replace** | Daily-specific. Replace with weekly helpers. |
| Anthropic SDK wiring (in `journalist-agent.ts` etc.) | **Keep concept, rewrite** | API client carries over; persona/lead-style axes get reset to the 9-section content model. |
| Resend integration + `email-templates.ts` | **Keep wiring, replace template** | Template is daily-signal-shaped. Replace with `emails/IssueEmail.tsx` via react-email. |
| `/api/subscribe` route | **Keep + extend** | Add role pick (Builder / Product-Biz / Secure Pro / Switcher) + referral attribution hook. |
| `/api/feedback`, `/api/journalist-review` | **Remove** | Out of new scope. |
| `/api/inngest` + all of `src/inngest/` | **Remove** | Per §1.6: no Inngest. Replace with single Vercel Cron route. |
| `/api/cron/daily-signal`, `content-evolution`, `formula-evolution` | **Remove** | Replace with one `/api/cron/send/route.ts` (weekly Sat 08:00 IST). |
| `/og/[number]`, `/og/default` | **Keep + retarget** | Reuse OG generation, retarget to `/i/[issue]`. |
| All daily-signal components (ExpiryBadge, SignalGate, SignalExpired, HeroBroadcast, HeroBridge, HeroTickers, HeroZone, StoryCard, StoryArticle, IssueHeader, NotebookFacts, NotebookStrip, ReadingStreak, ReadingSidebar, RoleLenses, TheWire, TrackRecord, etc.) | **Remove** | Different product. Archive on a tag before delete. |
| `SiteFooter`, `SiteNav`, `SubscribeInput`, `SubscribeSection`, `ArchiveSection`, `HomePageClient` | **Remove + rewrite** | Re-shaped under new component tree. |
| `/about`, `/feedback`, `/sponsor`, `/pay`, `/issue/[slug]`, `/signal/[number]` | **Remove** | New routes per §4. |
| 13 DB migrations + `db/types/database.ts` | **Remove + rewrite** | New schema in §4 below. |
| `db/seed.sql` | **Remove + rewrite** | Seed one Issue 001 from the HTML's example content for visual parity testing. |
| `db/CLAUDE.md`, `system/CLAUDE.md`, `qa/CLAUDE.md`, `design/CLAUDE.md`, `content/CLAUDE.md`, root `CLAUDE.md` | **Keep + amend** | Specialist briefs stay. Update CLAUDE.md files to bake in §6 voice + rubric. |
| Old `system/briefs/`, `system/proposals/`, `qa/reviews/`, `design/reviews/`, `system/postmortems/` | **Archive** | Move under `system/_archive/2026-06-12_pre-aibasically/`. |
| Old `STATE.md`, `PLAN.md`, `PRD.md`, `PRODUCT.md` | **Archive + replace** | New PRD.md / PLAN.md / STATE.md anchored to AI, Basically. |
| `scripts/run-wc-validation.ts`, `scripts/test-fact-check.ts`, `scripts/audit-articles.ts` | **Remove** | Daily-pipeline tooling. |
| `package.json` deps: `inngest` | **Remove** | |
| Env vars: Inngest, Gemini, NextAuth, GitHub OAuth | **Remove** | Trim `.env.local` to the new minimum. |
| `vercel.json` cron entry | **Replace** | New entry: `0 2 * * 6` UTC (= Sat 07:30 IST) — see §7. |
| `ai-signal-v2/` | **DO NOT TOUCH** | Per hard rule §1. |

---

## 3. Target architecture (final file tree)

The repo stays at `/Users/surajpandita/ai_signal/` (decision pending — see §8). Skeleton:

```
ai_signal/  (new product: AI, Basically.)
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                     # landing + subscribe (latest issue hero)
│  ├─ i/[issue]/
│  │  ├─ page.tsx                  # web issue renderer (interactive)
│  │  └─ not-found.tsx
│  ├─ archive/page.tsx             # subscriber-only; non-sub sees gate; referral unlock at 1
│  ├─ about/page.tsx
│  ├─ r/[code]/route.ts            # referral attribution redirect → cookie + 302 to /
│  ├─ og/[issue]/route.tsx         # OG image (port + retarget)
│  └─ api/
│     ├─ subscribe/route.ts        # email + role + (optional) ref code
│     ├─ referral/route.ts         # GET counts; POST unlock check (used by archive gate)
│     ├─ poll/route.ts             # 1-tap weekly poll (rate-limited by email or IP)
│     └─ cron/send/route.ts        # Vercel Cron, single Node serverless route
├─ components/
│  ├─ issue/                       # Masthead, Eyebrow, Hero, TLDR, Foot, ProgressBar, Mast meta
│  ├─ sections/
│  │  ├─ OneThing.tsx              # 01 — deep, .stamp (Skip List)
│  │  ├─ SoWhat.tsx                # 02 — 4 lenses + rotation-note + TrackPicker (client)
│  │  ├─ BuildNotes.tsx            # full-bleed dark band — server scaffold + Fold client
│  │  ├─ JobSignal.tsx             # 03 — jobrows + Spotlight + Upskill + Interview (copyable)
│  │  ├─ UnderTheHood.tsx          # 04 — deep, SVG + Fold for 3 steps
│  │  ├─ TheRep.tsx                # 05 — Lite/Full tiers + Done + ReaderWin (.result)
│  │  ├─ Toolbox.tsx               # 06 — see §8 open decision (keep or drop)
│  │  ├─ RealityCheck.tsx          # 07 — deep, harm-rotation
│  │  ├─ IndiaSignal.tsx           # 08 — 3 sig cards (cat · status · why-you-care)
│  │  ├─ Sponsor.tsx               # one clean Presented-by unit
│  │  ├─ Closer.tsx                # full-bleed dark band — joke + ShareCard
│  │  └─ Referral.tsx              # full-bleed dark band — 3-rung ladder + invite copy + counter
│  └─ interactive/
│     ├─ LensTrackPicker.tsx
│     ├─ Fold.tsx                  # used by Under the Hood + Build Notes
│     ├─ Poll.tsx
│     ├─ CopyButton.tsx
│     ├─ ShareCard.tsx
│     └─ ReadingProgress.tsx
├─ emails/
│  └─ IssueEmail.tsx               # react-email; table-based; Georgia; inline-styled; no JS/images
├─ lib/
│  ├─ supabase.ts / -server.ts / -admin.ts   # kept
│  ├─ anthropic.ts                 # rewritten — 9-section generation
│  ├─ resend.ts                    # send wrapper
│  ├─ referral.ts                  # code mint, count, unlock-tier resolver
│  ├─ issue-id.ts                  # issue identifier helpers (zero-padded 3-digit; e.g. "001")
│  └─ pipeline/
│     ├─ generate.ts               # 9-section generation orchestrator
│     ├─ rubric.ts                 # §6 ship-gate scorer (1–5 across 6 axes)
│     └─ human-gate.ts             # holds "The One Thing" first-draft for editor
├─ content/
│  └─ issues/
│     └─ 001.json                  # the model — one record per issue (also written into DB)
├─ styles/
│  ├─ tokens.css                   # design tokens from §3 of the brief (and the HTML)
│  └─ issue.css                    # the bespoke per-section CSS, ported 1:1 from the HTML
├─ supabase/migrations/
│  └─ 20260612000000_initial_aibasically.sql
├─ db/types/database.ts            # generated from the new schema
├─ system/, design/, qa/           # ARIA scaffolding kept; old briefs archived
├─ CLAUDE.md                       # rewritten — build standard + voice + rubric
├─ PRD.md / PLAN.md / STATE.md     # rewritten for the new product
├─ tailwind.config.ts              # extended with the new tokens
├─ vercel.json                     # cron entry only — Sat 02:00 UTC
└─ package.json                    # inngest removed; react-email added
```

**Stack:** Next.js 15 App Router · TS strict · Tailwind 3.4 · Supabase · Resend + react-email · Anthropic SDK · Vercel + Vercel Cron. No new heavy deps beyond `react-email` + its peers.

---

## 4. Data schema (Supabase, column-level)

Minimal v1. RLS on. Service-role for cron + admin only.

```sql
-- ── issues ──────────────────────────────────────────────────────────────
create table issues (
  id                uuid primary key default gen_random_uuid(),
  issue_number      int unique not null,                       -- 1, 2, 3 …
  slug              text unique not null,                      -- "001", "002" (zero-padded for URLs)
  published_at      timestamptz,                               -- null until live
  status            text not null default 'draft'              -- 'draft' | 'review' | 'published'
                    check (status in ('draft','review','published')),
  -- masthead
  hero_eyebrow      text not null,
  hero_headline_html text not null,                            -- supports the <em> oxblood accent
  hero_sub          text not null,
  -- TLDR (4 rows × {label, body})
  tldr              jsonb not null default '[]',
  -- 9 sections — each is a typed object; see content_model.ts
  one_thing         jsonb not null,                            -- {head, lede, skip_list:{title,body}}
  so_what           jsonb not null,                            -- {primary_lens, deep_lens_note, lenses:[…4]}
  build_notes       jsonb not null,                            -- {paper_ref, skim, struggle, finding, takeaway_metric, takeaway_code, code_lang, paper_link, eval_link, diagram_svg}
  job_signal        jsonb not null,                            -- {rows:[…], spotlight:{stat,sub,src,sodo_search,sodo_companies}, upskill:{rungs[3], note}, interview:{q, steps[4], tip}}
  under_the_hood    jsonb not null,                            -- {question, analogy_svg, steps[3], source}
  the_rep           jsonb not null,                            -- {type:'audit|build|compare|break', lite, full, done, reader_win:{quote, by}}
  toolbox           jsonb,                                     -- nullable if we drop Toolbox (§8)
  reality_check     jsonb not null,                            -- {harm_tag, h3, body, honest, src}
  india_signal      jsonb not null,                            -- {cards:[…3]}  card={cat, place, status, h4, body, why_you}
  sponsor           jsonb,                                     -- {brand, copy, cta_url} | null when unsold
  closer            jsonb not null,                            -- {format:'dark-joke|absurd-true|provocation', text_html}
  -- meta
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── subscribers ────────────────────────────────────────────────────────
create table subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  role                text                                     -- 'builder'|'product_biz'|'secure_pro'|'switcher'|null (curious)
                      check (role is null or role in ('builder','product_biz','secure_pro','switcher')),
  status              text not null default 'active'
                      check (status in ('active','unsubscribed','bounced')),
  referral_code       text unique not null
                      default substr(encode(gen_random_bytes(6),'base64'),1,8),
  unsubscribe_token   text unique not null
                      default encode(gen_random_bytes(32),'hex'),
  source              text,                                    -- 'organic'|'r/<code>'|'about'|...
  subscribed_at       timestamptz not null default now()
);

-- ── referrals ──────────────────────────────────────────────────────────
create table referrals (
  id                uuid primary key default gen_random_uuid(),
  referrer_id       uuid not null references subscribers(id) on delete cascade,
  referred_id       uuid not null references subscribers(id) on delete cascade,
  created_at        timestamptz not null default now(),
  unique (referrer_id, referred_id)
);
-- materialized view or simple count() join for referral count + tier resolution.

-- ── lens_prefs (optional — defaults derive from subscribers.role) ──────
create table lens_prefs (
  subscriber_id     uuid primary key references subscribers(id) on delete cascade,
  primary_track     text not null check (primary_track in ('builder','product_biz','secure_pro','switcher')),
  updated_at        timestamptz not null default now()
);

-- ── poll_responses ─────────────────────────────────────────────────────
create table poll_responses (
  id                uuid primary key default gen_random_uuid(),
  issue_id          uuid not null references issues(id) on delete cascade,
  subscriber_id     uuid references subscribers(id) on delete set null,
  choice            text not null,                             -- the chip text
  ip_hash           text,                                      -- for anon dedup
  created_at        timestamptz not null default now()
);
create unique index poll_one_per_subscriber on poll_responses(issue_id, subscriber_id) where subscriber_id is not null;
```

**Indexes:** `issues(status, published_at desc)`, `issues(slug)`, `referrals(referrer_id)`, `subscribers(referral_code)`.
**RLS:** public read on `issues where status='published'`. All writes via service-role from the API routes only. Subscribers can self-read by `email` token (deferred — not needed for MVP).

---

## 5. Design-port plan (zero visual drift)

The HTML is **~340 lines of bespoke CSS** + a single `<template id="issue">` cloned into desktop and mobile mounts, plus interactive JS. The right way to port is **CSS-first, not Tailwind-first** — the typography system is too custom for Tailwind to express elegantly. Tailwind handles layout primitives + utility classes; the bespoke `.sec`, `.lens`, `.buildnotes`, `.hood`, `.referral`, `.closer-band`, etc. come over as **raw CSS in `styles/issue.css`**, scoped under a top-level `.issue` class.

**Port pipeline:**
1. Extract the `:root` token block → `styles/tokens.css`, renaming `--kesari → --accent` and `--tech → --dark-band` to match the brief's vocabulary; keep aliases for the rest. Wire these into `tailwind.config.ts` `theme.extend.colors` so Tailwind utilities can reference them too.
2. Copy the **entire** `<style>` block (minus the chrome `.board-head`, `.frame`, `.vp-mobile`, `.viewport`) into `styles/issue.css`, **verbatim**, scoped under `.issue { … }`. This is the pixel-perfect baseline.
3. Load both Google Fonts links (Fraunces / Newsreader / Archivo family / Spline Sans Mono) via `next/font/google` in `app/layout.tsx`. CSS variable bindings: `--font-serif`, `--font-read`, `--font-sans`, `--font-mono`.
4. Walk the `<template>` top-down, converting each `<div class="…">` into a React component in `components/sections/` (or `components/issue/`). Each component takes typed props sourced from the JSONB columns above. **No re-styling** — just JSX around the existing class names.
5. Interactions (LensTrackPicker, Fold, Poll, CopyButton, ShareCard, ReadingProgress) are ported 1:1 from the inline `<script>` block as React client components. Each carries the same DOM mutations behind a `useEffect`/event handlers + respects `prefers-reduced-motion`.
6. **Side-by-side parity test** during port: open the HTML in one tab, `next dev` in another, both at 1440px desktop + 390px iPhone DevTools. Drift > 2px on any element = stop and fix.
7. **Email twin** (`emails/IssueEmail.tsx`) is a parallel port — same content tree, completely different CSS surface (Georgia/Helvetica, table layout, inline styles only). The HTML already includes the email design — port that block verbatim into react-email components.

**Token canonical list (final names → HTML source):**

| Token | Hex | Source name in HTML | Usage |
|---|---|---|---|
| `--bg` | `#F4F1E8` | `--bg` | paper background |
| `--ink` | `#191712` | `--ink` | warm black text + dark band base |
| `--accent` | `#9C4A2E` | `--kesari` | oxblood — eyebrows, accents, section numbers, dot in wordmark |
| `--clay` | `#B5683E` | `--clay` | Skip List stamp + closer punch only |
| `--sand` | `#E3DBC9` | `--sand` | reserved |
| `--faint` | `#ECE7DA` | `--faint` | tinted blocks (stamp, sponsor box, rotation note, etc.) |
| `--hair` | `#DCD6C8` | `--hair` | hairline dividers |
| `--grey` | `#6F6A60` | `--grey` | meta labels |
| `--dark-band` | `#211E18` | `--tech` | Build Notes background |
| body chrome | `#E9E9E7` | (inline) | outer page chrome |

---

## 6. Agent assignment (mapped to existing specialists)

The brief lists Agents A–F. Mapping to ARIA's specialist set (FORGE / SEED / SAGE / LENS / VEIL):

| Brief agent | Maps to | Lives in | Depends on |
|---|---|---|---|
| **A — Design System** | FORGE | `styles/`, `tailwind.config.ts`, `app/layout.tsx`, `components/issue/*` | none (foundation) |
| **B — Data & Backend** | SEED (schema) + FORGE (`lib/`, API routes) | `supabase/migrations/`, `db/types/`, `lib/supabase*.ts`, `lib/anthropic.ts`, `lib/resend.ts`, `app/api/subscribe`, `app/api/referral` | none (foundation) |
| **C — Web Section Components** | FORGE | `components/sections/*` | A |
| **D — Interactions** | FORGE | `components/interactive/*` | C (needs DOM targets) |
| **E — Email Twin** | FORGE | `emails/IssueEmail.tsx` | A (tokens) |
| **F — Content Pipeline** | SAGE (prompts, content model) + FORGE (cron route) | `lib/pipeline/*`, `app/api/cron/send/route.ts`, `lib/anthropic.ts` (prompts) | B (schema), A (token names appear in OG copy only) |

**Reviewers (after every workstream):** LENS (code review) + VEIL (design review for A, C, D, E).
**Integration owner (ARIA main thread):** wire components into `app/i/[issue]/page.tsx`, run cleanup of old AI Signal per §2, run QA (§8 of the brief).

**Parallelisation graph:**
```
Phase 1 (foundation):     [ A ]    [ B ]                ← parallel
Phase 2 (sections+email): [ C ]    [ E ]    [ F ]       ← parallel after A/B
Phase 3 (polish):         [ D ]    [ F finish ]         ← parallel after C
Phase 4 (cleanup + QA):   [ ARIA ]                      ← single thread
```

---

## 7. Phased timeline

**Phase 1 — Foundation (parallel: A + B)**
- A: tokens → `styles/tokens.css`; port `<style>` block → `styles/issue.css`; wire Google Fonts via `next/font`; `tailwind.config.ts` extend; build shared issue primitives (Masthead, Eyebrow, Hero, TLDR, ProgressBar). Output: `app/i/[issue]/page.tsx` renders a hard-coded "Issue 001" using the seeded JSON and **visually matches the HTML head + hero + TLDR**.
- B: drop old `db/migrations/`, write `20260612000000_initial_aibasically.sql`; regenerate `db/types/database.ts`; keep `supabase.ts` / `-server.ts` / `-admin.ts`; write `lib/anthropic.ts`, `lib/resend.ts`, `lib/referral.ts`, `lib/issue-id.ts`; ship `/api/subscribe` (email + role + ref code), `/api/referral` (count + unlock check); seed Issue 001 from the HTML content into the DB.
- **Phase 1 gate:** LENS + VEIL pass; `next dev` renders Issue 001 head, hero, TLDR pixel-matched to the HTML.

**Phase 2 — Sections + Email + Pipeline scaffold (parallel: C + E + F-scaffold)**
- C: build all 8 (or 9 — see §8) numbered sections + Sponsor + Closer + Referral + Poll + Foot as server components, ported 1:1 from the template. No interactivity yet (server snapshots).
- E: `emails/IssueEmail.tsx` — port the email twin verbatim into react-email; render-test at 600px (Gmail web), 360px (mobile). Confirm: no `<script>`, no external images, all inline.
- F-scaffold: content model TS types + JSON schema for an issue; rubric scorer stub; human-gate stub (a no-op marker on `one_thing`).
- **Phase 2 gate:** full web issue renders end-to-end (all sections, both viewports). Email twin renders identical content at 600/360px. LENS + VEIL pass.

**Phase 3 — Interactions + Pipeline + Cron (parallel: D + F-finish)**
- D: LensTrackPicker, Fold (Under the Hood + Build Notes), Poll (+ `/api/poll`), CopyButton (Interview, Build Notes code, Share card, Invite link), ShareCard, ReadingProgress. All gated on `prefers-reduced-motion`.
- F-finish: `lib/pipeline/generate.ts` — Anthropic prompts for sections 02–08 + sponsor (paid? skip generation; mark slot); human-gate on 01 (compose-tool route or CLI for Suraj to write/paste); rubric run; `/api/cron/send/route.ts` runs weekly Sat 02:00 UTC (= 07:30 IST), reads the latest `status='published'` issue, sends to active subscribers via Resend.
- **Phase 3 gate:** every interaction works (lens dim, both folds, poll roundtrip, all copy buttons). Cron route returns 200 on a test invocation; sends a single test email successfully. LENS + VEIL pass.

**Phase 4 — Cleanup + QA + first real issue (single thread, ARIA)**
- Remove archived old AI Signal code per §2.
- Archive old briefs/proposals/reviews under `system/_archive/2026-06-12_pre-aibasically/`.
- Migrate or wipe subscribers per §8 decision.
- Run §8 QA checklist of the brief end-to-end.
- Suraj writes Issue 001's "One Thing" longhand; pipeline drafts 02–08; Suraj edits + publishes; Saturday cron sends.
- **Phase 4 gate:** §8 brief checklist all green. First real send goes out.

---

## 8. Open decisions (need your answer before Phase 1 starts)

> **A) cadence.** Brief confirms weekly Sat 08:00 IST. Old product was daily 09:00 IST. Plan assumes the switch. **Confirm.**

> **B) domain.** HTML embeds `aibasically.co` (header link, referral URL). Two options:
>   (1) Buy `aibasically.co`, point Vercel project at new domain, keep current domain redirecting.
>   (2) Rebrand the existing domain in-place (Vercel project name stays).
> **Recommend (1)** — clean brand reset matters more than SEO continuity for a 5-figure-subscriber-or-less list. Tell me which.

> **C) subscribers.** Old AI Signal subscribers signed up for *daily*. New product is *weekly + different voice*. Three options:
>   (1) **Migrate all, single intro email** acknowledging the change. Fast list build, some unsubscribes guaranteed.
>   (2) **Start clean** — old list dormant, send one farewell email pointing to new signup.
>   (3) **Opt-in migration** — email old list once, only re-subscribe those who reply/click.
> **Recommend (3)** — keeps consent honest, list quality stays high, no spam-complaint risk. Tell me.

> **D) repo strategy.** Three options:
>   (1) **Transform in place** at `/Users/surajpandita/ai_signal/` — keep git history, tag `pre-aibasically-2026-06-12` before nuking, then rewrite.
>   (2) **New folder** `/Users/surajpandita/ai_basically/` — clean git init, old repo untouched as reference.
>   (3) **New branch** `aibasically` on the existing repo — leave `main` alive until cutover.
> **Recommend (1) with the safety tag** — saves you maintaining two trees, preserves history for archaeology, and the tag is the rollback. Tell me.

> **E) section list discrepancy.** Brief §3 lists 9 sections including "Reader Win" as a standalone section. **The HTML doesn't.** In the HTML, the numbered sections are:
>   01 One Thing · 02 So What For Me? · (Build Notes — unnumbered dark band) · 03 Job Signal · 04 Under the Hood · 05 The Rep · **06 Toolbox** · 07 Reality Check · 08 India Signal.
> "Reader Win" is **embedded inside The Rep** as the `.result` block (Priya's quote). "Toolbox" exists as section 06 but is **not in the brief's 9-section list**.
> Brief §1.2 says the HTML is the design contract. So plan defaults to: **8 numbered sections + Build Notes band + Reader Win inside The Rep + Toolbox kept**. Confirm or override.

> **F) issue identifier format.** HTML uses `№ 001` in masthead and `aibasically.co/i/001` in the email mast. Plan assumes `slug = zero-padded 3-digit issue number` ("001", "002", …). Confirm.

> **G) Supabase project.** Same project (new schema, drop old tables in one migration), or a fresh project? **Recommend same** — env vars already wired; one migration handles the drop. Tell me.

> **H) Resend audience.** New audience ID? Fresh sender domain (`hello@aibasically.co`)? **Recommend** new audience + new sender, keeps deliverability clean while the rebrand bakes.

> **I) `ai-signal-v2/` sibling.** Confirmed untouched. Just verifying: is this a separate active project, or an old experiment I should leave alone forever? Plan assumes **leave alone forever**.

> **J) design file confirmation.** `~/Downloads/ai-basically-FINAL.html`, 71KB, 784 lines, dated 2026-06-12 — that's the file. Confirm this is the version to lock against (not an older draft sitting somewhere else).

---

## 9. Risks I'm flagging once (not asking permission)

1. **Pixel parity on the bespoke CSS is the single biggest correctness risk.** Mitigation in §5: port the `<style>` block verbatim, scoped, and walk diffs visually. Don't Tailwind-ify it.
2. **Email-twin parity is the second biggest.** Email clients ignore web fonts and external CSS. Mitigation: render the HTML's email block in react-email at exact pixel widths and diff before merge. Litmus/Email-on-Acid is overkill for v1 — Gmail web + Apple Mail + iOS Mail covers ~85% of opens.
3. **Sat 08:00 IST cron == Sat 02:30 UTC.** Vercel Cron expressions are UTC. The plan schedules `30 2 * * 6` UTC and the route resolves "this Saturday's issue" by `status='published' AND published_at <= now()` — never trust the cron clock alone.
4. **Anthropic pipeline writes 7+ sections; the rubric needs to fail noisily**, not silently degrade. Mitigation: rubric.ts returns per-axis scores; any axis < 3 blocks publish and surfaces the gap in the human-gate UI.
5. **Inngest removal must be clean.** Mitigation: delete `src/inngest/`, `package.json` dep, `/api/inngest/route.ts`, and the env vars in a single commit; the cron route is the only background path.
6. **Referral counter race conditions** when two subs join via the same code in the same second. Mitigation: count via `select count(*)` at read time; do not denormalize until volume justifies it.

---

## 10. What I need from you to start Phase 1

Answer **A–J in §8**. Once those are settled, Phase 1 begins with two briefs spawned in parallel (`A → FORGE` in one terminal, `B → SEED` in another), per your existing ARIA workflow.

**Plan ready. Approve to start Phase 1?**
