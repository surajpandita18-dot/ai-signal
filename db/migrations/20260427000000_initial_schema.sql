-- AI Signal v2 — initial schema
-- Phase 1: issues, stories, subscribers

-- issues
create table issues (
  id            uuid primary key default gen_random_uuid(),
  issue_number  int unique not null,
  slug          text unique not null,
  published_at  timestamptz,
  editor_note   text,
  long_read     jsonb,
  status        text not null default 'draft' check (status in ('draft', 'published')),
  created_at    timestamptz not null default now()
);

-- stories
create table stories (
  id             uuid primary key default gen_random_uuid(),
  issue_id       uuid not null references issues(id) on delete cascade,
  position       int not null check (position between 1 and 7),
  category       text not null check (category in ('models','tools','business','policy','research')),
  headline       text not null,
  summary        text not null,
  why_it_matters text not null,
  deeper_read    text,
  lens_pm        text,
  lens_founder   text,
  lens_builder   text,
  sources        jsonb not null default '[]',
  read_minutes   int not null default 3,
  unique (issue_id, position)
);

-- subscribers
create table subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  role              text not null default 'curious' check (role in ('pm','founder','builder','curious')),
  status            text not null default 'active' check (status in ('active','unsubscribed')),
  subscribed_at     timestamptz not null default now(),
  unsubscribe_token text unique not null default encode(gen_random_bytes(32), 'hex')
);

-- RLS
alter table issues enable row level security;
alter table stories enable row level security;
alter table subscribers enable row level security;

create policy "public read published issues"
  on issues for select
  using (status = 'published');

create policy "public read stories on published issues"
  on stories for select
  using (
    exists (
      select 1 from issues
      where issues.id = stories.issue_id
      and issues.status = 'published'
    )
  );

-- subscribers: no policies = service role only (anon has zero access)
