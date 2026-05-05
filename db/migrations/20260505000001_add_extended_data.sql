-- V11 universal article structure — extended data for 11 new sections
-- Stores all extended_data sections as a single jsonb blob.
-- Nullable: existing stories are unaffected; new pipeline fills this column.
-- No new RLS policy needed: existing "public read stories on published issues" covers all columns.

ALTER TABLE stories ADD COLUMN extended_data JSONB NULL;
