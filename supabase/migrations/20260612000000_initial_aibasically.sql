-- ─────────────────────────────────────────────────────────────────────────
-- AI, Basically. — initial schema
-- Safe to run on the existing Supabase project.
-- Drops the legacy daily-product tables (issues, stories, subscribers,
-- feedback) before recreating the new weekly schema per
-- system/PLAN-aibasically-v1.md §4.
-- All JSONB columns conform to src/lib/content-model.ts IssueContent.
-- RLS: anyone can SELECT issues WHERE status='published'. All writes go
-- through the service-role key from server-side API routes only.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Legacy drop (no-op if already absent) ───────────────────────────────
drop table if exists feedback cascade;
drop table if exists stories cascade;
drop table if exists subscribers cascade;
drop table if exists issues cascade;
drop table if exists referrals cascade;
drop table if exists lens_prefs cascade;
drop table if exists poll_responses cascade;

-- gen_random_bytes / gen_random_uuid live in pgcrypto.
create extension if not exists pgcrypto;

-- ── issues ──────────────────────────────────────────────────────────────
create table issues (
  id                  uuid primary key default gen_random_uuid(),
  issue_number        int unique not null,
  slug                text unique not null,
  published_at        timestamptz,
  status              text not null default 'draft'
                      check (status in ('draft','review','published')),

  -- masthead / hero
  hero_eyebrow        text not null,
  hero_headline_html  text not null,
  hero_sub_html       text not null,
  date_display        text not null,
  read_time_min       int  not null,
  streak_caption      text not null,

  -- TLDR + summary blocks
  tldr                jsonb not null default '[]'::jsonb,

  -- 9 numbered sections (Toolbox optional) + Build Notes band
  one_thing           jsonb not null,
  so_what             jsonb not null,
  build_notes         jsonb not null,
  job_signal          jsonb not null,
  under_the_hood      jsonb not null,
  the_rep             jsonb not null,
  toolbox             jsonb,
  reality_check       jsonb not null,
  india_signal        jsonb not null,

  -- closing units
  sponsor             jsonb,
  closer              jsonb not null,
  poll                jsonb not null,
  foot                jsonb not null,

  -- meta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index issues_status_published_at_idx on issues(status, published_at desc);
create index issues_slug_idx                on issues(slug);

-- ── subscribers ─────────────────────────────────────────────────────────
create table subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  role                text                                     -- nullable = 'curious'
                      check (role is null or role in ('builder','product_biz','secure_pro','switcher')),
  status              text not null default 'active'
                      check (status in ('active','unsubscribed','bounced')),
  referral_code       text unique not null
                      default substr(encode(gen_random_bytes(6),'base64'),1,8),
  unsubscribe_token   text unique not null
                      default encode(gen_random_bytes(32),'hex'),
  source              text,
  subscribed_at       timestamptz not null default now()
);

create index subscribers_referral_code_idx on subscribers(referral_code);

-- ── referrals ───────────────────────────────────────────────────────────
create table referrals (
  id                  uuid primary key default gen_random_uuid(),
  referrer_id         uuid not null references subscribers(id) on delete cascade,
  referred_id         uuid not null references subscribers(id) on delete cascade,
  created_at          timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

create index referrals_referrer_id_idx on referrals(referrer_id);

-- ── lens_prefs ──────────────────────────────────────────────────────────
create table lens_prefs (
  subscriber_id       uuid primary key references subscribers(id) on delete cascade,
  primary_track       text not null check (primary_track in ('builder','product_biz','secure_pro','switcher')),
  updated_at          timestamptz not null default now()
);

-- ── poll_responses ──────────────────────────────────────────────────────
create table poll_responses (
  id                  uuid primary key default gen_random_uuid(),
  issue_id            uuid not null references issues(id) on delete cascade,
  subscriber_id       uuid references subscribers(id) on delete set null,
  choice              text not null,
  ip_hash             text,
  created_at          timestamptz not null default now()
);

create unique index poll_one_per_subscriber
  on poll_responses(issue_id, subscriber_id)
  where subscriber_id is not null;

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table issues          enable row level security;
alter table subscribers     enable row level security;
alter table referrals       enable row level security;
alter table lens_prefs      enable row level security;
alter table poll_responses  enable row level security;

-- Public SELECT on published issues only. No public writes anywhere.
create policy issues_public_read_published
  on issues for select
  using (status = 'published');

-- All writes are performed with the service-role key from server-side API
-- routes; the service role bypasses RLS, so no explicit policies are
-- required here.
