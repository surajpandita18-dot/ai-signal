# AI, Basically. — Build Plan

Source: `system/PLAN-aibasically-v1.md` (full Phase 0 audit + decisions).
Design contract: `~/Downloads/ai-basically-FINAL.html`.

## Phases

| # | Phase | Status | Notes |
|---|---|---|---|
| 0 | Audit, decisions, safety tag, branch, demolition | DONE | branch `aibasically`, tag `pre-aibasically-2026-06-12` |
| 1 | Foundation — Design System (A) + Data & Backend (B) | IN_PROGRESS | parallel |
| 2 | Sections (C) + Email Twin (E) + Pipeline scaffold (F) | IN_PROGRESS | C+E spawned with A+B; F deferred |
| 3 | Interactions (D) + Pipeline finish (F) + Cron (F) | PENDING | after C scaffolds |
| 4 | QA + first real issue + Vercel project rename | PENDING | merge to `main` is cutover |

## Phase gates

**Phase 1 done when:** tokens + fonts + layout wired; `app/i/[issue]/page.tsx` renders masthead + hero + TLDR pixel-matched to HTML; DB schema migrated; lib wiring complete; Issue 001 seeded from HTML content. LENS + VEIL pass.

**Phase 2 done when:** all 8 numbered sections + Build Notes + Sponsor + Closer + Referral + Poll + Foot render server-side (no interactivity yet) pixel-matched to HTML at desktop + 390px; email twin renders identical content at 600px + 360px. LENS + VEIL pass.

**Phase 3 done when:** LensTrackPicker, both Folds, Poll roundtrip, all CopyButtons, ShareCard, ReadingProgress work; pipeline produces a valid 9-section issue with the human-gate stop on `one_thing`; cron route returns 200 on a test invocation; test email sends to a single recipient successfully. LENS + VEIL pass.

**Phase 4 done when:** §8 brief checklist all green (visual parity desktop + 390px web, 600px + 360px email; zero JS console errors; email-safe; ≥4.5:1 contrast on body; mobile zero overflow; functional subscribe + referral + archive + cron + pipeline + human-gate; no placeholder URLs). First real send goes out. Vercel project renamed.
