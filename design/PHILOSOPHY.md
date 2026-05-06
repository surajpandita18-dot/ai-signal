# Section Philosophy + Adaptation Principles

Read this when:
- Generating per-signal content where structure varies by article type
- A section feels forced or hollow for the current signal
- Cardinality (3 cards, 4 steps, 2 cards, etc.) seems to constrain content quality
- Article type doesn't cleanly fit FUNDING / PRODUCT-PRICING / POLICY-REGULATION / RESEARCH-BENCHMARK

For verification rules, anti-patterns, decision hierarchy: see .claude/intelligence/operating-modes/ui-default.md.
This file is the design-sense framework — the WHY each section exists, and HOW it adapts intelligently.

---

## Core principle: Purpose over count

Default cardinalities (3 stat cards, 4 cascade steps, 2x2 stakeholder, 2 bet/burn cards, 3 reactions) create visual rhythm. They are DEFAULTS, not absolutes.

Maintain count when:
- Visual rhythm depends on it (3-column grid breaks at 2 or 4)
- Cognitive job needs the count (3 actions = manageable; 5+ = overwhelming)
- Reader expects consistency across signals

Flex count when:
- Content genuinely doesn't fit the count
- Article type lacks the relevant data
- An alternative serves the same cognitive job better

When flexing, surface to user FIRST. Format:
"This signal's [X data] doesn't fit [Y section]'s default cardinality cleanly. Options: (a) [option], (b) [option], (c) [option]. Recommend [Z] because [reason]. Approve?"

Never force-fit silently. Never skip silently.

---

## Section-by-section purpose + adaptation

### Hero zone
Purpose: Front-page newspaper theatre. Brand promise headline never changes — it's recognition cue.
Per-signal: Date, broadcast text, category chip, 3 ticker values, 3 preview cards (mirror Sections 6/8/14).

### Notebook strip ("Did you know?")
Purpose: Playful pause between hero theatre and serious analysis. Builder humor allowed here only.
Per-signal: 12 facts rotated by category (numbers/trivia/industry).

### Story header
Purpose: Newspaper-style opening with metadata.
Per-signal: Headline (h2) + deck (1-2 lines) — both content-specific. Category chip varies by signal type.

### TL;DR strip
Purpose: Lazy-reader exit ramp. "If you read nothing else, read this."
Per-signal: Single paragraph 50-80 words, 2-3 strong highlights.
Voice rule: Bold the operative VERBS (switch, decide, audit, pull, ship). Never bold a noun.

### Signal block (THE SIGNAL)
Purpose: Thesis sentence reader remembers if they close the tab now.
Per-signal: 2-3 sentences max.
Lead pattern varies by signal type:
- Numerical signal → lead with the number
- Strategic signal → lead with the actor
- Behavioral signal → lead with the pattern
Last sentence is ALWAYS the consequence in builder voice — never end on a fact, always end on stakes.

### Block 1 — BY THE NUMBERS
Purpose: Quantitative anchor. "This is real, here's the data."
Default: 3 stat cards + 1 comparison element.

Article-type adaptation:

FUNDING signal (raise, M&A, IPO):
- Cards: raise size + comparable round + competitor runway gap
- Chart: comparable raises (bar chart)
- h3 lens: what does this raise PRICE or VALIDATE?

PRODUCT-PRICING signal (launch, pricing change):
- Cards: headline metric + quality delta + release character
- Chart: head-to-head comparison
- h3 lens: what ASSUMPTION just broke?

POLICY-REGULATION signal:
- Cards: deadline + penalty + scope coverage
- Chart: regional impact OR companies-affected (NOT bar chart)
- h3 lens: what DEADLINE or CONSTRAINT just landed?

RESEARCH-BENCHMARK signal:
- Cards: SOTA delta + compute scale + reproducibility signal
- Chart: benchmark curve over time (line chart, not bar)
- h3 lens: what BASELINE just cracked?

When 3 cards doesn't fit: signal probably has only 2 strong angles. Options:
(a) Pad weakly — bad, dilutes design
(b) Show 2 cards in adjusted-spacing layout — acceptable
(c) Replace chart with 3 large pull-stats as text — alternative when no chart-worthy data
Surface to user before choosing.

### Insights strip (3 cells: → ◐ ⚡)
Purpose: Mid-article scan rescue. Reader getting lost gets re-oriented.
Cardinality: ALWAYS 3 — labels are static (What changed / Who's affected / Move by). All icons in single warm-deep color (labels carry differentiation; color would be noise).
Per-signal: Only the 3 text blurbs change. Each = 1 sentence with 1 highlight underline.
Highlight rule: Underline the noun phrase that earns it (the consequence). Never underline verbs.

### Block 2 — WHY IT MATTERS
Purpose: Argumentation. "So what?" — second-order analysis. Block 1 was facts; Block 2 is interpretation.
Default: 2-3 paragraphs prose + 1 editorial pull quote.

Article-type adaptation:
- FUNDING: pricing-of-the-category argument
- PRODUCT-PRICING: economic-or-capability shift argument
- POLICY-REGULATION: enforcement-credibility argument
- RESEARCH-BENCHMARK: scaling-or-narrow-domain argument

Pull quote rule: ALWAYS editorial voice ("— AI Signal Editorial"). NEVER external quote (avoid fabrication risk + amplify house POV).

### Cascade grid
Purpose: Forecast value. This is what differentiates AI Signal from a news aggregator.
Default: 4 steps with time markers.

Time-bucket adaptation by signal velocity:
- FUNDING / PRODUCT signals: weeks (this week / 2-3 weeks / 6 weeks / 3 months)
- POLICY signals: months (this week / month 1 / month 3 / month 6)
- RESEARCH signals: quarters (this month / Q1 / Q2 / Q4)

If signal genuinely fits 3 stages: pad to 4 with extension ("End of quarter" or "12+ months out") rather than break count. 4 is the visual-rhythm load-bearing number.

### Stakeholder grid (2x2)
Purpose: Reader self-classification. Hardest cognitive task is "where do I sit in this?"
Default: 2 wins + 2 losses (asymmetry implies bias; 2-2 forces editorial discipline — find genuine losers in good news, genuine winners in bad).

Article-type adaptation:
- FUNDING: funded co's customers + adjacent winners (wins) | undifferentiated competitors + uncertain buyers (losses)
- PRODUCT-PRICING: cost-sensitive builders + high-volume consumers (wins) | premium quality-bound + infra resellers (losses)
- POLICY-REGULATION: compliance-first incumbents + jurisdictional competitors (wins) | lean-team startups + foreign entrants (losses)
- RESEARCH-BENCHMARK: validated thesis teams + infra (wins) | competing approaches + shrunk moats (losses)

Adaptation intelligence: Wins don't have to be obvious. Non-obvious arbitrageurs (e.g., Indian IT services winning from US enterprise AI raise) often carry the editorial weight. This is where writer adds real value beyond surface analysis.

### Builder block (THE BUILD — dark)
Purpose: Tone shift. After 6 sections of newsroom analysis, reader's brain needs different texture — practitioner voice, not analyst voice.
Per-signal: One large quote (1-2 sentences). Italicized fragment in signal-soft for emotional spike.

Voice angle by article type:
- FUNDING: competitive pressure
- PRODUCT-PRICING: opportunity
- POLICY-REGULATION: adaptation
- RESEARCH-BENCHMARK: practical/skeptical

Voice must be SPECIFIC and CONCRETE — never abstract. Mention a code change, feature, unit economic, or deploy. If quote could've been said by a McKinsey analyst, it's wrong.

### Builder secondary (Bet / Burn)
Purpose: Two-sided bet making. Forces both bull and bear case to prevent cheerleading.
Default: Exactly 2 cards. Bet (green, bull) + Burn (warm, bear).

Article-type fit:
- FUNDING: works naturally (capital decisions are bets)
- PRODUCT-PRICING: works naturally (switching decisions are bets)
- POLICY-REGULATION: often FORCED — compliance is a constraint, not a bet a reader is making.
  Fallback: flag the card with [FORCED — review before publish: this signal is a constraint, not a bet] rather than rationalize fit.
  Phase 2 consideration: Adapter / Sufferer variant for policy signals (different framing, same 2-card structure).
- RESEARCH-BENCHMARK: works for applied research, awkward for pure results. Use judgment.

This is a known adaptation tension. Don't suppress when it doesn't fit — flag.

Bet/Burn must reference the SAME actor (e.g., Indian SaaS founders — for them, the bet is X, the burn is Y). Not "bet for big tech, burn for startups." Symmetry is "same person, two outcomes based on action."

### Decision aid (Q&A + verdict)
Purpose: The actionable filter. After all analysis, reader still asks "but what should I do?" Q&A forces self-classification; verdict gives the operative answer.
Default: 3 rows + 1 verdict bar.

Q&A structure:
- Each row filters reader to GO / WAIT / NO action
- Pill content: SHORT label only ("GO" / "WAIT" / "NO") — 3-4 chars max
- Long guidance text goes BELOW question in same column, NOT in pill
- Decision question (h4) is content-specific framing — direct binary, reflective challenge, or reposition prompt

CRITICAL: Pills MUST stay short. If verdict_text data contains long sentence, restructure: pill = short label, guidance = secondary line below question. NEVER cram long text into pill — this causes min-content propagation that breaks grid layout (documented Phase 1C bug).

Pill mapping example:
- row.verdict = "go" → pill renders "GO"
- row.verdict = "wait" → pill renders "WAIT"
- row.verdict = "no" → pill renders "NO"
- row.verdict_text = full guidance sentence → renders as secondary line below question

### Block 3 — THE MOVE · NEXT 48H
Purpose: Reader's checklist. Proof of utility — if reader does these 3, they got value.
Default: 3 actions tagged RUN / FLAG / CHECK.

Tag mapping (PM modes of action):
- RUN = do work yourself (re-run analysis, audit stack)
- FLAG = raise to team/leadership (brief board, raise in standup)
- CHECK = verify assumption (talk to customers, validate hypothesis)

Constraint: Each action doable in <2 hours by one person. "Build new architecture" = project, not action. The 48-hour constraint forces this discipline.

### Standup card
Purpose: Distribution utility. Removes friction of "how do I share this credibly at standup?"
Default: 4 tabs (Slack / Email / WhatsApp / LinkedIn).

Voice changes per CHANNEL, not per signal type:
- Slack: casual, embedded action
- Email: structured, slightly formal
- WhatsApp: conversational, short
- LinkedIn: punchy observation

### Counter-block (Devil's Advocate)
Purpose: Editorial integrity. Tests every thesis. Prevents hype-machine drift.
Default: ALWAYS present (no signal ships without one). Beige paper card with rotated stamp.
Per-signal: counter-headline (h4) is content-specific question or counter-thesis. Body = 1-2 paragraphs of strongest counter-argument.

Test: Would a sharp critic of the thesis nod at the counter? If no, counter is weak — rewrite. Don't ship token disclaimers.

### Reaction grid (3 quotes with avatars)
Purpose: Social proof + multiple lenses. "What does the market think?"
Default: ALWAYS 3 anonymous-but-credentialed voices (avoids quote fabrication legal/ethical risk; allows composing sharp quotes without misrepresenting real people).

Voice mix per article type:
- FUNDING: VP Product at competing co (threat) + pre-A founder (existential) + incumbent PM (consolidation)
- PRODUCT-PRICING: VC (market) + CTO Series A (production reality) + ML researcher (technical lens)
- POLICY-REGULATION: GC at large tech + affected founder + policy analyst
- RESEARCH-BENCHMARK: lead author/expert + applied ML practitioner + skeptic

Discipline: The 3 voices must DISAGREE PRODUCTIVELY — not all bullish, not all bearish. If all 3 say same thing, writer is confirming bias, not exploring perspectives.

### Sources block
Purpose: Trust infrastructure.
Adaptation: 2-4 sources (only flexibly-counted section). Tags: Primary (original announcement) / Benchmark (independent verification) / Community (practitioner discussion).
Discipline: Don't pad. 2 strong sources beat 4 weak. If only primary source exists with no corroboration, signal might not be ship-ready — push back to editorial.

### Read stamp + feedback vote
Purpose: Closing ritual + value classification.
Always present. 4 buttons map to value tiers (Changed my decision = highest, Made me think = strong, Already knew this = neutral, Not relevant = negative).

### Sidebar
Purpose: Real-time engagement (today's read circle) + subscription tease (tomorrow envelopes).
Default: Always 3 envelopes — 1 visible (lead candidate) + 2 sealed.

---

## When article type doesn't cleanly fit the 4 lanes

Some signals don't slot cleanly into FUNDING / PRODUCT-PRICING / POLICY-REGULATION / RESEARCH-BENCHMARK. Examples:

- Acquisition (Microsoft buys Inflection) — funding-adjacent + strategic hybrid
- Personnel (researcher leaves OpenAI, founds new lab) — none of the four
- Geopolitical (China AI export restrictions) — policy but cross-jurisdictional
- Open source release (Llama 4) — product + research hybrid

For these signals:
1. Identify the DOMINANT lens — which framework's lens fits most cleanly?
2. Use that lens for headline generation and adaptation
3. Flag tensions in other sections (e.g., Bet/Burn for personnel signal might need [FORCED] flag)
4. Surface the categorization decision to user before shipping

Don't force-fit silently. Don't skip sections silently.

---

## Updating this file

When you discover something new during a task:
- New article-type adaptation pattern that worked → propose adding here
- A section's purpose proved unclear under pressure → propose clarifying
- A new article type beyond the 4 lanes shows recurring pattern → propose adding its lane

Format:
"During [task] I observed [pattern]. This is not in PHILOSOPHY.md. Recommend adding to [section]: [proposed text]. Approve?"

Don't update silently. Surface, get ack, then update. The file improves with each session — that's the point.
