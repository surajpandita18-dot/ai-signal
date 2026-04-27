# AI Signal — Design System

Extracted from PRD section 5. This is the canonical reference VEIL audits against and FORGE implements from.

## References (ranked)

1. The Pragmatic Engineer — clean editorial typography, generous whitespace
2. Stratechery — restraint, black/white/one accent
3. Are.na — modular, library-feel
4. Linear blog/changelog — soft surfaces, confident hierarchy

Do not reference: Substack, gradient SaaS, neon dark mode, AI-startup tropes, emoji headers, brutalism.

---

## Colour system

Three colours total. No gradients. No shadows except subtle focus rings.

### Light mode

```
background:       #FAFAF7  (warm off-white)
text-primary:     #1A1A1A  (near-black)
text-secondary:   #4A4A4A  (dark grey)
accent:           #8B7355  (warm muted brown — used for 'why it matters' block only)
border:           #E8E4DC  (soft warm grey)
card-bg:          #F3F0E8  (slightly warmer than background)
```

### Dark mode

```
background:       #0F0F0E  (soft black)
text-primary:     #F0EDE6  (warm off-white)
text-secondary:   #9A9590  (warm mid-grey)
accent:           #C4A882  (shifted warm accent)
border:           #2A2A28  (dark warm grey)
card-bg:          #1A1A18  (slightly lighter than background)
```

**Rule:** Accent is used exclusively for the 'why it matters' block background and left-border. Never use accent for headings, buttons, or navigation.

---

## Typography

### Fonts

- **Headings** (H1, H2, H3, story headlines): Source Serif 4 — loaded via `next/font/google`
- **Body and UI:** Inter — loaded via `next/font/google`
- **Mono** (source labels, metadata): system-ui monospace. Sparingly.

### Scale

```
text-xs:    11px  (metadata, labels)
text-sm:    13px  (secondary UI)
text-base:  15px  (body copy, summary text)
text-lg:    17px  (subheadings)
text-xl:    20px  (section headers)
text-2xl:   24px  (issue title, H2)
text-3xl:   30px  (H1, page title)
headline:   22px  (story card headline — serif, line-height 1.3, max 2 lines)
```

### Weights

- Headings: 600–700
- Body: 400
- Labels/metadata: 500, uppercase, letter-spacing 0.06em

---

## Spacing

Base unit: 8px. All spacing is multiples of 8.

- Paragraph gap: 16px (2 units)
- Section gap: 40px (5 units)
- Story card padding: 24px (3 units)
- Story card gap between cards: 32px (4 units)
- Max content width: 720px (centred)
- Horizontal page padding: 24px mobile, 48px desktop

---

## Interaction

- Expand/collapse is the only interactive primitive on issue pages
- Transition: `150ms ease` targeted — never `transition: all`
- No layout shift on expand — use `overflow: hidden` + CSS `grid-template-rows` animation or `max-height` with known max
- Subscribe: single text input. No modals, no popups, no exit intents.
- Focus rings: `2px solid accent` with `2px offset`

---

## Component surface rules

### Story card (collapsed)

- White/card-bg background, subtle border
- Serif headline at 22px, line-height 1.3
- 'Why it matters' block: card-bg darkened slightly, left-border 3px accent, padding 12px
- 'Go deeper' button: outlined, secondary, no fill

### Story card (expanded)

- Three-lens grid: For PMs / For Founders / For Builders
- User's role highlighted (slightly bolder border)
- 'The deeper read' paragraph: serif, 15px, generous line-height 1.7
- Sources: monospace labels, small, with external link icon

### Subscribe input

- Full-width on mobile, max 480px on desktop
- Single email input + submit button on one line
- No placeholder text beyond "your@email.com"

---

## What never appears

- Gradients of any kind
- Box shadows (except 0 0 0 2px focus rings)
- border-radius above 6px on cards (4px is preferred)
- Any colour not in the colour system above
- More than one accent colour
- Animation beyond expand/collapse and focus transitions
