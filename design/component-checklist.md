# AI Signal — Component Checklist

VEIL checks every item for the relevant component on each review. One line per criterion.

---

## StoryCard (collapsed state)

- [ ] Serif font (Source Serif 4) used for headline, not sans
- [ ] Headline is 22px, line-height 1.3, max 2 lines before truncation
- [ ] Category tag + read-time estimate visible in top-left metadata row
- [ ] Summary uses Inter 15px, 2–3 sentences, no overflow
- [ ] 'Why it matters' block has accent left-border (3px) and card-bg background
- [ ] 'Go deeper' button is outlined secondary — no filled/primary style
- [ ] Card background uses card-bg token, not raw white or transparent
- [ ] Border radius 4–6px, no more
- [ ] No shadow on card (focus ring only)

## StoryCard (expanded state)

- [ ] Expanded content appears below collapsed content without layout shift
- [ ] Transition is 150ms ease on height, not `transition: all`
- [ ] Three-lens grid renders: For PMs / For Founders / For Builders
- [ ] User's selected role is visually highlighted (border or weight, not colour)
- [ ] 'The deeper read' paragraph uses serif font, 15px, line-height 1.7
- [ ] Sources section uses monospace, small font, with labelled external links
- [ ] Collapse returns to exact same collapsed state

## IssueHeader

- [ ] Issue number and date displayed in metadata style (small, muted)
- [ ] Editor's note in serif font, 15–17px, generous line-height
- [ ] No decorative elements around header
- [ ] Visually distinct from story cards but same max-width column

## EditorNote

- [ ] Serif font, editorial tone
- [ ] Contained within max-width column (720px)
- [ ] No background fill, no card treatment — inline with page

## SubscribeInput

- [ ] Single email input + submit on one line
- [ ] Max width 480px on desktop, full-width on mobile
- [ ] No placeholder beyond "your@email.com"
- [ ] No modal, no popup, no interstitial
- [ ] Focus ring visible on input (accent colour)

## OnboardingRolePicker

- [ ] Four large tappable cards: PM / Founder / Builder / Just curious
- [ ] Cards are the full interaction target — no radio buttons
- [ ] Single tap selects and submits — no separate confirm button
- [ ] No more than one question on this screen

## ArchivePage

- [ ] Reverse chronological list
- [ ] Each entry: issue number, date, one-line editor's note, 'read issue' link
- [ ] No filtering controls (MVP deferred)
- [ ] Same max-width column as issue pages

## HomePage

- [ ] Top: wordmark + tagline + subscribe input — nothing else above the fold
- [ ] Below fold: full latest issue rendered inline
- [ ] No separate marketing section, no hero image, no feature bullets
- [ ] Footer: archive link, about link, social link (LinkedIn) — nothing else

## AdminComposeTool

- [ ] Paste area for raw newsletter input is large and clearly labeled
- [ ] Drafted summaries are editable inline (no separate modal)
- [ ] Preview renders the actual web issue component, not a facsimile
- [ ] Publish is a single button with a confirmation step
- [ ] Admin tool is not accessible to non-admin users
