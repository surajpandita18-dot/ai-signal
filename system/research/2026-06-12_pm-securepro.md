# UX Research — Issue 001 read by Product/Biz + Secure Pro

Date: 2026-06-12
Researcher: ARIA (simulated)
Personas: Karthik (Sr PM, Bengaluru lending startup, AI roadmap owner) · Meena (Principal Eng, established Bengaluru SaaS, 14 YOE)
Artifact: https://ai-signal-eta.vercel.app/i/001?preview=1
Source of truth read: /Users/surajpandita/ai_signal/content/issues/001.json
Reference: /Users/surajpandita/Downloads/ai-basically-FINAL.html

---

## PART A — KARTHIK (Product/Biz, 32, lending startup PM)

Device: 16" MacBook, desk, lunch break. Budget: 8–10 min. Bias: kills fluff fast. Reads Stratechery for thesis, Lenny for craft. Will fact-check the 11,000 stat.

### A.1 Scroll narration with inner monologue

**Masthead + streak caption ("Your Saturday ritual"):**
> "Saturday ritual is a stretch for issue 1, but the wordmark looks like a serious publication. Newsreader italic tagline is doing the work. Two seconds — I'll give it the scroll."

**Hero — "This week, RBI quietly changed the rules." + eyebrow "AI, explained like a normal person would":**
> "Wait, RBI? I'm in lending. This is literally my Monday standup. The eyebrow framing — 'normal person would' — that's anti-Stratechery, but I'll forgive it because the headline is on-thesis. The sub-deck 'Skim it in 5 or go deep in 12 — your call' is a *promise*, and I'm grading it the rest of the way."

This is the strongest 12 seconds of the issue for him. He's hooked.

**TLDR rail (Big one / Build Notes / Jobs / Reality):**
> "Good. Four bullets, I know the spine. 'Build Notes' tells me this isn't a Lenny-style operator essay, this leans technical. Slight worry: 'Jobs' is below Build Notes — wrong order for a PM. I want signal then strategy then jobs. Whatever. Click 01."

**Section 01 — The One Thing (RBI circular):**
> "*'Like IRCTC keeps an audit trail for every Tatkal booking, every AI loan decision will now have to record its why'* — that's the analogy I'm stealing for the standup. Solid. *'It's a draft, so timelines may slip — but the direction is clear'* — okay, this writer hedges honestly. I trust him 5% more. 'If you're in BFSI, this shapes your next few quarters. If you're not, remember the pattern: insurance and hiring are likely next' — *this* is the Stratechery move. Pattern, not panic. Skip List telling me to ignore GPT-6 leak threads — yes please, I wasted 20 min on that on Tuesday."

WIN: section 01 is genuinely on-thesis for him.

**Section 02 — So What For Me (lens carousel):**
First thing he notices: the rotation note says "Primary: Builder. Next week: Secure Pro." His lens — Product/Biz — is *not* the primary one this week.
> "Wait. The system has decided this week is for Builders. I'm Product/Biz. That's a flag — the lens I'm here for is explicitly de-prioritised. Let me see what I actually get."

He scans down to Product/Biz lens:
> "Add an *AI decision log* section to the PRD now. Audit-ready by design is cheap; retrofitting it later is expensive."
> 
> Inner monologue: "Okay. True. But I already know this. Anyone shipping AI in BFSI has had this conversation in October last year. 'Add one line to your live PRD today' — that's not an action, that's a slogan. Where's the *template*? Where's the *one sentence to actually paste in*? The Builder lens above me got 'spend this weekend adding a citation layer' — that's specific. Mine is vibes."

This is a P1 dropoff. He doesn't bail, but his trust dips. He reads the Secure Pro and Switcher lenses out of curiosity:
> "Secure Pro lens is actually nicer prose than mine. Switcher is the most differentiated — 'AI + compliance is a less-crowded lane' is a real take. My lens is the weakest of the four. Funny."

**Section 03 — Build Notes (RAG hallucination):**
> "Dark band, monospaced font, the 'embarrassing-question' framing. Not for me. But the 20-second skim version is good — *'your model retrieves the right chunk then ignores it in favour of training'* — okay, I can use this in 1:1s with my engineers. The 71→89% number — that's a real metric, signed and cited. Better than half of Stratechery's vibes-economics this week. I'm not going to read the Python code, but I respect that it's there."

He skims, doesn't dwell, doesn't bail. Build Notes is *not* aimed at him but doesn't drive him away because it's clearly demarcated by dark band — he knows it's not his lane.

**Section 04 — Job Signal:**
> "11,000+ open AI-adjacent roles in Bengaluru GCCs. Source: NASSCOM Q2 2026 report. *I will fact-check this*. [opens new tab, searches] Okay, NASSCOM does publish quarterly GCC reports, the number is plausible. Good — they didn't make it up. The skill heating up = 'AI evals' — yes, I've seen this in JDs we posted. Wells Fargo GCC / Target India / Walmart Global Tech namecheck — that's a tell that the writer knows the actual market, not a generic 'GCCs are hiring'."

Then: the upskill ladder ("If you're unemployed or scared right now — start here").
> "Not for me. But it's directly addressed to a different reader, which is fine. Skipping past."

Then: the interview Question of the Week — "How would you know if your AI feature is actually working?" with 4-step framework.
> "Wait. This is actually the framework I'd want my PMs to use in a roadmap review. Outcome → online + offline metric → specific failure → log it. That's *the* answer. I'm saving this. *'Save this — it answers a whole category of questions'* — yes, ack, agreed."

WIN: the interview framework is more useful to Karthik than his own lens take was. Quiet irony.

**Section 05 — Under the Hood (memory / RAG explainer):**
> "Tiffin analogy. Cute. 'A genius with the wrong notes still cooks the wrong dish' — I'm using that line. Not new info, but the *language* is fresh. This is what I'd send to my non-technical co-founder when she asks 'why doesn't our AI just remember things'."

Useful for him as a translator-asset, not as new knowledge.

**Section 06 — The 15-Min Rep:**
> "Drop a PDF into Claude. Find 3 hidden charges. Cute, but I'm not doing this on my lunch break. The reader-win quote from Priya in Pune feels real, which gives the section credibility even if I skip the action."

Skim, no action.

**Section 07 — Toolbox ("explain it back" trick):**
> "Already use this every time I write a proposal. Doesn't teach me anything. Two paragraphs, takes 15 seconds, no harm done."

**Section 08 — Reality Check (water/power cost):**
> "The framing — *'not a reason to quit AI… use it deliberately'* — is exactly the tone I want my CEO to read. The 'same logic as the Skip List, pointed at your own usage' callback is a nice writerly move. Real source citation. This is the only place I'm going to share the issue with someone — sending the screenshot to our ops lead."

WIN: this is his share-out moment.

**Section 09 — India Signal cards:**
> "Namma Metro 40% — surprised, would investigate. NPCI open-sourcing UPI fraud model — *huge* if true, and the framing 'free India-native production-grade dataset' is exactly the kind of thing a builder wants. I'd forward this to my staff engineer. Zoho Tamil LLM — niche but real."

These cards land well for him because his lens is "what's actually shipping in India."

**Closer (dark joke) + Poll:**
> "'We spent two years teaching AI to sound confident. We spent zero teaching it to say I don't know.' Good. The poll — 'building / surviving / planning a switch' — there's no 'shipping the roadmap' option. I'd tap 'building' but it's not quite me."

### A.2 Dropoff moments — Karthik

| # | Section | Severity | Why |
|---|---|---|---|
| K1 | Section 02 — Product/Biz lens | P1 painful | His lens take is the weakest of the four. "Add an AI decision log to your PRD" is a slogan, not an artifact. Builder gets a weekend project. Switcher gets a 20-min portfolio piece. Karthik gets one line. |
| K2 | Section 02 — rotation note | P2 friction | Explicitly tells him this week's primary is *not* him. He stays, but the implicit message is "you're not the protagonist this week." |
| K3 | Section 04 — upskill rungs | P2 friction | Addressed to "unemployed or scared" — Karthik is neither. He skims past. Not a bail point, but a "this issue lacks a track for me" signal. |
| K4 | Section 06 — Rep tier | P2 friction | The Rep is consumer-flavoured (loan FAQs, hidden charges). For Karthik, would land harder as "drop your competitor's API docs / a regulator's draft circular into Claude and ask X". |
| K5 | Section 03 — Build Notes density | P2 friction | Not a bail, but he stops at the takeaway and skips the code/diagram. The dark band correctly signals "engineer territory" so he doesn't feel excluded. |
| K6 | Poll | P2 friction | "Building / surviving / switching" misses "leading a team / making roadmap calls". |

No P0 bail moments for Karthik. He'd read end to end in ~9 min.

### A.3 Wins — Karthik

Direct quotes:
- "*'Insurance and hiring are likely next'* — that's the Stratechery move."
- "*'A genius with the wrong notes still cooks the wrong dish'* — stealing this for the all-hands."
- "Interview Q framework — Outcome → online + offline → failure → log. I'm screenshotting that for my PMs."
- "Reality Check tone is the only place I'd actually share this issue — to my CEO, with the framing 'use AI deliberately'."
- "NPCI open-sourcing UPI fraud model — forwarding this to my staff engineer right now."

### A.4 Lens audit through Karthik's eyes (1–5)

| Lens | Relevance | Actionability | Voice-fit | Specificity | Notes |
|---|---|---|---|---|---|
| Builder | 2 | 4 | 4 | 4 | Not his lane, but he respects the specificity ("citation layer this weekend"). Reads it for translation value. |
| **Product/Biz (his)** | **5** | **2** | **3** | **2** | Topic relevance is maxed. But the take ("add a line to your PRD") is what *everyone* in BFSI is already doing. No template, no example, no name of a real decision-log structure he could copy. Reads like the lens was written last. |
| Secure Pro | 3 | 3 | 4 | 3 | He reads it out of curiosity; it lands as warmer/more human than his own lens. |
| Switcher | 4 | 5 | 5 | 5 | The most differentiated, specific, novel take in the whole carousel. 20-min portfolio artifact is a real action. Ironically, the lens most likely to make Karthik forward the issue to a friend. |

**Verdict:** The Product/Biz lens does *not* earn it for Karthik. It's the lens most likely to read like ChatGPT wrote it.

---

## PART B — MEENA (Secure Pro, 39, principal eng SaaS)

Device: iPad, sofa, post-dinner. Budget: 6–8 min. Bias: allergic to "AI will replace you" panic-bait. Wants steady honest guidance and the minimum she has to learn.

### B.1 Scroll narration with inner monologue

**Masthead + hero:**
> "*'AI, explained like a normal person would.'* Okay, low ego, I'll allow it. *'RBI quietly changed the rules'* — I'm not in BFSI but I'll see why he says 'rules' and not 'noise'."

The promise of "skim in 5 or go deep in 12" matters to her more than to Karthik. Time budget is everything.

**TLDR:**
> "Four labels. I see 'Jobs' and brace for AI-will-eat-you energy. But the framing — 'a real hiring number, plus the surprise interview question' — is dry, not threatening. Cautious continue."

**Section 01 — The One Thing:**
> "Not my industry. But the *pattern* line — 'remember the pattern: insurance and hiring are likely next' — is what I'll come back for. Skim, done in 40 seconds."

She doesn't dwell. Smart not to slow her down here.

**Section 02 — So What For Me, the Secure Pro lens:**
This is the test of whether the issue earns her loyalty.
> "*'Good news first: this makes your judgement more valuable, not less.'* — Okay. Honest, not panicked. Better than Lenny last week. *'The one habit worth starting — a quick why note on big calls — turns you into the person who can explain the AI, which is exactly who teams keep around.'*
>
> Hmm. The advice is: write down why. Like an ADR (architecture decision record). I've been doing this for 8 years. The framing is gentle and protective, which I appreciate — but the *action* is a thing senior engineers already do."

This is the central question of the whole research: **does the Secure Pro lens earn it for Meena?**

Answer: **partially.** The *tone* earns it (P0 anti-doom framing, "job's safe, day's changing"). The *action* under-serves a 14-YOE principal — she's already living it. A 4-YOE mid-level would get more from this.

> "I want to know: of the 30 AI things being thrown at me, which 2 actually matter for my next perf cycle? This lens told me my judgement is safe. It didn't tell me what to learn."

She reads the other three lenses:
> "Builder is too tactical (a weekend RAG project — I haven't shipped to prod in 18 months, I do design reviews). Product/Biz is generic. Switcher is for someone else, but is the most concrete."

**Section 03 — Build Notes:**
> "*Your RAG hallucinates in prod — here's the actual reason.* This is what my staff engineers are dealing with. Reading not to ship, but to *talk to them*. The chunk-vs-prior framing is clean. The diagram is well-made. The 71→89% with no latency change — sounds real, sounds engineer-honest.
>
> *Logging disagreement rate as your real hallucination metric* — I'm taking this to the AI-platform team next week. This is the kind of thing I'd quote in my CTO's monthly review."

WIN: Build Notes is the *most* useful section for Meena — even though she's not the target. Because she's the person who relays this to a team and a CTO. The writer didn't intend this, but it works.

**Section 04 — Job Signal:**
> "11,000 jobs in Blr GCCs, NASSCOM Q2 26. Doesn't move me — I'm not job hunting. Skim.
>
> 'If you're unemployed or scared right now' — not me. The upskill rung (10 test cases, eval doc, Hugging Face guide) — *this is what I'd give my junior on Monday morning*. Saving the link.
>
> Interview Q — 'How would you tell if your AI feature is working?' — same framework I use when I review my team's design docs. Bookmark, not for me, for them."

She passes through. No P0 dropoff, but the section is for someone else. Job Signal is over-tilted to entry-level / nervous switchers, which is correct framing for the audience but means Meena *consumes it as a manager*, not as a Secure Pro.

**Section 05 — Under the Hood (memory / RAG):**
> "Tiffin analogy — cute. I already know this. But — *'most AI is dumb complaints are actually AI was handed bad notes'* — that's the line I want in our internal AI-readiness Slack. Saving."

The "translation asset" pattern is becoming her primary value extraction.

**Section 06 — The Rep:**
> "Drop a PDF and ask for hidden charges. I'd actually do this on my home loan papers. Mild win. The 'reply with your screenshot' loop feels too informal for the brand promise — but I get what he's going for."

Likely action: she might actually do this on a Sunday morning. P0 win for the Rep.

**Section 07 — Toolbox ('explain it back'):**
> "Use this every time I write an RFC. Will recommend to my team but won't change my own behavior."

**Section 08 — Reality Check (water/power):**
> "I have two kids and I think about this. Not the apocalypse take, not the abstainer take. *'Use it where it earns its cost'* — that's a position I can hold honestly. And the link back to the Skip List is satisfying — the issue feels *composed*, not assembled."

WIN: Reality Check is the second-most-resonant section for Meena, after Build Notes.

**Section 09 — India Signal:**
> "Namma Metro 40% — I'd verify before quoting. NPCI fraud model — interesting but I won't open it this weekend. Zoho Tamil LLM — proud of Indian work, not actionable for me."

Read-and-pass.

**Closer + Poll:**
> "Dark joke is sharp. *'Machines that are wrong at the speed of light, and a generation learning to trust the tone instead of checking the fact.'* — I'll quote this. Poll — I'm 'building'? No. 'Surviving'? Sort of. 'Switching'? Definitely not. No tap."

### B.2 Dropoff moments — Meena

| # | Section | Severity | Why |
|---|---|---|---|
| M1 | Section 02 — Secure Pro lens action | P1 painful | Tone is perfect. Action ("write the why on your next big decision") is something a principal engineer has done for a decade. The lens needs a *senior-flavored* action: "write the one paragraph you'd defend in a CTO review about which AI capability your team should NOT adopt this quarter," for example. |
| M2 | Section 04 — Job Signal whole section | P2 friction | The section is correctly aimed at switchers/early-career. Meena consumes it as a translator-asset for her juniors, not for herself. No bail, but the section is "not for her" for 60% of its length. |
| M3 | Section 05 — Under the Hood | P2 friction | She already knows it. The value is the language, not the lesson. For a Secure Pro lens reader, this could front-load *one* harder thing she doesn't know. |
| M4 | Section 06 — Rep tone | P2 friction | "Reply with your screenshot — featured results are shared with permission" feels community-flavored. Meena is unlikely to participate publicly. She'll do the Rep privately. |
| M5 | Poll | P1 painful | None of the three options describe Meena's state ("steady, observing, deciding what to learn"). Worst, "surviving" frames her honest state as failure. |
| M6 | Hero promise vs lens delivery | P1 painful | "Skim in 5, go deep in 12" promises a track for her. The Secure Pro lens is 60 words. The Builder lens has 200 words + a code snippet + a diagram. There's a *depth asymmetry* that signals which reader the issue values most. |

No P0 bails. She finishes the issue. But the lens-delivery asymmetry (M6) is the structural finding from her read.

### B.3 Wins — Meena

Direct quotes:
- "*'Job's safe, day's changing'* — finally someone said it without the 'you must reinvent yourself' yelling."
- "Build Notes disagreement-rate metric — taking this to the platform team Monday."
- "*'A genius with the wrong notes still cooks the wrong dish'* — Slack-quote material."
- "Reality Check tone — 'use AI where it earns its cost.' That's a sustainable position I can hold."
- "Dark closer — '*wrong at the speed of light*' is going on a sticky note above my monitor."

### B.4 Lens audit through Meena's eyes (1–5)

| Lens | Relevance | Actionability | Voice-fit | Specificity | Notes |
|---|---|---|---|---|---|
| Builder | 2 | 4 | 3 | 5 | She respects it, harvests it for her team. Not for her. |
| Product/Biz | 2 | 2 | 3 | 2 | She finds it generic; it doesn't speak to either of her hats. |
| **Secure Pro (hers)** | **4** | **2** | **5** | **2** | Voice nails it — the most distinctive emotional register in the issue. But action is calibrated for a mid-level, not a principal. She wants the take but it doesn't help her *decide* anything Monday. |
| Switcher | 3 | 5 | 4 | 5 | She reads it imagining her cousin. Most actionable lens of the four. |

**Verdict:** The Secure Pro lens *earns the trust* (voice + emotional safety) but *under-serves the brain* (action is mid-level). Half-win.

---

## PART C — Combined lens audit (writer-facing)

Reading the four lenses against both personas, a pattern emerges:

| Lens | Specificity | Novelty | Action quality | Verdict |
|---|---|---|---|---|
| Builder | 5 | 4 | 5 (citation layer this weekend) | The strongest lens. Has a verb, a deliverable, a timeframe. |
| Product/Biz | 2 | 2 | 2 (add a line to your PRD) | The weakest lens. Sloganistic. No artifact. Karthik can write this himself. |
| Secure Pro | 3 | 4 | 2 (write the why on next big decision) | Voice carries it. Action is mid-level. |
| Switcher | 5 | 5 | 5 (20-min portfolio bullet) | The sleeper hit. Most likely to make either persona forward to a friend. |

The Builder + Switcher lenses are doing the work. Product/Biz and Secure Pro lenses are coasting on tone. For a primary lens this week to be "Builder" is fine, but the *non-primary* lenses still need to earn their seat — and Product/Biz is the one closest to filler.

---

## PART D — Top 5 concrete fixes (Monday-shippable)

All file references are to: `/Users/surajpandita/ai_signal/content/issues/001.json`

### FIX 1 — Replace the Product/Biz lens action with an actual artifact

File + region: `content/issues/001.json` → `so_what.lenses[1]` (role: `product_biz`)

Before:
```json
{
  "body_html": "Add an \"AI decision log\" section to the PRD now. Audit-ready by design is cheap; retrofitting it later is expensive.",
  "action": "→ Do: add one line to your live PRD today."
}
```

After:
```json
{
  "body_html": "Audit-ready PRDs are about to be table-stakes in regulated stacks. The one-line addition that costs you nothing today and saves a retrofit later: a <b>\"Decision Log\"</b> field on every AI feature, capturing <i>inputs in, model + version, retrieval source, why this answer, who can override</i>. Five fields. One line in the PRD. One column in your eval sheet.",
  "action": "→ Paste this into your live PRD today: <code>Decision Log: {input, model+version, retrieval_source, rationale, override_path}</code>. That's the artifact. Ship it before the regulator asks."
}
```

Why it fixes the dropoff: Karthik (K1) gets a real artifact he can paste into Confluence Monday morning. The Switcher lens has a 20-min portfolio piece. The Builder lens has a weekend project. Now the Product/Biz lens has a 5-field template. Symmetry restored.

### FIX 2 — Add a Senior tier to the Secure Pro lens

File + region: `content/issues/001.json` → `so_what.lenses[2]` (role: `secure_pro`)

Before:
```json
{
  "body_html": "Good news first: this makes your judgement <em>more</em> valuable, not less. The one habit worth starting — a quick \"why\" note on big calls — turns you into the person who can explain the AI, which is exactly who teams keep around.",
  "action": "→ Do: write the \"why\" on your next big decision."
}
```

After:
```json
{
  "body_html": "Good news first: this makes your judgement <em>more</em> valuable, not less. If you're mid-career, the one habit worth starting is a <b>\"why\" note on big calls</b> — you become the person who can explain the AI, which is who teams keep around. If you're already senior, the harder move is the <b>\"not yet\" list</b>: the AI capabilities your team should explicitly <em>not</em> adopt this quarter, and the one sentence you'd defend that decision with in a CTO review.",
  "action": "→ Mid-career: write the \"why\" on your next big decision. Senior: write your team's 3-item \"not yet\" list before Monday."
}
```

Why it fixes the dropoff: Meena (M1) finally gets a senior-flavored action. The "not yet" list is the work principal engineers do that nobody names — surfacing it earns the lens. Mid-level reader still served by line 1.

### FIX 3 — Fix the poll so neither persona feels mis-described

File + region: `content/issues/001.json` → `poll.options`

Before:
```json
{
  "question": "Before you go — one tap:",
  "options": ["This week I'm: building", "…just surviving", "…planning a switch"]
}
```

After:
```json
{
  "question": "Before you go — one tap:",
  "options": ["This week I'm: building", "…steering / deciding", "…holding steady & learning", "…planning a switch"]
}
```

Why it fixes the dropoff: M5 (Meena's "surviving" frames steady-state as failure) and K6 (Karthik has no roadmap-leader option) both solved. "Steering / deciding" picks up Karthik. "Holding steady & learning" picks up Meena's actual state without making it sound like failure. Poll completion goes up; signal quality goes up.

### FIX 4 — Re-balance lens length / depth so non-primary lenses aren't visibly shorter

File + region: `content/issues/001.json` → `so_what.lenses[*]` (length audit)

Before (current word counts):
- Builder (primary): ~42 words + bold action
- Product/Biz: ~22 words + 9-word action
- Secure Pro: ~50 words + 12-word action
- Switcher: ~36 words + 30-word action with explicit deliverable

After: enforce a **floor** of ~45 words body + an action with at least one concrete deliverable (artifact, time-box, OR named resource). Specifically, lengthen Product/Biz per FIX 1 and Secure Pro per FIX 2. Builder stays as the depth-anchor; that's correct for the primary.

Why it fixes the dropoff: Meena's M6 finding — that lens length itself signals which reader the issue values — is addressed structurally. The primary lens can still be deeper (a `is_primary: true` deserves more), but no lens reads as filler.

### FIX 5 — Add a "for the team lead" sidebar to Job Signal, so senior readers harvest it without feeling addressed-down-to

File + region: `content/issues/001.json` → `job_signal` (add new key after `upskill`)

Before: `job_signal.upskill` is addressed to "If you're unemployed or scared right now — start here." No alternative for senior readers.

After: add a small sibling block, e.g.:
```json
"upskill_lead": {
  "title": "If you're the one *giving* this advice to your team",
  "body_html": "Forward the rung above to your most junior PM or engineer. Then run this week's interview question on yourself — when was the last time you wrote down <em>one online + one offline metric</em> for an AI feature you own? If the answer is 'never on paper,' that's the gap. Write it this week."
}
```

Why it fixes the dropoff: Meena (M2) and Karthik (K3) both currently consume Job Signal as managers-of-juniors. This makes the section explicitly serve them as managers without losing the entry-level lane. Two readers, same section, no condescension.

---

## PART E — Verdicts (1–5)

| Dimension | Karthik (Product/Biz) | Meena (Secure Pro) |
|---|---|---|
| Hooked in first 30 sec | 5 | 4 |
| Found the relevant lens | 2 | 3 |
| Made it past Section 04 / Under the Hood | 5 | 5 |
| Would share with team | 4 (Reality Check + Build Notes takeaway) | 4 (Build Notes disagreement metric + closer line) |
| Would return next Saturday | 4 (RBI thesis was that good) | 3 (will return if next week's Secure Pro lens earns it; currently on probation) |

Both finish the issue. Both extract real value. Neither's lens is the issue's best lens — the Builder + Switcher lenses are.

---

## PART F — Summary

**Total dropoff moments found: 12** (Karthik 6, Meena 6). Zero P0 bail points. Three P1 painful (K1 Product/Biz lens action; M1 Secure Pro action calibrated for mid-level; M5/M6 poll and lens-depth asymmetry). The rest are P2 friction.

**Top 3 fixes to ship Monday:**

1. **FIX 1** — Replace the Product/Biz lens action with a 5-field Decision Log template. Closes the lens's biggest credibility gap and makes the non-primary lens carry weight equal to Switcher.
2. **FIX 2** — Add a "Senior" tier to the Secure Pro lens with a "not yet" list action. Earns trust from 14-YOE readers who are currently being served emotion but not action.
3. **FIX 3** — Fix the poll to add "steering / deciding" and "holding steady & learning" so neither persona is mis-described or implicitly failing.

These three together unlock the lens system as the issue's promised value-prop instead of two-out-of-four lenses doing the work.
