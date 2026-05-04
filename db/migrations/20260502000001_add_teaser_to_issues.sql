ALTER TABLE issues ADD COLUMN IF NOT EXISTS teaser TEXT;
COMMENT ON COLUMN issues.teaser IS 'Short headline preview shown in upcoming-issues sidebar before issue is published';
