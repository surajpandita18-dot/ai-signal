# Brief: UX fixes, mobile responsiveness, routing, TheWire IST clock

**Date:** 2026-04-28  
**Agent:** FORGE  
**Files to edit/create:**
- `src/components/SubscribeSection.tsx` — add id="subscribe"
- `src/components/ArchiveSection.tsx` — wrap cards in Link, dynamic dates
- `src/components/TheWire.tsx` — fix clock to IST
- `src/components/HomePageClient.tsx` — mobile responsive main grid
- `src/components/SiteNav.tsx` — minor fixes
- `src/app/archive/page.tsx` (CREATE NEW) — gate placeholder
- `src/app/globals.css` — add mobile breakpoint utilities

---

## DO NOT
- Touch StoryArticle.tsx, ReadingSidebar.tsx, NotebookFacts.tsx
- Touch page.tsx, layout.tsx, tailwind.config.ts
- Add npm dependencies
- Use `any` types

---

## 1. SubscribeSection.tsx

Add `id="subscribe"` to the outer `<section>` element so the nav Subscribe → anchor works.

Find the outer section element and add the id:
```tsx
<section id="subscribe" style={{ maxWidth:1280, ...
```

---

## 2. ArchiveSection.tsx

### Fix 1: Make cards clickable Links
Import `Link` from `next/link`. Wrap each `<article>` in a `<Link href="/archive">` so the whole card is clickable.

```tsx
import Link from 'next/link'
// ...
<Link href="/archive" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
  <article style={{ ... /* existing card styles */ }}>
    ...
  </article>
</Link>
```

### Fix 2: Add hover lift effect via inline style state
Since this is a server component, use a `<style>` tag for hover:
```tsx
<style>{`
  .archive-card-link:hover article {
    transform: translateY(-3px);
    border-color: var(--border-mid);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
  .archive-card-link article {
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }
`}</style>
```
Add `className="archive-card-link"` to each Link wrapper.

### Fix 3: Dynamic dates
Replace the hardcoded "26 April", "25 April", "24 April" with relative dates from today. Since this is a server component, calculate them at render time:
```tsx
// At top of component
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

// Use: daysAgo(1), daysAgo(2), daysAgo(3)
```

### Fix 4: Mobile responsive grid
The 3-col grid needs to collapse. Add to the inline `<style>`:
```css
@media (max-width: 880px) {
  .archive-grid { grid-template-columns: 1fr !important; }
}
```
Add `className="archive-grid"` to the cards container div.

---

## 3. TheWire.tsx

### Fix: Clock shows IST (UTC+5:30), not local time

Replace the clock tick function:
```ts
const tick = () => {
  const now = new Date()
  // Convert to IST: UTC + 5h30m
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  setClockStr(`${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())}`)
}
```

Also update the dateline in the masthead to show today's actual date:
```tsx
// Replace hardcoded "27 April 2026" with:
// At top of component (outside useEffect):
const todayIST = (() => {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000)
  return ist.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})()
// Use {todayIST} in the dateline span
```

### Fix: Mobile responsive wire
Add to the inline `<style>` tag:
```css
@media (max-width: 880px) {
  .wire-dispatch-row {
    grid-template-columns: auto 1fr auto !important;
    grid-template-rows: auto auto;
    gap: 10px 14px;
    padding: 16px 18px !important;
  }
  .wire-dispatch-row .dispatch-meta { grid-row: 1; grid-column: 1; }
  .wire-dispatch-row .dispatch-loc { grid-row: 1; grid-column: 2; align-self: center; }
  .wire-dispatch-row .dispatch-delta-badge { grid-row: 1; grid-column: 3; align-self: center; }
  .wire-dispatch-row .dispatch-body { grid-row: 2; grid-column: 1 / -1; }
  .wire-header-grid {
    grid-template-columns: 1fr !important;
    gap: 12px;
    text-align: center;
  }
  .wire-zone-wrap { padding: 0 16px !important; margin-top: 48px !important; }
}
```

Add appropriate classNames to the WireDispatch sub-component elements and the outer section.

---

## 4. HomePageClient.tsx

### Fix: Responsive main grid
The `gridTemplateColumns: '1fr 280px'` breaks on mobile. Add a responsive wrapper via inline `<style>`:

```tsx
// Add inside HomePageClient return, before other elements:
<style>{`
  .main-article-grid {
    max-width: 1280px;
    margin: 60px auto 0;
    padding: 0 32px;
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 56px;
    align-items: start;
  }
  @media (max-width: 1080px) {
    .main-article-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    .main-article-grid aside {
      position: static !important;
    }
  }
  @media (max-width: 640px) {
    .main-article-grid {
      padding: 0 16px;
      margin-top: 40px;
    }
  }
`}</style>
```

Replace the inline `style={{ gridTemplateColumns... }}` div with:
```tsx
<div className="main-article-grid">
  <StoryArticle ... />
  <ReadingSidebar ... />
</div>
```

---

## 5. SiteNav.tsx

### Fix: Add `suppressHydrationWarning` concern
The `useEffect` scroll listener is fine. No change needed here unless you spot an issue.

### Fix: Nav padding on mobile
Add to a `<style>` tag:
```css
@media (max-width: 640px) {
  .site-nav-inner { padding: 14px 16px !important; }
  .site-nav-inner .nav-links a:not(.nav-cta) { display: none; }
}
```
Add `className="site-nav-inner"` to the `<header>` and `className="nav-links"` to the nav, `className="nav-cta"` to the Subscribe link.

---

## 6. NEW: src/app/archive/page.tsx

Create a minimal placeholder (not gated yet — Phase 5 adds auth gate):

```tsx
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SubscribeSection } from '@/components/SubscribeSection'

export const metadata = {
  title: 'Archive — AI Signal',
  description: 'All past signals. Subscribe to access.',
}

export default function ArchivePage() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 720, margin: '80px auto 0', padding: '0 32px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(36px,5vw,56px)',
          lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', marginBottom: 16 }}>
          Past <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>transmissions</em>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text-mute)', marginBottom: 48 }}>
          The full archive is available to subscribers. Subscribe below to unlock every signal from day one.
        </p>
        <div style={{ padding: '28px 0', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)', marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--signal)',
            marginBottom: 12 }}>Coming in Phase 5</p>
          <p style={{ fontSize: 15, color: 'var(--text-mute)', lineHeight: 1.6 }}>
            Subscriber-only archive with full signal history, streak counter, and search.{' '}
            <Link href="/" style={{ color: 'var(--signal)', textDecoration: 'none',
              borderBottom: '1px solid var(--signal-soft)' }}>
              ← Back to today's signal
            </Link>
          </p>
        </div>
      </main>
      <SubscribeSection />
      <SiteFooter />
    </>
  )
}
```

---

## 7. globals.css — add mobile utility

At the end of globals.css, add:
```css
@media (max-width: 640px) {
  html, body { font-size: 15px; }
}
```

---

## Acceptance criteria
- `npx tsc --noEmit` passes, zero errors
- Archive cards are clickable Links
- `/archive` route exists and renders
- Subscribe → nav anchor scrolls to SubscribeSection
- TheWire clock shows IST time
- TheWire dateline shows today's actual date
- Mobile: main grid collapses to 1 col at ≤1080px
- Mobile: nav collapses to just Subscribe CTA at ≤640px

## Log file
Write to `/src/IMPLEMENTATION_LOG_ux.md`
