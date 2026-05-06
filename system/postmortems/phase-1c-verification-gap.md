# Postmortem: Phase 1C Verification Gaps

## Gap 1 — Playwright structural checks ≠ visual verification (2026-05-05)

**What happened:**
47/47 automated checks passed (CSS class presence, property values, bounding rects). Declared "verified." User's browser revealed Decision Aid pill consuming full row width (982px), sidebar pushed off-screen, broken visual rhythm.

**Root cause:**
DOM-curl checks confirmed CSS *properties exist* but not *computed layout behavior*. `white-space: nowrap` on a pill with long content causes the `auto` grid column to expand to content size — a runtime layout collapse not caught by checking property values alone.

**New requirement:**
After any layout fix: take Playwright screenshot, describe what a designer's eye sees at first glance, compare rendered output against reference HTML section-by-section.

---

## Gap 2 — "detailY pinned to same Y" ≠ "cards look aligned" (2026-05-05)

**What happened:**
Applied `flex-direction: column; justify-content: space-between` to `.hero-ticker`. Measured `detailY [84, 84, 84]` across all three cards. Declared ticker alignment "verified." User's browser revealed card 2 ("On track") value wrapping to 2 lines while flanking cards stay single-line — visually broken rhythm despite equal Y positions.

**Root cause:**
Measurement confirmed the `.hero-ticker-detail` baseline aligned across all three cards. But it did not check whether each card's *value text* stayed on one line. Content density inside equal-height boxes can create visual misalignment even when layout measurements are identical.

**Actual root cause of the wrap:**
- `"On track"` is two words → anonymous flex item min-content = "track" width (~75px)
- Delta text "↑ Blockbuster projected" at `white-space: nowrap` + `min-width: auto` = 136px, cannot shrink
- Combined demand (136px delta + 6px gap + value text) exceeds card inner width (200px)
- Flex algorithm squeezes value text below min-content → "On" wraps above "track"
- Single-token values ("$950M", "$50B+") cannot wrap → appear single-line

**Underlying data contract bug (Phase 2):**
Reference delta strings: "↑ 18%", "↓ 10×", "↑ 4" — max ~50px. Generator is producing "↑ Top 5 AI raises 2026" (~144px). Fix: constrain delta.text to ≤8 chars in generator prompt.

**New requirement:**
When claiming "alignment verified," take screenshot AND describe card-by-card what each card looks like in isolation (value lines, text wrap, content density). Equal Y-position of one element does not mean the full card composition is correct.

---

## Gap 3 — Computed measurements aligning ≠ visual design crispness (2026-05-05)

**What happened:**
After fix, reported "all 3 fixes verified" based on computed metrics (detailY, grid columns, pill text). User's browser showed visual rhythm still broken due to card 2 wrapping.

**Rule added:**
When claiming a UI fix is done, the verification statement must include:
1. Playwright screenshot at 1440px AND 375px
2. Description of what an Indian designer's eye would see at first glance — not measurements
3. Explicit card-by-card or element-by-element narrative of the visual state
4. Cross-check of each element against the reference HTML equivalent

Technically-true measurements that miss visual truth are not verification.
