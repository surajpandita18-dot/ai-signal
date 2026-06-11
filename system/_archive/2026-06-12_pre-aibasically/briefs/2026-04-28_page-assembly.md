# Brief: Page assembly — wire everything into page.tsx

**Date:** 2026-04-28  
**Agent:** FORGE  
**File to edit:** `src/app/page.tsx`

**Depends on:** All other 2026-04-28 briefs completing first — SiteNav, HeroZone, NotebookFacts, StoryArticle, ReadingSidebar, TheWire, ArchiveSection, SubscribeSection, SiteFooter must exist.

---

## DO NOT
- Touch any component file
- Change the Supabase data fetching logic (keep all 4 states A/B/C/D)
- Add new npm dependencies
- Use `any` types

---

## What changes

The current page.tsx uses `SiteShell` (old component). The new page.tsx should:
1. Remove `SiteShell` wrapper
2. Add a scroll-progress bar (client component) at top
3. Keep exact Supabase data fetching logic
4. Use new components for State A (active signal) — full rich page
5. Keep States B/C/D using new SiteNav + simple layouts

---

## New page structure for State A (active signal)

State A renders the full v8 design. Create a `'use client'` wrapper `HomePageClient` in this file (not a separate file) that holds scroll state:

```tsx
'use client'
function HomePageClient({ story, publishedAt, signalNumber }: {
  story: StoryType
  publishedAt: string
  signalNumber: number
}) {
  const [readPct, setReadPct] = useState(0)

  return (
    <>
      <ProgressBar pct={readPct} />
      <SiteNav signalNumber={signalNumber} />
      <HeroZone />
      <NotebookFacts />
      
      {/* Main grid: article + sidebar */}
      <div style={{
        maxWidth: 1280, margin: '60px auto 0', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '1fr 280px', gap: 56,
        alignItems: 'start',
      }}>
        <StoryArticle
          story={story}
          publishedAt={publishedAt}
          signalNumber={signalNumber}
          onReadPctChange={setReadPct}
        />
        <ReadingSidebar readPct={readPct} signalNumber={signalNumber} />
      </div>
      
      <TheWire />
      <ArchiveSection />
      <SubscribeSection />
      <SiteFooter />
      
      <RevealObserver />
    </>
  )
}
```

`ProgressBar` — simple inline client component:
```tsx
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: 3, zIndex: 100,
      width: `${pct}%`,
      background: 'linear-gradient(90deg, #2B5BFF, #FF6B35)',
      transition: 'width 0.1s linear',
    }} />
  )
}
```

`RevealObserver` — client component that sets up IntersectionObserver for `.reveal` elements:
```tsx
'use client'
function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
```

---

## State B layout (expired signal)

Replace old `SiteShell` + `SignalExpired` with:
```tsx
<>
  <SiteNav />
  <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
    <SignalExpired ... />
    <SubscribeInput ... />
  </div>
  <SiteFooter />
</>
```

## State C layout (no signal yet)

```tsx
<>
  <SiteNav />
  <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
    <p style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:500, letterSpacing:'0.08em',
      textTransform:'uppercase', color:'var(--text-mute)', marginBottom:32 }}>
      First signal coming soon.
    </p>
    <SubscribeInput label="Be first when we launch." />
  </div>
  <SiteFooter />
</>
```

## State D layout (no_signal day)

```tsx
<>
  <SiteNav />
  <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
    <p style={{ fontFamily:'var(--ff-mono)', fontSize:11, fontWeight:500, letterSpacing:'0.08em',
      textTransform:'uppercase', color:'var(--text-mute)', marginBottom:16 }}>
      No signal today.
    </p>
    {issue.editor_note && (
      <p style={{ fontSize:15, lineHeight:1.6 }}>{issue.editor_note}</p>
    )}
  </div>
  <SiteFooter />
</>
```

---

## Dev mode fallback (no Supabase credentials)

```tsx
<>
  <SiteNav />
  <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
    <p style={{ fontFamily:'var(--ff-mono)', fontSize:11, color:'var(--text-mute)' }}>
      Dev mode — no Supabase credentials. Copy .env.local.example → .env.local.
    </p>
  </div>
  <SiteFooter />
</>
```

---

## Imports needed at top of page.tsx

```ts
import { SiteNav } from '@/components/SiteNav'
import { HeroZone } from '@/components/HeroZone'
import { NotebookFacts } from '@/components/NotebookFacts'
import { StoryArticle } from '@/components/StoryArticle'
import { ReadingSidebar } from '@/components/ReadingSidebar'
import { TheWire } from '@/components/TheWire'
import { ArchiveSection } from '@/components/ArchiveSection'
import { SubscribeSection } from '@/components/SubscribeSection'
import { SiteFooter } from '@/components/SiteFooter'
// keep existing:
import { SignalExpired } from '@/components/SignalExpired'
import { SubscribeInput } from '@/components/SubscribeInput'
import { isWithin24h } from '@/lib/utils'
import { createServerSupabaseClient } from '@/lib/supabase-server'
```

Also add the type import for Story:
```ts
import type { Database } from '@/db/types/database'
type StoryType = Database['public']['Tables']['stories']['Row']
```

---

## Notes on server vs client

`page.tsx` is a server component. `HomePageClient` is defined in the same file with `'use client'` directive. In Next.js 14 app router this is fine — client components can be defined in the same file as server-only logic, BUT you must ensure that file-level `'use client'` is NOT at the top. Keep the file as a server component.

Actually — the cleanest approach: `HomePageClient` should be in its own file `src/components/HomePageClient.tsx` with `'use client'`. Then page.tsx remains a pure server component and just passes data to HomePageClient.

Create `src/components/HomePageClient.tsx`:
```ts
'use client'
import { useState, useEffect } from 'react'
// ... all client imports
// props: story, publishedAt, signalNumber
// contains: ProgressBar, RevealObserver, full layout
```

Then page.tsx just:
```tsx
import { HomePageClient } from '@/components/HomePageClient'
// ...
return <HomePageClient story={story} publishedAt={...} signalNumber={...} />
```

---

## Acceptance criteria
- `npx tsc --noEmit` passes, no `any`
- All 4 states render without crashing
- State A shows: SiteNav → HeroZone → NotebookFacts → [article+sidebar grid] → TheWire → ArchiveSection → SubscribeSection → SiteFooter
- Progress bar fills as user scrolls
- `.reveal` elements animate in on scroll

## Log file
Write to `/src/IMPLEMENTATION_LOG_assembly.md`
