---
name: design-implementer
description: Use when implementing any visual change — reads DESIGN_SYSTEM.md and executes exactly what it says, no interpretation
---

# Design Implementer

## Purpose
Pure execution of DESIGN_SYSTEM.md spec. No creativity. No interpretation. No additions.

## Steps
1. Read `DESIGN_SYSTEM.md` (source of truth for all visual decisions)
2. Read last 5 entries in `FEEDBACK_MEMORY.md`
3. Read the specific component file to change
4. Implement EXACTLY what DESIGN_SYSTEM.md says for that component
5. Run `npm run build` — zero TS errors required
6. Append session summary to `FEEDBACK_MEMORY.md`

## Rules
- Never add anything not in DESIGN_SYSTEM.md
- Never remove anything user hasn't explicitly asked to remove
- One component at a time
- Show diff before committing
- If DESIGN_SYSTEM.md is unclear → ask before implementing

## Trigger
`/design-implement [component-name]`
