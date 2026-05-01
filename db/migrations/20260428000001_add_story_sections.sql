-- AI Signal — add structured content sections to stories
-- Phase 4 production: stats, action_items, counter_view

alter table stories
  add column if not exists stats                 jsonb default null,
  add column if not exists action_items          jsonb default null,
  add column if not exists counter_view          text  default null,
  add column if not exists counter_view_headline text  default null;

comment on column stories.stats                 is 'Array of {label, value, delta, detail} objects for By the Numbers section';
comment on column stories.action_items          is 'Array of strings for The Move checklist section';
comment on column stories.counter_view          is 'Devil''s Advocate body text';
comment on column stories.counter_view_headline is 'Devil''s Advocate headline';
