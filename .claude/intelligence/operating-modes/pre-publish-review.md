# Pre-Publish Review Pipeline

Every newly generated signal MUST pass through this review before the issue's status flips to 'published'. Two reviewer roles: Editorial and Design. Both must sign off.

## When to invoke

- After a fresh signal generation completes
- Before merging any PR that affects signal rendering
- When a user reports a signal looks "off"

## Reviewer Role 1: Editorial (Senior Tech Writer)

Persona: Senior tech editor at a top-tier publication (Stratechery / The Information caliber). Sharp prose, concrete framing, builder-empathy. Tests every word for impact.

Review checklist per section:

HEADLINE — Specific to signal? Decision pressure? ≤12 words?
SIGNAL BLOCK — Lead hooks? Last sentence stakes? Builder voice?
BY THE NUMBERS — 3 cards relevant? Numbers concrete? Detail adds insight?
WHY IT MATTERS — Pull quote bolds punch? Argues second-order? "AI Signal Editorial" attribution?
CASCADE — 4 markers match velocity? Each step ≤9 words? Logical sequence?
STAKEHOLDER GRID — 2 wins + 2 losses? Non-obvious arbitrage? Indian context?
DECISION AID — Filters to GO/WAIT/NO? Pills ≤4 words? Verdict separate from pill?
THREE THINGS — Each <2 hours? RUN/FLAG/CHECK appropriate?
REACTIONS — 3 voices disagree productively? First 3-5 words bolded? Anonymous credentials?
DID YOU KNOW — Quirky? 1-2 sentences max? Topical fun angle?

BANNED PATTERNS (flag if found):
- "X hits inflection point"
- "The Y moment for Z"
- "Strategic implications for the ecosystem"
- "Undercapitalized competitors"
- Consultant-speak phrases

If section fails: flag specifically, propose rewrite, get sign-off, fix, re-review.

## Reviewer Role 2: Design (Editorial Designer)

Persona: Senior editorial designer at NYT/Atlantic caliber. Hierarchy, whitespace, typography rhythm. Knows when to break vs hold a rule.

Review with Playwright at desktop 1440px + mobile 375px:

VISUAL HIERARCHY — H1→H2→H3 distinct? Eyebrows differentiated? Pull quotes typographically distinct?
ALIGNMENT — All grids align-items: stretch? Cascade text equal heights? Reaction grid bottoms aligned? Hero 6-card 3+3 symmetrical?
WHITESPACE — Section gaps consistent (no >120px deserts)? Adjacent sections breathe? No empty animated placeholders?
COLOR SEMANTICS — Insight icons single warm-deep? Win cards green, Lose warm consistent? Bet/Burn correctly colored?
TYPOGRAPHY — Adjacent sizes related? Bold for SCAN rhythm not random? No 15-word words in headlines?
MOBILE 375px — Zero horizontal scroll? Grids stack 1-column? No text overflow?
DECORATIVE — Notebook stylized correctly? Counter-block stamp positioned? Sources badges aligned?

If check fails: flag with screenshot reference, propose fix, get sign-off, fix, re-review.

## Review Sequence

1. Generate signal
2. Playwright screenshots: desktop 1440px (full + 4 zoomed sections), mobile 375px (full + 2 zoomed)
3. Editorial reviewer walks checklist → pass list + fail list with rewrites
4. Design reviewer walks checklist → pass list + fail list with fixes
5. Both pass: signal approved
6. Either fails: apply fixes (content first, then visual), re-screenshot, re-review failed sections, repeat
7. Log to .claude/intelligence/reviews/[signal-id]-[date].md

## Authority

Non-negotiable. No signal ships without both reviewers signing off. If reviewers disagree, escalate to Suraj before applying.

If a recurring pattern fails, log to .claude/intelligence/phase-2-prompt-fixes.md as systemic prompt-level bug.

## Anti-loop discipline

Maximum 3 review cycles per signal. If 3 cycles don't yield approval:
- Stop iterating
- Document blocker in .claude/intelligence/blocked-reviews/[signal-id].md
- Escalate to Suraj for human decision
- Do NOT keep tweaking — that's the documented anti-pattern
