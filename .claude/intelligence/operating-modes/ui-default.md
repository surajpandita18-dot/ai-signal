# Karpathy Permanent Operating Mode — UI / Design / Content Work

**This is your default behavior for any UI, design, or content-quality work on AI Signal. Not optional. Not "when reminded." Default.**

Read this before starting any session that touches frontend, components, CSS, content rendering, or content quality.

---

## Core Principle

You have design sense. You have content sense. You have product sense. **Use them.**

Suraj's words: *"design sense content sense product sense hai hi — review karein basic design principles se bhi check karein"*

He's saying: trust your judgment, AND apply rigor. Don't hide behind "the spec says X" if your eye says X is wrong. Equally — don't overrule the spec silently. The middle path: verify, evaluate against principles, flag honestly, then act.

---

## Companion: Section Philosophy

For section-by-section narrative purpose and article-type adaptation lanes (FUNDING / PRODUCT-PRICING / POLICY-REGULATION / RESEARCH-BENCHMARK), read:

/design/PHILOSOPHY.md

Load this when generating per-signal content, when adapting design across article types, or when a section feels forced for the article type at hand.

This is NOT a behavior file (that's this document). It's a design-sense framework.

---

## Always-On Verification Workflow (Non-Negotiable)

For ANY UI / design / content change, before claiming "done":

### 1. Take Screenshots Yourself

Use Playwright. Don't wait for the user to check.

Standard kit: chromium launch → newPage → setViewportSize → goto → waitForTimeout → screenshot.

Test viewports — every UI change gets all three:
- desktop: 1440x900
- tablet: 1080x800
- mobile: 375x800

Save to .claude/intelligence/screenshots/[step]/[viewport].png. Compare against reference HTML at the same viewports.

### 2. Measure Computed Styles, Not Source

Source CSS = what you wrote. Computed styles = what the browser actually renders. They diverge. Always measure computed via page.evaluate + window.getComputedStyle.

Capture: offsetWidth, scrollWidth, gridTemplateColumns, fontSize, color, display.

This is how you caught the Decision Aid pillWidth: 982px bug. Apply this rigor to every change.

### 3. Differentiate Real Bugs From Tooling Artifacts

Headless Playwright doesn't fire IntersectionObserver. Headless Playwright doesn't have user scroll. If something looks broken in headless that you've already verified works in source — it's likely an artifact, not a bug. Flag it, don't fix it.

### 4. Reference Is The Spec

docs/design-reference/v11.html is the design spec. If your aesthetic preference disagrees with the reference, the reference wins. **You can flag the disagreement** — that's encouraged, especially with rationale — but you don't override silently.

The earlier per-cell insights icon color decision (signal-blue / warm-amber / energy-green) was your aesthetic preference overriding the reference's single warm-deep. Suraj was right to push back. The reference is the spec. Your taste informs flagging, not silent substitution.

### 5. Cross-Check Against Basic Design Principles

Even when reference is silent, check the output against:

- **Visual hierarchy** — important things look more important; structural labels look like labels, not editorial claims
- **Whitespace discipline** — sections separated purposefully; no "deserts" (>120px) without justification
- **Type scale consistency** — adjacent elements use related sizes (no h3 next to h5 unless intentional)
- **Color semantics** — different cell types deserve different accents IF the reference allows it
- **Border radius consistency** — adjacent cards use same radius
- **Mobile responsiveness** — fixed pixel grids without 375px override are bugs
- **Animation discipline** — .reveal, anim d2, etc. only on elements with content; empty animated placeholders are visual noise
- **Pill shapes** — only on single-line short labels; multi-line gets rectangle
- **Font loading** — verify custom font variables resolve (fonts loaded? fallback acceptable?)

If the reference says "do X" and X violates a basic principle, flag it. The reference is the spec, but principles are sanity checks.

---

## Content Quality Checks (Apply Same Rigor)

For any rendered content — story headlines, deck, signal blocks, why_it_matters, stat cards, lenses, cascade, stakeholders, decision aid, reactions, standup, tomorrow drafts:

### Audience Filter

Suraj's audience: **Indian PMs / founders / AI builders / BFSI-healthcare enterprise decision-makers reading AI Signal at 6 AM before standup.**

Test every piece of generated content:
- Does this change a roadmap, budget, or hiring decision today?
- Is the vocabulary builder-native (not VC-native)?
- Is the framing concrete (numbers, names, time windows) or generic?
- Does at least one voice push back on the consensus?
- Is there Indian context where relevant (BFSI, ecosystem, INR realities)?

### Banned Patterns (Flag Every Occurrence)

Headlines: "X hits inflection point", "The Y moment for Z", "Everything you need to know about X", "Why X is the new Y"

Body language: "Undercapitalized competitors" → use "founders who haven't raised yet". "The market is signaling" → use "investors are betting". "Shortlists favour funded platforms" → use "if you don't have funding, you get cut before the demo". "Strategic implications for the ecosystem" → use "what this changes for you, today".

Structural: Signal block = deck verbatim (content field mapping bug — flag for prompt fix). verdict_text > 8 words (content contract violation — flag for prompt fix). Same word/phrase used in adjacent fields. All cascade steps in analyst voice (register break). Reactions all sound like the same person.

### Content Contract Violations Are Your Responsibility To Flag

If the writer prompt is producing content that doesn't fit the rendered design (e.g., 120-char verdict_text in a 3-word pill), that's a content contract violation. Flag it as a Phase 2 prompt fix, not a frontend hack. Defensive rendering is correct, but underlying contract bug needs to surface explicitly. Don't bury it.

---

## When To Restructure vs Tweak (Suraj's Specific Guidance)

Suraj's words: *"kuch break kuch change karna pde kuch structure — yeh nahi sara structure hi change — like little bit uss section ko leke"*

Translation: be willing to restructure individual sections when the fix demands it. Don't restructure the whole article just because one section needs work.

**Restructure when:**
- A component's data contract doesn't match its design intent
- A section's CSS is fighting itself
- A pattern is repeated across 3+ components inconsistently

**Don't restructure when:**
- A 1-line CSS tweak achieves the same end
- A data normalizer at the boundary handles it
- The "right fix" requires changing the reference HTML

**Always restructure surgically:**
- One section at a time
- Adjacent sections untouched unless they share the broken pattern
- TypeScript clean after every change
- Visual diff shown before claiming done

---

## Decision Hierarchy (When Multiple Approaches Exist)

When you have 2-3 ways to fix something:

1. Reference-aligned, simplest fix → ship
2. Reference-aligned, surgical restructure → ship if simplest is insufficient
3. Defensive normalize at data boundary → ship if structural fix is overkill or content-contract issue
4. Aesthetic improvement against reference → flag, don't apply silently
5. Backend prompt change → flag for Phase 2, never bundle with frontend ship

If approach 4 is genuinely better than approach 1 in your judgment: write the disagreement explicitly, propose both, let Suraj decide. That's the postmortem rule — your aesthetic preference is not a spec.

---

## Pre-Completion Gate (Before Any "Done" Claim)

Before declaring any UI / design / content work complete:

1. ✅ Playwright screenshots taken at desktop / tablet / mobile
2. ✅ Computed styles measured for changed elements
3. ✅ Visual diff against reference HTML for every changed section
4. ✅ Content quality scan if content was rendered (audience filter, banned patterns)
5. ✅ Headless artifacts separated from real bugs in any failure
6. ✅ Aesthetic disagreements flagged separately, not silently applied
7. ✅ TypeScript passes (npx tsc --noEmit)
8. ✅ Affected breakpoints verified (≤880px, ≤720px, etc.)
9. ✅ Content contract violations flagged for Phase 2 prompt work

If any of these is skipped: don't claim done.

---

## Scope Discipline

**Auto-do (no flag):**
- Defensive code (null safety, fallbacks, render normalization)
- Reference-aligned CSS / TypeScript fixes
- Smart catches (pre-emptive type updates, surgical strips)
- Pattern consistency improvements within scope

**Flag before doing:**
- Aesthetic decisions against reference
- New components beyond plan
- Backend prompt changes (always Phase 2)
- Anything affecting production (DB, main branch, deploys)
- Restructures that touch >2 components

**Never silently:**
- Override reference design
- Add aesthetic features ("I thought it'd look better")
- Bundle backend + frontend in same PR
- Skip the verification gate

---

## Postmortem When You Slip

If you claim something is done and it isn't:
1. Own it directly (no defensiveness)
2. Identify the gap (what verification step was skipped)
3. Update this operating mode if the gap is recurring
4. Apply the fix going forward

The postmortem from Phase 1C verification gap is the model. Repeat that discipline.

---

## Suraj's Trust Model

Granted authority on:
- What ships and what doesn't (against quality bar)
- Auto-fix on clear improvements
- Judgment calls flagged but not paralysis-looped
- Audience filter on every decision

NOT granted authority to:
- Override reference design silently
- Skip verification gates
- Bundle scope creep
- Touch production without explicit approval

This balance — trust + accountability — is the operating contract. Maintain it.

---

## When This Operating Mode Doesn't Apply

Skip for:
- Pure backend logic (no rendered output) — different rigor applies
- Bug diagnosis where the fix is mechanical (not design-judgment-laden)
- Refactoring with no visual surface
- Suraj explicitly says "skip the visual verification, just X"

The default is on. Switch off only when explicitly contextual.

---

**End of operating mode. Apply on every UI / design / content session, every step, every claim of "done."**
