# AI Signal — Design System

**Hero principle: DECISIVE**
AI Signal feels like a tool that has already made up its mind. Certainty in every element. No decorative chrome. Information that demands action.

Target feel: Bloomberg Terminal × Linear. Dense enough to trust. Clean enough to act.
NOT: light SaaS, warm editorial, white cards, marketing gradients.

---

## Inspiration References

- **Linear** — calm density, Inter font, minimal accent usage. Trust through restraint.
- **Vercel** — confident minimalism, typography as hierarchy. Every element earns its weight.
- **Bloomberg Terminal** — amber for action, density as trust signal. Information is the design.

---

## Color tokens (use these everywhere)

```
--bg: #09090b
--bg-card: #0f0f12
--bg-card-hover: #141418
--bg-elevated: #1a1a20
--border: rgba(255,255,255,0.06)
--border-hover: rgba(139,92,246,0.35)
--purple: #7c3aed
--purple-light: #a78bfa
--amber-primary: #f59e0b
--amber-secondary: #d97706
--amber-border: rgba(245,158,11,0.4)
--text-1: #fafafa
--text-2: #a1a1aa
--text-3: #52525b
--text-4: #27272a
```

**Amber is action. Purple is chrome. Never swap them.**

---

## Typography system

```
Font: Inter (variable) — Google Fonts
Headings: Inter Display 600–700
Body: Inter 400
Labels: Inter 500, uppercase, letter-spacing: 0.08em

Scale:
--text-xs:   11px
--text-sm:   13px
--text-base: 15px
--text-lg:   17px
--text-xl:   20px
--text-2xl:  24px
--text-3xl:  30px
```

Spacing: base 8px. All spacing is multiples of 8.

---

## Zone 1 — editorial signal list

Zone 1 is a numbered editorial list. NOT cards. Full-width rows.

- **Signal number** (01, 02, 03): 48px, `rgba(124,58,237,0.15)` — large, dim, editorial. Not decorative.
- **Title**: `--text-xl`, weight 600, `--text-1`
- **WHAT / WHY labels**: `--text-xs`, uppercase, letter-spacing 0.08em, `--text-3`
- **TAKEAWAY label**: `--text-xs`, uppercase, `--amber-primary`
- **TAKEAWAY content**: `--text-base`, `--amber-primary`, `border-left: 2px solid var(--amber-border)`, `padding-left: 12px`
- **Signal #1**: amber-primary accent. Signals #2–3: amber-secondary accent.
- **Row divider**: `1px solid rgba(255,255,255,0.04)` — barely visible
- **Hover**: `--bg-card-hover` background only. No translateY. No glow.

### WOW element — the TAKEAWAY pull quote

The single screenshottable moment: the TAKEAWAY line with amber left border.

```tsx
// Inside Zone1Signal.tsx — TAKEAWAY block
<div style={{
  borderLeft: "2px solid var(--amber-border)",
  paddingLeft: "12px",
  marginTop: "8px",
}}>
  <span style={{
    display: "block",
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--amber-primary)",
    marginBottom: "4px",
  }}>
    Takeaway
  </span>
  <span style={{
    fontSize: "15px",
    color: isBlurred ? "transparent" : "var(--amber-primary)",
    filter: isBlurred ? "blur(4px)" : "none",
    userSelect: isBlurred ? "none" : "auto",
  }}>
    {signal.takeaway}
  </span>
</div>
```

---

## Zone 2 — compact signal grid

Zone 2 shows the broader signal set. Title + score bar only.

- Background: `--bg-card`, border `1px solid var(--border)`
- Border radius: **6px** (not 13px)
- **Score bar**: 3px height. Purple (`--purple`) for high-impact. Indigo (`#4f46e5`) for medium.
- **Hover**: `translateY(-2px)` only. No glow shadow.
- `transition: transform 150ms ease` — targeted, not `transition: all`

---

## Never use

`bg-white`, `bg-slate-*`, `bg-gray-*`, `bg-indigo-50`, `text-slate-*`,
Tailwind `shadow-*` defaults, light backgrounds of any kind,
`border-radius: 13px`, `translateY(-3px)`, purple glow shadow on Zone 2 cards,
`transition: all`.

---

## Engineering rules

- Read this file before touching any UI component
- Preserve all functionality, routing, state, localStorage
- No breaking changes to: RSS feed, search, filters, bookmarks, read state, unread toggle, saved page, article pages, auto-refresh
- No `* { transition: all }` — use targeted transitions only
- Full-file replace when >8 class changes touch a file
- Inter font: import from Google Fonts via `next/font/google`
- Inter font loading: use `next/font/google` — `const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })` — apply to root layout only

---

## Memory Rules

**SESSION START — always run:**
```bash
/Users/surajpandita/Library/Python/3.9/bin/mempalace wake-up --wing ai-signal
```

**SESSION END — always run:**
```bash
bash scripts/hooks/post-session.sh
```

**NEVER load these files directly** (token killers):
- `~/lennys-podcast-transcripts/` (8.73 MB) → `mempalace search "[query]" --wing lenny-index`
- `.claude/intelligence/` full folder → `mempalace search "[topic]" --wing ai-signal`
- `.claude/2026-04-20-ai-signal-mvp-plan.md` (large) → `mempalace search "[task]" --wing ai-signal`
- `node_modules/`, `.next/` → never

**TOKEN BUDGET: 15,000 per session max**

Wing map:
- `--wing ai-signal` ← product decisions, personas, intelligence, assumptions
- `--wing lenny-index` ← 89 Lenny episodes (growth, retention, pricing, habit formation)
- `--wing ai-signal-code` ← scripts/, lib/ code decisions and fixes

---

## Core Features (never break)

RSS feed · search · source filter · daily brief · top signals · bookmarks · read state · unread toggle · saved page · article pages · auto-refresh workflow
