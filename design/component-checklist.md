# AI Signal — Component Checklist

VEIL checks every item for the relevant component on each review. One line per criterion. Format: `- [ ] [component] — [specific measurable criterion]`

---

## StoryCard (collapsed state)

### Typography

- [ ] StoryCard/Collapsed — Category tag uses system-ui monospace font, not Inter or Source Serif 4
- [ ] StoryCard/Collapsed — Category tag is text-xs (11px), uppercase, letter-spacing 0.06em
- [ ] StoryCard/Collapsed — Category tag weight is 500 (medium), matching label/metadata spec
- [ ] StoryCard/Collapsed — Story number is rendered in the metadata row alongside category tag; uses same monospace/text-xs/uppercase treatment
- [ ] StoryCard/Collapsed — Read-time estimate is displayed in the metadata row (e.g. "3 min read"); text-xs, mono font, not sentence-cased
- [ ] StoryCard/Collapsed — Headline uses Source Serif 4 exclusively, not Inter or system font
- [ ] StoryCard/Collapsed — Headline is exactly 22px (design-system "headline" scale), not text-xl (20px) or text-2xl (24px)
- [ ] StoryCard/Collapsed — Headline line-height is 1.3 — verify via computed style, not just class name
- [ ] StoryCard/Collapsed — Headline is capped at 2 lines maximum; overflow is hidden with text-ellipsis (no text just disappearing, no third line visible)
- [ ] StoryCard/Collapsed — Headline weight is 600–700 (heading weight), not 400
- [ ] StoryCard/Collapsed — Summary uses Inter, not Source Serif 4 or monospace
- [ ] StoryCard/Collapsed — Summary is 15px (text-base), not 13px (text-sm) or 17px (text-lg)
- [ ] StoryCard/Collapsed — Summary is capped at 2–3 sentences; no paragraph longer than 3 sentences
- [ ] StoryCard/Collapsed — Summary font weight is 400 (body weight)

### "Why it matters" block

- [ ] StoryCard/Collapsed — "Why it matters" block background is card-bg (#F3F0E8 light / #1A1A18 dark) darkened slightly — NOT the accent color (#8B7355/#C4A882) as background fill
- [ ] StoryCard/Collapsed — "Why it matters" block has a 3px solid left-border in the accent color (#8B7355 light / #C4A882 dark)
- [ ] StoryCard/Collapsed — "Why it matters" block has 12px internal padding on all sides
- [ ] StoryCard/Collapsed — "Why it matters" block has NO box-shadow
- [ ] StoryCard/Collapsed — "Why it matters" block text uses Inter (body font), not serif
- [ ] StoryCard/Collapsed — "Why it matters" label/heading (if present) uses text-xs uppercase mono treatment

### "Go deeper" button

- [ ] StoryCard/Collapsed — "Go deeper" button is outlined style: visible border, no background fill
- [ ] StoryCard/Collapsed — "Go deeper" button border color uses the border token (#E8E4DC light / #2A2A28 dark), not the accent color
- [ ] StoryCard/Collapsed — "Go deeper" button text color uses text-primary or text-secondary, not accent color
- [ ] StoryCard/Collapsed — "Go deeper" button has no background color in default state (transparent or inherit)
- [ ] StoryCard/Collapsed — "Go deeper" button has a visible focus ring: 2px solid accent, 2px offset — and no other shadow

### Card surface

- [ ] StoryCard/Collapsed — Card background uses card-bg token (#F3F0E8 light / #1A1A18 dark), not raw white (#FFFFFF) or page background (#FAFAF7/#0F0F0E)
- [ ] StoryCard/Collapsed — Card border is 1px solid using border token (#E8E4DC light / #2A2A28 dark)
- [ ] StoryCard/Collapsed — Card border-radius is 4px (preferred) or up to 6px maximum — verify it is not 8px, 12px, or rounded-full
- [ ] StoryCard/Collapsed — Card has NO box-shadow in any state except focus rings on interactive children
- [ ] StoryCard/Collapsed — Card has NO gradient of any kind (background, border, text)

### Spacing

- [ ] StoryCard/Collapsed — Card internal padding is 24px (3 × 8px base unit) on all sides
- [ ] StoryCard/Collapsed — Vertical gap between metadata row and headline is a multiple of 8px
- [ ] StoryCard/Collapsed — Vertical gap between headline and summary is a multiple of 8px
- [ ] StoryCard/Collapsed — Vertical gap between summary and "why it matters" block is a multiple of 8px
- [ ] StoryCard/Collapsed — Vertical gap between "why it matters" block and "Go deeper" button is a multiple of 8px
- [ ] StoryCard/Collapsed — Gap between consecutive story cards is 32px (4 × 8px)
- [ ] StoryCard/Collapsed — Card max-width is 720px; content does not exceed this on any viewport

### Color usage

- [ ] StoryCard/Collapsed — Accent color (#8B7355 light / #C4A882 dark) appears ONLY on the "why it matters" left-border; used nowhere else on the collapsed card
- [ ] StoryCard/Collapsed — No color outside the 6-token system (background, text-primary, text-secondary, accent, border, card-bg) appears anywhere on the card
- [ ] StoryCard/Collapsed — Text-primary (#1A1A1A light / #F0EDE6 dark) used for headline
- [ ] StoryCard/Collapsed — Text-secondary (#4A4A4A light / #9A9590 dark) used for metadata row (category, story number, read-time)

### Dark mode

- [ ] StoryCard/Collapsed — Card background shifts to card-bg dark (#1A1A18) in dark mode
- [ ] StoryCard/Collapsed — Card border shifts to border dark (#2A2A28) in dark mode
- [ ] StoryCard/Collapsed — Headline text shifts to text-primary dark (#F0EDE6) in dark mode
- [ ] StoryCard/Collapsed — Summary and body text shifts to text-primary or text-secondary dark tokens in dark mode
- [ ] StoryCard/Collapsed — Metadata row text shifts to text-secondary dark (#9A9590) in dark mode
- [ ] StoryCard/Collapsed — "Why it matters" left-border shifts to accent dark (#C4A882) in dark mode
- [ ] StoryCard/Collapsed — "Why it matters" background shifts to darkened card-bg dark variant in dark mode; not raw black
- [ ] StoryCard/Collapsed — "Go deeper" button border shifts to border dark (#2A2A28) in dark mode
- [ ] StoryCard/Collapsed — No hard-coded hex values in component CSS — all colors via CSS variables or Tailwind dark: variants

### Editorial restraint (collapsed)

- [ ] StoryCard/Collapsed — Card feels like The Pragmatic Engineer or Stratechery: content-first, no decorative chrome
- [ ] StoryCard/Collapsed — No emoji anywhere on the card
- [ ] StoryCard/Collapsed — No icon decorations beyond the "Go deeper" button (if it has a chevron, it is small and monochrome)
- [ ] StoryCard/Collapsed — No marketing/SaaS framing in label text (e.g. "FEATURED", "HOT", "🔥 TRENDING")
- [ ] StoryCard/Collapsed — Are.na card-as-object feel: the card sits in the column like an object in a collection, not a widget on a dashboard

---

## StoryCard (expanded state)

### Three-lens grid

- [ ] StoryCard/Expanded — Three-lens grid renders all three columns: "For PMs", "For Founders", "For Builders" — none omitted even if content is empty
- [ ] StoryCard/Expanded — Lens grid is a CSS grid (3 columns), not a flex row — verify layout does not collapse to a single column on desktop widths
- [ ] StoryCard/Expanded — Each lens column header ("For PMs" / "For Founders" / "For Builders") uses text-xs uppercase mono treatment matching label spec
- [ ] StoryCard/Expanded — Each lens take text is capped at 2 lines maximum; third line is hidden with ellipsis or hidden overflow — no lens take overflows its column
- [ ] StoryCard/Expanded — Lens take text uses Inter at text-base (15px), not serif
- [ ] StoryCard/Expanded — Lens take text weight is 400 (body), not bold

### User role highlighting

- [ ] StoryCard/Expanded — Active role column (matching user's onboarding pick) has a visually bolder border compared to inactive columns
- [ ] StoryCard/Expanded — Active role differentiation is border-weight or border-opacity based ONLY — NOT color-based (no accent fill, no accent border color on active column)
- [ ] StoryCard/Expanded — Inactive lens columns remain fully visible and readable; they are not dimmed, hidden, or de-emphasized with opacity below 70%
- [ ] StoryCard/Expanded — No background fill difference between active and inactive lens columns

### "The deeper read" paragraph

- [ ] StoryCard/Expanded — "The deeper read" paragraph uses Source Serif 4 (serif), not Inter
- [ ] StoryCard/Expanded — "The deeper read" is 15px (text-base), not larger
- [ ] StoryCard/Expanded — "The deeper read" line-height is 1.7 — verify via computed style
- [ ] StoryCard/Expanded — "The deeper read" section label (if present) uses text-xs uppercase mono treatment

### Sources section

- [ ] StoryCard/Expanded — Sources use system-ui monospace font (mono), matching the metadata spec
- [ ] StoryCard/Expanded — Sources text is text-xs or text-sm (11px or 13px) — not body size
- [ ] StoryCard/Expanded — Each source has an external link icon (e.g. arrow-up-right or similar); icon is small, monochrome, inline with the label
- [ ] StoryCard/Expanded — Source link text uses text-secondary token, not accent color
- [ ] StoryCard/Expanded — Source links have NO text-decoration (underline) in default state — underline on hover is acceptable
- [ ] StoryCard/Expanded — Sources section renders 2–4 links maximum per story; if data has more, only first 4 are shown (or all are shown but design handles gracefully)

### Expand/collapse animation

- [ ] StoryCard/Expanded — Expand transition duration is exactly 150ms — not 200ms, 300ms, or unspecified
- [ ] StoryCard/Expanded — Expand transition timing function is "ease" — not "linear", "ease-in-out", or custom cubic-bezier
- [ ] StoryCard/Expanded — Transition property targets only the height-related property (grid-template-rows or max-height) — NOT `transition: all`
- [ ] StoryCard/Expanded — Expanding the card causes NO layout shift in surrounding content (other cards do not jump or reflow)
- [ ] StoryCard/Expanded — Collapse returns card to the exact same visual state as the default collapsed state — no residual expanded padding or whitespace
- [ ] StoryCard/Expanded — Animation uses `grid-template-rows: 0fr → 1fr` OR `max-height` with a known reasonable max — not `height: auto` animated directly (which causes no transition)
- [ ] StoryCard/Expanded — The inner content container has `overflow: hidden` during the animation so partial content is not visible mid-transition

### Card surface (expanded)

- [ ] StoryCard/Expanded — Card background does not change when expanded — remains card-bg token
- [ ] StoryCard/Expanded — No new shadows introduced in expanded state
- [ ] StoryCard/Expanded — No gradient introduced in expanded state
- [ ] StoryCard/Expanded — Expanded content area has 24px padding consistent with collapsed card padding
- [ ] StoryCard/Expanded — Vertical spacing between expanded sections (lens grid, deeper read, sources) follows 8px rhythm (16px or 24px gaps)

### Dark mode (expanded)

- [ ] StoryCard/Expanded — Lens grid column borders use border dark token (#2A2A28) in dark mode
- [ ] StoryCard/Expanded — Active role bolder border is still distinguishable in dark mode (not invisible against dark card-bg)
- [ ] StoryCard/Expanded — "The deeper read" text uses text-primary dark (#F0EDE6) in dark mode
- [ ] StoryCard/Expanded — Source link text uses text-secondary dark (#9A9590) in dark mode
- [ ] StoryCard/Expanded — No expanded-state color is hard-coded; all via tokens

### Editorial restraint (expanded)

- [ ] StoryCard/Expanded — Expanded state feels like reading a newsletter issue, not opening a SaaS feature panel
- [ ] StoryCard/Expanded — No decorative dividers, icon clusters, or badges in the expanded content
- [ ] StoryCard/Expanded — "The deeper read" section is visually the anchor of the expanded state — it has the most typographic weight (serif, generous line-height)

---

## General card rules

- [ ] StoryCard — Max content width 720px is respected at all viewport widths; card never stretches wider than 720px
- [ ] StoryCard — Accent color (#8B7355 light / #C4A882 dark) appears ONLY on the "why it matters" left-border — not on headings, buttons, active states, links, or any other element
- [ ] StoryCard — No gradients appear anywhere on the card in either state or either mode
- [ ] StoryCard — No box-shadows appear on the card surface in either state (only 2px focus ring on interactive elements is permitted)
- [ ] StoryCard — Editorial restraint test: shown alongside a screenshot of The Pragmatic Engineer, does the card feel like it belongs in that publication? If it feels like a SaaS product card, it fails.
- [ ] StoryCard — Anti-reference test: card does not resemble The Rundown or TLDR AI (no emoji, no bold color blocks, no highlight-reel layout)
- [ ] StoryCard — Anti-reference test: dark mode does not resemble gradient SaaS (no purple/teal/pink, no glow effects, no neon)
- [ ] StoryCard — Are.na reference: card feels like an object in a curated collection, not a widget. Borders and spacing define it, not decoration.
- [ ] StoryCard — Stratechery reference: restraint is visible. Every element on the card earns its presence. Nothing is decorative.

---

## IssueHeader

- [ ] IssueHeader — Issue number and date displayed in metadata style (text-xs or text-sm, text-secondary, mono font)
- [ ] IssueHeader — Editor's note uses Source Serif 4 (serif), 15–17px, line-height at least 1.6
- [ ] IssueHeader — No decorative elements around header (no horizontal rules styled as design elements, no icon flourishes)
- [ ] IssueHeader — Visually distinct from story cards but occupies the same 720px max-width column

---

## EditorNote

- [ ] EditorNote — Uses Source Serif 4 (serif), editorial tone
- [ ] EditorNote — Contained within 720px max-width column
- [ ] EditorNote — No background fill, no card treatment — inline with page background
- [ ] EditorNote — No box-shadow, no border, no gradient

---

## SubscribeInput

- [ ] SubscribeInput — Single email input and submit button on one line (not stacked vertically on desktop)
- [ ] SubscribeInput — Max width 480px on desktop, full-width on mobile
- [ ] SubscribeInput — Placeholder text is exactly "your@email.com" — no other placeholder text
- [ ] SubscribeInput — No modal, no popup, no exit-intent interstitial
- [ ] SubscribeInput — Focus ring visible on input: 2px solid accent (#8B7355 light / #C4A882 dark), 2px offset
- [ ] SubscribeInput — Input and button use border token for borders, not accent color
- [ ] SubscribeInput — No shadow on input or button in default state

---

## OnboardingRolePicker

- [ ] OnboardingRolePicker — Four large tappable cards: PM / Founder / Builder / Just curious — all four present
- [ ] OnboardingRolePicker — Cards are the full interaction target — no radio buttons, no checkboxes visible
- [ ] OnboardingRolePicker — Single tap selects and advances — no separate "Confirm" button
- [ ] OnboardingRolePicker — No more than one question on this screen
- [ ] OnboardingRolePicker — Cards use card-bg token, border token, and Inter text — no accent fill on selected state (border-weight only for selection indication)

---

## ArchivePage

- [ ] ArchivePage — Entries are in reverse chronological order (newest first)
- [ ] ArchivePage — Each entry shows: issue number, date, one-line editor's note, "read issue" link
- [ ] ArchivePage — No filtering controls rendered (MVP — deferred)
- [ ] ArchivePage — Same 720px max-width column as issue pages
- [ ] ArchivePage — No card treatment on archive entries — inline list, not a grid of cards

---

## HomePage

- [ ] HomePage — Above the fold: wordmark + one-line tagline + subscribe input — nothing else
- [ ] HomePage — No nav menu above the fold
- [ ] HomePage — Below fold: full latest issue rendered inline (not a link to the issue — the issue itself)
- [ ] HomePage — No separate marketing section, hero image, or feature bullet list
- [ ] HomePage — Footer: archive link, about link, LinkedIn link — no other footer elements
- [ ] HomePage — Subscribe input on homepage respects SubscribeInput checklist in full

---

## AdminComposeTool

- [ ] AdminComposeTool — Paste area for raw newsletter input is large (textarea, not a small input) and clearly labeled
- [ ] AdminComposeTool — Drafted summaries are editable inline — no separate modal required to edit
- [ ] AdminComposeTool — Preview renders the actual web issue component (StoryCard), not a simplified facsimile
- [ ] AdminComposeTool — Publish is a single button with a confirmation step before executing
- [ ] AdminComposeTool — Admin tool route is inaccessible to non-admin users (auth gate verified)
- [ ] AdminComposeTool — Admin UI may use slightly higher information density than public-facing pages, but must still stay within the type scale and color system
