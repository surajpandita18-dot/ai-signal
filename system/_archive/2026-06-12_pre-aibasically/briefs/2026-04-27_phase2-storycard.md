# Brief — Phase 2: Next.js scaffold + StoryCard component

**Assigned to:** FORGE (/src/)
**Date:** 2026-04-27
**Phase:** 2 of 7

---

## Task

Bootstrap the Next.js 14 app router project and build the StoryCard component in both collapsed and expanded states. This is the core UI component — it must be exceptional. All other pages in later phases compose from it.

---

## Files to create

```
package.json
tsconfig.json
next.config.ts
postcss.config.mjs
tailwind.config.ts
.env.local.example
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx              (temp — renders one StoryCard with seed data hardcoded)
src/components/StoryCard.tsx
src/components/StoryCard.test.tsx   (manual render test, no Jest needed — just a demo page)
src/lib/supabase.ts
src/lib/fonts.ts
/src/IMPLEMENTATION_LOG.md
```

---

## Scaffold requirements

**package.json dependencies (exact — no extras):**
- next: 14.x
- react: 18.x
- react-dom: 18.x
- @supabase/supabase-js: 2.x
- typescript: 5.x
- tailwindcss: 3.x
- autoprefixer: latest
- postcss: latest
- @types/react: 18.x
- @types/react-dom: 18.x
- @types/node: 20.x

**tsconfig.json:** strict mode, paths alias `@/*` → `./src/*`

**next.config.ts:** minimal. No experimental flags.

---

## Fonts (src/lib/fonts.ts)

```typescript
import { Source_Serif_4, Inter } from 'next/font/google'

export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
```

Apply both variables to `<html>` in layout.tsx.

---

## Colour tokens (src/app/globals.css)

Define as CSS custom properties on `:root` and `[data-theme="dark"]`:

```css
:root {
  --bg:           #FAFAF7;
  --bg-card:      #F3F0E8;
  --text-1:       #1A1A1A;
  --text-2:       #4A4A4A;
  --text-3:       #9A9590;
  --accent:       #8B7355;
  --accent-border: rgba(139, 115, 85, 0.4);
  --border:       #E8E4DC;
  --font-serif:   var(--font-serif);
  --font-sans:    var(--font-sans);
}

[data-theme="dark"] {
  --bg:           #0F0F0E;
  --bg-card:      #1A1A18;
  --text-1:       #F0EDE6;
  --text-2:       #9A9590;
  --text-3:       #5A5550;
  --accent:       #C4A882;
  --accent-border: rgba(196, 168, 130, 0.4);
  --border:       #2A2A28;
}
```

Also set: `box-sizing: border-box`, `max-width: 720px` centred container class, `font-family: var(--font-sans)` on body.

---

## StoryCard component (src/components/StoryCard.tsx)

**Props:**
```typescript
interface StoryCardProps {
  story: Story                    // from /db/types/database.ts
  userRole?: SubscriberRole       // highlights the matching lens
  position: number                // 1-indexed, displayed as 01, 02...
}
```

**Collapsed state (default):**

```
[01]  MODELS  · 3 min
GPT-5 Mini cuts API costs by 10x...         ← serif 22px, weight 600, max 2 lines
Summary text here, 2–3 sentences.           ← sans 15px

┌─────────────────────────────────────────┐
│ WHY IT MATTERS                          │  ← accent left-border 3px, bg-card + 8%
│ The strongest sentence on the card...   │  ← sans 15px
└─────────────────────────────────────────┘

                              [Go deeper ↓]   ← outlined button, right-aligned
```

**Expanded state (after click):**

```
[collapsed content stays visible]

── For PMs ────────────────────────────────  ← lens grid, 3 columns on desktop
   lens_pm text (2 lines max)
── For Founders ───────────────────────────
   lens_founder text
── For Builders ───────────────────────────
   lens_builder text

The deeper read                              ← label, serif italic
Full deeper_read paragraph...               ← serif 15px, line-height 1.7

Sources                                      ← label
• The Rundown AI ↗   • OpenAI pricing ↗     ← mono small, external link

                              [Collapse ↑]   ← same button, text changes
```

**Interaction:**
- Toggle is `useState(false)` — client component (`'use client'`)
- Expand/collapse: animate with `max-height` transition or CSS grid `grid-template-rows: 0fr` → `1fr`, `150ms ease`
- No layout shift — use `overflow: hidden` on the expanding container
- Keyboard: `Enter` and `Space` on the button trigger toggle

**Lens highlighting:**
- If `userRole` matches a lens, that lens column gets `font-weight: 600` and a slightly stronger border. The other two lenses remain visible at normal weight.
- If `userRole` is undefined, all three lenses render at normal weight.

---

## Supabase client (src/lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../db/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

Also export a `createServerClient` for server components using `process.env.SUPABASE_SERVICE_ROLE_KEY` — this key never goes to the browser.

---

## Temp page (src/app/page.tsx)

Renders two StoryCards with hardcoded seed data (copy from /db/seed.sql) so the component can be visually verified without a live database. One card collapsed (default), one with `userRole="pm"` so the lens highlight is visible. Mark with a comment: `// TEMP — replaced in Phase 3`.

---

## .env.local.example

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Acceptance criteria

- [ ] `npm run dev` starts without errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] StoryCard renders in both states with seed data
- [ ] Expand/collapse transition is smooth, no layout shift
- [ ] Dark mode: toggle `data-theme="dark"` on `<html>` and all colours flip correctly
- [ ] Lens highlight works when `userRole="pm"` is passed
- [ ] Max content width 720px respected
- [ ] No `any` types, no `transition: all`
- [ ] IMPLEMENTATION_LOG.md written

---

## Do NOT

- Do not add any npm dependencies beyond the list above
- Do not use Tailwind for colours — use CSS custom properties from globals.css only
- Do not add Storybook, Jest, Playwright, or any test infrastructure
- Do not connect to Supabase — temp page uses hardcoded data
- Do not add any page other than the temp homepage
- Do not add navigation, header, or footer — those come in Phase 3/4
- Do not add dark mode toggle UI — apply `data-theme="dark"` manually in layout.tsx for dev verification, remove before committing
- Do not add any animation beyond the expand/collapse transition
