# AI Signal — Component Checklist v2

VEIL checks every item for the relevant component on each review. Reference: `design/references/ai-signal-v8.html`.

---

## StoryCard

### Meta row

- [ ] StoryCard — Category chip uses `--ff-mono`, 12px, uppercase, 0.08em letter-spacing
- [ ] StoryCard — Category chip background uses the correct category color mapping (models=signal, tools=warm, business=money, policy=water, research=energy)
- [ ] StoryCard — Read-time uses `--ff-mono`, 14px, `--text-mute`, not sentence-cased
- [ ] StoryCard — Timer badge uses `--warm-soft` background, `--warm` text, `--ff-mono`, 12px, 600 weight
- [ ] StoryCard — Meta row has no emoji

### Headline

- [ ] StoryCard — Headline uses `--ff-display` (Instrument Serif), NOT Inter or system font
- [ ] StoryCard — Headline uses `clamp(34px, 4.6vw, 52px)` responsive scale
- [ ] StoryCard — Headline `line-height` is 1.06
- [ ] StoryCard — Headline `letter-spacing` is -0.025em
- [ ] StoryCard — Headline `font-weight` is 400 (Instrument Serif is already display weight)
- [ ] StoryCard — Headline color is `--text` (near-black)

### Summary / deck

- [ ] StoryCard — Summary uses Inter body font, 19px, line-height 1.55
- [ ] StoryCard — Summary color is `--text-soft` (#2D2A26)
- [ ] StoryCard — Summary margin: 28px top, 32px bottom

### Signal block (why it matters)

- [ ] StoryCard — Signal block background is `linear-gradient(135deg, var(--signal-faint), var(--bg-card))`
- [ ] StoryCard — Signal block border: `1px solid var(--signal-soft)` + `border-left: 4px solid var(--signal)`
- [ ] StoryCard — Signal block border-radius is 14px
- [ ] StoryCard — Signal block padding is 24px top/bottom, 28px left/right
- [ ] StoryCard — Signal block eyebrow: mono, 11px, 700, uppercase, 0.16em spacing, `--signal` color
- [ ] StoryCard — Signal block body: 17px Inter, line-height 1.6, `--text`

### Lens sections

- [ ] StoryCard — Lens sections render in 3-column CSS grid (all three: PM, Founder, Builder)
- [ ] StoryCard — Each lens cell has mono label (10px, uppercase, 0.12em spacing) + body text (15px, 1.6 line-height)
- [ ] StoryCard — Lens cell background: `--bg-soft` (inactive), `--signal-faint` (active role)
- [ ] StoryCard — Lens cell border: `--border` (inactive), `--signal-soft` (active)
- [ ] StoryCard — Active role label color: `--signal` (inactive: `--text-mute`)
- [ ] StoryCard — Lens grid gap is 12px

### Deeper read (editorial quote)

- [ ] StoryCard — Deeper read uses `--ff-display` (Instrument Serif), 24px, line-height 1.3
- [ ] StoryCard — Deeper read block background: `--bg-soft`, border-radius 14px, padding 28px/32px
- [ ] StoryCard — Large italic quote glyph present in top-left (position:absolute)
- [ ] StoryCard — Body text indented 36px from left to clear the quote glyph

### Sources

- [ ] StoryCard — Sources render as stacked cards (full-width link cards), NOT as a pill row
- [ ] StoryCard — Each source card: `--bg-card` background, `1px solid var(--border)`, border-radius 12px
- [ ] StoryCard — Each source card hover: border-color → `--signal`, background → `--signal-faint`
- [ ] StoryCard — Source label: `--ff-mono`, 14px, 500 weight, `--text` color
- [ ] StoryCard — Arrow `↗` on right side, `--text-mute` color

### Card surface

- [ ] StoryCard — Card background: `--bg-card` (#FFFFFF)
- [ ] StoryCard — Card border: `1px solid var(--border)`
- [ ] StoryCard — Card border-radius: 20px
- [ ] StoryCard — Card padding: 48px
- [ ] StoryCard — Card box-shadow: `0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)`
- [ ] StoryCard — No expand/collapse pattern — all content always visible
- [ ] StoryCard — No hard-coded hex values — all via CSS variables

### Responsive

- [ ] StoryCard — Lens grid collapses to 1 column on mobile (below 768px)
- [ ] StoryCard — Card padding reduces on mobile (24px)
- [ ] StoryCard — Headline clamp works at all viewport widths

---

## SiteShell (Nav)

- [ ] SiteShell/Nav — Position sticky, top 3px, z-index 60
- [ ] SiteShell/Nav — Background: `rgba(250, 250, 247, 0.85)` with `backdrop-filter: blur(12px)`
- [ ] SiteShell/Nav — Border-bottom: `1px solid var(--border)`
- [ ] SiteShell/Nav — Mark icon: 28px dark square (`--text` bg), white text, warm pulse dot in top-right
- [ ] SiteShell/Nav — Wordmark: `--ff-body`, 15px, 700 weight, -0.02em letter-spacing
- [ ] SiteShell/Nav — Pulse dot: `--warm` color, `livePulse` animation, 7px diameter
- [ ] SiteShell/Nav — Subscribe CTA: `--ff-body`, 14px, 600, border-bottom underline on text (not button)

---

## ExpiryBadge

- [ ] ExpiryBadge — Uses `--ff-mono`, 11px, uppercase, letter-spacing 0.06em
- [ ] ExpiryBadge — Text color is `--text-mute` — NOT signal or warm
- [ ] ExpiryBadge — No background fill, no border, no card treatment
- [ ] ExpiryBadge — Format: `SIGNAL #N — EXPIRES IN XH YM` — uppercase, no emoji
- [ ] ExpiryBadge — Updates every 60 seconds client-side
- [ ] ExpiryBadge — `role="status"` for accessibility

---

## SignalExpired

- [ ] SignalExpired — Label: mono, 11px, uppercase, `--text-mute`
- [ ] SignalExpired — Expired headline: Instrument Serif, 22px, italic
- [ ] SignalExpired — Subscribe input below CTA

---

## SubscribeInput

- [ ] SubscribeInput — Single line input + submit button
- [ ] SubscribeInput — Max-width 480px desktop
- [ ] SubscribeInput — Focus ring: 2px solid `--signal`, 2px offset
- [ ] SubscribeInput — Placeholder: "your@email.com"
- [ ] SubscribeInput — No shadow in default state, no modal

---

## General rules

- [ ] All components — No `transition: all` — target specific CSS properties only
- [ ] All components — No hard-coded hex values — CSS variables only
- [ ] All components — No emoji in production UI
- [ ] All components — Font families via CSS variables (`--ff-display`, `--ff-body`, `--ff-mono`, `--ff-hand`)
- [ ] All components — Focus rings use `outline: 2px solid var(--signal)` not `box-shadow`
