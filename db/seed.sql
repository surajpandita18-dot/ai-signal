-- AI Signal v2 — seed data for local development
-- One daily signal (#1) with 1 story + one test subscriber
--
-- NOTE: published_at is set to a fixed past date.
-- For the homepage to show State A (active, countdown visible),
-- update published_at to within the last 24h:
--   update issues set published_at = now() where issue_number = 1;

-- Signal #1
insert into issues (issue_number, slug, published_at, editor_note, long_read, status)
values (
  1,
  '2026-04-27',
  '2026-04-27 03:30:00+00',
  null,
  null,
  'published'
);

-- 1 story for signal #1
with issue as (select id from issues where issue_number = 1)

insert into stories (
  issue_id, position, category,
  headline, summary, why_it_matters,
  deeper_read, pull_quote, lens_pm, lens_founder, lens_builder,
  sources, read_minutes,
  stats, action_items, counter_view_headline, counter_view
)
select
  issue.id,
  1,
  'models',
  'GPT-5 Mini cuts API costs by 10× — and every Q1 AI budget is now wrong',
  '**$0.04 per million input tokens.** OpenAI shipped GPT-5 Mini and it outperforms GPT-4 Turbo on most reasoning tasks — at a tenth of the price. **Most product teams haven''t rerun their unit economics yet.**',
  E'Every cost assumption in your Q1 roadmap is now wrong. The **10× price drop** unlocks use cases that were previously uneconomical — high-volume summarisation, always-on assistants, per-user personalisation at scale. The question is not whether to reprice; it is which deferred features just became viable today.\n\nGPT-5 Mini lands two weeks after Anthropic cut Haiku pricing. This is not coincidence — it is the opening of a **price war at the commodity tier**. The labs are competing on cost while differentiating on capability at the top. The infrastructure layer is getting cheaper faster than anyone modelled.\n\nThe winners in 12 months will not be the teams with the best models. They will be the teams that moved their cost assumptions down in April and shipped the features their competitors said were too expensive.',
  'The default model is no longer a question of capability — it is a question of who notices the price change first.',
  'We''re reopening our kill list. **Features we marked "not viable" on cost** need a second look — one of them is almost certainly profitable now. Run your production token counts against the new pricing today, not at the next sprint planning.',
  '**Features gated by token cost** — high-frequency agents, per-user personalisation, always-on summarisation — move up the roadmap immediately. Reprice them before your competitors do.',
  'Your burn rate on AI API calls just got a meaningful tailwind. More importantly, **your competitor''s "we can''t afford to do this at scale" moat just narrowed significantly**. Differentiation is shifting from cost to product quality — that is a race you can win.',
  '[{"label": "OpenAI pricing page", "url": "https://openai.com/pricing"}, {"label": "The Rundown AI", "url": "https://therundown.ai"}]'::jsonb,
  3,
  '[
    {"label": "Input cost", "value": "$0.04", "delta": "↓ 10×", "detail": "Per million tokens, down from GPT-4o Mini"},
    {"label": "Reasoning", "value": "+12%", "delta": "↑", "detail": "Outperforms GPT-4 Turbo on MMLU-Pro"},
    {"label": "Release", "value": "Silent", "delta": null, "detail": "Pricing page only — no blog post, no PR"}
  ]'::jsonb,
  '[
    "**Re-run your unit economics** on every feature gated by token cost this week — there is likely one you killed last quarter that is now profitable.",
    "**Audit your model router** today: if you are still defaulting to GPT-4-class models for tasks Mini can handle, you are burning runway on every request.",
    "**Talk to your finance team** before they read about this in a board deck — own the narrative, this is a tailwind not a fire drill."
  ]'::jsonb,
  'What if you don''t switch?',
  'Mini is cheaper, but cheaper is not always better for premium products. If your users pay for the smartest answer — legal, medical, code review — the 12% benchmark gain may hide regressions on edge cases. Run your own evals before swapping defaults. **Chasing cost without regression-testing quality is how products lose users silently.** One bad answer in a legal workflow costs more than a year of token savings.'
from issue;

-- Test subscriber
insert into subscribers (email, role, status)
values ('test@example.com', 'pm', 'active');
