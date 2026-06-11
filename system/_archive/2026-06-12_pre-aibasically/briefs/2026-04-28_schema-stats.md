# Brief: Schema — add stats, action_items, counter_view to stories

**Date:** 2026-04-28  
**Agent:** SEED  
**Files to create/edit:**
- `/db/migrations/20260428000001_add_story_sections.sql` (new)
- `/db/types/database.ts` (update)
- `/db/seed.sql` (update seed story data)

---

## DO NOT
- Modify any existing migration file
- Touch /src files
- Drop or rename any existing column

---

## Migration

```sql
-- AI Signal — add structured content sections to stories
-- Phase 4 production: stats, action_items, counter_view

alter table stories
  add column if not exists stats          jsonb default null,
  add column if not exists action_items   jsonb default null,
  add column if not exists counter_view   text  default null,
  add column if not exists counter_view_headline text default null;

comment on column stories.stats is 'Array of {label, value, delta, detail} objects for By the Numbers section';
comment on column stories.action_items is 'Array of strings for The Move checklist section';
comment on column stories.counter_view is 'Devil''s Advocate body text';
comment on column stories.counter_view_headline is 'Devil''s Advocate headline';
```

No new RLS needed — existing "public read stories on published issues" policy covers all story columns.

---

## database.ts update

In the `stories` Row/Insert/Update interfaces, add:

```ts
// In Row:
stats: StoryStats[] | null
action_items: string[] | null
counter_view: string | null
counter_view_headline: string | null

// In Insert and Update (all optional):
stats?: StoryStats[] | null
action_items?: string[] | null
counter_view?: string | null
counter_view_headline?: string | null
```

Add the new domain type below the existing `StorySource` interface:

```ts
export interface StoryStats {
  label: string
  value: string
  delta: string | null  // e.g. "↓ 10×" or "+12%"
  detail: string
}
```

---

## seed.sql update

Find the existing INSERT for the stories table (the GPT-5 Mini story). Add the new columns to that insert:

```sql
stats = '[
  {"label": "Input cost", "value": "$0.04", "delta": "↓ 10×", "detail": "Per million tokens, down from GPT-4o Mini"},
  {"label": "Reasoning", "value": "+12%", "delta": "↑", "detail": "Outperforms GPT-4 Turbo on MMLU-Pro"},
  {"label": "Release", "value": "Silent", "delta": null, "detail": "Pricing page only — no keynote, no PR"}
]'::jsonb,

action_items = '[
  "Re-run your unit economics on every feature gated by token cost. There'\''s likely one feature you killed last quarter that just became profitable.",
  "Audit your model router. If you'\''re still defaulting to GPT-4-class models for tasks Mini can handle, you'\''re burning runway today.",
  "Talk to your finance team before they read about this in a board deck. Own the narrative — this is a tailwind, not a fire drill."
]'::jsonb,

counter_view_headline = 'What if you don'\''t switch?',

counter_view = 'Mini is cheaper, but cheaper isn'\''t always better for premium products. If your users pay for the smartest answer — legal, medical, code review — the 12% benchmark gain may hide regressions on edge cases. Run your own evals before swapping defaults. Chasing cost without regression-testing quality is how products lose users.'
```

If seed.sql uses `DO $$ ... $$` blocks or ON CONFLICT, maintain that pattern. Add these columns to whichever INSERT or UPDATE targets the GPT-5 Mini story row. Also add `pull_quote` if it is missing from the seed — use this value:
```
'The default model is no longer a question of capability. It is a question of who notices the price change first.'
```

---

## Acceptance criteria
- Migration file is additive only (IF NOT EXISTS)
- database.ts has `StoryStats` interface and all 4 new columns in Row/Insert/Update
- seed.sql updated with stats, action_items, counter_view data
- No syntax errors in SQL

## Log file
Write to `/db/IMPLEMENTATION_LOG.md`
