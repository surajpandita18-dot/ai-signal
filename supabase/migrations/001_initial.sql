-- AI Signal — Initial Schema
-- Run via: supabase db push  OR  paste into Supabase SQL editor
-- Version: 1.0 | 26 Apr 2026

-- ── Extensions ────────────────────────────────────────────────────────────────

create extension if not exists vector;

-- ── Tables ────────────────────────────────────────────────────────────────────

-- Stories: raw fetched + scored stories. pgvector for semantic dedup.
create table if not exists stories (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  url           text        not null,
  source        text        not null,
  published_at  timestamptz not null,
  raw_text      text,
  embedding     vector(1536),           -- text-embedding-3-small output for dedup
  infra_score   int,                    -- 0–10
  speed_score   int,                    -- 0–10
  competitive_score int,               -- 0–10
  hype_discount int,                    -- -5–0
  final_score   int,                    -- sum of above dimensions
  tier          text,                   -- 'critical' | 'monitor' | 'tool' | 'ignore'
  score_rationale text,
  fetched_at    timestamptz default now()
);

-- Briefs: daily assembled briefs with free + pro variants
create table if not exists briefs (
  id            uuid  primary key default gen_random_uuid(),
  date          date  not null unique,
  slug          text  not null unique,  -- e.g. '2026-04-26'
  free_content  jsonb not null,         -- gated brief for free subscribers
  pro_content   jsonb not null,         -- full brief for pro subscribers
  web_payload   jsonb not null,         -- structured data for /brief/[date] page
  created_at    timestamptz default now()
);

-- Subscribers: all newsletter subscribers
create table if not exists subscribers (
  id                      uuid primary key default gen_random_uuid(),
  email                   text not null unique,
  tier                    text not null default 'free', -- 'free' | 'pro'
  stripe_customer_id      text,
  beehiiv_subscriber_id   text,
  timezone                text not null default 'Asia/Kolkata',
  created_at              timestamptz default now()
);

-- Pipeline runs: operational metrics + calibration data
create table if not exists pipeline_runs (
  id              uuid    primary key default gen_random_uuid(),
  date            date    not null,
  duration_ms     int,
  story_count     int,
  critical_count  int,
  monitor_count   int,
  emails_scheduled boolean,
  manual_send     boolean default false,
  success         boolean,
  errors          jsonb,
  created_at      timestamptz default now()
);

-- Agent errors: debugging + alerting
create table if not exists agent_errors (
  id          uuid  primary key default gen_random_uuid(),
  agent       text  not null,   -- 'fetcher' | 'scorer' | 'writer' | etc.
  error       text  not null,
  context     jsonb,
  created_at  timestamptz default now()
);

-- Pipeline state: orchestrator memory across runs
create table if not exists pipeline_state (
  key         text  primary key,
  value       jsonb not null,
  updated_at  timestamptz default now()
);

-- Pro subscribers: extended data for paid tier
create table if not exists pro_subscribers (
  id                      uuid primary key default gen_random_uuid(),
  subscriber_id           uuid references subscribers(id) on delete cascade,
  slack_webhook_url       text,
  timezone                text not null default 'Asia/Kolkata',
  stripe_subscription_id  text,
  current_period_end      timestamptz,
  created_at              timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup for daily brief assembly
create index if not exists idx_stories_published_at  on stories (published_at desc);
create index if not exists idx_stories_tier          on stories (tier);
create index if not exists idx_stories_final_score   on stories (final_score desc);

-- Semantic similarity search for dedup (ivfflat requires data before build — create after first insert)
create index if not exists stories_embedding_idx on stories
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Brief lookup
create index if not exists idx_briefs_date on briefs (date desc);
create index if not exists idx_briefs_slug on briefs (slug);

-- Subscriber lookup
create index if not exists idx_subscribers_email on subscribers (email);
create index if not exists idx_subscribers_tier  on subscribers (tier);

-- Pipeline monitoring
create index if not exists idx_pipeline_runs_date   on pipeline_runs (date desc);
create index if not exists idx_agent_errors_agent   on agent_errors (agent, created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table stories          enable row level security;
alter table briefs           enable row level security;
alter table subscribers      enable row level security;
alter table pipeline_runs    enable row level security;
alter table agent_errors     enable row level security;
alter table pipeline_state   enable row level security;
alter table pro_subscribers  enable row level security;

-- Stories: public read (brief web pages need unauthenticated access)
create policy "stories_public_read" on stories
  for select using (true);

-- Stories: service role only for insert/update/delete
create policy "stories_service_write" on stories
  for all using (auth.role() = 'service_role');

-- Briefs: public read (web archive is public)
create policy "briefs_public_read" on briefs
  for select using (true);

-- Briefs: service role only for write
create policy "briefs_service_write" on briefs
  for all using (auth.role() = 'service_role');

-- Subscribers: users can read their own record
create policy "subscribers_own_read" on subscribers
  for select using (auth.jwt() ->> 'email' = email);

-- Subscribers: service role for all operations (pipeline + Stripe webhook)
create policy "subscribers_service_all" on subscribers
  for all using (auth.role() = 'service_role');

-- Pipeline tables: service role only
create policy "pipeline_runs_service"  on pipeline_runs  for all using (auth.role() = 'service_role');
create policy "agent_errors_service"   on agent_errors   for all using (auth.role() = 'service_role');
create policy "pipeline_state_service" on pipeline_state for all using (auth.role() = 'service_role');
create policy "pro_subscribers_service" on pro_subscribers for all using (auth.role() = 'service_role');

-- Pro subscribers: users can read their own record
create policy "pro_subscribers_own_read" on pro_subscribers
  for select using (
    subscriber_id in (
      select id from subscribers where email = auth.jwt() ->> 'email'
    )
  );
