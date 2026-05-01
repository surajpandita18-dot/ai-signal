-- Allow issues to be published as 'no_signal' days
-- (days where no story cleared the editorial bar — a feature, not a bug)
-- The check constraint must be dropped and recreated; Postgres doesn't support ALTER CONSTRAINT.

alter table issues drop constraint if exists issues_status_check;

alter table issues
  add constraint issues_status_check
  check (status in ('draft', 'published', 'no_signal'));
