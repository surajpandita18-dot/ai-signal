# StoryCard Design Decisions — 2026-04-27

**Status: CONDITIONALLY APPROVED — 3 fixes required before LENS + VEIL review**

---

## Context

Phase 2 StoryCard was delivered early by FORGE alongside Phase 3. This document audits the existing implementation against PRD section 4.5 and `design/design-system.md`, documents final design decisions on the five open questions, and identifies required fixes.

---

## Design decision log

### a. Expand/collapse mechanism: grid-template-rows

**Decision: grid-template-rows animation. Existing implementation is CORRECT.**

```css
/* Outer wrapper */
display: grid;
grid-template-rows: 0fr; /* collapsed */
grid-template-rows: 1fr; /* expanded */
transition: grid-template-rows 150ms ease;

/* Inner div — required for 0fr to work */
overflow: hidden;
```

**Why this over max-height:**
- `max-height` requires a hardcoded maximum (e.g. `max-height: 1000px`) — the animation duration is split between the real content height and the arbitrary ceiling, causing a delayed snap at the end
- `grid-template-rows: 0fr → 1fr` computes from actual content height. The transition is smooth to exactly the right end point
- No JavaScript height measurement needed (ResizeObserver, ref.scrollHeight)
- No layout shift — the outer wrapper reserves space via CSS, inner overflow is hidden during transition

**Constraint check:** `transition: grid-template-rows 150ms ease` targets a specific property, not `transition: all`. Pass.

---

### b. Role highlighting in the lens grid

**Decision: 2px solid border for active role. NOT a color change. Implementation must be updated.**

**Rationale:**
- Color-only change (`1px text-secondary` vs `1px border-token`) is too subtle at a glance, especially in dark mode where both colors are close in luminance
- Weight change (1px → 2px) is immediately perceptible without relying on color discrimination — better accessibility
- Stays within the constraint of "no new colors" — uses only existing tokens
- The active column should feel like a book you've bookmarked, not a button you've pressed

**Correct implementation:**
```tsx
border: isActive ? '2px solid var(--border)' : '1px solid var(--border)'
```

Note: border color stays the same (`--border` token) in both states. Weight changes only. This way the column "steps forward" without any color introduction.

**What NOT to do:**
- Do not use accent color for the active border (accent is reserved for why-it-matters only)
- Do not add a background fill to the active column
- Do not change text weight/color in the active column header

---

### c. "Why it matters" block

**Decision: 3px accent left-border + surface-muted background tint. `--card-bg-deeper` must be replaced.**

**Problem with existing implementation:**
The component uses `backgroundColor: 'var(--card-bg-deeper)'` which is not defined in `globals.css`. The block currently renders with no background tint — only the 3px accent border provides visual separation.

**Correct approach:**
Add `--surface-muted` to `globals.css` as a new token:

```css
:root {
  --surface-muted: #ECEAE0;  /* card-bg #F3F0E8 darkened ~5% */
}
.dark {
  --surface-muted: #141412;  /* card-bg dark #1A1A18 darkened ~3% */
}
```

Use in the component:
```tsx
style={{
  borderLeft: '3px solid var(--accent)',
  backgroundColor: 'var(--surface-muted)',
  padding: '12px',
  marginBottom: '16px',
}}
```

**Why a tint matters:**
The "why it matters" paragraph is the single most important sentence on the card. It must be visually distinct from the body copy. The accent border alone makes it visible; the tint makes it feel like a callout that deserves attention, not just a styled paragraph.

**Constraint check:**
- No gradient: pass (flat color)
- No shadow: pass
- Accent used only for border, not fill: pass (fill uses surface-muted, not accent)

---

### d. Category tag design

**Decision: Plain uppercase mono label. No pill shape. Implementation is CORRECT.**

```tsx
// Correct
<span className="font-mono" style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
  {story.category}
</span>
```

**Why no pill:**
- Pills add border-radius and (usually) a fill or border around the tag — decorative chrome
- This is a metadata label, not a clickable filter chip. Rendering it as a pill implies interactivity that doesn't exist
- The Pragmatic Engineer and Stratechery don't use pill tags. Linear's blog uses plain mono labels
- A pill on a mono uppercase label would feel like SaaS product UI, not editorial

**Note on the daily signal pivot:**
PRD section 4.5 now says "No story number (there's only one per day)." The existing implementation renders `story.position` as a story number in the metadata row. This must be removed.

---

### e. "Go deeper" button

**Decision: Outlined chip. Implementation is CORRECT.**

```tsx
style={{
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
}}
```

Focus ring is correct: `boxShadow: '0 0 0 2px var(--accent)'` with 2px offset via the shadow value.

The toggle label `Go deeper ↓` / `Collapse ↑` is acceptable. The directional arrows provide an affordance without adding decorative icons.

---

## Full component spec

### HTML structure

```tsx
<article>                        {/* card surface — card-bg, border, 4px radius */}
  <header>                       {/* metadata row */}
    <span>category</span>        {/* mono, 11px, uppercase */}
    <span>·</span>               {/* separator, border-color */}
    <span>N min read</span>      {/* mono, 11px */}
  </header>

  <h2>headline</h2>              {/* serif, 22px, 1.3 lh, max 2 lines */}
  <p>summary</p>                 {/* sans, 15px, 1.6 lh */}

  <div role="note">              {/* why it matters — surface-muted bg, 3px accent border-left */}
    <p className="label">        {/* "WHY IT MATTERS" — mono, 11px, uppercase */}
    <p>why_it_matters</p>        {/* sans, 15px */}
  </div>

  <button aria-expanded={expanded}>   {/* outlined, transparent, border-token */}
    {expanded ? 'Collapse ↑' : 'Go deeper ↓'}
  </button>

  <div                           {/* expand wrapper — grid-template-rows animation */}
    style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', transition: '...' }}
  >
    <div style={{ overflow: 'hidden' }}>   {/* required inner div for 0fr */}
      <div>                      {/* expanded content */}
        <div className="grid grid-cols-3"> {/* lens grid */}
          {LENSES.map(lens => (
            <div style={{ border: isActive ? '2px solid var(--border)' : '1px solid var(--border)' }}>
              <p className="label">{lens.label}</p>
              <p>{lens.take}</p>
            </div>
          ))}
        </div>

        <div>                    {/* deeper read — serif, 15px, 1.7 lh */}
          <p className="label">THE DEEPER READ</p>
          <p>{story.deeper_read}</p>
        </div>

        <div>                    {/* sources — mono, 13px */}
          <p className="label">SOURCES</p>
          {sources.map(s => <a>{s.label} ↗</a>)}
        </div>
      </div>
    </div>
  </div>
</article>
```

### Accessibility

- `aria-expanded={expanded}` on the button — screen reader announces state change
- `role="note"` on why-it-matters block — identifies it as supplementary content
- Expand/collapse triggered by native `<button>` — Enter and Space work without custom `onKeyDown`
- Custom `onKeyDown` for Space is redundant on `<button>` — remove it (native handles both keys)
- Focus ring via `onFocus`/`onBlur` inline style is fragile — use CSS `:focus-visible` instead

### Dark mode class strategy

All colors use CSS custom properties from `:root` / `.dark` in `globals.css`. The Tailwind `dark:` prefix is NOT used in this component because inline styles reference CSS variables directly. The dark mode toggle on `<html>` changes the variable values globally. No per-element dark/light conditional logic needed in JSX.

---

## Audit against PRD section 4.5

| Requirement | Implementation | Status |
|---|---|---|
| Category tag + read-time in metadata row | Present, mono, uppercase | PASS |
| No story number (daily signal: one per day) | Currently renders `position` — must remove | **FAIL → fix required** |
| Headline: serif, 22px, 1.3 lh, max 2 lines | Source Serif 4, 22px, 1.3, `-webkit-line-clamp: 2` | PASS |
| Summary: sans, 15px, 2–3 sentences | Inter, 15px | PASS |
| Why it matters: 3px accent border, one paragraph | 3px accent border present; background uses ghost token | **FAIL → fix required** |
| Go deeper: outlined, secondary | Outlined, transparent, border-token | PASS |
| Three-lens grid on expand | grid grid-cols-3, all three rendered | PASS |
| User role highlighted | Color-only change, should be 2px weight | **FAIL → fix required** |
| Deeper read: serif, 15px, generous line-height | Source Serif 4, 15px, 1.7 | PASS |
| Sources: mono labels, external link | font-mono, 13px, ↗ indicator | PASS |
| expand/collapse: no layout shift, 150ms | grid-template-rows, 150ms ease | PASS |
| Max 720px content width | Applied at page level, not per-card | PASS |
| No gradients | None present | PASS |
| No shadows (except focus ring) | No shadow on card; focus ring is 0 0 0 2px | PASS |
| accent only on why-it-matters | Only on left-border | PASS |

---

## ARIA verdict: CONDITIONALLY APPROVED

The StoryCard is structurally sound and passes the majority of design system constraints. Three targeted fixes are required before the component can be submitted for LENS + VEIL review.

**Required fixes (brief at /system/briefs/2026-04-27_phase2-fixes.md):**

1. **Add `--surface-muted` to globals.css** and replace `var(--card-bg-deeper)` with it in StoryCard
2. **Update active lens border** from color change to `2px solid var(--border)` for active, `1px solid var(--border)` for inactive
3. **Remove story position number** from metadata row (daily signal: one story per day, position is meaningless)

These are all contained within `src/app/globals.css` and `src/components/StoryCard.tsx`. Estimated scope: ~15 lines changed.
