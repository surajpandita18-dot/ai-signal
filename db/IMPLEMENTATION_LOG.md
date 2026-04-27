# SEED — Implementation Log
## Task: Phase 1 — schema + seed data
## Date: 2026-04-27

---

### Files created

- `/db/migrations/20260427000000_initial_schema.sql`
- `/db/types/database.ts`
- `/db/seed.sql`

### Key decisions

**Types written by hand** — Supabase CLI gen requires a live local DB. Types are written to match the migration schema exactly and are compatible with `@supabase/supabase-js` v2's `createClient<Database>()` generic pattern.

**`IssueWithStories` composed type added** — FORGE will need this shape on every issue page render (issue + its stories in one query). Adding it here avoids FORGE writing ad-hoc types later.

**RLS on subscribers is zero-policy** — anon has no access at all. Service role (used by API routes) bypasses RLS by default in Supabase. This is intentional — no public read of email addresses.

**Seed data uses a CTE** — the `with issue as (...)` pattern avoids hardcoding UUIDs in seed.sql, making it safe to re-run after a `supabase db reset`.

**Seed stories have all lens fields populated** — FORGE needs realistic data in every field for Phase 2 (story card component). Empty fields would mask rendering bugs.

### Deviations from brief

None.

### How to apply

**With Supabase CLI:**
```bash
supabase db reset           # applies migrations and seed.sql
supabase gen types typescript --local > /db/types/database.ts
```

**Without CLI (manual):**
1. Run `/db/migrations/20260427000000_initial_schema.sql` in the Supabase SQL editor
2. Run `/db/seed.sql` in the Supabase SQL editor
3. Types are already written — no regeneration needed

### Typecheck

`/db/types/database.ts` has no imports and no external dependencies. TypeScript will not flag it standalone. FORGE will validate it when importing into `/src/lib/supabase.ts` in Phase 2.
