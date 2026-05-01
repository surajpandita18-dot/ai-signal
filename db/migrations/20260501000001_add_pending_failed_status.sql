-- Add 'pending' and 'failed' to issues status — supports background job flow
-- pending: cron inserted placeholder, Inngest pipeline in progress
-- failed:  Inngest exhausted retries, pipeline did not complete
-- Postgres does not support ALTER CONSTRAINT — drop and recreate.

alter table issues drop constraint if exists issues_status_check;

alter table issues
  add constraint issues_status_check
  check (status in ('draft', 'published', 'no_signal', 'pending', 'failed'));
