# Implementation Log — Block 6 + D1 Design Refresh (v10)

**Date:** 2026-05-03
**Task:** Block 6 + D1: NotebookFacts verify, ArchiveSection teaser wire

---

## TASK 1 — NotebookFacts.tsx

**Finding:** Component verified clean. No `.reveal` class present anywhere in the file. Rotation interval is exactly 5500ms. The 4 category filter tabs (All / Nums / Trivia / Industry) map correctly to `FACTS` entries with cats `numbers`, `trivia`, `industry`. `changeFact()` sequences correctly: sets `animState('scribbling')` → after 380ms sets `factIndex` + `animState('writing')` → after 900ms sets `animState('idle')`.

**Result:** No changes needed — NotebookFacts verified, no edits made.

---

## TASK 2 — ArchiveSection.tsx: teaser field wired

### Data flow traced

- `page.tsx` previously had no query for past published issues — the archive section used hardcoded static data.
- `HomePageClient.tsx` called `<ArchiveSection />` with zero props.
- `database.ts` issues Row has `teaser: string | null` (confirmed) but no `category` column — category lives on `stories`.

### Files changed

**`src/components/ArchiveSection.tsx`**
- Removed hardcoded `ARCHIVE_ITEMS` constant, `daysAgo()` helper, `CATEGORY_PILL` map, and `getCatPill()` (issues table has no `category` column — kept schema-accurate, no phantom fields)
- Added exported `ArchiveIssue` interface: `id`, `issue_number`, `slug`, `published_at`, `teaser` (all match `database.ts` issues Row exactly)
- Added `ArchiveSectionProps { issues?: ArchiveIssue[] }` — optional so component renders empty gracefully
- Added `formatPublishedAt()` helper for date display
- Cards now iterate live `issues` data; headline shows `Signal #N`, date from `published_at`
- Teaser rendered conditionally below headline: `{issue.teaser && (<p style={{fontFamily: 'var(--ff-body)', fontSize: 13.5, ...}}>)}`
- `className="reveal"` on `<article>` preserved for scroll-reveal observer in HomePageClient

**`src/components/HomePageClient.tsx`**
- Line 11: added `type ArchiveIssue` to import from ArchiveSection
- Line 30: added `archiveIssues?: ArchiveIssue[]` to `HomePageClientProps`
- Line 82: destructured `archiveIssues` from props
- Line 150: `<ArchiveSection issues={archiveIssues} />`

**`src/app/page.tsx`**
- Added archive fetch after teasers query: `.select('id, issue_number, slug, published_at, teaser')`, status=published, excludes current issue, ordered desc by published_at, limit 3
- Maps to `ArchiveIssue[]` shape and passes as `archiveIssues` prop to `<HomePageClient />`

### Typecheck

NOTE: Bash execution requires user permission. All types are derived from `database.ts` canonical source — no `any`, no unsafe casts. `ArchiveIssue` fields all present in `Database['public']['Tables']['issues']['Row']`. Run `npx tsc --noEmit` from `/Users/surajpandita/ai_signal/` to confirm. Expected: 0 errors.
