-- Performance indexes for production query patterns
-- Homepage: published issues ordered by date
CREATE INDEX IF NOT EXISTS idx_issues_published_at
  ON issues(published_at DESC)
  WHERE status IN ('published', 'no_signal');

-- Filter by status
CREATE INDEX IF NOT EXISTS idx_issues_status
  ON issues(status);

-- Stories by issue (most common join)
CREATE INDEX IF NOT EXISTS idx_stories_issue_id
  ON stories(issue_id);

-- Unique signal number lookup (used by /signal/[number] route)
-- issue_number already has UNIQUE constraint but explicit index aids query planner
CREATE INDEX IF NOT EXISTS idx_issues_issue_number
  ON issues(issue_number);

-- Slug lookup (/issue/[slug] route)
CREATE INDEX IF NOT EXISTS idx_issues_slug
  ON issues(slug);

-- Unsubscribe token lookup
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token
  ON subscribers(unsubscribe_token);

-- Explicit DENY write policies for anon role on issues
-- DROP first so this script is safe to re-run
DROP POLICY IF EXISTS "anon cannot insert issues" ON issues;
DROP POLICY IF EXISTS "anon cannot update issues" ON issues;
DROP POLICY IF EXISTS "anon cannot delete issues" ON issues;

CREATE POLICY "anon cannot insert issues"
  ON issues FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "anon cannot update issues"
  ON issues FOR UPDATE TO anon USING (false);

CREATE POLICY "anon cannot delete issues"
  ON issues FOR DELETE TO anon USING (false);
