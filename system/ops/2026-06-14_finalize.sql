-- One-shot finalization for the AI, Basically. cutover.
-- Paste this block into the Supabase SQL Editor (dashboard → SQL → New query)
-- and Run. Both statements are idempotent — safe to re-run.
--
-- Project: ai-signal (eta.vercel.app) — NOT ai-signal-v2.

-- 1) Add the optional `decoder` JSONB column the page + email + cron already
--    reference. Existing rows get NULL (no decoder). Web has a JSON fallback
--    for issues 001–003 today; the column landing lets new issues opt in
--    cleanly and lets email render decoder without a redeploy.
alter table public.issues
  add column if not exists decoder jsonb;

-- 2) Publish issue 001 so the Saturday cron picks it up. The cron checks
--    `status='published' and published_at <= now()` and skips anything older
--    than 7 days, so timing the publish near the send window matters. This
--    sets published_at to now(); if you want a specific Saturday, change it.
update public.issues
   set status = 'published',
       published_at = now()
 where slug = '001';

-- Verify:
select slug, status, published_at,
       decoder is not null as has_decoder
  from public.issues
 order by issue_number;
