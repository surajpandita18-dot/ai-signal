# Brief — Phase 1: Schema + seed data

**Assigned to:** SEED (/db/)
**Date:** 2026-04-27
**Phase:** 1 of 7

---

## Task

Create the Supabase schema for AI Signal v2. Three tables: `issues`, `stories`, `subscribers`. Add RLS policies. Generate TypeScript types. Insert one fake published issue with 3 stories as seed data.

---

## Files to create

```
/db/migrations/20260427000000_initial_schema.sql
/db/types/database.ts
/db/seed.sql
/db/IMPLEMENTATION_LOG.md
```

---

## Schema (exact)

### issues

```sql
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
```

`long_read` shape: `{ title: string, url: string, source: string, why_pick: string }`

### stories

```sql
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
```

`sources` shape: `[{ label: string, url: string }]`

### subscribers

```sql
create table subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  role              text not null default 'curious' check (role in ('pm','founder','builder','curious')),
  status            text not null default 'active' check (status in ('active','unsubscribed')),
  subscribed_at     timestamptz not null default now(),
  unsubscribe_token text unique not null default encode(gen_random_bytes(32), 'hex')
);
```

---

## RLS policies

Enable RLS on all three tables.

**issues** — public can read published issues only:
```sql
alter table issues enable row level security;
create policy "public read published issues"
  on issues for select using (status = 'published');
```

**stories** — public can read stories on published issues only:
```sql
alter table stories enable row level security;
create policy "public read stories on published issues"
  on stories for select using (
    exists (select 1 from issues where issues.id = stories.issue_id and issues.status = 'published')
  );
```

**subscribers** — no public read/write; service role only:
```sql
alter table subscribers enable row level security;
-- no policies = service role only (anon has no access)
```

---

## Seed data (/db/seed.sql)

Insert one published issue, issue_number 1, slug `2026-04-27`, with 3 stories. Use realistic AI news headlines. All three stories must have all text fields populated (headline, summary, why_it_matters, deeper_read, lens_pm, lens_founder, lens_builder). Sources array must have 2 entries per story.

Seed also inserts one test subscriber: email `test@example.com`, role `pm`, status `active`.

---

## TypeScript types (/db/types/database.ts)

Generate with Supabase CLI after applying migration:
```bash
supabase gen types typescript --local > /db/types/database.ts
```

If Supabase CLI is not available locally, write the types by hand matching the schema exactly. The file must export a `Database` type with `public.Tables` structure compatible with `@supabase/supabase-js` v2.

Minimum required exports:
```typescript
export type Issue = Database['public']['Tables']['issues']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
```

---

## Acceptance criteria

- [ ] Migration file runs without errors on a clean Supabase project
- [ ] All three tables exist with correct columns and constraints
- [ ] RLS is enabled on all tables; anon role cannot read subscribers
- [ ] Seed data inserts cleanly and can be queried
- [ ] TypeScript types file exports `Database`, `Issue`, `Story`, `Subscriber` types
- [ ] No TypeScript errors in /db/types/database.ts
- [ ] IMPLEMENTATION_LOG.md written

---

## Do NOT

- Do not add any tables or columns beyond what is specified above
- Do not add created_by or user_id columns (no auth users in MVP)
- Do not create any indexes beyond what Supabase creates automatically on PKs and unique columns
- Do not add a `views` or `analytics` table (tracking is handled by the email provider)
- Do not touch any file outside /db/
- Do not create a Supabase client — that belongs in /src/lib/ and will be done by FORGE in Phase 2
