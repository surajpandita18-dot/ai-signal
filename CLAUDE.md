# AI Signal — System Brain
Last updated: 2026-04-25

## What is AI Signal
Premium daily intelligence briefing for PMs, founders, and engineers building AI products.
Tagline: "AI changed overnight. Here's what to build."
Feel: Rundown AI energy + Linear precision.

## User
Primary: CTO / Technical Founder at AI startup
Pain: Too much AI noise, no time to filter what matters
Job: Know what changed overnight + what to do next

---

## Session Ritual

**START:**
Read `SYSTEM_STATE.md` — pick ONE task only.

**BEFORE any design change:**
Read `DESIGN_SYSTEM.md` + last 5 entries in `FEEDBACK_MEMORY.md`. Then implement.

**AFTER any change:**
Run `npm run build` (zero TS errors required).
Append session summary to `FEEDBACK_MEMORY.md`.
Update `SYSTEM_STATE.md`: what shipped + next action.

**FEEDBACK RECEIVED:**
→ Design feedback: log in `FEEDBACK_MEMORY.md` → update `DESIGN_SYSTEM.md` → implement.
→ "Yeh acha nahi": ask what specifically → log → check if 3x pattern → make it a rule.
→ Screenshot shared: extract 3–5 patterns → add dated section to `DESIGN_SYSTEM.md` → implement targeted only.
→ Competitor shared: add sources to `SOURCES.md` → add patterns to `DESIGN_SYSTEM.md`.
→ Same mistake 3x: promote to named rule in `DESIGN_SYSTEM.md`, never repeat.

---

## File Roles

| File | Owns |
|------|------|
| `CLAUDE.md` (this) | Brain, vision, workflow |
| `DESIGN_SYSTEM.md` | ALL visual decisions — overrides this |
| `FEEDBACK_MEMORY.md` | Learning log + rules (append only) |
| `SYSTEM_STATE.md` | Current focus + next steps |
| `SOURCES.md` | Pipeline source list |

Design rule: `DESIGN_SYSTEM.md` wins over everything visual.
Flexibility rule: Never reject changes due to past decisions. Adapt always.

---

## Product Principles
1. Fewer signals, more insight
2. Every signal: WHAT + WHY + TAKEAWAY
3. Calm senior-operator voice — no hype
4. Fast to scan — editorial not algorithmic
5. One original layer per signal

---

## Never Break
RSS feed · search · source filter · bookmarks · read state ·
unread toggle · saved page · article pages · auto-refresh
No `transition: all`. No light backgrounds. No amber outside TAKEAWAY.
