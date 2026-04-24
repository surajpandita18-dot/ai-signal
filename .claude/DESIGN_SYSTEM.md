# AI Signal — Design System
Last updated: 2026-04-25
Rule: This file overrides CLAUDE.md for all visual decisions.
Rule: Overwrite freely. This file evolves constantly.

## Current Direction
Dark editorial briefing. Premium. Fast to scan.
NOT: generic dark SaaS dashboard
YES: morning intelligence briefing with personality

## Inspiration Stack

### PRIMARY: The Rundown AI (therundown.ai)
Observed: April 2026
Adopt:
- Emoji before article titles for instant visual hook
  🧠 LLM  🔬 Research  ⚡ Infra  💰 Funding
  🚀 Product  🤖 Agents  📦 Open Source  🛡️ Policy
- Bold "The Rundown:" label before summary
  → our version: bold "WHAT" label
- "Why it matters:" explicitly labeled in bold
  → our "WHY" needs more visual weight
- Dark header + content area contrast
- Thumbnail images on article cards
  → implement: OG image fetch or category gradient
- "PLUS: [secondary angle]" subtitle on cards
- Email input huge + prominent above fold
- Company logos for social proof (add when real users)

Skip:
- White content sections (we stay fully dark)
- Generic thumbnails (we are signal-based)
- Breadth over depth (we do fewer better signals)

### SECONDARY: Linear.app
Adopt: calm density, Inter font, minimal accents
Skip: task-management patterns

### SECONDARY: Vercel Dashboard
Adopt: typography as hierarchy, confident minimalism
Skip: deployment-specific patterns

## Color System
--bg: #0a0a0a
--bg-card: #111111
--bg-card-hover: #161616
--bg-elevated: #1a1a1a
--border: rgba(255,255,255,0.08)
--border-accent: rgba(255,255,255,0.15)
--purple: #7c3aed
--amber: #f59e0b        (TAKEAWAY only — never elsewhere)
--amber-dim: #d97706    (secondary signals)
--green: #10b981        (score 4.5+)
--text-1: #ffffff
--text-2: #a1a1aa
--text-3: #52525b
--text-4: #27272a

Category colors + emoji:
LLM/Models:   #7c3aed purple  🧠
Research:     #2563eb blue    🔬
Infra:        #059669 green   ⚡
Funding:      #d97706 amber   💰
Product:      #dc2626 red     🚀
Agents:       #7c3aed purple  🤖
Open Source:  #0891b2 cyan    📦
Policy:       #6b7280 gray    🛡️

## Typography
Font: Inter (variable) — Google Fonts
Headings: Inter 700-800
Body: Inter 400
Labels: Inter 600, uppercase, letter-spacing 0.08em

Scale:
xs:  11px  (labels, timestamps)
sm:  13px  (secondary body)
base: 15px (primary body)
lg:  17px  (card titles)
xl:  20px  (section headers)
2xl: 28px  (page headers)
3xl: 36px  (hero)
hero: 48px (landing)

## Spacing
Base: 8px. All multiples of 8.
Section padding: 48px vertical
Signal row padding: 24px vertical
Card padding: 16px
Max content width: 768px centered

## Zone 1 — Signal Row
Structure (top to bottom):
1. Signal number: 48px, rgba(255,255,255,0.04), editorial
2. Meta row: [emoji] [colored dot] [source] · [date]
3. Title: 20px, weight 700, text-1, tight line-height
4. WHAT label: 10px uppercase bold text-3
   WHAT body: 14px text-2
5. WHY label: 10px uppercase bold text-3
   WHY body: 14px text-2
6. TAKEAWAY block:
   - 2px amber left border
   - padding-left: 16px
   - label: 10px uppercase amber bold
   - body: 15px amber weight 500
7. Footer: tags + "Read signal →" link
8. Divider: 1px rgba(255,255,255,0.05)

Implementation — Zone1Signal.tsx:
Add emoji before title:
  const emoji = CATEGORY_EMOJI[signal.category] || '📡'
  <h2>{emoji} {signal.title}</h2>

## Zone 2 — Signal Card
Structure:
- bg: #111111, border: 1px rgba(255,255,255,0.08)
- border-radius: 8px
- Score bar: 3px, category color
- [Category emoji] [Source name]
- Title: 15px weight 600 text-1
- Secondary line: first 60 chars of WHAT (if available)
- Hover: bg #161616 only, no movement, no glow
- "Read →" link bottom right

Thumbnail (future):
- Fetch OG image from signal.link
- Fallback: category color gradient with emoji centered
- Size: 160x90px, border-radius 6px

## Landing Page
Above fold only:
- Logo top left
- Hero headline: large, bold, 2 lines max
- Subheading: 1 sentence, value prop
- Email input + CTA button: full width, prominent
- Secondary CTA: "Browse signals →" (no email needed)

Below fold:
- Live signal preview (real data)
- How it works: 3 steps with large dim numbers
- Social proof (add when real users exist)

## Interaction Patterns
Hover: color/bg change only — no translateY
Transitions: 150ms ease, targeted properties only
No transition: all anywhere
Modal: dark overlay rgba(0,0,0,0.8), centered panel
Toast: bottom right, auto-dismiss 1.4s
Filter pills: border-color change on active

## Component Rules
border-radius max: 8px on cards
Amber: ONLY on TAKEAWAY — never anywhere else
No box-shadow with large blur
No light backgrounds anywhere
No generic placeholder content — always real data

## How to Update
When user shares screenshot → add dated section above
When user gives design feedback → update relevant section
When competitor analyzed → add to Inspiration Stack
This file is always source of truth. Overwrite freely.
