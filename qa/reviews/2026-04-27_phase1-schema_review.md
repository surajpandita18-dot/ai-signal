# Review — Phase 1: schema + seed data — 2026-04-27

## Verdict
PASS

---

## Critical (must fix before merge)
None.

---

## Important (should fix)
None.

---

## Nice to have (defer)
- `db/migrations/20260427000000_initial_schema.sql:8` — consider adding `check (length(slug) > 0)` and `check (length(headline) > 0)` constraints on key text fields to prevent accidental empty-string inserts at the DB level. Low priority for MVP — application layer validates first.
- `db/types/database.ts` — `Views` and `Functions` are typed as `Record<string, never>` which is correct for now but will need updating if Supabase views are added in later phases. Not a problem today.

---

## Strong choices worth keeping
- CTE pattern in `seed.sql` (`with issue as (select id ...)`) is the right call — avoids hardcoded UUIDs, survives `db reset` reruns cleanly.
- `IssueWithStories` composed type exported from types file. This will save FORGE from writing ad-hoc intersection types in Phase 2.
- Zero-policy RLS on `subscribers` is correct. Explicit no-access is safer than a permissive policy that gets narrowed later.
- All three lens fields populated in seed data — this will surface rendering bugs in Phase 2 that empty fields would hide.
- `unsubscribe_token` default uses `gen_random_bytes(32)` — cryptographically appropriate for an unsubscribe token.
