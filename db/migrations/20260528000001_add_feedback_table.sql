create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  rating        text not null,          -- 'changed' | 'thinking' | 'good_to_know' | 'not_relevant'
  message       text,                   -- optional free text
  reply_email   text,                   -- optional email for reply
  signal_number int,                    -- which signal they're rating (optional)
  source        text default 'website'  -- 'website' | 'email'
);

alter table public.feedback enable row level security;

-- Anyone can insert feedback (public form)
create policy "public can insert feedback"
  on public.feedback for insert
  to anon
  with check (true);

-- Only service role can read
create policy "service role can read feedback"
  on public.feedback for select
  to service_role
  using (true);
