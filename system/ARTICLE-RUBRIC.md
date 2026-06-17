# Article Rubric — the Feynman / Andrew Ng / great-explainer story-flow bar

Suraj's standing instruction (2026-06-18): every issue of AI, Basically. must explain its technical content the way Richard Feynman / Andrew Ng / the sharpest Anthropic+OpenAI engineer blog posts do — depth preserved, but the prose hooks the reader into a story they don't want to stop reading. *Retention bna rehta hai.*

This rubric codifies the technique. Pair it with `INTERVIEW-RUBRIC.md` (interview prep brief quality) and `MISTAKES.md` (banned cross-issue formulas).

---

## The 6 moves that make a section read as story, not lecture

### 1. Open with a concrete moment, not a definition
**Bad:** "Quantization compresses model weights into fewer bits per number."
**Good:** "Thursday 4:17pm. CX ticket lands on your screen: the bot quoted ₹4.2 crore on a Q3 earnings PDF. The actual figure was ₹42 crore. One missing zero, one customer call back, one quiet bug nobody saw."

The opening sentence should anchor the reader in a specific scene: a screen, a person, a timestamp, a screenshot. Names ("Meera, 38, Indore kirana owner"), times ("Thursday 4:17pm"), real currencies ("₹4.2 crore"), real institutions ("RBI", "Zerodha Kite"). Abstraction comes later, after the scene has hooked.

### 2. Analogies do load-bearing work — the analogy IS the explanation
**Bad:** "Decision-recursion means the agent re-checks its own work in a way that consumes a step but doesn't bound the work."
**Good:** "Picture a paranoid delivery boy with an order slip. He walks to the door, re-reads the slip, walks back to confirm with the cook, re-reads the slip, asks the cook again. Every loop counts as a step. None of them get to the door."

Pick ONE analogy domain per issue and thread it across multiple sections (lede + build_notes.finding + under_the_hood.steps + reality_check or closer). The metaphor becomes the issue's through-line image — the reader carries it back to work on Monday. Recent through-lines:
- 001 (RAG hallucination): the lawyer who fabricated case citations (Mata v. Avianca)
- 002 (vendor lock-in + quantization): railway junction with one platform + simultaneous interpreter
- 003 (Hinglish capability + forgetting): violinist who freezes on key modulation + library with archivist
- 004 (agent loops): delivery boy with a counter at the door

**Hard rule:** when you write a new issue, **diff your analogy domain against the last 4 issues' through-lines** in `MISTAKES.md`. Pick a domain that doesn't collide. Cross-issue analogy reuse is a formula and kills the story.

### 3. Cause-and-effect made visible, not narrated
**Bad:** "X causes Y, which leads to Z."
**Good:** "When the budget hits 12 calls, the thirteenth doesn't happen. The agent stops mid-loop. The user gets a 'we're handing this to a human' message. The CX rep picks up the trace, scrolls 12 lines, and sees exactly where the agent got stuck — because the log line per call is right there in the dashboard."

Walk the reader through the chain of "when X happens, Y happens, because Y, now Z." Each link is concrete.

### 4. Reader's POV throughout
**Bad:** "The team observes that benchmarks are stable but CX escalations climb."
**Good:** "You ship the model on a Monday. Two weeks pass. You're in the Friday review when CX walks in with a screenshot and says: 'the model is wrong on the financial PDFs. Look.' Engineering pulls up the benchmark dashboard: green. Both sides are right."

"You" or a named character ("Meera", "Rhea", "Lakshmi"), not "the team", "the candidate", "the engineer". Specific, lived-in.

### 5. Show, don't tell. Use concrete numbers, screens, real institutions
**Bad:** "Performance degrades on outlier inputs."
**Good:** "On a 4-bit quantized 7B model, average benchmark accuracy moved 0.3 points — well within noise. Cohort breakdown on the 100 escalated tickets that included financial statements: 22 percentage points worse than FP16. The average hid it; the cohort cut found it."

Every claim earns a number. Every number cites a source where verifiable. No "studies suggest" — name the study, the year, the specific finding.

### 6. Land the principle ONCE at the end, after the story does the teaching
**Bad:** front-loading "the durable skill this teaches is X" then walking through the case.
**Good:** unfold the case, then close: "That's the move: name the cohort before the average names you."

The reader extracts the principle because the story made it obvious — they shouldn't have to be told they just learned something.

---

## Which fields get the story-flow treatment

Per issue (verified across 001-004, applied via commits `bc1bc94` + `prep-r7`):

**Must:**
- `one_thing.lede_html` — 4-beat arc: scene → mechanism → cautionary tale → call to action. ~200-250 words.
- `build_notes.struggle_html` — open with a vivid CX/dev scene. ~80-100 words.
- `build_notes.finding_html` — analogy does the mechanism explanation. ~100-120 words.
- `build_notes.fix_html` — sequence of moves the reader makes. ~100-120 words.
- `under_the_hood.question_html` — opens with the analogy. ~60-80 words.
- `under_the_hood.steps[].body_html` — extend the analogy through each step. ~70-90 words each.
- `reality_check.body_html` — one specific person harmed; concrete consequence. ~150-200 words.
- `closer.body_html` — see "Closer shapes" below. Rotate the comedian technique per issue. ~50-110 words.
- `rabbit_hole` — one curated paper / blog / video / repo / podcast / thread that pairs with this issue's One Thing. REAL link (verify the URL resolves). 1-2 sentence `why_html` that names what THIS resource gives the reader THIS week. Compounds into `/rabbit-holes` library.

**Interview prep brief (separately codified in INTERVIEW-RUBRIC.md):**
- `q_html` — structured (setup ¶ + trigger ¶ + ask ¶, with `<ul>` for parenthesized items)
- `teaser_q` — hand-curated 1-2 sentence hook for teaser + library card
- `sample_answer_html` — first-person story-flow walkthrough
- `eval_deep_dive_html` — composition / scoring / validation / reading
- everything else per INTERVIEW-RUBRIC.md

**Leave alone (data, titles, refs, structure):**
- `hero_*`, `tldr`, `one_thing.head`, `one_thing.skip_list`
- `so_what.lenses[]` (separate editorial unit; restructure separately if needed)
- `build_notes.title`, `paper_ref`, `metric_html`, `ship_this_week_html`, `code`, `diagram_svg`
- `under_the_hood.source`, `diagram_svg`
- `the_rep.*`, `toolbox`, `india_signal.*`, `decoder`, `poll`, `foot`
- `reality_check.harm_tag`, `h3`, `honest_html`, `source`

---

## Closer shapes — rotate per issue (4 comedian techniques)

The closer is the punch the reader screenshots. Pick ONE intelligent-comedian shape per issue and rotate across the next 4 — never use the same shape two issues in a row. These are STRUCTURAL moves, not voice imitations; the brand voice (calm confidence) stays.

| Shape | Move | Sample punchline cadence |
|---|---|---|
| **Norm Macdonald deadpan anti-joke** | Setup deadpan, factual, lingers on absurd detail without commentary. The "joke" subverts the expected moral. Restraint is the comedy. | "It was promoted to a paid tier and given a longer context window." |
| **George Carlin first-principles strip** | Name a normalized industry practice. Strip the framing one clause at a time. Reveal what the bare action actually is. | "...the platform that was advertised, in the brochure, as a moving train." |
| **Mitch Hedberg short pattern-flips** | 2-3 single-sentence flips stacked. Second half subverts the assumed shape of the first. Tight enough to screenshot each line. | "It just won't remember what you told it in the first sentence by the time you get to the fourth." |
| **Bo Burnham meta-system observation** | Step back from the artifact, name what its existence implies about us. Slightly horrified, intelligent. | "...the load-bearing engineering between it and the customer is the number twelve." |

Sample issue rotation: 001=Norm, 002=Carlin, 003=Hedberg, 004=Burnham, 005=Norm again (rotate the cycle). No two consecutive issues share a shape.

Voice constraints still apply: no edgelord, no cynicism for its own sake, no "everyone is stupid" punchlines. The dark observation earns its place by being TRUE, not by being shocking.

## Voice rules (override CLAUDE.md if conflict)

Banned phrasings (logged in MISTAKES.md as recurring formulas):
- "Save this" / "Save this — it answers any..."
- "Strong-hire candidates do X. Hire candidates do Y."
- "the durable skill" / "the meta-skill"
- "the senior move is..."
- "the framework works for any..."
- "same shape works for any X, Y, Z"
- "is X, not Y" closer cadence with em-dash-then-when-clause

Banned visual scaffolding:
- Inline titled sub-sections like `<b>The Framework:</b>`, `<b>The Trap:</b>`, `<b>What separates:</b>` — use prose with embedded emphasis, not labeled lists.

Banned opener shapes (collisions logged in MISTAKES.md):
- "A Tuesday this month, ..." (used in 004 lede)
- "Last November, ..." (used in 004 closer)
- "Picture the..." — generic, no anchor

---

## Pre-ship checklist for any new issue

Before pushing or publishing a new issue:

1. **Run the multi-device audit:** `node scripts/audit-layouts.mjs https://aibasically-eta.vercel.app` — must show P0: 0.
2. **(Optional, recommended) Visual judge:** `node scripts/audit-layouts-judge.mjs` — must show 0 blockers.
3. **Cross-issue analogy diff:** open the last 4 issues' lede + build_notes.finding + under_the_hood.steps. Confirm the new issue's analogy domain isn't a near-duplicate of any of them. If it is, rewrite before push.
4. **Voice scan:** grep the new content for any banned phrasing from the "Voice rules" section above. Zero hits required.
5. **First-time reader test:** read the issue cold on mobile. Identify the through-line image — can you name it in one phrase? If not, the analogy isn't doing its work.

A new issue is **DONE** when:
- Multi-device audit P0: 0
- Voice scan: zero banned phrasings
- Through-line analogy is named, threads through ≥3 sections, doesn't collide with prior 4 issues
- Each of the 8 "must" fields above lands a concrete moment in the first 30 words
- Closer has a punch that the reader screenshots and shares

A new issue is **BLOCKED FROM PUBLISH** when:
- Any concrete claim lacks a named source + year
- The One Thing lede is auto-drafted without Suraj's editorial pass
- Through-line analogy collides with any of the last 4 issues
- Any banned voice phrasing is present
