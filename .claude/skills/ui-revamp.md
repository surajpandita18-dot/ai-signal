# UI Revamp — AI Signal

Redesign screens so each section has a distinct visual identity.
Generic sameness is a failure. Sterile white is a failure.

## Section Surface Spec

| Section | Background | Border | Special |
|---|---|---|---|
| Hero | `from-[#EDE8E0] via-[#F5F1EC] to-white` gradient | `border border-[#C8C0B5]` + `shadow-[0_6px_32px_rgba(0,0,0,0.09)]` | `p-10 md:p-14`, large type, solid indigo CTA, italic "why it matters". Hierarchy from scale + surface — no accent stripe. |
| Daily Brief | `bg-[#F2EDE5]` | `#E0D9CF` + `border-l-[3px] border-l-indigo-300` | Memo identity, not a card |
| Top Signals | `bg-[#F7F4F0]` unified container | `#E0D9CF` outer, `#E8E2DB` row dividers | Rows hover to white — no per-row rounded cards |
| Article Cards | `bg-white` | `#E0D9CF` default, `#C8C0B5` hover | `rounded-2xl`, footer `border-t #EDE8E2 pt-3`, read state `opacity-60` |
| Article Header | `from-[#EDE8E0] via-[#F5F1EC] to-white` | `#E8E1D8` bottom divider | Warm zone, matches hero |

## Constraints

- Prefer `stone-*` for primary text; `gray-*` is acceptable for decorative/structural elements (dividers, placeholders)
- Active filters and hero CTA: `bg-indigo-600 text-white` — solid, not ghost
- Nav/secondary buttons: `bg-[#F7F4F0] border-[#D5CEC5]` — warm fill, not plain white
- `rounded-2xl` for containers; `rounded-full` for pills only
- No `* { transition: all }` — use `transition-colors duration-150` on interactive elements only
- Read state: `opacity-60` minimum — dimmed but legible
- Preserve all logic, routing, state, localStorage

## Output Process

1. Read all files in scope
2. Show complete changes (do not write yet)
3. Get approval, then write
