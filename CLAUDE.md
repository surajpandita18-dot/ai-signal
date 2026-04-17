# AI Signal — Dark Theme Design System

Target feel: Linear.app + Vercel dashboard + Bloomberg terminal.
NOT: light SaaS, warm editorial, white cards.

---

## Color tokens (use these everywhere)

```
--bg: #08090f           (page background)
--bg-card: #0d0e17      (card background)
--bg-card-hover: #101220
--bg-elevated: #13152a
--border: rgba(255,255,255,0.07)
--border-hover: rgba(139,92,246,0.4)
--purple: #7c3aed
--purple-light: #a78bfa
--indigo: #4f46e5
--emerald: #10b981
--text-1: #f0f2ff       (headings, titles)
--text-2: #8892b0       (body, summaries)
--text-3: #4a5568       (muted, labels)
--text-4: #2d3748       (very muted)
```

---

## Card tiers (all dark)

- Featured/Tier1: bg `#0d0e17`, border `rgba(139,92,246,0.18)`, hover glow
- Standard: bg `#0d0e17`, border `rgba(255,255,255,0.07)`
- All cards: border-radius 13px, hover `translateY(-3px)` + purple glow shadow

---

## Never use

`bg-white`, `bg-slate-*`, `bg-gray-*`, `bg-indigo-50`, `text-slate-*`,
`shadow-*` Tailwind defaults, light backgrounds of any kind.

## Always use

Dark surfaces only. Purple (`#7c3aed`) as sole accent.
Emerald (`#10b981`) for score 4.0+. Indigo (`#4f46e5`) for score 3.0–3.4.

---

## Engineering rules

- Preserve all functionality, routing, state, localStorage
- No breaking changes to RSS feed, search, filters, bookmarks, read state, unread toggle, saved page, article pages, auto-refresh
- No `* { transition: all }` — use targeted transitions
- Full-file replace when >8 class changes touch a file

---

## Core Features (never break)

RSS feed · search · source filter · daily brief · top signals · bookmarks · read state · unread toggle · saved page · article pages · auto-refresh workflow
