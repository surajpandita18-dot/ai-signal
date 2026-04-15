Redesign AI Signal into a premium editorial intelligence product.

Apply the design system from CLAUDE.md and `.claude/skills/design-system-warm-light.md`.

## Constraints

- Preserve all functionality exactly (routing, state, localStorage, bookmarks, read state, unread toggle, personalization, RSS, automation)
- No dark theme, no neon, no decorative illustrations, no flashy gradients
- No washed-out white — every section must use warm surfaces
- No `rounded-3xl` on containers — use `rounded-2xl`
- No `* { transition: all }` — use `transition-colors duration-150` on interactive elements only
- No bg class on `<main>` — let body gradient show through
- Prefer `stone-*` for primary text; `gray-*` is acceptable for dividers and decorative elements

## Section requirements

Each section must have a distinct identity:

- **Hero**: warm featured gradient (`from-[#EDE8E0] via-[#F5F1EC] to-white`) + `border border-[#C8C0B5]` + `shadow-[0_6px_32px_rgba(0,0,0,0.09)]` + solid indigo CTA + large type. Hierarchy from scale and surface — no accent stripe.
- **Daily Brief**: `bg-[#F2EDE5]` + `border-l-[3px] border-l-indigo-300` — memo block, not a card
- **Top Signals**: single `bg-[#F7F4F0]` container with row dividers — not individual floating cards
- **Article Cards**: `bg-white border-[#E0D9CF] rounded-2xl shadow-sm` + footer `border-t border-[#EDE8E2] pt-3` + read state `opacity-60`
- **Article Page Header**: warm gradient zone matching hero

## Button requirements

- Active filters: `bg-indigo-600 text-white` — solid
- Nav/secondary: `bg-[#F7F4F0] border-[#D5CEC5]` — warm fill
- Hero CTA: `bg-indigo-600 text-white` — solid, never ghost

## Process (enforce this order)

1. Read all files in scope
2. Show complete proposed changes — do not write yet
3. Wait for approval
4. Write files
