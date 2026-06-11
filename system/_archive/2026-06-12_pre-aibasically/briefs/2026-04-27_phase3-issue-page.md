# Brief — Phase 3: Issue page + homepage

**Assigned to:** FORGE (/src/)
**Date:** 2026-04-27
**Phase:** 3 of 7

---

## Task

Build the issue page (`/issue/[slug]`) that fetches and renders a full issue from Supabase, and update the homepage (`/`) to show the latest published issue inline. Both pages share the same layout: IssueHeader + list of StoryCards.

---

## Files to create/edit

```
src/app/issue/[slug]/page.tsx     (new)
src/app/issue/[slug]/not-found.tsx  (new)
src/components/IssueHeader.tsx    (new)
src/components/LongRead.tsx       (new)
src/app/page.tsx                  (replace TEMP placeholder with real Supabase fetch)
src/IMPLEMENTATION_LOG.md         (overwrite)
```

---

## Data fetching pattern

Both pages are **server components** that call Supabase directly — no API routes, no useEffect, no client-side fetching.

```typescript
// fetch a published issue with its stories, ordered by position
const { data: issue } = await supabase
  .from('issues')
  .select('*, stories(*)')
  .eq('slug', slug)
  .eq('status', 'published')
  .order('position', { referencedTable: 'stories', ascending: true })
  .single()
```

Use the server client (`createServerSupabaseClient` from `src/lib/supabase-server.ts`) for all server component fetches.

Homepage fetches the most recent published issue:
```typescript
.order('published_at', { ascending: false })
.limit(1)
```

---

## IssueHeader component

Props:
```typescript
interface IssueHeaderProps {
  issueNumber: number
  publishedAt: string  // ISO string
  editorNote: string
}
```

Layout (no card, no border — sits inline on the page):
```
Issue #1 · April 27, 2026      ← font-mono text-xs uppercase text-secondary
                                 margin-bottom: 24px

[editor's note paragraph]       ← font-serif text-base (15px), line-height 1.7
                                 color text-primary
                                 max-width 720px
                                 margin-bottom: 40px

────────────────────────────    ← 1px border, border token color
                                 margin-bottom: 40px
```

Format `publishedAt`: `April 27, 2026` using `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })`.

---

## LongRead component (footer of each issue)

Props:
```typescript
import type { LongRead as LongReadType } from '../../../db/types/database'

interface LongReadProps {
  longRead: LongReadType
}
```

Layout:
```
LONG READ OF THE WEEK          ← font-mono text-xs uppercase text-muted, margin-bottom: 16px

[title]                        ← font-serif text-lg (17px), font-weight 600, color text-primary
[source label]                 ← font-mono text-xs text-muted, margin-bottom: 8px

[why_pick paragraph]           ← font-sans text-base text-secondary, line-height 1.6

Read it →                      ← plain anchor, font-sans text-sm text-accent (accent color),
                                  no decoration, hover underline
```

Wrap the whole block in a `<footer>` tag. Border-top: `1px solid var(--border)`, padding-top: 40px, margin-top: 40px.

---

## Issue page layout (/issue/[slug]/page.tsx)

```
<main> (max-width 720px, centered, padding 48px 24px)
  <IssueHeader ... />
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    {issue.stories.map((story, i) => (
      <StoryCard key={story.id} story={story} position={story.position} />
    ))}
  </div>
  {issue.long_read && <LongRead longRead={issue.long_read} />}
</main>
```

`userRole` is not passed in Phase 3 — it will be wired to the subscriber cookie in Phase 5.

---

## Homepage (/page.tsx)

Replace the TEMP content entirely. Fetch the latest published issue, render it exactly like the issue page. Add one line of tagline above the IssueHeader:

```
AI Signal · Issue #N            ← font-mono text-xs text-muted, margin-bottom: 32px
```

No subscribe CTA in Phase 3 — that comes in Phase 5. No navigation header — Phase 4.

---

## not-found.tsx for /issue/[slug]

If the slug doesn't match a published issue, return `notFound()` from `next/navigation`. The `not-found.tsx` file renders a minimal message:

```
404 — Issue not found.
← Back to latest issue
```

Use `<Link href="/">← Back to latest issue</Link>` from `next/link`.

---

## Metadata

Add `generateMetadata` to `/issue/[slug]/page.tsx`:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // fetch issue title from editor_note first sentence
  return { title: `AI Signal #${issue.issue_number} — ${formattedDate}` }
}
```

Homepage uses the static metadata already in layout.tsx — do not override.

---

## Acceptance criteria

- [ ] `/issue/2026-04-27` renders the seed issue with 3 StoryCards
- [ ] `/` renders the same seed issue inline (latest published)
- [ ] `/issue/nonexistent` returns 404 page
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] Story cards have correct position numbers (01, 02, 03)
- [ ] IssueHeader shows issue number, formatted date, editor's note
- [ ] LongRead footer renders if `long_read` is not null
- [ ] No client components on this page (no `'use client'`, except StoryCard which already is)
- [ ] IMPLEMENTATION_LOG.md written

---

## Do NOT

- Do not add navigation header, site footer, or subscribe CTA — those are Phase 4/5
- Do not add loading.tsx or Suspense wrappers — not needed at this stage
- Do not fetch stories in a separate query — use the joined `.select('*, stories(*)')` pattern
- Do not add any new npm dependencies
- Do not pass `userRole` to StoryCard yet — Phase 5
- Do not add ISR or revalidation — static is fine for MVP
