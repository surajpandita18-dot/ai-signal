# ORACLE Proposal — Signal Reading Experience Redesign

**Date:** 2026-04-27
**ARIA Status: APPROVED — execute immediately**
**Pattern observed:** StoryCard was designed for list scanning. Product is now one article per day. The card metaphor actively works against the reading experience.

---

## The problem

The current StoryCard puts everything inside a boxed container with a border, card-bg, and expand/collapse. This makes sense when you have 5–7 items competing for attention and the reader needs to scan, pick, and go deeper selectively.

With one daily signal:
- There's nothing to scan
- There's nothing to compare
- The box border creates visual friction — it says "this is one of many" when it's the only one
- Expand/collapse hides content that the reader **should** read — the lenses and deeper read ARE the product
- 3-line clamps on lenses create frustration, not intrigue

The card is working against the product.

---

## What one great article deserves

References: Stratechery's subscriber posts, The Pragmatic Engineer single-topic issues, Matter (reading app), a well-typeset magazine feature.

The pattern is: **the content IS the page**. No wrapper. Generous whitespace. Section breaks via horizontal rules and typographic rhythm, not boxes.

---

## Proposed changes

### 1. Replace StoryCard with SignalView (full-page editorial layout)

**Delete:** `border`, `border-radius`, `card-bg` background, `padding: 24px` box, expand/collapse button, `grid-template-rows` animation.

**Add:** Full-width content on page background. Section separators via `<hr>` (1px border-token) and `margin` rhythm. Everything visible, nothing hidden.

Layout (top to bottom):

```
CATEGORY · READ TIME

[Headline — large serif, 28px, no clamp]

[Original source link — "Read the original in [Publication] ↗" — mono, text-secondary]

────────────────────────

[Why it matters — the lede]
The editor's sharpest take. Accent left-border, 3px.
This moves from being a "callout block" inside a card
to being the PAGE OPENER after the headline.
Bigger padding (16px). Larger text (17px not 15px).

────────────────────────

[WHAT HAPPENED label — mono, 11px, uppercase]
[Summary — sans, 15px, 1.7 lh]

────────────────────────

[Pull quote — if present]
Serif, 20px, italic. Left border 2px accent.
Not inside a box — floats in the whitespace.

────────────────────────

[FOR PMs / FOR FOUNDERS / FOR BUILDERS]
Grid, 3 columns desktop / 1 column mobile.
NO LINE CLAMP — full paragraph per lens.
Border: 1px border-token. Active role: 2px.

────────────────────────

[THE BIGGER PICTURE label — mono, 11px, uppercase]
[Deeper read — serif, 16px, 1.8 lh, NOT italic]
(Italic signals "quote" — this is original writing)

────────────────────────

[SOURCES]
Original article first. Additional coverage after.
```

### 2. Add `pull_quote` field to stories schema

A short, striking sentence from the original article. When present, becomes a typographic anchor between summary and lenses.

```sql
alter table stories add column pull_quote text;
```

TypeScript:
```typescript
pull_quote: string | null  -- in Row, Insert, Update
```

### 3. Promote `why_it_matters` to the page opener

Currently rendered as a callout block mid-card. In the new layout: it's the first thing after the headline and source link. It IS the lede. The editor's voice. Most important text on the page.

Visual treatment:
- Left border 3px accent
- Background: `var(--card-bg-deeper)` — subtle tint
- Padding: 16px all sides
- Font: Inter, 17px (up from 15px), 1.6 lh
- Margin-bottom: 40px before the `<hr>`

### 4. Uncap lens text

Remove `WebkitLineClamp: 3` from lens columns. Role lenses should be full paragraphs — that's the depth of insight that justifies subscribing. Teasing it with a clamp defeats the purpose.

### 5. Deeper read: serif, not italic

Current: `fontStyle: 'italic'`. Italic reads as "quoted text". The deeper read is Suraj's original synthesis — his voice, not a quote. Set it in upright serif at 16px, 1.8 line-height. The slight size and line-height increase signals it's richer content.

---

## Schema migration

New file: `/db/migrations/20260427000001_add_pull_quote.sql`

```sql
alter table stories add column pull_quote text;
```

Also update seed.sql: add `pull_quote` to the story insert with a realistic example sentence.

---

## Implementation order

1. SEED: migration + types update + seed update
2. FORGE: rebuild StoryCard as full-page SignalView
3. FORGE: wire SignalView into page.tsx and signal/[number]/page.tsx
4. LENS + VEIL review

---

## What NOT to change

- The 24h expiry mechanic — untouched
- SiteShell, ExpiryBadge, SignalExpired — untouched
- SubscribeInput — untouched
- Overall page structure (SiteShell wrapper) — untouched
- Dark mode token system — same tokens, just different layout

---

## Expected outcome

Reading AI Signal #247 should feel like reading a Stratechery post about a single important development — editorial, considered, with room to breathe. Not like scanning a product dashboard.
