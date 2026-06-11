# Brief: Foundation — Design Tokens, Fonts, Tailwind

**Date:** 2026-04-28  
**Agent:** FORGE  
**Files to edit (all 3 existing files, no new files):**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `tailwind.config.ts`

---

## Task

The project is switching to a new design system based on the HTML reference at `design/references/ai-signal-v8.html`. You must update the three foundation files so all new components can use the correct tokens, fonts, and Tailwind classes.

**DO NOT** touch any file in `/src/components/`, `/src/app/page.tsx`, or `/db/`.

---

## 1. `src/app/layout.tsx`

Replace the font imports with 5 Google Fonts:

```ts
import { Inter, Fraunces, Instrument_Serif, JetBrains_Mono, Caveat } from 'next/font/google'
```

Config each:
```ts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  weight: ['500', '600', '700'],
  display: 'swap',
})
```

Apply all variables to the `<html>` tag:
```tsx
<html lang="en" className={`${inter.variable} ${fraunces.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${caveat.variable}`} suppressHydrationWarning>
```

Remove the dark mode localStorage script (the new design is light-only — no `.dark` class needed). Keep `<body>{children}</body>`.

Update metadata:
```ts
export const metadata: Metadata = {
  title: 'AI Signal — One story. Every day. Gone in 24 hours.',
  description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
}
```

---

## 2. `src/app/globals.css`

Replace the entire file with this content. Preserve `@tailwind base/components/utilities` at top.

### CSS variables (`:root` only — no `.dark`):
```css
:root {
  --bg: #FAFAF7;
  --bg-card: #FFFFFF;
  --bg-soft: #F4F2EC;
  --bg-warm: #FBF8F1;
  --hero-bg: #F6F7FB;
  --text: #14110F;
  --text-soft: #2D2A26;
  --text-mute: #5C574F;
  --text-faint: #8A847A;
  --signal: #2B5BFF;
  --signal-deep: #1F44CC;
  --signal-soft: #E5EBFF;
  --signal-faint: #F4F6FF;
  --warm: #FF6B35;
  --warm-soft: #FFE8DD;
  --green: #1B7A3E;
  --green-soft: #E0F2E5;
  --money: #16A34A;
  --money-soft: #DCFCE7;
  --beige: #F0E9D8;
  --beige-deep: #E5DCC4;
  --border: #E5E2D9;
  --border-mid: #D6D2C5;
  --border-strong: #B8B3A3;
  --paper: #FFF8DC;
  --paper-line: #E8D88A;
  --ink-pen: #2B4A8F;
  --ff-display: var(--font-display), 'Georgia', serif;
  --ff-fraunces: var(--font-fraunces), 'Georgia', serif;
  --ff-body: var(--font-inter), system-ui, sans-serif;
  --ff-mono: var(--font-mono), ui-monospace, monospace;
  --ff-hand: var(--font-hand), cursive;
}
```

### Base reset + html/body:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--ff-body);
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  letter-spacing: -0.005em;
}
```

### Animation keyframes (add all of these):
```css
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

@keyframes paperSway {
  0%, 100% { transform: rotate(-0.4deg) translateY(0); }
  25% { transform: rotate(-0.2deg) translateY(-1px); }
  50% { transform: rotate(0.1deg) translateY(0); }
  75% { transform: rotate(-0.1deg) translateY(1px); }
}

@keyframes writeIn {
  from { clip-path: inset(0 100% 0 0); opacity: 0; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
}

@keyframes scribble {
  to { width: 100%; }
}

@keyframes dispatchIn {
  from { opacity: 0; transform: translateY(-6px); background: rgba(255, 107, 53, 0.10); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes numFlash {
  0% { color: #FF8A5C; text-shadow: 0 0 12px rgba(255, 107, 53, 0.4); }
  100% { color: var(--warm); text-shadow: none; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes timerHand {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### Utility classes:
```css
.anim { opacity: 0; animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.d1 { animation-delay: 0.05s; }
.d2 { animation-delay: 0.15s; }
.d3 { animation-delay: 0.3s; }
.d4 { animation-delay: 0.45s; }

.reveal { opacity: 0; transform: translateY(20px); transition: all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
.reveal.in { opacity: 1; transform: translateY(0); }
```

---

## 3. `tailwind.config.ts`

Replace `extend` section:

```ts
extend: {
  colors: {
    signal: {
      DEFAULT: '#2B5BFF',
      deep: '#1F44CC',
      soft: '#E5EBFF',
      faint: '#F4F6FF',
    },
    warm: {
      DEFAULT: '#FF6B35',
      soft: '#FFE8DD',
    },
    green: {
      DEFAULT: '#1B7A3E',
      soft: '#E0F2E5',
    },
    ink: '#2B4A8F',
    beige: {
      DEFAULT: '#F0E9D8',
      deep: '#E5DCC4',
    },
  },
  fontFamily: {
    display: ['var(--font-display)', 'Georgia', 'serif'],
    fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
    sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
    hand: ['var(--font-hand)', 'cursive'],
  },
  maxWidth: {
    content: '720px',
    wire: '1280px',
  },
},
```

Keep `darkMode: 'class'` and `content` as-is.

---

## Acceptance criteria
- `npx tsc --noEmit` passes with zero errors
- All 5 font CSS variables (`--font-inter`, `--font-fraunces`, `--font-display`, `--font-mono`, `--font-hand`) are present on `<html>`
- All animation keyframes are defined in globals.css
- No existing component breaks (they still reference old `--text-primary`, `--text-secondary` etc — that's OK, those can be left as-is or aliased: add `--text-primary: var(--text); --text-secondary: var(--text-mute);` to :root for backwards compat)

## Log file
Write to `/src/IMPLEMENTATION_LOG_foundation.md`
