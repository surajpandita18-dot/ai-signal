# Brief — Phase 2 Review: StoryCard LENS + VEIL

**Assigned to:** LENS (/qa/) and VEIL (/design/)
**Date:** 2026-04-27
**Phase:** 2 of 7 — review gate

---

## Context

Phase 2 StoryCard was delivered early by FORGE alongside Phase 3. ARIA has conducted a design audit (see `/system/proposals/2026-04-27_storycard-design-decisions.md`). Three targeted fixes were applied and verified:

1. Removed story position from metadata row (daily signal: one story per day, position is meaningless)
2. Updated active lens border: was color-only change, now `2px solid var(--border)` for active vs `1px solid var(--border)` for inactive. Padding compensated by 1px to prevent layout shift.
3. Confirmed `--card-bg-deeper` token is correctly defined in `globals.css` — no missing token.

TypeScript passes zero errors post-fix.

---

## Files to review

```
src/components/StoryCard.tsx     — primary review target
src/app/globals.css              — CSS tokens (--card-bg-deeper, --surface-muted if added)
src/app/page.tsx                 — StoryCard usage in homepage context
src/app/issue/[slug]/page.tsx    — StoryCard usage in issue page context
```

---

## What LENS must verify

1. TypeScript: `npx tsc --noEmit` passes zero errors (already confirmed, re-verify after any changes)
2. No `position` prop referenced or passed to StoryCard anywhere in codebase
3. Expand/collapse uses `grid-template-rows` — not `max-height`, not `height`
4. Active lens uses border-weight change only (`2px` vs `1px`), no color change
5. `--card-bg-deeper` is defined in globals.css and used (not `--card-bg-deeper` ghost reference)
6. `aria-expanded` is on the button element, not the expand wrapper div
7. No `transition: all` — only targeted property transitions
8. `userRole` prop is optional with `?` — component does not crash when role is undefined

---

## What VEIL must verify

Run against the full component-checklist.md StoryCard section (89 items). Priority items:

**Collapsed state:**
- Headline: Source Serif 4, 22px, 1.3 line-height, 2-line max
- Metadata row: mono, 11px, uppercase, category + read-time only (no story number)
- Why it matters: 3px accent left-border + `--card-bg-deeper` background tint
- Go deeper button: outlined, border-token, accent focus ring
- No accent color used anywhere except why-it-matters left-border

**Expanded state:**
- Three-lens grid: 3 columns, all rendered
- Active lens: 2px solid var(--border) border, 11px padding; inactive: 1px solid var(--border), 12px padding
- Active lens: NO color change, NO background shift
- Deeper read: serif, 15px, 1.7 line-height
- Sources: mono, 13px, external link indicator

**Dark mode:**
- Card-bg shifts to dark variant
- Accent shifts to `#C4A882`
- All colors via CSS variables — no hardcoded hex

**Editorial restraint:**
- No emoji, no marketing copy, no gradients, no shadows
- Feels like The Pragmatic Engineer, not Substack

---

## Acceptance criteria

Phase 2 is complete when LENS and VEIL both return PASS.

If CHANGES_NEEDED: ARIA will write a FOLLOWUP_BRIEF for FORGE.

---

## Do NOT

- Do not review files outside the list above
- Do not comment on Phase 3, 4, or future phases
- Do not suggest feature additions beyond Phase 2 scope
