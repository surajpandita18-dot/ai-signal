# AI Signal — Design Rules & Mobile Standards

> Reference this before any UI/CSS change. These rules exist because of real user feedback — don't undo them.

---

## 1. Screen-edge breathing room

**Rule:** No card or content block should sit within 16px of the screen edge on any device.

- Hero cards (tickers, preview strip): `padding: 0 8px` on the container in `@media (max-width: 880px)`. Combined with hero-banner's 20px side padding = 28px total gutter.
- On very small phones (< 480px): reduce to `padding: 0 4px` on containers, `padding: 16px` on `.hero-banner`.
- `story-wrap`: `padding: 32px 20px` on 880px, `padding: 24px 16px` on 480px.
- `main-article-grid`: `padding: 0 16px` on 640px, `padding: 0 12px` on 480px.

---

## 2. Card design — white > warm-cream

**Rule:** Cards that contain data or links use `var(--bg-card)` (white), not `var(--bg-warm)` (cream).

- Cream (`bg-warm`) is for passive decorative elements.
- White cards with `border: 1.5px solid var(--border)` and `box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)` read as elevated, interactive.
- `border-top: 3px solid [accent]` is the colour identity signal per card:
  - Card 1 / ticker 1 → `var(--signal)` (blue)
  - Card 2 / ticker 2 → `var(--warm)` (orange)
  - Card 3 / ticker 3 → `#22a85a` (green)

---

## 3. Typography hierarchy — what should be bold

| Element | Treatment |
|---|---|
| Section eyebrow (By the numbers, etc.) | Mono, 9–10px, ALL CAPS, `letter-spacing: 0.16em`, `font-weight: 700` |
| Block number badge | Mono, 700 weight, signal-blue bg |
| Block title (h3) | Display serif, 20–24px, `font-weight: 400` (display serifs don't need bold) |
| Signal block body | 18px, `line-height: 1.74`, `**text**` → `<strong>` bold |
| Why it matters para | 18px, `line-height: 1.8`, space between paras `30px` |
| Pull quote | Display italic, 22–26px, signal blue |
| Stat card value | Display, 28–34px, dark, `letter-spacing: -0.02em` |
| Ticker value | Display, 22px, dark |
| Preview card value | Display, 16px |
| Role lens body | 14px, `line-height: 1.65`, `**text**` → bold |
| Counter-view body | 15px, `line-height: 1.7` |
| Arrow/CTA labels | Mono, 10px, ALL CAPS, `font-weight: 700` |

**Critical**: `context-body strong { color: var(--text); font-weight: 600; }` — bold in body paragraphs should be dark text, never signal-blue.

---

## 4. Mobile breakpoints — what collapses where

| Component | Breakpoints |
|---|---|
| `main-article-grid` (2-col → 1-col) | `max-width: 1080px` |
| `role-lenses-grid` (3-col → 1-col) | `max-width: 680px` |
| `hero-tickers` (3-col → 1-col) | `max-width: 880px` |
| `hero-preview-strip` (3-col → 1-col) | `max-width: 880px` |
| `stat-cards` (3-col → 1-col) | `max-width: 880px` |
| `subscribe-card` (2-col → 1-col) | `max-width: 880px` |
| `standup-tabs` (3-col → 2×2) | `max-width: 720px` |
| `story-wrap` padding tightens | `max-width: 880px`, again at `max-width: 480px` |

**Reading sidebar** (`ReadingSidebar`) becomes invisible at `max-width: 1080px` because the grid collapses to 1 column and sidebar should be hidden. Verify this hides cleanly.

---

## 5. Hover states — all interactive cards must have these three

1. `transform: translateY(-3px)` to `-4px` — card lifts
2. `box-shadow` increase — card pops
3. A colour change on the arrow/CTA element — directional cue

Avoid `transform: scale()` on cards — it shifts adjacent layout and looks amateurish.

---

## 6. Line height and spacing — the readable baseline

| Context | Font size | Line height | Inter-para gap |
|---|---|---|---|
| Article body (context-body) | 18px | 1.80 | 30px |
| Signal block body | 18px | 1.74 | — (single para) |
| Story deck | 18–20px | 1.72 | — |
| Role lens body | 14px | 1.65 | — |
| Hero broadcast | 19–22px | 1.45 | — |
| Ticker detail | 11px | 1.35 | — |

---

## 7. The "Today's signal" card — editorial, not generic

Structure (top → bottom):
1. Dark charcoal header strip (`var(--text)` = `#14110F`) with:
   - Live blue pip (animated `livePulse`)
   - "TODAY'S SIGNAL" in mono caps, 9.5px, 0.2em tracking
   - Signal number (`#38`) right-aligned, muted
2. White body (`var(--bg-card)`) with:
   - `border-left: 4px solid` gradient (signal-blue → warm-orange)
   - Headline in display serif, 17–22px, left-aligned
   - "Read the full signal →" CTA in mono, signal blue, arrow gap widens on hover

**Never**: centered text in this card. Never generic "Today's story" without the dark header strip.

---

## 8. Hero title treatment

The `big-headline` has three distinct word treatments:
- `hw1` ("One") → stroke/outline only, `-webkit-text-stroke: 1.5px var(--text); -webkit-text-fill-color: transparent`
- `hw2` ("AI") → solid signal blue + glow `text-shadow: 0 0 80px rgba(43,91,255,0.38)`; animated gradient underline draws after word appears
- `hw3` ("story.") → normal dark fill
- `hw4` (sub-line inside h1) → italic, signal blue, `.62em` of parent, hover tilt

The `headline-stage` wrapper has:
- `.hs-glow`: breathing dual-colour radial gradient behind the title
- `.hs-ring-1` / `.hs-ring-2`: pulse rings that expand outward on load

Do not put the sub-line outside the `h1` as a `<p>`. It belongs inside h1 as a word span.

---

## 9. Colors — signal semantic use

| Color | Token | When to use |
|---|---|---|
| Signal blue | `var(--signal)` `#2B5BFF` | Primary CTA, data labels, "AI" word, live indicators |
| Warm orange | `var(--warm)` `#FF6B35` | Second accent, time indicators, warm glow |
| Green | `#22a85a` or `var(--money)` | Positive delta, third card accent |
| Text | `var(--text)` `#14110F` | Dark headers, primary body, dark card BG |
| Text-soft | `var(--text-soft)` | Secondary body |
| Text-mute | `var(--text-mute)` | Labels, meta |
| Text-faint | `var(--text-faint)` | Tertiary meta, watermarks |
| Border | `var(--border)` | Default card borders (light) |
| Border-mid | `var(--border-mid)` | Separators |

---

## 10. What NOT to do

- ❌ `background: var(--bg-warm)` on interactive cards
- ❌ Cards within 16px of screen edge on mobile
- ❌ `transform: scale()` on hover for cards
- ❌ Center-aligned body text (only headlines and pull quotes are centered)
- ❌ `transition: all` — target specific properties only
- ❌ Shadows without `border` — shadows alone look flat on light backgrounds
- ❌ Arrow/CTA with `opacity: 0` by default — users won't discover it; use ≥ 0.5
- ❌ Sub-line outside h1 as separate `<p>` — breaks the hover-tilt interaction
- ❌ Removing `padding` from `.hero-tickers` / `.hero-preview-strip` on mobile

---

*Last updated: 2026-05-28. Update this doc when a design rule changes — don't let it drift.*
