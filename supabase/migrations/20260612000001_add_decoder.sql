-- Adds the optional `decoder` JSONB column to issues — an opt-in jargon
-- explainer rendered as a closed fold on web and an always-open block in
-- email. Existing rows get NULL (no decoder); newer issues populate the
-- column at insert time.
alter table issues add column if not exists decoder jsonb;
