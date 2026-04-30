-- Add editorial pick metadata to issues
-- Captures why the chosen story won and what candidates were rejected
-- Both nullable — backward compat, old rows stay untouched
ALTER TABLE issues
  ADD COLUMN pick_reason TEXT NULL,
  ADD COLUMN rejected_alternatives JSONB NULL;
