-- RLS: allow public read of 'no_signal' issues alongside 'published'
-- Context: homepage and signal pages query .in('status', ['published', 'no_signal'])
-- The original policy only allowed 'published' — no_signal rows were silently dropped.

drop policy if exists "public read published issues" on issues;

create policy "public read published issues"
  on issues for select
  using (status in ('published', 'no_signal'));

-- Stories policy: no change needed — no_signal issues have 0 stories by definition.
-- The existing policy (exists published parent) stays correct.
