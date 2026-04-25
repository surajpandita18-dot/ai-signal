# AI Signal — Design System
Last updated: 2026-04-25
Rule: This file overrides CLAUDE.md for all visual decisions.
Rule: Overwrite freely. This file evolves constantly.

---

## Current Direction
Dark editorial briefing. Premium. Fast to scan.
NOT: generic dark SaaS dashboard
YES: morning intelligence briefing with editorial personality
FEEL: Rundown AI × Superhuman AI × Linear

---

## Inspiration Stack

### PRIMARY: The Rundown AI (therundown.ai)
Observed: April 2026
Adopt:
- Emoji before every article title — instant visual hook
  🧠 LLM/Models  🔬 Research  ⚡ Infra  💰 Funding
  🚀 Product  🤖 Agents  📦 Open Source  🛡️ Policy  📡 Default
- Bold "WHAT" / "WHY IT MATTERS" labels — more weight than body text
- Dark header with strong contrast against content
- Email input huge + prominent above fold
- Secondary CTA: "Browse without email" — zero-friction path
- Company logos for social proof (add when real users exist)

Skip:
- White content sections (we stay fully dark)
- Generic thumbnails
- Breadth over depth (we do fewer, better signals)

### SECONDARY: Superhuman AI
Adopt:
- Left border color on cards = category identity (instant scan)
- Very clean card layout — source + title + read link
- Strong typographic hierarchy within each item

### TERTIARY: Linear
Adopt: calm density, Inter font, minimal accent usage
Skip: task-management UI patterns

---

## Color System

```
--bg:              #0a0a0a
--bg-card:         #111111
--bg-card-hover:   #161616
--bg-elevated:     #1a1a1a
--border:          rgba(255,255,255,0.08)
--border-hover:    rgba(255,255,255,0.15)
--purple:          #7c3aed
--amber:           #f59e0b   ← TAKEAWAY only, never elsewhere
--amber-dim:       #d97706   ← secondary signals
--text-1:          #ffffff
--text-2:          #a1a1aa
--text-3:          #52525b
--text-4:          #27272a
```

**Amber = TAKEAWAY only. Purple = chrome. Never swap.**

Category colors + emoji (use consistently everywhere):
```
LLM / Models:  #7c3aed  🧠
Research:      #2563eb  🔬
Infra:         #059669  ⚡
Funding:       #d97706  💰
Product:       #dc2626  🚀
Agents:        #7c3aed  🤖
Open Source:   #0891b2  📦
Policy:        #6b7280  🛡️
Default:       #52525b  📡
```

---

## Typography

```
Font: Inter (variable) — loaded via globals.css
Headings:  Inter 700–800, letter-spacing: -0.02em
Body:      Inter 400
Labels:    Inter 600–700, uppercase, letter-spacing: 0.08–0.1em

Scale:
xs:   11px  (labels, timestamps, pills)
sm:   13px  (secondary body, nav links)
base: 15px  (primary body)
lg:   17px  (card titles)
xl:   20px  (Zone 1 titles)
2xl:  28px  (page headers)
3xl:  36px  (landing hero subhead)
hero: 48px  (landing headline)
```

Spacing: 8px base. All multiples of 8.
Max content width: 768px centered.

---

## Zone 1 — Signal Row (implementation)

Structure top to bottom:
1. Signal number: 44px, `rgba(124,58,237,0.12)`, weight 800
2. Source row: `[dot] [SOURCE] · [date] [category pill]`
3. Title: `{emoji} {title}` — 19px, weight 700, tight line-height
4. WHAT label: 10px, uppercase, weight 700, `#71717a`
   WHAT body: 14px, `#a1a1aa`, line-height 1.65
5. WHY label: 10px, uppercase, weight 700, `#71717a`
   WHY body: 14px, `#a1a1aa`, line-height 1.65
6. TAKEAWAY: `border-left: 2px solid rgba(245,158,11,0.5)`, `padding-left: 14px`
   Label: 10px, uppercase, weight 700, amber
   Body: 15px, amber, line-height 1.6
7. Row divider: `1px solid rgba(255,255,255,0.05)`
8. Hover: `#111111` bg only. No translateY. No glow.

Emoji implementation (Zone1Signal.tsx) — uses tags[], NOT signal.category:
```tsx
const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};
const emoji = signal.tags?.map(t => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
// <Link>{emoji} {signal.title}</Link>
```

---

## Zone 2 — Signal Card (implementation)

Structure:
- Left border: `3px solid {categoryColor}` — Superhuman-style category identity
- Border style: left = color bar, rest = `1px solid rgba(255,255,255,0.08)`
- Border radius: `0 8px 8px 0` (flush left edge, rounded right)
- `[emoji] [SOURCE]` row — emoji from category map
- Score bar: 3px, category color fill
- Title: 13px, weight 600, `#ffffff`, 2-line clamp
- "Read →" in category color (not purple)
- Hover: `#161616` bg only. `transition: background 150ms ease`.

```tsx
// Zone2Card.tsx — left border pattern
<Link style={{
  borderLeft: `3px solid ${categoryColor}`,
  borderRight: "1px solid rgba(255,255,255,0.08)",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0 8px 8px 0",
  ...
}}>
```

---

## Landing Page

Above fold:
- Edition badge: "DAILY BRIEF · FREE" — small, uppercase, amber
- Headline: large, bold, 2 lines, tight tracking
- Subheading: 1 sentence value prop, `#71717a`
- Email input + amber CTA — full width block, prominent
- Secondary: "Browse without email →" in `#52525b`

Below fold:
- "TODAY'S TOP SIGNAL — LIVE" label with pulsing amber dot
- Full Zone1-style preview (real data)
- Stats strip: Daily / 3 min / 24+ sources
- Social proof: add logos when real users exist

---

## Interaction Patterns

Hover: bg color change only — no translateY on Zone 1 rows
Zone 2 cards: `translateY(-1px)` max, subtle
Transitions: `150ms ease`, targeted property only — never `transition: all`
Amber: ONLY on TAKEAWAY — nowhere else
Max border-radius: 8px on cards

---

## Thumbnail (future — do NOT build yet)
Validate with real users first. If needed: category gradient + emoji fallback.

---

## How to Update
When user shares screenshot → add dated section above
When user gives feedback → update relevant section
When competitor analyzed → add to Inspiration Stack
This file is always source of truth. Overwrite freely.
