# Project Identity

AI Signal is a premium editorial intelligence product — not a generic news website, not a SaaS dashboard.
It helps founders, PMs, and operators scan, prioritize, and act on important AI developments quickly.

The product must feel: calm, intelligent, structured, warm.
It must not feel: generic, sterile, decorative, overbuilt.

---

# Product Principles

- Clarity over clutter
- Editorial hierarchy over decorative styling
- Never flatten into a generic dashboard
- Keep users inside the product flow
- Preserve existing logic unless explicitly changing it
- Prefer practical product improvements over superficial decoration
- Every section must have a distinct visual identity (hero ≠ brief ≠ signals ≠ cards)

---

# Design Principles

- Warm light surfaces (cream / parchment / soft stone) — never plain sterile white
- White cards that contrast against a warm base — not white on white
- Strong section differentiation through surface, border, and spacing — not decoration
- Soft but visible borders (not invisible, not heavy)
- Restrained shadows — only where they add depth, not everywhere
- `rounded-2xl` for containers and cards (editorial feel); `rounded-full` for pills/buttons only
- High whitespace discipline
- Strong typography hierarchy (eyebrow → title → body → meta)
- Accent colors must feel curated: one primary (indigo), one functional (amber), nothing else

---

# Design Token Reference

Use these exact values. Do not substitute with Tailwind defaults unless they match.

```
Page base:         body gradient — linear-gradient(160deg, #EDE7DC 0%, #F5F1EC 45%, #FAFAF9 100%) fixed
Surface/warm:      #F7F4F0   — nav buttons, Top Signals container, insets, read-state cards
Surface/deep:      #F2EDE5   — Daily Brief background
Surface/featured:  from-[#EDE8E0] via-[#F5F1EC] to-white — hero + article page header
Surface/card:      #FFFFFF   — primary cards

Border/default:    #E0D9CF   — standard warm border
Border/strong:     #C8C0B5   — hover, featured emphasis
Border/light:      #EDE8E2   — internal card dividers, insets

Text:              stone-900 / stone-600 / stone-500 / stone-400
                   Prefer stone-* for primary text and surfaces (warmer tone)
                   gray-* is acceptable for subtle decorative elements (dividers, placeholders)

Indigo:            indigo-600 for solid CTAs and active states
                   indigo-50 for tinted backgrounds
                   indigo-200 for tinted borders

Amber:             amber-600 text / amber-50 bg / amber-300 border
                   Use ONLY for bookmark/saved emphasis
```

---

# Section Identity (enforce per section)

| Section        | Surface           | Border                          | Special treatment                          |
|----------------|-------------------|---------------------------------|--------------------------------------------|
| Hero           | Featured gradient | `border border-[#C8C0B5] shadow-[0_6px_32px_rgba(0,0,0,0.09)]` | Large type, solid indigo CTA, italic "why it matters". No accent stripe — hierarchy comes from scale + surface. |
| Daily Brief    | `#F2EDE5`         | `#E0D9CF` + `border-l-[3px] border-l-indigo-300` | Memo block, not a card |
| Top Signals    | `#F7F4F0` unified container | `#E0D9CF` outer, `#E8E2DB` row dividers | Rows hover to white; no individual rounded cards |
| Article Cards  | `#FFFFFF`         | `#E0D9CF` default, `#C8C0B5` hover | `rounded-2xl`, footer `border-t #EDE8E2`, read state `opacity-60` (not less — preserve legibility) |
| Article Page   | Featured gradient header | `#E8E1D8` divider | Warm header zone matches hero |

---

# Button System

- Active filter / primary CTA: `bg-indigo-600 text-white border-indigo-600` — solid, decisive
- Nav / secondary actions: `bg-[#F7F4F0] border-[#D5CEC5] text-stone-600` — warm fill, not plain white
- Inactive filter: `bg-white border-[#D5CEC5] text-stone-600`
- Bookmark active: `bg-amber-50 border-amber-300 text-amber-600`
- Bookmark inactive: `bg-[#F7F4F0] border-[#E0D9CF] text-stone-300`

---

# Typography System

- Eyebrow labels: `text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400`
- Section heading: `text-xl font-semibold text-stone-900`
- Card title: `text-[0.9375rem] font-semibold leading-[1.5] text-stone-900`
- Hero title: `text-4xl md:text-5xl font-semibold leading-[1.12] tracking-tight text-stone-900`
- Body: `text-sm leading-6 text-stone-500`
- Meta: `text-xs text-stone-400`

---

# Engineering Principles

- Preserve all existing functionality exactly
- Do not rewrite unrelated files
- Prefer scoped edits; use full-file replacement only when class changes are pervasive throughout
- Use Next.js Link for internal navigation
- Never break routing, state, localStorage, RSS behavior, or automation
- No `* { transition: all }` global rules — use targeted `transition-colors duration-150`
- Keep code readable and production-friendly

---

# Working Rules (Non-negotiable)

1. Show changes before writing — explain what will change, then wait for approval before touching files
2. Prefer exact block replacements; only do full-file if the change touches >10 class strings
3. Minimize token usage — only read files in scope
4. Never redesign the whole app unless explicitly asked
5. If request is broad, break into phases and confirm scope

---

# Core Features to Preserve

- RSS feed and realNews.json data source
- Search and source filter
- Daily Brief generation
- Top Signals section
- Bookmarks (localStorage)
- Read state (localStorage)
- Unread only toggle
- Saved page
- Internal article pages
- Auto-refresh GitHub workflow
