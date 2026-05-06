# AI Signal — DB Migrations

## Naming convention

```
YYYYMMDDHHMMSS_short_description.sql
```

Example: `20260505000001_add_extended_data.sql`

## Rules

- **Never edit past migration files.** Changes go in new files only.
- **One concern per file.** Column additions, index additions, and RLS changes each get their own file.
- **Always nullable for new columns.** Existing rows must not break on deploy.
- **RLS:** New tables need explicit policies. Adding a column to an existing table inherits existing policies — no new policy needed.

## Apply locally

```bash
supabase db reset        # full reset + seed
# or
supabase migration up    # incremental
```

## Regenerate TypeScript types after applying

```bash
supabase gen types typescript --local > db/types/database.ts
```

## Migration history

| File | What it does |
|---|---|
| 20260427000000_initial_schema.sql | issues, stories, subscribers tables + RLS |
| 20260427000001_add_pull_quote.sql | pull_quote column on stories |
| 20260427000002_add_no_signal_status.sql | no_signal status on issues |
| 20260427000003_fix_no_signal_rls.sql | RLS fix for no_signal |
| 20260428000001_add_story_sections.sql | stats, action_items, counter_view columns |
| 20260428000002_add_performance_indexes.sql | indexes for issue_id, status, published_at |
| 20260430000001_add_editorial_take.sql | editorial_take column on stories |
| 20260430000002_add_broadcast_phrases.sql | broadcast_phrases column on stories |
| 20260430000003_add_issue_picker_metadata.sql | pick_reason, rejected_alternatives on issues |
| 20260501000001_add_pending_failed_status.sql | pending, failed status values on issues |
| 20260502000001_add_teaser_to_issues.sql | teaser column on issues |
| 20260505000001_add_extended_data.sql | extended_data jsonb column on stories (V11) |
