# Cutover Runbook — AI Signal → AI, Basically.

Run these in order. Each step is a single command (or a single click). Rollback is `git revert` for code or the safety tag `pre-aibasically-2026-06-12` for nuclear.

---

## What's already done

- Branch `aibasically` shipped: 8 commits, full Phase 0–3.
- `tsc --noEmit` clean; `next build` clean (10 routes, 102 KB First Load JS).
- Visual QA via Playwright: desktop + mobile parity with `~/Downloads/ai-basically-FINAL.html`.
- Vercel preview deploy on push (URL printed at end).

## What's left (your hands — destructive on prod)

### 1. Env vars — *already done for prod, optional for preview & local*

Verified via `vercel env ls`: all 8 needed env vars are in the Vercel `ai-signal` project (encrypted; visible only at build/runtime, not via `vercel env pull`). **The prod deploy will pick them up automatically when you merge.** No paste needed for prod.

**Optional fix — Preview deploys** (the `/archive` 500 on https://ai-signal-jjcbe62vv-...):

Two vars are scoped only to Production in Vercel and need to also be scoped to Preview so preview deployments stop 500-ing on `/archive`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Fix (30 seconds): Vercel dashboard → ai-signal → Settings → Environment Variables → for each of the two vars, edit → check the "Preview" environment box → save. Then redeploy: `vercel --force` or push an empty commit. (Three other vars — ANTHROPIC_API_KEY, EMAIL_FROM, NEXT_PUBLIC_SITE_URL — are also Production-only; only matters if you need them on preview.)

**Optional — local dev with real Supabase**: paste these into `/Users/surajpandita/ai_signal/.env.local` (currently empty-quoted because CLI never decrypts):

```
SUPABASE_SERVICE_ROLE_KEY="<from dashboard>"
ANTHROPIC_API_KEY="<from dashboard>"
RESEND_API_KEY="<from dashboard>"
EMAIL_FROM="<from dashboard>"
CRON_SECRET="<from dashboard>"
```

Skip this entirely if you only want to QA on the deployed preview URL.

---

### 2. Apply the migration to Supabase — **DESTRUCTIVE**

This drops the legacy daily-product tables (`issues`, `stories`, `subscribers`, `feedback`) and creates the new schema. After this, the OLD `main` branch will 500 on every page that touches Supabase, because its code expects the old columns. So **do this immediately before merging to `main`**, not before.

```bash
cd /Users/surajpandita/ai_signal
psql "$(supabase status --output env | grep DATABASE_URL | cut -d= -f2- | tr -d '"')" \
  -f supabase/migrations/20260612000000_initial_aibasically.sql
```

If you don't have `supabase` CLI linked, paste the SQL into the Supabase dashboard → SQL Editor → Run.

Then seed Issue 001 + a test subscriber (idempotent — safe to re-run):
```bash
psql "$DATABASE_URL" -f /Users/surajpandita/ai_signal/db/seed.sql
```

Verify:
```bash
psql "$DATABASE_URL" -c "SELECT slug, status, issue_number FROM issues;"
# expected: 001 | draft | 1
```

> Issue 001 ships as `status='draft'`. The public RLS policy hides drafts, so non-subscribers won't see it until you bump it to `published`:
> ```sql
> UPDATE issues SET status='published', published_at=now() WHERE slug='001';
> ```

---

### 3. Merge `aibasically` → `main` — **LIVE CUTOVER**

Confirm preview URL still looks right, then:
```bash
cd /Users/surajpandita/ai_signal
git checkout main
git merge aibasically --no-ff -m "feat: cutover to AI, Basically."
git push origin main
```

Vercel auto-deploys to `ai-signal-eta.vercel.app`. Watch the deploy:
```bash
vercel ls 2>/dev/null | head -5
```

Smoke-test prod (replace URL if the alias changed):
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ai-signal-eta.vercel.app/
curl -s -o /dev/null -w "%{http_code}\n" https://ai-signal-eta.vercel.app/i/001
```

---

### 4. (Optional) Rename Vercel project + attach domain later

```bash
# inside /Users/surajpandita/ai_signal
vercel project rename ai-signal ai-basically
# auto URL becomes ai-basically-<hash>-surajpandita18-dots-projects.vercel.app
```

Custom domain `aibasically.co` is deferred. When ready:
```bash
vercel domains add aibasically.co
vercel alias set <latest-deployment-url> aibasically.co
```

---

## Rollback plans

**Code rollback:**
```bash
git revert HEAD --no-edit
git push origin main
```

**Nuclear rollback (back to the pre-rebuild state):**
```bash
git checkout main
git reset --hard pre-aibasically-2026-06-12
git push origin main --force   # destructive — only if the cutover is broken beyond repair
```

**Supabase rollback:** there's no automatic rollback for the migration drop. If needed, restore from Supabase's daily backup (Project Settings → Database → Backups).

---

## Follow-up (after cutover lands)

Per Agent F's notes in `STATE.md`:

1. Add a follow-up migration: `issues.sent_at TIMESTAMPTZ NULL` + `issues._rubric JSONB NULL`. The v1 cron uses a fragile 7-day proxy that breaks if you publish mid-week.
2. Tighten the `as unknown as IssueContent` casts in `src/app/i/[issue]/page.tsx` and `src/app/archive/page.tsx` to use the typed `Database['public']['Tables']['issues']['Row']` now that `db/types/database.ts` exists.
3. Remove the `?preview=1` query param from `/i/[issue]/page.tsx` once Issue 001 is `status='published'` and the live Supabase has the row. The fallback was a QA aid, not production logic.
