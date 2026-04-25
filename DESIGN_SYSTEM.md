# AI Signal — Design System
Last updated: 2026-04-25
Rule: This file overrides everything. Overwrite freely.

## Current Direction
FULLY DARK everywhere — landing, app, article, all pages.
Exactly like Rundown AI: dark background, white text, editorial.
NO light theme anywhere. NO white backgrounds. Ever.

## Reference
Rundown AI (therundown.ai) — primary reference
- Dark background #0a0a0a everywhere
- Clean navbar: logo left, minimal links right
- Hero: big bold headline, email input, secondary CTA
- Signals: full-width rows, NO card borders
- Bold inline labels: "The Signal:" / "Why it matters:"
- Emoji prefix on titles
- Thin divider between signals
- Amber accent = one special element only (TAKEAWAY)

## Colors
```
--bg:         #0a0a0a
--bg-card:    #111111
--bg-hover:   #161616
--border:     rgba(255,255,255,0.07)
--purple:     #7c3aed
--amber:      #f59e0b   ← TAKEAWAY only
--text-1:     #ffffff
--text-2:     #a1a1aa
--text-3:     #52525b
```

Category colors + emoji:
```
LLM:       #7c3aed  🧠
Research:  #2563eb  🔬
Infra:     #059669  ⚡
Funding:   #d97706  💰
Product:   #dc2626  🚀
Agents:    #7c3aed  🤖
Open Src:  #0891b2  📦
Policy:    #6b7280  🛡️
Default:   #52525b  📡
```

## Typography
```
Font: Inter variable
Hero headline: clamp(32px,6vw,52px), weight 800, #ffffff
Section labels: 11px, uppercase, letter-spacing 0.12em, #52525b
Signal title: 18–19px, weight 700–800, #ffffff
Body: 14px, #a1a1aa, line-height 1.7
Labels: 10–11px, uppercase, weight 700, letter-spacing 0.1em
```

## Landing Page (DARK)
Background: #0a0a0a
Navbar: logo left "● AI SIGNAL", "Browse →" right in #52525b
Hero:
  - Badge: "DAILY · FREE" 11px uppercase #52525b
  - H1: big bold white headline 2 lines, #a1a1aa for second line
  - Sub: 1 sentence value prop, 17px #71717a
  - Email input: bg #111, border rgba(255,255,255,0.1), white text
  - Subscribe button: bg #ffffff, color #000000
  - Secondary: "Browse without email →" #52525b, underlined
Below fold:
  - "TODAY'S TOP SIGNALS" label, 11px uppercase #3f3f46
  - 1–2 real signals (same editorial style: source → title → The Signal → TAKEAWAY)
  - Thin dividers between signals

## Zone 1 Signal Row
- Full width, NO outer card border
- Only bottom divider: 1px rgba(255,255,255,0.06)
- Signal number: large, rgba(124,58,237,0.1), weight 800
- Source row: dot + SOURCE + date + category pill
- Title: emoji + title, weight 700–800, #ffffff
- "The Signal:" bold white inline + body #a1a1aa
- "Why it matters:" bold white inline + body #a1a1aa
- TAKEAWAY: 2px amber left border, amber text

## Zone 2 Cards
- bg #111111, border-left 3px category color
- border-radius 0 8px 8px 0
- Hover: bg #161616 only. transition: background 150ms ease

## Article Page (DARK)
Background: #0a0a0a
Open typography — NO card wrapper around content
Category → Title → divider → sections as standalone labels
TAKEAWAY: amber left border, amber text
"Read original source ↗" — plain text link, white, underlined
Related signals: thin dividers, no cards

## Rules
- No light backgrounds anywhere. No white backgrounds anywhere.
- No transition: all
- No box-shadow with large blur
- Amber = TAKEAWAY only
- Border-radius max 8px
- Purple = chrome/accent only
