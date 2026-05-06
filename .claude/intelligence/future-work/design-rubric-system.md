# Design Rubric Evaluation System (Phase 3+ project)

## Vision

Convert the v11 reference HTML's design quality into mathematical/measurable metrics. Use those metrics as constraints during signal generation so every signal looks like a 100-person editorial company's premium output — not AI-template output.

## Why this matters

Current state: Sonnet generates content; design renders content; if content shape varies, design quality varies. Each signal becomes a manual review loop.

Future state: Design rubric is fixed (extracted from v11). Editorial + design agents negotiate where content meets constraints. New components proposed only when existing ones fail. End result: brand consistency at scale, content variety preserved.

## Rubric dimensions to extract

From docs/design-reference/v11.html, measure and codify:

COLOR — Warm/cool/neutral pixel ratios per section, semantic usage rules, border opacity gradients, background tones per section type

TYPOGRAPHY — Type scale ratios (h1:h2:h3:body), weight distribution per section, mono vs display vs body proportions, line-height and letter-spacing fingerprints

WHITESPACE — Section-to-section gap distribution, card padding patterns by type, internal spacing rhythm

DENSITY — Text/whitespace ratio per section, card count per row, words per section by type

LAYOUT — Grid column patterns, card cardinality rules (3, 4, 2x2), aspect ratios

DECORATIVE — Animation stagger timings, border radius consistency, pill vs rectangle rules, icon usage patterns

## Negotiation framework

Two agents during signal generation:

EDITORIAL AGENT: "Content needs to express X. Best structure is A with N items."

DESIGN AGENT: "Rubric constraints: section requires 3 items, max Y words each, total height ~Z px. Proposed structure breaks these."

NEGOTIATION:
1. Can content compress to fit? → editorial tries
2. Can constraints flex within thresholds? → design identifies flex room
3. Need new component? → design proposes within rubric palette
4. Stuck? → escalate to human

## Build phases

Phase 3.1 — Rubric extraction (1 week)
- Parse v11 HTML, extract measurable rules, categorize must/should/nice, document with thresholds

Phase 3.2 — Evaluation engine (1 week)
- Playwright runtime measurement, score against rubric, composite + per-dimension scores, visual report

Phase 3.3 — Negotiation logic (1-2 weeks)
- Two-agent state machine, content adjustment proposals, component palette + composition rules, Sonnet pipeline integration

Phase 3.4 — Iteration + refinement (ongoing)
- Tune thresholds, expand component palette, track quality metrics

## Why not now

60-80 hour project requiring:
- Fresh-state design thinking
- Dedicated time block
- Validation against multiple signal types

Building tired = wrong rubric = useless system.

## Trigger to start

When:
- Phase 1C stable in production (1 week of clean signals)
- Phase 2 prompt fixes addressed
- Focused 2-week block available
