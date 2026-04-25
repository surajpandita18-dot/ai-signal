# AI Signal — Design System

**Hero principle: DECISIVE**
AI Signal feels like a morning intelligence briefing — editorial, not algorithmic.
Feel: Rundown AI energy + Linear precision.
NOT: generic dark SaaS dashboard, light backgrounds, marketing gradients.

---

## Session Ritual

**SESSION START — always run:**
```bash
/Users/surajpandita/Library/Python/3.9/bin/mempalace wake-up --wing ai-signal
```
Then read `.claude/SYSTEM_STATE.md` only. Pick ONE task.

**BEFORE any design change:** Read `.claude/DESIGN_SYSTEM.md` — it overrides this file for visual decisions.

**SESSION END — always run:**
```bash
bash scripts/hooks/post-session.sh
```

**NEVER load these files directly** (token killers):
- `.claude/intelligence/` full folder → `mempalace search "[topic]" --wing ai-signal`
- `.claude/2026-04-20-ai-signal-mvp-plan.md` → `mempalace search "[task]" --wing ai-signal`
- `node_modules/`, `.next/` → never

**TOKEN BUDGET: 15,000 per session max**

---

## Inspiration (PRIMARY: Rundown AI)

- **Rundown AI** — emoji hooks, bold WHAT/WHY labels, dark editorial, prominent email CTA
- **Linear** — calm density, Inter font, minimal accent usage
- **Vercel** — confident minimalism, typography as hierarchy

---

## Color tokens

```
--bg: #0a0a0a
--bg-card: #111111
--bg-card-hover: #161616
--bg-elevated: #1a1a1a
--border: rgba(255,255,255,0.08)
--purple: #7c3aed
--amber: #f59e0b          (TAKEAWAY only — never elsewhere)
--amber-dim: #d97706      (secondary signals)
--text-1: #ffffff
--text-2: #a1a1aa
--text-3: #52525b
--text-4: #27272a
```

**Amber = TAKEAWAY only. Purple = chrome. Never swap.**

Category emoji + color map:
```
LLM/Models:   #7c3aed  🧠
Research:     #2563eb  🔬
Infra:        #059669  ⚡
Funding:      #d97706  💰
Product:      #dc2626  🚀
Agents:       #7c3aed  🤖
Open Source:  #0891b2  📦
Policy:       #6b7280  🛡️
Default:               📡
```

---

## Typography

```
Font: Inter (variable) — already loaded via globals.css
Headings: Inter 700–800
Body: Inter 400
Labels: Inter 600, uppercase, letter-spacing: 0.08em

Scale:
xs:   11px  (labels, timestamps)
sm:   13px  (secondary body)
base: 15px  (primary body)
lg:   17px  (card titles)
xl:   20px  (Zone 1 titles)
2xl:  28px  (page headers)
```

Spacing: base 8px. All spacing is multiples of 8.

---

## Zone 1 — editorial signal list

Zone 1 is a numbered editorial list. NOT cards. Full-width rows.

- **Emoji + title**: `🧠 [signal title]` — emoji from category map above
- **Signal number** (01, 02, 03): 48px, `rgba(124,58,237,0.15)` — large, dim, editorial
- **Meta row**: `[emoji] [colored dot] [source] · [date]`
- **Title**: 20px, weight 700, `--text-1`
- **WHAT label**: 10px, uppercase, weight **600**, `--text-3`
- **WHY label**: 10px, uppercase, weight **600**, `--text-3` — same weight as WHAT
- **TAKEAWAY label**: 10px, uppercase, `--amber`
- **TAKEAWAY content**: 15px, `--amber`, `border-left: 2px solid rgba(245,158,11,0.4)`, `padding-left: 16px`
- **Signal #1**: amber `#f59e0b`. Signals #2+: amber-dim `#d97706`.
- **Row divider**: `1px solid rgba(255,255,255,0.05)` — barely visible
- **Hover**: `#161616` background only. No translateY. No glow.

```tsx
// Zone1Signal.tsx — add emoji before title
const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};
const emoji = signal.tags?.map(t => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
// Then: <h2>{emoji} {signal.title}</h2>
```

---

## Zone 2 — compact signal grid

- Background: `#111111`, border `1px solid rgba(255,255,255,0.08)`
- Border radius: **8px**
- **Score bar**: 3px height. Purple for high-impact. Indigo for medium.
- **Hover**: `#161616` background only. No translateY. No glow.
- `transition: background 150ms ease` — targeted only

---

## Never use

Light backgrounds of any kind, `border-radius: 13px`, `translateY` on Zone 2,
purple glow shadows, `transition: all`, amber anywhere except TAKEAWAY.

---

## Engineering rules

- Read `.claude/DESIGN_SYSTEM.md` before touching any UI component — it overrides this file
- Preserve all functionality, routing, state, localStorage
- No breaking changes to: RSS feed, search, filters, bookmarks, read state, unread toggle, saved page, article pages, auto-refresh
- No `* { transition: all }` — use targeted transitions only
- Full-file replace when >8 changes touch a file

---

## Core Features (never break)

RSS feed · search · source filter · daily brief · bookmarks · read state · unread toggle · saved page · article pages · auto-refresh

## System Files

| File | Role |
|------|------|
| `CLAUDE.md` (this) | Design tokens + engineering rules |
| `.claude/DESIGN_SYSTEM.md` | Full visual spec — overrides this |
| `.claude/SYSTEM_STATE.md` | Current focus + next steps |
| `.claude/FEEDBACK_MEMORY.md` | Learning log |
| `.claude/SOURCES.md` | Pipeline sources |
