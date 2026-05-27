# AI Signal — Typography Rules

> Reference this before any font-size, line-height, or spacing change. Based on Butterick's Practical Typography, Richard Rutter's Web Typography, and NNG research.

---

## 1. Body text — minimum 16px

All body-level text must be ≥ 16px. 14–15px is fine for labels, captions, and mono eyebrows — not for reading text.

| Element | Min size |
|---|---|
| Article body (`context-body`) | 18px |
| TL;DR text | 16px |
| Action items | 16px |
| PM Angle body | 16px |
| Role lens body | 14px (short, scannable — exception) |

---

## 2. Line height — tighter for display, looser for prose

| Context | Line height | Why |
|---|---|---|
| Display serif headline (h1, h2) | 1.05–1.15 | Tight = intentional, monumental |
| Pull quote / editorial quote | 1.32 | Quoted text needs breathing room but stays punchy |
| Story deck / standup title | 1.28 | Short italic display — visible air, not sprawl |
| Article body | 1.75 | NNG: 1.5–1.8 for 16–18px text |
| Signal block body | 1.74 | Single para, slightly denser fine |
| Role lens / action items | 1.55–1.65 | Dense lists — reduce slightly |

**Rule:** Line height and font size must be set together. Bigger text = tighter line height. Smaller text = looser line height.

---

## 3. Letter spacing — display serif carries none

Display serif fonts (Source Serif 4) at large sizes already have optical weight from size + font design. Adding bold or positive letter-spacing over-kills it.

| Element | Letter spacing |
|---|---|
| Stat card value (28–34px display) | `-0.03em` |
| Pull quote (25px display) | `-0.012em` |
| Story deck (19px display) | `-0.012em` |
| Article deck | `-0.012em` |
| Big headline words | `-0.025em` to `-0.04em` |
| Body text | `0` (default) |
| Mono labels / eyebrows | `+0.12em` to `+0.2em` |

---

## 4. Font weight — display doesn't need bold

**Rule:** Display serif (Source Serif 4) at ≥ 20px should be `font-weight: 400`. Size + letter-spacing carry the visual weight. `font-weight: 500` or `700` on large display makes it look heavy, not premium.

Exception: `font-weight: 500` is acceptable at ≤ 17px italic display (standup title, story deck context) where the italic style already signals display treatment.

**Stat card value**: `font-weight: 400` at 32px — the number itself communicates. Bold makes it look like a dashboard, not an editorial product.

---

## 5. Inter-paragraph spacing

At `font-size: 18px, line-height: 1.75` → single line-height = 31.5px → `margin-top: 30px` between paragraphs = ~1× line height. This is the correct rhythm.

**Rule:** Paragraph gap ≈ 1× line height of the body text. Do not use `margin-bottom` on `p` — use `p + p { margin-top }` instead.

---

## 6. Optimal line length

At `font-size: 18px`, optimal line = 65–75 characters ≈ `max-width: 680px`.

`context-body` uses `max-width: 680px` — do not widen. Wider lines require readers to search for the next line start, increasing fatigue.

---

## 7. Standup card typography

The standup card uses an italic display title + smaller mono preview text. Key values:

- Title: 17px display italic, `line-height: 1.28` (not 1.1 — too tight for multi-word titles)
- Preview text: 14px body, `line-height: 1.65` (dense preformatted text needs air)

---

## 8. Mono eyebrow system

All section labels use mono font, ALL CAPS, with generous letter spacing. This creates clear hierarchy between "navigation" and "reading" text.

Standard: `font-family: var(--ff-mono); font-size: 9–11px; font-weight: 600–700; letter-spacing: 0.14–0.2em; text-transform: uppercase`

Never use body font or display serif for eyebrows.

---

## 9. What NOT to do

- ❌ `font-weight: 700` on display serif at ≥ 20px
- ❌ `line-height: 1.1` on multi-word italic display titles (standup, deck)
- ❌ `font-size: 15px` or smaller for reading text (not labels)
- ❌ `letter-spacing: 0` on mono eyebrows — tracking is part of the signal
- ❌ `line-height: 1.4` on pull quotes — too loose for display, too tight for body
- ❌ Mixed `margin-bottom` and `margin-top` on paragraphs — pick one pattern

---

*Last updated: 2026-05-28. Update when any CSS typography value changes in globals.css.*
