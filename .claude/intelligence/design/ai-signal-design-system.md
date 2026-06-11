# AI Signal — Design System
> Single source of truth for all visual and component decisions. Figr AI–ready.
> Last updated: 2026-05-06. Branch: backend-v11.

---

## 1. Brand Identity

**Product name:** AI Signal  
**Tagline:** *AI changed overnight. Here's what to build.*  
**Secondary tagline:** One story. Every day. Signal over noise.  
**Voice:** Editorial, direct, builder-forward. Hinglish-friendly in founder voice sections.

### Brand personality
- Authoritative but not stuffy
- Data-rich but scannable
- Warm accents (orange) on cold intelligence (blue)
- Handwritten elements for "human curator" moments

---

## 2. Color Tokens

### Web (CSS custom properties — `globals.css :root`)

#### Background
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FAFAF7` | Page background |
| `--bg-card` | `#FFFFFF` | Card surfaces |
| `--bg-soft` | `#F4F2EC` | Muted sections, cascade bg |
| `--bg-warm` | `#FBF8F1` | Warm-tinted panels |
| `--hero-bg` | `#F6F7FB` | Hero zone background |
| `--hero-tint` | `#EEF1FF` | Hero zone tint overlay |

#### Text
| Token | Hex | Use |
|---|---|---|
| `--text` | `#14110F` | Body, headings — near-black warm |
| `--text-soft` | `#2D2A26` | Secondary body |
| `--text-mute` | `#5C574F` | Labels, metadata |
| `--text-faint` | `#8A847A` | Eyebrows, disabled, source names |

#### Primary — Signal Blue
| Token | Hex | Use |
|---|---|---|
| `--signal` | `#2B5BFF` | CTA, links, signal block border, active states |
| `--signal-deep` | `#1F44CC` | Hover state for signal |
| `--signal-soft` | `#E5EBFF` | Chip backgrounds, card tints |
| `--signal-faint` | `#F4F6FF` | Very light signal tint |

#### Accent — Warm Orange
| Token | Hex | Use |
|---|---|---|
| `--warm` | `#FF6B35` | Timestamps, "The Move", live pips, builder burn |
| `--warm-soft` | `#FFE8DD` | Warm chip backgrounds |

#### Semantic
| Token | Hex | Use |
|---|---|---|
| `--green` | `#1B7A3E` | Success, GO verdict, builder bet, live status dot |
| `--green-soft` | `#E0F2E5` | Green chip/card backgrounds |
| `--water` | `#0EA5E9` | Water/info category |
| `--water-soft` | `#E0F2FE` | Water backgrounds |
| `--money` | `#16A34A` | Score pip, funding category |
| `--money-soft` | `#DCFCE7` | Money backgrounds |
| `--rocket` | `#EA580C` | "Run" action tag |
| `--rocket-soft` | `#FFEDD5` | Run action backgrounds |
| `--energy` | `#CA8A04` | Energy category |
| `--energy-soft` | `#FEF9C3` | Energy backgrounds |

#### Paper / Notebook
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FFF8DC` | Notebook background, envelope stack |
| `--paper-deep` | `#FAEFC1` | Envelope flap |
| `--paper-line` | `#E8D88A` | Notebook ruled lines |
| `--ink-pen` | `#2B4A8F` | Handwritten text, notebook doodles |

#### Borders
| Token | Hex | Use |
|---|---|---|
| `--border` | `#E5E2D9` | Default dividers |
| `--border-mid` | `#D6D2C5` | Medium-weight borders |
| `--border-strong` | `#B8B3A3` | Strong dividers, archive links |

#### Neutrals
| Token | Hex | Use |
|---|---|---|
| `--beige` | `#F0E9D8` | Counter view bg |
| `--beige-deep` | `#E5DCC4` | Counter view border |

### Category Color System (web)

| Category | Accent | Tint | Text on tint |
|---|---|---|---|
| models | `#4F46E5` | `#EEF2FF` | `#312e6b` |
| tools | `#F97316` | `#FFF1E6` | `#7c2d12` |
| business/funding | `#10B981` | `#E7F8F0` | `#065f46` |
| research | `#8B5CF6` | `#F2EDFE` | `#4c1d95` |
| infra | `#6B7280` | `#F1F1F0` | `#374151` |
| policy/safety | `#EF4444` | `#FDECEC` | `#991b1b` |
| product | `#EC4899` | `#FCEAF3` | `#9d174d` |

### Hardcoded accent colors (not in tokens)
- `#22a85a` — Hero tickers/preview card 3rd accent (green variant)
- `#C0392B` — Notebook numbers (red ink)
- `#86EFAC` — Decision pill GO border
- `#FDBA74` — Decision pill WAIT border
- `#FCA5A5` — Decision pill NO border
- `#166534` — Decision pill GO text
- `#9A3412` — Decision pill WAIT text
- `#991B1B` — Decision pill NO text

---

## 3. Typography

### Font Stack

| Variable | Family | Weights | Use |
|---|---|---|---|
| `--ff-display` | Instrument Serif → Georgia → serif | 400 (normal + italic) | Headlines, big numbers, display text |
| `--ff-body` / `--ff-sans` | Inter → system-ui → sans-serif | 400–700 | Body copy, UI labels |
| `--ff-mono` | JetBrains Mono → ui-monospace | 400/500/600/700 | Eyebrows, labels, code, metadata |
| `--ff-hand` | Caveat → cursive | 500/600/700 | Notebook strip, handwritten moments |
| `--font-fraunces` | Fraunces | 400 (optical sizing, italic) | Available but less used |

### Tailwind font classes
```
font-display → var(--font-display), Georgia, serif
font-sans    → var(--font-inter), system-ui, sans-serif
font-mono    → var(--font-mono), ui-monospace, monospace
font-hand    → var(--font-hand), cursive
font-fraunces → var(--font-fraunces), Georgia, serif
```

### Type Scale

| Class/Usage | Size | Line Height | Letter Spacing | Weight | Family |
|---|---|---|---|---|---|
| `.big-headline` | `clamp(52px, 8.4vw, 108px)` | 0.96 | -0.038em | 400 | display |
| `.story-headline` | `clamp(32px, 4.4vw, 50px)` | 1.12 | -0.022em | 400 | display |
| `.block-title` | 30px | 1.1 | -0.02em | 400 | display |
| `.builder-quote` | 26px | 1.32 | -0.01em | 400 | display |
| `.archive-title` | 44px | 1 | -0.025em | 400 | display |
| `.story-deck` | 19px | 1.72 | -0.012em | 400 | body |
| `.signal-body` | 18px | 1.74 | — | 400 | body |
| `.context-body` | 18px | 1.75 | — | 400 | body |
| `.hero-broadcast-line` | 24px | 1.4 | -0.012em | 400 | display |
| `.compare-subtitle` | 22px | 1.2 | -0.015em | 400 | display |
| `.tldr-text` | 16px | 1.55 | — | 500 | body |
| `.open-question-text` | 19px | 1.45 | -0.015em | 400 | display (italic) |
| Eyebrows (`.block-eyebrow`, `.score-eyebrow`) | 11px | — | 0.14–0.18em | 600–700 | mono, uppercase |
| Labels (`.hero-ticker-label`) | 9.5px | — | 0.18em | 700 | mono, uppercase |
| Smallest caps | 8.5–9px | — | 0.1–0.2em | 600–700 | mono, uppercase |

### Base body
```css
font-size: 18px; line-height: 1.7; letter-spacing: -0.005em;
```
Mobile (`≤640px`): `font-size: 15px`

### Notebook font
```css
.nb-title:    Caveat, 34px, 700, underlined
.nb-fact-text: Caveat, 26px, 600
.nb-counter:  Caveat, 17px, 500
```

---

## 4. Spacing & Layout

### Max-widths
| Token | Value | Use |
|---|---|---|
| `max-w-content` | `720px` | Reading column (articles) |
| `max-w-wire` | `1280px` | Full-width layout container |

### Main grid
```css
.main-grid {
  max-width: 1280px;
  display: grid;
  grid-template-columns: 1fr 280px;  /* article + sidebar */
  gap: 56px;
  padding: 0 32px;
  margin: 60px auto 0;
}
/* ≤1080px: single column, sidebar hidden */
/* ≤880px: padding 0 20px */
```

### Story article
```css
.story-wrap {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px;
  box-shadow: layered 3-level;
}
/* ≤880px: padding 32px 20px */
```

### Hero zone
- Hero broadcast: `max-width: 760px`, padding `36px 32px 30px`
- Hero tickers / preview strip: `max-width: 720px`, 3-col grid, gap 10px
- Notebook strip: `max-width: 1280px`, padding `0 32px`

### Block spacing
- Between article blocks (`.block`): `margin-bottom: 56px`
- Within block: header 18px margin, title 16px margin
- Signal block: `margin-bottom: 40px`
- Author row: `padding: 16px 0`, `margin-bottom: 36px`

---

## 5. Border Radius Scale
| Value | Use |
|---|---|
| 4px | Tiny chips, source tags |
| 6px | Small badges, pills |
| 8px | Archive cat pill, source favicon |
| 10px | Decision rows, insight cells |
| 12px | Insights strip, standup, compare chart |
| 14px | Signal block, counter block |
| 16px | Builder block, score card, sidebar cards |
| 20px | Story wrap |
| 24px | Subscribe card |
| 100px | Full pill shape |
| 50% | Avatars, dots |

---

## 6. Shadow Vocabulary
| Level | CSS | Use |
|---|---|---|
| 1 (subtle) | `0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)` | Story wrap |
| 2 (card) | `0 1px 4px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.05)` | Hero tickers |
| 3 (hover) | `0 8px 24px rgba(0,0,0,0.08)` | Stat card hover |
| 4 (lift) | `0 12px 28px rgba(0,0,0,0.08)` | Builder card hover |
| 5 (hero card) | `0 1px 4px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.08)` | Hero today card |

---

## 7. Animation Vocabulary

| Name | Duration | Curve | Effect |
|---|---|---|---|
| `hwRise` | 0.9s | `cubic-bezier(0.22,1,0.36,1)` | Hero words rise from below + derotate |
| `livePulse` | 1.4–1.8s | ease-in-out | Live pip scale pulse (0.85→1→0.85) |
| `caretBlink` | 0.9s | steps(2) | Typing cursor blink |
| `broadcastBreath` | 8s | ease-in-out | Hero broadcast radial gradient fade |
| `scanTravel` | 7s | ease-in-out | Horizontal scan line across hero |
| `bridgeFlow` | 4s | ease-in-out | Line shimmer on hero bridge |
| `paperSway` | 6s | ease-in-out | Notebook gentle tilt ±0.4deg |
| `scribble` | 0.35s | ease-out | Strikethrough line drawing |
| `writeIn` | 0.9s | cubic-bezier(.25,.46,.45,.94) | Text fade-write-in |
| `paceFadeIn` | 0.5s | ease-out | Reading streak pace reveal |
| Reading progress | 0.1s | ease-out | Top bar width transition |

### Standard transitions
- Hover lift: `transform 0.2s, box-shadow 0.2s`
- Color change: `color 0.2s, border-color 0.2s`
- Button scale: `transform 0.25s, box-shadow 0.25s`
- Slow reveal: `transform 0.4s cubic-bezier(0.2,0.8,0.2,1)`

---

## 8. Component Inventory

### Navigation — `SiteNav.tsx`
```
.site-nav-inner: sticky top:3px, backdrop-filter blur(12px), bg rgba(250,250,247,0.88)
.nav-mark: logo + text, 36px icon, 28px box with live warm pip
.nav-mark-name: 15px, 700, body font
.nav-mark-tag: 8.5px mono uppercase, text-faint
.nav-tab / .nav-tab--active: 14px, underline on active
.nav-ring: SVG radial timer ring, warm stroke, animates on scroll
```

### Hero Zone

#### `HeroBroadcast.tsx` — `.hero-broadcast`
- Radial gradient bg + noise texture overlay + scan line animation
- `.hero-broadcast-eyebrow`: live orange pip, mono uppercase 9.5px, 0.32em spacing
- `.hero-broadcast-line`: display font 24px, typed text + italic spans + mono numbers in warm
- `.hero-broadcast-meta`: mono 10px uppercase, live pip, topic pills

#### `HeroTickers.tsx` — `.hero-tickers`
- 3-col grid, max-width 720px
- Each `.hero-ticker`: white card, top border signal/warm/green per nth-child, hover lift
- `.hero-ticker-label`: mono 9.5px, live pip
- `.hero-ticker-value`: display 22px, baseline-aligned delta mono 10px (`.up` = green, `.down` = signal blue)
- `.hero-ticker-detail`: 11px text-mute

#### `HeroPreviewStrip.tsx` — `.hero-preview-strip`
- 3-col grid, max-width 720px, same nth-child color system as tickers
- `.hero-preview-card`: links to article anchors, display font value 17px
- `.preview-arrow`: opacity 0.5 → 1 on hover, gap animates

### Article Components

#### Story Wrap
```
.story-wrap: white card, border-radius 20px, padding 48px
.story-meta: flex row, gap 12px — category chip + meta text + timer bar
.story-headline: display clamp(32–50px), leading 1.12
.story-deck: 19px body, leading 1.72, text-soft
```

#### TL;DR Strip — `.tldr-strip`
- Orange left border (4px), warm gradient bg `#FFF8F0→#FFF3E0`
- Orange square icon box (38px, border-radius 10px) with "TL;DR" mono text
- `.tldr-text`: 16px, weight 500; `strong` = warm color

#### Author Row — `.author-row`
- Avatar: 38px gradient circle (signal→warm), green online dot (11px bottom-right)
- `.author-name`: 14px 600; `.author-handle`: 13px text-mute

#### Signal Block — `.signal-block`
- `border-left: 4px solid var(--signal)`, signal-faint gradient bg
- `.signal-eyebrow`: mono 11px, signal blue, uppercase
- `.signal-body`: 18px, leading 1.74

#### Block Sections — `.block`
- `.block-num`: 26×26px dark square, 7px radius, mono 12px white
- `.block-eyebrow`: mono 11px, text-mute, uppercase
- `.block-title`: display 30px, 16px margin below

#### Stat Cards — `.stat-cards`
- 3-col grid → 1-col at ≤640px
- `.stat-card`: top 3px signal border, 20px padding
- `.stat-card-value`: display 32px, baseline gap 8px, wraps on mobile
- `.stat-card-delta`: mono 10px, green bg (color-mix), border-radius 4px
- `.stat-card-detail`: 12px text-mute, top border rule

### V11 Data Sections

#### InsightsStrip — `InsightsStrip.tsx` / `.insights-strip`
- 3-col grid, no gap, outer border + radius 12px, white bg
- `.insight-cell`: 22px 24px padding, border-right between cells
- `.insight-icon`: 28px warm-soft box, mono icon
- `.insight-label`: mono 10px text-mute uppercase
- `.insight-text`: 15px 500; `==text==` syntax → `.highlight` span (warm-deep)

#### PrimaryChart — `PrimaryChart.tsx` / `.compare-chart`
- Comparison bars: `.compare-row` 3-col grid (140px label | track | 80px value)
- Bar fills: `.signal` / `.warm` / `.mute` color classes
- Trajectory: SVG line chart (rendered inline)
- Cap flow: source→target→amount display
- Quote callout: editorial-quote style

#### CascadeTimeline — `CascadeTimeline.tsx` / `.cascade-grid`
- 4-step horizontal timeline in bg-soft panel
- Connecting line: `linear-gradient(signal→warm)` 2px, z-index 0
- `.cascade-marker`: 30px circle, text border 2px, mono 11px

#### StakeholdersGrid — `StakeholdersGrid.tsx` / `.stakeholder-grid`
- 2×2 matrix, `.stakeholder-cell`
- `.win`: green gradient bg + `#BBF7D0` border; `.lose`: warm gradient + `#FED7AA` border
- Label pill: 100px border-radius, `.win` = `#DCFCE7 / #166534`

#### DecisionAid — `DecisionAid.tsx` / `.decision-aid`
- Light blue/orange gradient bg, signal-soft border
- `.decision-question`: display 24px
- `.decision-row`: 2-col grid (question | pill wrap), left border color-coded
  - `.go` left: `#86EFAC`; `.wait`: `#FDBA74`; `.no`: `#FCA5A5`
- `.decision-pill`: mono 10px uppercase, 100px radius
  - `.go`: `#DCFCE7 / #166534 / #86EFAC border`
  - `.wait`: `#FFF7ED / #9A3412 / #FDBA74 border`
  - `.no`: `#FEE2E2 / #991B1B / #FCA5A5 border`
- `.decision-verdict`: dark bg (`var(--text)`), white text, display 18px

#### ReactionsPanel — `ReactionsPanel.tsx` / `.reaction-grid`
- 3-col grid, each `.reaction-card`: white, top border signal/warm/text-mute per nth-child
- `.reaction-quote`: display 16px italic
- `.reaction-avatar`: 30px circle, gradient bg, mono initial

#### Standup Card — `.standup-card`
- Warm top border (4px), white bg
- 4 platform tabs (Slack/Email/WhatsApp/LinkedIn): flex, bottom-border active indicator (warm)
- `.standup-preview`: white inner, 14px body, `pre-wrap`
- Copy button: full-width dark, hover signal blue

### Sidebar Components

#### Score Card — `.score-card`
- 130px SVG ring with gradient stroke (`scoreGrad` linearGradient)
- `.score-ring-num`: display 38px with italic `.pct` (22px signal)
- `.score-msg-title`: display 19px italic

#### Tomorrow Probably Card — `.probably-card`
- Envelope stack: 3 envelopes at rotate(-1°)/rotate(0.8°)/rotate(-0.5°), z-index layered
- `.probably-env`: paper bg, 180,140,60 border system
- Hover: top envelope lifts -3px, fans out

### Utility Components

#### Builder Block — `BuilderCard.tsx`
```
.builder-block: dark bg linear-gradient(#14110F → #1F44CC) + noise + signal radial glow
.builder-quote: display 26px white
.builder-secondary: 2-col grid
.builder-bet: green top border (4px), green tint bg
.builder-burn: warm top border (4px), warm tint bg
```

#### Notebook Strip — `NotebookStrip.tsx`
- Ruled paper bg (`repeating-linear-gradient` 30px lines), rotate(-0.4deg), paperSway animation
- `::before`: masking tape (yellow, 100px wide, rotate -2deg)
- `::after`: red margin line (left: 60px)
- `.nb-title`: Caveat 34px, underlined in ink-pen opacity
- `.nb-fact-text`: Caveat 26px — `==num==` → `.nb-num` for red ink numbers
- Scribble-out transition: strikethrough line drawn via CSS animation

#### ChaiButton — `ChaiButton.tsx`
- `.chai-btn`: support button
- Modal overlay with UPI QR code (200×200, from qrserver API)
- Touch: redirects to `upi://pay?...` directly; Desktop: shows QR modal

#### BuilderCard — `BuilderCard.tsx`
- Renders `editorial_take`, `lenses.bet`, `lenses.burn` from story fields
- Parses `**bold**` markdown into `<strong>` via `boldHtml()`

### Page-level States

#### Signal Expired — `SignalExpired.tsx` / `.signal-expired`
- Dimmed headline (opacity 0.55, italic)
- Live warm pip + "Next signal" teaser text
- Category chip

#### Signal Gate — `SignalGate.tsx`
- Freemium paywall shown when `isWithin24h()` returns false (currently disabled)

---

## 9. Extended Data Schema

All sections stored in `stories.extended_data` (jsonb). TypeScript types at `src/lib/types/extended-data.ts`.

| Field | Type | Description |
|---|---|---|
| `numbers_headline` | `string?` | AI-generated title for "By the numbers" block |
| `matters_headline` | `string?` | AI-generated title for "Why it matters" block |
| `one_breath` | `{ text: string }` | 18–24 word punchy opener |
| `tickers` | `TickerData[3]` | Hero zone live data cards |
| `preview_cards` | `PreviewCard[3]` | Hero zone "what's inside" |
| `did_you_know_facts` | `DidYouKnowFact[]` | Notebook strip rotating facts |
| `primary_chart` | `ComparisonChart` | Article infographic (comparison/trajectory/cap_flow/quote_callout) |
| `insights_strip` | `InsightCell[3]` | 3-col insight grid |
| `cascade` | `CascadeData` | 4-step timeline (forecast/history) |
| `stakeholders` | `StakeholdersData` | 2×2 impact grid (win_lose/evidence_grid/before_after) |
| `decision_aid` | `DecisionAid` | 3-question verdict flow |
| `reactions` | `Reaction[3]` | Industry voice quotes |
| `standup_messages` | `StandupMessages` | Slack/Email/WhatsApp/LinkedIn |
| `tomorrow_drafts` | `TomorrowDraft[]` | Sidebar envelope stack |
| `open_question` | `string?` | The one unresolved question |
| `replaces` | `{ yes, not_yet }` | Tools category: what it replaces |
| `readiness_level` | `'lab'|'paper'|'prototype'|'product'|'deployed'` | Research category progress |
| `signal_boost` | `SignalBoost` | End-of-article bonus (prompt/quote/fact) |
| `suraj_note` | `string?` | Founder voice note |

### Verdict values (DecisionAid)
- `go` / `wait` / `no` → standard 3-option
- `segment_a` / `segment_b` / `segment_c` → segment_impact frame

---

## 10. Responsive Breakpoints

| Breakpoint | Value | Effect |
|---|---|---|
| Large tablet | `≤1080px` | Main grid → 1 col, sidebar hidden |
| Tablet | `≤880px` | Nav padding reduces, archive → 1 col, stat cards → 1 col |
| Mobile | `≤720px` | Hero broadcast min-height increases, builder secondary → 1 col |
| Mobile S | `≤640px` | Font base 15px, sub-form vertical, hero broadcast mobile layout |
| Mobile XS | `≤600px` | Hero today card edge-to-edge |
| Mobile XS | `≤480px` | Replaces block → 1 col |

---

## 11. Email Design System

Completely separate from web — all inline JS constants in `src/lib/email-templates.ts`. Max-width 600px, web-safe fonts only.

### Email Tokens
```js
// Background
CANVAS = '#ece9e3'  // outer bg
FILL   = '#fbfaf8'  // card bg
TAN    = '#FBF6EE'  // suraj note bg
PAPER  = '#FFF8DC'  // paper tint

// Text
INK    = '#1c1a17'  // heading
BODY_CLR = '#3d3a34'  // body
META   = '#8a857d'  // metadata
FAINT  = '#a8a297'  // faint

// Borders
LINE   = '#e7e3db'  // default
LINE_2 = '#ddd8cf'  // strong

// Primary — Indigo (email)
INDIGO      = '#4F46E5'
INDIGO_TINT = '#EEF2FF'
INDIGO_TEXT = '#312e6b'

// Accent — Orange (email)
ORANGE     = '#F97316'
ORANGE_TINT = '#FFF7ED'
ORANGE_INK  = '#7c2d12'
ORANGE_LBL  = '#c2410c'

// CTA
BUTTON = '#0F172A'  // near-black CTA button
```

### Email Font Stacks
```
Mono:  'SF Mono','JetBrains Mono',ui-monospace,Menlo,Consolas,monospace
Serif: Georgia,'Times New Roman',serif
Sans:  -apple-system,system-ui,'Segoe UI',Helvetica,Arial,sans-serif
```

### Email Category Colors
| Category | Accent | Tint |
|---|---|---|
| models | `#4F46E5` | `#EEF2FF` |
| tools | `#F97316` | `#FFF1E6` |
| business/funding | `#10B981` | `#E7F8F0` |
| research | `#8B5CF6` | `#F2EDFE` |
| infra | `#6B7280` | `#F1F1F0` |
| policy/safety | `#EF4444` | `#FDECEC` |
| product | `#EC4899` | `#FCEAF3` |

### Email Sections (13+)
1. `sMasthead` — brand header
2. `sCategoryBadge` — category pill
3. `sHeadline` — story title
4. `sOneBreath` — orange left-border "In one breath"
5. `sTheSignal` — indigo left-border signal text
6. `sStatsGrid` — 3-col stat cards
7. `sWhyItMatters` — body section
8. `sEditorsTake` — editorial perspective
9. `sPlaybook` — "The move" action section
10. `sCtaButton` — dark `#0F172A` button
11. `sCounterView` — 3 quote cards "In the field"
12. `sSurajTake` — TAN bg, founder voice (Hinglish per category)
13. `sTipJar` — UPI QR chai support
14. `sAIFact` — rotating AI fact
15. `sPS` — postscript
16. `sFooter` — footer with unsubscribe

---

## 12. Design Patterns & Rules

### Hierarchy pattern
1. Mono uppercase eyebrow (9.5–11px, 0.14–0.18em tracking)
2. Display font title/subtitle
3. Body content
4. Mono metadata footer

### Left-border language
| Border color | Meaning |
|---|---|
| `var(--signal)` 4px | Primary signal / key insight |
| `var(--warm)` 4px | Action / timing / "the move" |
| `var(--green)` 4px | Builder bet / go verdict |
| `#86EFAC` 3px | GO decision row |
| `#FDBA74` 3px | WAIT decision row |
| `#FCA5A5` 3px | NO decision row |
| Dashed border | Open question / uncertain |

### Top-border language (cards)
- Signal blue = first/primary
- Warm orange = second/medium
- Green `#22a85a` = third/positive

### Live indicators
- `livePulse` animation (1.4–1.8s) on any green dot
- Always 5–6px circle
- Present on: nav ring pip, score pip, broadcast eyebrow, hero tickers, tomorrow status

### Dark sections
- Only `.builder-block` uses dark bg (`#14110F → #1F44CC`)
- Subscribe card uses `var(--text)` bg
- Decision verdict uses `var(--text)` bg

### Interactive states
- Hover lift: `translateY(-2px)` to `translateY(-4px)` depending on card weight
- Active border underscore: `border-bottom: 1px solid var(--text)`
- Signal hover: border-bottom becomes signal blue
- Feedback voted state: signal-soft bg, pointer-events none

### Font pairing rules
- Display (Instrument Serif) + Mono (JetBrains): primary article pairing
- Caveat only in notebook strip — never elsewhere
- Fraunces loaded but rarely used; display is the primary serif

### Spacing system
Not strict multiples — context-driven. Common values: 4, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64px.

### Content width constraint
Reading pages hard-cap at `720px` max-width. Never exceed. Sidebar collapses before content narrows.

---

## 13. Figr AI Prompting Notes

When generating designs from this system:

**Do use:**
- `#FAFAF7` page bg, `#14110F` primary text
- Instrument Serif (or Georgia fallback) for all display text — always weight 400, use italic sparingly for emphasis
- JetBrains Mono for ALL labels, eyebrows, metadata — never body copy
- 3-column grid pattern for tickers, preview cards, insights
- Left-border cards (3–4px colored) as the primary information container pattern
- Top-border 3px color coding: signal blue / warm orange / green (nth-child progression)
- Near-black dark panels only for editorial voice sections (The Build)

**Do not:**
- Never use Caveat outside notebook aesthetic moments
- Never use Fraunces in new designs (legacy)
- Never use `#000000` black — always `#14110F` warm near-black
- Never use generic blue — always `#2B5BFF` signal blue
- Never add drop shadows heavier than level 4 (listed above)
- Never exceed `720px` column width for reading content
- Never use `transition: all` — always specify properties
