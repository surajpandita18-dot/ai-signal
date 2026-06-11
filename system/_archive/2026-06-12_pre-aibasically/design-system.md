# AI Signal — Design System v2

Derived from `design/references/ai-signal-v8.html`. This is the canonical reference. VEIL audits against it, FORGE implements from it.

## References (ranked)

0. **`ai-signal-v8.html`** — primary reference. Extract every token, pattern, and rhythm from it.
1. The Pragmatic Engineer — editorial typography, generous whitespace
2. Stratechery — content-first hierarchy
3. Bloomberg Terminal — time-stamped authority, information density
4. Linear changelog — soft surfaces, confident type

Do not reference: Substack, neon dark mode, AI-startup tropes, emoji headers, brutalism.

---

## Color system

All tokens are defined in `globals.css` `:root`. Dark mode is deferred — light-first.

### Core backgrounds

```
--bg:        #FAFAF7   (page background — warm off-white)
--bg-card:   #FFFFFF   (card/surface background)
--bg-soft:   #F4F2EC   (section fill, quote backgrounds)
--bg-warm:   #FBF8F1   (wire/broadsheet background)
--hero-bg:   #F6F7FB   (hero zone tint)
```

### Text

```
--text:       #14110F   (near-black, primary)
--text-soft:  #2D2A26   (body copy)
--text-mute:  #5C574F   (labels, metadata)
--text-faint: #8A847A   (disabled, decorative)
```

### Signal (primary brand — blue)

```
--signal:       #2B5BFF
--signal-deep:  #1F44CC
--signal-soft:  #E5EBFF
--signal-faint: #F4F6FF
```

### Warm (secondary accent — orange)

```
--warm:       #FF6B35
--warm-soft:  #FFE8DD
```

### Category colors

```
--green:        #1B7A3E   --green-soft:   #E0F2E5   (research / tools)
--money:        #16A34A   --money-soft:   #DCFCE7   (business)
--water:        #0EA5E9   --water-soft:   #E0F2FE   (policy)
--energy:       #CA8A04   --energy-soft:  #FEF9C3   (models / analysis)
--rocket:       #EA580C   --rocket-soft:  #FFEDD5   (tools / launch)
```

### Paper / notebook

```
--paper:       #FFF8DC
--paper-line:  #E8D88A
--ink-pen:     #2B4A8F
--beige:       #F0E9D8
--beige-deep:  #E5DCC4
```

### Borders

```
--border:        #E5E2D9   (primary borders)
--border-mid:    #D6D2C5   (section dividers)
--border-strong: #B8B3A3   (emphasized borders)
```

### Category chip mapping

| Category  | Background        | Text               |
|-----------|-------------------|--------------------|
| models    | `--signal-soft`   | `--signal-deep`    |
| tools     | `--warm-soft`     | `--warm`           |
| business  | `--money-soft`    | `--money`          |
| policy    | `--water-soft`    | `--water`          |
| research  | `--energy-soft`   | `--energy`         |

---

## Typography

### Fonts

| Variable       | Font             | Use                              |
|----------------|------------------|----------------------------------|
| `--ff-display` | Instrument Serif | Story headlines, editorial quotes, display text |
| `--ff-body`    | Inter            | All body copy, UI text           |
| `--ff-mono`    | JetBrains Mono   | Labels, metadata, category chips, mono UI |
| `--ff-hand`    | Caveat           | Notebook/annotation elements only |
| `--ff-fraunces`| Fraunces         | Dispatch/wire text               |

All loaded via `next/font/google`. CSS vars set on `<html>` via `layout.tsx`.

### Scale

```
10px   — meta labels, timestamps, badges
11px   — category chips, eyebrows (mono uppercase)
12px   — chip text, sub-meta
13px   — secondary UI, small body
14px   — meta text, author info
15px   — small body copy
17px   — default body (html/body base)
18px   — context body
19px   — story deck/summary
24px   — editorial quotes
30px   — block titles (display)
clamp(34px, 4.6vw, 52px)  — story headline
clamp(54px, 8.4vw, 116px) — hero display headline
```

---

## Spacing

Base unit: 8px. All spacing multiples of 8.

```
Card padding:         48px  (story-wrap)
Section gap:          40px
Block gap:            28–32px
Paragraph gap:        16px
Meta row gap:         12px
Card border-radius:   20px  (story card), 12–14px (inner blocks), 6px (chips)
Max content width:    1280px (wire/main grid)
Story wrap max-width: 680px–900px (in a grid with sidebar, or full-width solo)
Page horizontal pad:  32px desktop, 20px mobile
```

---

## Effects

Gradients, shadows, and effects from the reference are **encouraged** in the right contexts.

### Allowed

- **Hero zone**: radial-gradient blobs (signal blue + warm orange, very subtle opacity 0.04–0.10)
- **Story card**: multi-layer box-shadow `0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)`
- **Signal block** (why-it-matters): `linear-gradient(135deg, var(--signal-faint), var(--bg-card))`
- **Builder block**: dark gradient with signal radial glow
- **Wire shell**: `repeating-linear-gradient` paper lines + grain texture
- **Backdrop blur on nav**: `backdrop-filter: blur(12px)`, `background: rgba(250, 250, 247, 0.85)`
- **Category chips**: solid background fill (soft tint)
- **Stat cards hover**: `box-shadow: 0 6px 18px rgba(0,0,0,0.06)`
- **Progress bar**: `linear-gradient(90deg, var(--signal), var(--warm))`

### Not allowed

- Neon glow effects (no bright purple/teal/pink)
- `text-shadow` except for `.big-headline:hover .ital` (reference-specific)
- `transition: all` — always target specific properties
- Emoji in production UI

---

## Interaction and Motion

### Animations (globals.css)

```
livePulse     — 1.4–1.8s ease-in-out infinite, opacity+scale — live dot only
paperSway     — 6s ease-in-out infinite, rotate+translateY — notebook only
writeIn       — 0.9s cubic-bezier, clip-path reveal — notebook fact text
dispatchIn    — 0.7s cubic-bezier, translateY+opacity — new wire dispatch
numFlash      — 1s ease-out, color flash — numeric delta
fadeUp / anim — 0.8s cubic-bezier — entrance animations (.anim .d1-d4)
timerHand     — 8s linear infinite — timer clock icon
blink         — 1s ease-in-out infinite — clock separator
```

### Hover patterns

- Source cards: `border-color → var(--signal)`, `background → var(--signal-faint)`, `0.2s`
- Story card: `transform: translateY(-3px)`, `border-color → var(--border-mid)`, `0.25s`
- Stat cards: `translateY(-3px)`, `box-shadow`, `0.25s`
- Nav links: `color → var(--text)`, `0.2s`
- Share buttons: `translateY(-1px)`, `border-color → var(--text)`, `0.2s`

### Focus

`outline: 2px solid var(--signal)`, `outline-offset: 2px` — NOT box-shadow.

---

## Component surfaces

### Nav (SiteShell)

- Position: sticky, top: 3px, z-index: 60
- Background: `rgba(250, 250, 247, 0.85)` + `backdrop-filter: blur(12px)`
- Border-bottom: `1px solid var(--border)`
- Mark icon: 28px dark square with warm pulse dot (`.mark-icon::after` pattern)
- Right side: date/issue meta + subscribe CTA link

### Hero zone

- Full-width section above wire
- Radial gradient blobs (subtle signal blue + warm)
- Large Instrument Serif headline with italic signal-colored accent word
- Eyebrow pill: white card, mono text, warm pulse pip

### Story card (`.story-wrap`)

- `background: var(--bg-card)`, border-radius 20px, padding 48px
- Box-shadow: `0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)`
- Meta row: category chip + read-time + expiry timer
- Headline: Instrument Serif, clamp(34px–52px), line-height 1.06
- Deck: 19px Inter, text-soft
- Signal block: signal blue gradient + 4px left border
- Lens sections: 3-col grid, bg-soft backgrounds
- Deeper read: editorial quote block, large italic quote glyph
- Sources: stacked link cards, hover to signal-faint

### Wire / broadsheet

- Paper-lined background (`repeating-linear-gradient` + grain noise)
- Masthead: Fraunces italic + mono sub-labels + live indicator
- Dispatches: timestamp | dateline | text | delta badge grid layout

### SubscribeInput

- Single line input + button, max-width 480px
- Focus ring: 2px solid `--signal`, 2px offset
- No shadow in default state

### ExpiryBadge

- Font-mono, 11px, uppercase
- Updates every 60s (minutes precision)
- `role="status"` for accessibility

---

## What never appears

- Neon/vivid glow effects not in the reference
- `transition: all`
- Emoji in production UI
- Hard-coded hex values in components — always use CSS variables
- `any` TypeScript casts
