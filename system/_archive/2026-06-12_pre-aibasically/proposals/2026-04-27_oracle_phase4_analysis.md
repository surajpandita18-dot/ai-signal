# ORACLE Analysis — Phase 4 Post-Mortem + Patterns

**Date:** 2026-04-27
**Triggered by:** User request (manual activation, task_counter = 6, threshold = 10)
**Scope:** Phases 1–4 across all agents

---

## Pattern 1 — FORGE consistently ships beyond brief scope

**Observed across:** Task 4 (Phase 2+3 early delivery), Task 6 (Phase 4)

**Evidence:**
- Phase 4 brief specified: SiteShell, ExpiryBadge, SignalExpired, SignalGate, SubscribeInput, homepage 3 states
- FORGE delivered additionally: `/api/subscribe/route.ts` (Phase 5 work), OG metadata on all pages, `src/lib/utils.ts`, `db/types/database.ts` updated with `no_signal`, `db/migrations/20260427000001_add_pull_quote.sql` (unspecified)

**Risk:** Pull_quote column added to stories with no brief, no PRD entry, no LENS review. Unknown if it'll be used or just accumulate as dead schema. The `no_signal` DB type update shipped without a corresponding SQL migration for the CHECK constraint — would cause runtime constraint violations in Supabase.

**Proposed change target:** [ARIA CLAUDE.md] — Add to brief template:
> "FORGE tends to ship Phase N+1 features alongside Phase N. If you receive an implementation that includes unrequested files or API routes, note them in the FOLLOWUP_BRIEF as 'FORGE pre-shipped' and route for LENS review before marking the phase complete."

**Confidence:** HIGH

---

## Pattern 2 — DB types updated without migration files

**Observed across:** Tasks 4, 6

**Evidence:**
- `db/types/database.ts` line 21: `status: 'draft' | 'published' | 'no_signal'` — type updated
- `db/migrations/` — no migration adding `no_signal` to the CHECK constraint until ARIA manually wrote `20260427000002_add_no_signal_status.sql`
- `db/types/database.ts` line 64: `pull_quote: string | null` — type updated
- `db/migrations/20260427000001_add_pull_quote.sql` — migration exists for pull_quote (correctly written this time)

**Risk:** A type that doesn't match the DB constraint causes silent failures at runtime. The `no_signal` insert would hit `ERROR: new row for relation "issues" violates check constraint "issues_status_check"` with no TypeScript warning because the type was already updated.

**Proposed change target:** [SEED CLAUDE.md] — Add rule:
> "Whenever FORGE updates db/types/database.ts, check that a corresponding migration file exists for any schema change. If not, write the migration. TypeScript types and DB constraints must always be in sync."

**Confidence:** HIGH

---

## Pattern 3 — ExpiryBadge design diverged between ARIA spec and FORGE build

**Observed:** Task 6 (Phase 4)

**Evidence:**
- ARIA Phase 4 brief: ExpiryBadge should be `48px font-mono countdown` as the page hero
- FORGE built: `11px font-mono text` — `Signal #N — Expires in XH YM` — minimal, metadata style
- FORGE's choice is arguably correct for editorial restraint (PRD design ref: Pragmatic Engineer, Stratechery)
- ARIA's spec was more product-marketing than editorial

**Finding:** FORGE applied editorial restraint correctly. The design system was not updated to document the resolved spec, so VEIL would have no ground truth to audit against. ARIA has now updated design-system.md to match what FORGE built.

**Proposed change target:** [VEIL CLAUDE.md] — Add to task lifecycle:
> "If a component's implementation differs from the brief spec but conforms to the design system references (Pragmatic Engineer, Stratechery), call it out in the review as a DEVIATION but note if it passes editorial restraint tests. Let ARIA decide which version is canonical."

**Confidence:** MEDIUM

---

## Pattern 4 — Onboarding role pick is uncoupled from subscribe flow

**Observed:** Task 6 (Phase 4 → Phase 5 bleed)

**Evidence:**
- `/api/subscribe/route.ts` accepts `email` + `role` (optional, defaults to 'curious')
- `SubscribeInput.tsx` sends `{ email }` only — no role
- The onboarding role pick screen (PM / Founder / Builder / Just curious) is not built
- Result: all new subscribers get `role = 'curious'`, the lens default is wrong, and the StoryCard expanded state can't highlight the correct lens column

**Risk:** The subscribe flow is functionally live but incomplete. Users who subscribe get the wrong lens default. The role pick is a key PRD differentiator.

**Proposed change target:** Phase 5 brief must include:
> - Role pick screen at `/onboard` or inline after subscribe confirmation
> - `SubscribeInput` must send `role` to `/api/subscribe` after the user picks
> - `StoryCard` must read role from cookie/session on all page loads

**Confidence:** HIGH

---

## Pattern 5 — Component checklist has stale items for the new product model

**Observed:** Ongoing since pivot

**Evidence:**
- `design/component-checklist.md` includes `StoryCard/Collapsed — Story number is rendered in the metadata row` — position was removed in Phase 4
- Checklist references "used 5–7 times per issue" — no longer true (1 story per day)
- ExpiryBadge, SignalExpired, SignalGate, SiteShell/SiteWordmark checklist items were added by ARIA but haven't been marked against the actual built implementations

**Proposed change target:** [design/component-checklist.md] — VEIL should audit component-checklist.md against current implementation files at the start of every Phase 5+ review and flag stale items for ARIA to remove.

**Confidence:** MEDIUM

---

## Top 3 priorities to apply now

1. **Write Phase 5 brief that closes the role pick gap** (Pattern 4 — highest runtime impact)
2. **SEED to review db/types vs migrations alignment after every FORGE task** (Pattern 2)
3. **Strip stale StoryCard position items from component-checklist.md** (Pattern 5)

---

## What ORACLE is NOT proposing (scope boundaries)

- Not proposing to change the product direction — that's locked
- Not proposing architectural changes beyond what patterns show as painful
- Not proposing pull_quote removal — might be intentional, needs user input
