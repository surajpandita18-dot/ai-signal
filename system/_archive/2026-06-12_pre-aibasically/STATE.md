# AI Signal — System State

Updated by ARIA after every routing decision and task completion.

```
current_phase:        Phase 4 — FOMO homepage (v8 design rebuild complete)
status:               READY
active_agents:        none
last_completed_task:  v8 full-page rebuild — 9 new components, foundation tokens, assembly wired
next_task:            Live test with Supabase credentials + npm run dev smoke test
blockers:             Supabase .env.local credentials needed for live testing. 2 postcss CVEs in Next.js 15 — tolerate until v16.
task_counter:         9
last_updated:         2026-04-28
```

## Task log

| # | Task | Agent | Result | Date |
|---|---|---|---|---|
| — | Cleanup: archived old build to archive-v1-old | ARIA | DONE | 2026-04-27 |
| 1 | Phase 1: DB schema, RLS, types, seed data | SEED | DONE | 2026-04-27 |
| 2 | FORGE scaffold: Next.js 15.3.9, Tailwind tokens, base layout, Supabase clients | FORGE | DONE | 2026-04-27 |
| 3 | VEIL: StoryCard component checklist (89 rubric items) | VEIL | DONE | 2026-04-27 |
| 4 | Phase 2+3 early delivery: StoryCard, IssueHeader, LongRead, issue page, homepage | FORGE | DONE | 2026-04-27 |
| 5 | ARIA design audit: 3 StoryCard fixes applied, tsc clean | ARIA | DONE | 2026-04-27 |
| 6 | ORACLE + LENS + VEIL parallel review: Phase 4 audit complete | ORACLE/LENS/VEIL | DONE | 2026-04-27 |
| 7 | FORGE Phase 4 fixes: 11 items — State D, SIGNAL #N, ExpiryBadge hero, subscribe API, about page, type fixes | FORGE | DONE | 2026-04-27 |
| 8 | ARIA audit: design-system.md rewrite (FOMO pivot), ORACLE analysis (5 patterns), missing no_signal migration, stale checklist items | ARIA | DONE | 2026-04-27 |
| 9 | v8 full-page rebuild: 9 components (SiteNav, HeroZone, NotebookFacts, StoryArticle, ReadingSidebar, TheWire, ArchiveSection, SubscribeSection, SiteFooter), HomePageClient, page.tsx assembly. 5 parallel workers. tsc clean. | FORGE×5 | DONE | 2026-04-28 |

## ORACLE proposals (applied)

Applied: `/system/proposals/2026-04-27_oracle-design-improvements.md` → moved conceptually applied
- State D (No Signal Today) — added to page.tsx and signal/[number]/page.tsx
- Signal #N in ExpiryBadge — SIGNAL #N label above hero countdown
- Tomorrow category tease — tomorrowCategory prop on SignalExpired
- /about page — created at src/app/about/page.tsx
- SubscribeInput false confirmation — wired to real /api/subscribe route

## Phase 4 — what shipped in fixes (task 7)

### New files
- `src/lib/utils.ts` — shared `isWithin24h()` utility
- `src/app/about/page.tsx` — static About page
- `src/app/api/subscribe/route.ts` — POST subscribe with Supabase insert, 23505 dedup

### Edited files
- `ExpiryBadge.tsx` — SIGNAL #N label, HH:MM hero (48px), SSR hydration fix, role="status"
- `SignalExpired.tsx` — tomorrowCategory prop, tomorrow copy fix (sans 15px sentence case)
- `SignalGate.tsx` — gate copy: "archive" not "expired"
- `SubscribeInput.tsx` — real fetch + email regex + loading/error states + corrected success copy
- `SiteShell.tsx` — Link from next/link for /about
- `page.tsx` — State D, null guard on published_at, signalNumber to ExpiryBadge, utils import
- `signal/[number]/page.tsx` — same fixes as page.tsx
- `db/types/database.ts` — 'no_signal' added to issues.status union

## Product direction — LOCKED

Daily single signal, 24h expiry. Decided 2026-04-27.

## ARIA fixes (2026-04-27, post-ORACLE analysis)

- `db/migrations/20260427000002_add_no_signal_status.sql` — CHECK constraint fix (was missing; `no_signal` inserts would have failed at runtime)
- `design/design-system.md` — full rewrite for FOMO/daily-signal pivot (ExpiryBadge, SignalExpired, SignalGate, SiteShell documented; financial terminal ref added; stale weekly newsletter language removed)
- `design/component-checklist.md` — stale StoryCard position item removed, no-position note added
- `system/proposals/2026-04-27_oracle_phase4_analysis.md` — 5 patterns, 3 proposals, top priorities identified

## Pending before Phase 4 full close

1. `supabase migration up` or `supabase db reset` to apply migration 002 (`no_signal` CHECK fix)
2. Live test with real Supabase credentials (.env.local)

## Phase 5 — next up

- Subscribe form wired to /api/subscribe ✓ (already shipped in Phase 4 fix)
- Onboarding: single-question role pick (PM / Founder / Builder / Just curious) after email submit
- /archive route: subscriber-only, non-subscriber sees gate
- Streak counter (server-side, subscribed_at calculation)

## ORACLE status

INACTIVE. Activates when task_counter reaches 10. Manual trigger used today.

## Security note

Next.js 15.3.9. 2 residual CVEs inside Next.js bundled postcss — not fixable without v16.
