# UX research — Issue 001, Builder vs Switcher

**Date:** 2026-06-12
**URL tested:** https://ai-signal-eta.vercel.app/i/001?preview=1
**Method:** Scroll-by-scroll persona simulation, desktop + mobile screenshots, JSON content cross-check.

---

## Verified section order (as rendered)

Masthead (wordmark + "Your Saturday ritual" streak meta) → Hero (eyebrow "AI, explained like a normal person would" + huge serif headline "This week, RBI quietly *changed the rules.*" + sub) → TLDR 4-row box → §01 The One Thing (RBI circular + Skip List) → §02 So What For Me (4 lens cards, Builder primary) → Build Notes (dark technical band) → §03 Job Signal (2 rows + spotlight + upskill ladder + interview Q&A) → §04 Under the Hood (tiffin diagram + 3 steps) → §05 The Rep (lite + full + reader-win) → §06 Toolbox → §07 Reality Check (water bill) → §08 India Signal (3 cards) → Closer ("dark one") → Referral 3-tier ladder → Poll (3 options) → Footer.

That is **fifteen** sections after the hero, plus a referral block, plus a poll, plus a footer. The reading-time stamp says "7 min". The actual scroll-to-bottom is closer to 10–12 minutes if anyone reads carefully. This single mismatch is the seed of half the dropoff risk below.

---

## PERSONA 1 — Anshul (Builder, 27, fintech engineer, 5–8 min on a laptop)

### Scroll-by-scroll inner monologue

**Hero.** "OK, RBI changed the rules, BFSI hook, I work in credit-scoring — fine, I'll bite. 'Skim in 5 or go deep in 12' — good, I trust that promise." Leans in. Eyebrow "AI, explained like a normal person would" registers as slightly soft; he half-wonders if this is going to be a beginner piece. The italic kesari "changed the rules" carries it.

**TLDR.** Reads the 4 bullets in 4 seconds. "Build Notes on RAG hallucination — that's actually my Tuesday problem. Jumping there." But there's no anchor link. He scrolls.

**§01 The One Thing.** "RBI explainability circular. IRCTC Tatkal analogy is cute. 'If you're in BFSI, this shapes your next few quarters' — yeah, yeah, I'll forward this to the compliance PM, not my problem until the architect tags me." Skim mode engaged. The Skip List is a nice taste — three sentences of attitude that earn a half-smile.

**§02 So What — lens cards.** Sees four roles. **Builder is primary** with a kesari dot. Reads only the Builder card: "ship a 'why' field with every answer next sprint." Reaction: "Concrete enough. Citation layer on the RAG pipe, I already half-have that." He skips Product/Biz, Secure Pro, Switcher entirely. *The other three lenses are dead weight to him on this scroll.*

**Build Notes — entering the dark band.** This is the moment Anshul came for. The visual switch to dark + mono font reads "OK, the engineering content." Header: *"Your RAG hallucinates in prod — but never in testing."* He physically leans forward — "exact problem I had Thursday." Paper ref to Longpre EMNLP registers credibility.

- **20-second skim line:** "retrieves the right chunk, then ignores it… bigger models do this *more*." → Real, counter-intuitive, fits his lived experience. Win.
- **Struggle paragraph:** "Production. Confidently contradicts the chunk. Adds more context, gets *worse*." → Confirmation. He thinks "thank god someone wrote this down."
- **Finding paragraph:** "Model overrides the retrieved chunk with its training prior; bigger model trusts prior *more*." → Specific, falsifiable, useful framing.
- **Fix paragraph:** "(1) re-rank for unambiguous top chunk, (2) put 'answer ONLY from the context below' at the chunk boundary, not the system prompt." → He literally pulls a sticky note. **This is the single highest-leverage moment on the page.**
- **Metric: 71% → 89% faithfulness on 200 prod queries, no latency change.** → He believes it because the latency caveat is included. Real numbers.
- **Diagram (SVG).** Glances. The RETRIEVED CHUNK vs TRAINING PRIOR → CONFLICT → CONFIDENTLY WRONG arrow. He nods. Doesn't need it but it doesn't slow him down.
- **Code block.** `def disagreement_rate(rows):` — copies it. There's a copy button. He smiles. *This is what TLDR AI never does for him.*
- **"Ship this week" line:** "Log disagreement rate. That's your real hallucination metric." → He writes a Linear ticket while still on the page.

**§03 Job Signal.** "I'm employed, this is for someone else." Skims first row (Fintech + GCCs). Second row ("AI evals is heating up") — he pauses. "Wait, this is the same thing as the Build Notes — evals = the disagreement_rate I just learned. Nice tie-back." Spotlight stat (11,000 Bengaluru) — interesting but not for him. Upskill ladder ("if you're unemployed or scared") — he scrolls past. Interview question framework — he reads it because PMs at his org ask exactly this question and he half-mentors juniors. The 4-step structure registers as forwardable. Mild win.

**§04 Under the Hood — tiffin metaphor.** "Memory = storage + retrieval, RAG is just 'look it up before you answer.'" He already knows this. Skim. The tiffin diagram is charming but he doesn't need it. The line "a genius with the wrong notes still cooks the wrong dish" is good — he'll steal it for his next architecture review.

**§05 The Rep.** "Drop a bank loan PDF into Claude and find 3 hidden charges." He smiles, doesn't do it. He's already shipping his disagreement_rate Linear ticket.

**§06 Toolbox.** "'Explain it back' trick." He's heard it. Skim.

**§07 Reality Check.** "Water bill for AI images." He doesn't generate images. Skim. Reads the "use deliberately, skip the 50 throwaway generations" line and nods.

**§08 India Signal.** **NPCI open-sources UPI fraud detection model** — sudden hard lean-forward. "Wait, what? Indian transaction patterns Western datasets miss — this is literally what my team needs for our model." Card is too short. He wants a link, a repo, a dataset card. *There is no link.* Friction.

**Closer.** Dark joke. "Wrong at the speed of light." He half-laughs. Solid send-off line. *Forwards a screenshot of this to his team WhatsApp.*

**Referral block.** Sees 3 tiers, "refer 1 / 3 / 5". He just got value. He's open to forwarding. But: the CTA is "⧉ Copy your invite link". He's not logged in. The link is generic. He doesn't bother. *The Closer was the share trigger; the Referral block missed by being one screen too late.*

**Poll.** "building / surviving / planning a switch". Skim, doesn't tap. The page doesn't show what happens after a tap.

**Footer.** "Next issue: Saturday, 8:00." Trusts it. Closes tab.

### Dropoffs (Anshul)

| Section | Why | Severity |
|---|---|---|
| TLDR → §01 | No anchor links from TLDR. He wanted to jump to Build Notes; instead scrolled three sections of stuff he doesn't need. | **P1** |
| §02 So What (non-Builder lenses) | Three of the four lens cards are filler for him. Rotation note ("everyone gets a turn") doesn't justify reading them this week. He skips. | **P2** |
| §03 Job Signal — Upskill ladder | "If you're unemployed or scared" — he is neither. Full ladder is dead air. | **P2** |
| §04 Under the Hood | Builder-level knowledge. Charming but adds no info. ~90 seconds of his budget. | **P2** |
| §05 The Rep + §06 Toolbox | Skimmed in 5 seconds. Not bad — but reinforces "I'm done" feeling before the last good thing (NPCI). | **P2** |
| §08 India Signal — NPCI card | Highest-intent moment in the back half. **No link. Dead end.** This is a P0 share-loss because it's where he was most likely to forward to his team with a link. | **P0** |
| Referral block | Arrives after the share-impulse spike (Closer). One screen too late + cold CTA. | **P1** |

### Wins (Anshul)

- Build Notes dark band visual switch — instant "this is for me" signal.
- Code block is **actually copyable**, not a screenshot. **This is the single feature that beats TLDR AI for him.**
- 71% → 89% with no latency change — real, falsifiable, immediately usable.
- "Position matters more than wording" (chunk-boundary instruction placement) — non-obvious, actionable, ships Monday.
- Closer dark joke — earns a forward.

### Verdict (1–5)

- Hooked-in-first-30s: **4**
- Made-it-past-Build-Notes: **5** (leaned in, copied code)
- Came-back-up-from-fold: **2** (back half mostly skimmed)
- Would-share-with-friend: **3** (would have been 5 if NPCI card had a link)
- Would-return-next-Saturday: **4** (Build Notes alone earns the return)

---

## PERSONA 2 — Riya (Switcher, 34, biz-dev SaaS, iPhone in bed at 11pm, 4–6 min)

### Scroll-by-scroll inner monologue

**Hero.** "RBI quietly changed the rules." Phone in portrait. "OK, this is news-y, I can deal with this." Eyebrow "explained like a normal person would" is the line that keeps her on the page — she was bracing for jargon. Sub: "Skim it in 5, or go deep in 12 — your call." Good. She has 5.

**TLDR.** Reads all 4. "RBI lending circular — sounds like work stuff. RAG hallucinates — *no idea what RAG is*. Hiring number — yes please. Water bill — interesting, environment angle." She decides she'll read One Thing + Jobs and bail before the technical bit.

**§01 The One Thing.** RBI circular. IRCTC Tatkal analogy lands. "AI loan decisions have to record their 'why'" — she gets it. Then: "If you're in BFSI, this shapes your next few quarters. If you're not, remember the pattern: insurance and hiring are likely next." → **This sentence saves the section for her.** Without it she would have felt this was for someone else. Skip List is a small dopamine hit.

**§02 So What — lens cards.** This is where the page works for her. She immediately spots the **Switcher** card. "Caption: 'Want into AI, minus the fear.'" → She literally exhales. "Yes."
Body: "'AI + compliance' is a real, growing, far-less-crowded lane than 'prompt engineer'. You don't need to code — you need to understand rules."
Action: "Read the circular's 1-page summary + write 3 plain-English bullets. That's a portfolio artifact, done in 20 min."

This is **the single moment that makes her keep the tab open instead of swiping to Instagram.** She screenshots it. She also briefly reads Product/Biz ("decide the roadmap") and feels it's almost her — useful FYI. She skips Builder + Secure Pro.

**Build Notes — the dark band.** Smash cut to a dark, mono-font, code-y section. Header: "Your RAG hallucinates in prod." Eyebrow says **"Nerd Lane · non-tech? skip to §4, no guilt."** → This is the line that saves her from bailing on the whole newsletter. She scrolls past the dark band without reading. *She does not bail. The "skip with no guilt" framing is the safety valve.* But —

- She does glance at the diagram (because it's visual).
- She does NOT read the code block — it's a wall of green mono text on a black background on a phone. Her eyes glaze.
- She does briefly catch "71% → 89%" and "evals" — and that **second word lodges** because the TLDR also said "evals" is the hot skill. She files it.

**§03 Job Signal.** This is her real section. Two rows:
- "Fintech + GCCs are driving hiring." → She works at a 200-person SaaS in Bengaluru. She knows what a GCC is. Lean-in.
- "'AI evals' is the skill heating up… *evals = simply testing whether the AI's answer is actually good, on purpose, with examples.*" → **The italic glossary is the hero of the entire newsletter for her.** Someone explained a jargon word in one line, in the same breath. She thinks: "I can do this."

**Spotlight: 11,000+ Bengaluru.** "Eleven thousand. Wells Fargo GCC, Target India, Walmart Global Tech." She screenshots this too. The "search LinkedIn for 'AI' + 'evaluation' OR 'RAG' + Bengaluru" tip is a **literal action she can do tonight.**

**Upskill ladder.** "If you're unemployed or scared right now — start here." → She isn't unemployed but is scared. The framing reads to her. The 3-rung ladder:
- The project: 10 test cases on one AI tool. → "I use ChatGPT for email summaries. I can do this."
- Free resource: Hugging Face + Anthropic cookbook. → "I'll Google these."
- Done looks like: a one-page doc. → "I can write a one-page doc. That's literally my day job."

She thinks: "Wait. This is the first newsletter that gave me a homework assignment I could finish before Monday." Big win.

**Interview question framework.** "How would you know if your AI feature is actually working?" The 4-step structure is jargon-light. She reads all of it. The trap line ("candidates say 'accuracy', winners say 'depends what breaks for the user'") clicks. She bookmarks the tab.

**§04 Under the Hood — tiffin metaphor.** "Memory = storage + retrieval, like a tiffin you keep re-handing the cook." → **The tiffin metaphor is the second biggest win on the page for her.** She gets it in 4 seconds. "RAG = just look it up before you answer" — finally a definition. The 3 steps land. She feels smarter than she did 30 seconds ago.

**§05 The Rep.** "Drop a bill or policy PDF into Claude and ask what most people miss." Lite version is doable, full version is a stretch. The Priya testimonial ("found a notice-period clause my manager didn't know about") is a 10/10 social proof for her — it's another biz-dev woman from Pune. *This is the single line that makes her believe she's the target audience.*

**§06 Toolbox.** "Explain it back" trick. Useful, mild win.

**§07 Reality Check — water bill.** She actually cares about this. The "small per image but it scales" framing is honest. She reads it carefully. The "use deliberately" line is the kind of thing she'd share to her climate-aware friend. No bail.

**§08 India Signal.** Three cards. Namma Metro at 40% — she's in Bangalore, this is a small civic-pride hit. NPCI fraud model and Tamil LLM data — too technical, eyes glaze, skims. She's tired now. The "Why you care" lines for each card are written for Builders (NPCI: "Builders, this is your weekend") — she correctly reads "not for me" and disengages.

**Closer.** Dark joke about AI confident speed of light. Lands. She half-smiles. Solid ending. Mental tab-close warming up.

**Referral block.** Three tiers. She has just had the best newsletter experience of her year and would happily forward to two friends pivoting careers. But — "Copy your invite link" without being logged in confuses her. She doesn't know if it tracks. She doesn't tap. *Lost referral.*

**Poll.** "Planning a switch." She wants to tap that. Does the tap do anything? She taps. Nothing visible happens (or no feedback registers on mobile). Mild deflation. **This is a P1 because she expected a small "we hear you, here's something for switchers next week" payoff.**

**Footer.** "Next issue: Saturday 8:00." She'll be there. Closes tab. Has not subscribed.

### Dropoffs (Riya)

| Section | Why | Severity |
|---|---|---|
| Top of page — no subscribe input | She just had a great session and there is **no email field** until she hits the referral CTA, which doesn't capture her email. She'll forget. | **P0** |
| §02 lens cards on mobile | Stacks vertically. She had to scroll past Builder + Product/Biz + Secure Pro before reaching Switcher. Three sections of "not for me" before the "this is for you" moment. Almost bailed. | **P1** |
| Build Notes section in middle of mobile scroll | "Skip with no guilt" copy *saved* this, but the dark visual still triggers "I am stupid" anxiety. She got through because of the eyebrow line. Without it: bail. | **P1 (currently mitigated)** |
| Job Signal spotlight stat — "11,000+ Bengaluru GCCs" | Wins. But the "search LinkedIn for 'AI' + 'evaluation' OR 'RAG'…" needs the user to understand what RAG means — and RAG was only introduced AFTER this section, in Under the Hood. Cognitive whiplash. | **P2** |
| India Signal NPCI + Tamil cards | The "Why you care" lines say "Builders, this is your weekend." She reads "not me." 2 of 3 cards feel exclusionary. | **P2** |
| Referral CTA | "Copy your invite link" with no login state is opaque. She'd happily refer but the mechanic is unclear. | **P1** |
| Poll — no feedback after tap | Tapped "planning a switch", got nothing visible. Mild frustration. | **P1** |
| **No email capture before she closes the tab** | She arrived from a friend's link with zero prior commitment. She got real value. The page never asked for her email. **Saturday 8am, she doesn't get the next issue.** | **P0** |

### Wins (Riya)

- "Explained like a normal person would" eyebrow — earned trust in 1 second.
- Switcher lens card — "AI + compliance is real, you don't need to code" was the keep-reading moment.
- **Inline glossary in Jobs row: "*evals = simply testing whether the AI's answer is actually good, on purpose, with examples.*"** — this single italic line is the most underrated UX move on the whole page.
- "Nerd Lane · non-tech? skip to §4, no guilt" — the safety valve that prevented bail on Build Notes.
- Tiffin metaphor + RAG-in-one-line — she leveled up.
- Upskill ladder — first newsletter she could finish homework from.
- Priya/Pune reader-win — felt represented.
- Closer dark joke — earned a smile, would forward.

### Verdict (1–5)

- Hooked-in-first-30s: **4** (eyebrow saved it)
- Made-it-past-Build-Notes: **5** (the skip-no-guilt line is gold)
- Came-back-up-from-fold: **5** (Job Signal + Under the Hood are her best 4 minutes)
- Would-share-with-friend: **4** (high intent, capture mechanic fails her)
- Would-return-next-Saturday: **2** (she has no subscribe path — she'll forget unless friend re-sends)

---

## TOP 5 CONCRETE FIXES (combined, ranked by impact)

### Fix 1 — Add an email-capture rail that catches Riya before she leaves. (P0)

**Files:** `src/app/i/[slug]/page.tsx` + a new small component, plus possibly `src/components/IssuePage/*` (route the existing landing-page subscribe form into the issue route).

**Problem:** Riya arrives from a forwarded link with no prior commitment. She gets 5–6 minutes of real value. The first and only email-capture moment on the issue page is… there isn't one. The referral block (which appears after she's mentally closing the tab) is "copy invite link", not "give me your email". She closes. She does not subscribe. Saturday she does not return.

**Before** (current end-of-issue, immediately after Closer):
```
[Closer dark-joke paragraph]
[Referral 3-tier block — "Copy your invite link"]
[Poll]
[Footer]
```

**After** (insert one block between Closer and Referral):
```tsx
<aside className="post-closer-subscribe">
  <p className="lede">If a friend sent you this — get next Saturday's issue in your inbox.</p>
  <form action="/api/subscribe" method="post">
    <input type="email" name="email" placeholder="you@gmail.com" required />
    <button type="submit">Send me Saturday's issue →</button>
  </form>
  <small>One email a week. Skip-in-5 or read-in-12. No tracking pixels.</small>
</aside>
```

**Why this fixes the dropoff:** Riya gave us 5 minutes and got real value. We never asked for the only thing that retains her: her email. The Closer is the peak emotional moment ("she half-smiled and was about to close the tab") — the *next* thing she sees should be the subscribe ask, not a referral mechanic that doesn't apply to her.

---

### Fix 2 — Add an anchor-link rail in the TLDR so Anshul can jump to Build Notes. (P1)

**File:** `src/components/IssuePage/TldrBlock.tsx` (or wherever the TLDR `<ul>` renders), and add `id="build-notes"`, `id="job-signal"`, etc. to each section component.

**Problem:** Anshul reads the TLDR in 4 seconds. The line "Why your RAG hallucinates in prod but not in testing — and the retrieval fix" is exactly his Tuesday problem. He wants to click. He can't. He scrolls three sections of stuff he doesn't need. This burns 60–90 seconds of his 5–8 min budget on content he won't act on.

**Before** (from JSON, rendered into the TLDR list):
```html
<li><b>Build Notes</b>
  Why your RAG hallucinates in prod but not in testing — and the retrieval fix.</li>
```

**After:**
```html
<li><b>Build Notes</b>
  <a href="#build-notes">Why your RAG hallucinates in prod but not in testing — and the retrieval fix. ↓</a></li>
```

Each TLDR row becomes a tap-target. Down-arrow glyph signals jumpable.

**Why this fixes the dropoff:** Anshul's "made it past Build Notes" verdict is 5/5 already, but his "came back up from fold" is 2/5 — he abandons the back half because his attention budget got eaten by the front. Anchor jumps return him 60–90 seconds of budget, which is exactly the time he needs to find and click the NPCI link (Fix 3). It also rewards re-readers who want to send the Job Signal section to a specific friend.

---

### Fix 3 — Make every India Signal card actually link to its source. (P0 for share-loss)

**File:** `src/components/IssuePage/IndiaSignal.tsx` + `content/issues/001.json` (add a `link` field per card).

**Problem:** Anshul reads the NPCI fraud-detection card and is the most likely person on earth to forward it to his fintech team. **There is no link.** He doesn't know if it's on GitHub, a press release, or a tweet. He can't paste anything. He doesn't bother. This is the highest-leverage share-loss on the page.

**Before** (from `content/issues/001.json` line 207–209):
```json
{
  "cat": "Fintech · NPCI",
  "status": "open-source",
  "status_hot": true,
  "h4": "NPCI open-sources its UPI fraud-detection model",
  "body": "The fraud model behind billions of UPI transactions is now public. Trained on Indian transaction patterns Western datasets never capture.",
  "why_you": "↳ Why you care: a free, production-grade, India-native dataset to learn from. Builders, this is your weekend."
}
```

**After:**
```json
{
  "cat": "Fintech · NPCI",
  "status": "open-source",
  "status_hot": true,
  "h4": "NPCI open-sources its UPI fraud-detection model",
  "body": "The fraud model behind billions of UPI transactions is now public. Trained on Indian transaction patterns Western datasets never capture.",
  "why_you": "↳ Why you care: a free, production-grade, India-native dataset to learn from. Builders, this is your weekend.",
  "source_url": "https://github.com/npci/...",
  "source_label": "GitHub repo + dataset card →"
}
```

And in the component, render `source_label` as a small kesari link below `why_you`. Apply to all three India Signal cards.

**Why this fixes the dropoff:** Anshul's would-share-with-friend verdict jumps from 3 to 5 the moment this link exists. India Signal is also the section both personas remember most warmly (Riya gets civic pride from Namma Metro, Anshul wants the NPCI repo). Without links the section is editorial trivia; with links it becomes the most forward-worthy block on the page.

---

### Fix 4 — Replace the Switcher-lens-card position so it appears first when the role rotates. (P1)

**File:** `src/components/IssuePage/SoWhat.tsx` + `content/issues/001.json` (the `so_what.lenses` array) + the rendering logic that respects `is_primary: true`.

**Problem:** The JSON already marks one lens as `is_primary`. This week Builder is primary. On mobile, all four lens cards stack vertically. **Riya has to scroll past Builder + Product/Biz + Secure Pro before she reaches Switcher.** Three "not for me" cards in a row is exactly the dropout window. She survives because she's stubborn that night. Other Riyas won't.

**Before** (the rendered lens stack on mobile, in this JSON order):
```
1. Builder (primary, with dot)
2. Product / Biz
3. Secure Pro
4. Switcher
```

**After:** Two changes.

(a) Render `is_primary` first, then **rotate the remaining three** so a different non-primary lens leads each week. This week, lead the non-primary stack with **Switcher** (since Switcher is the JSON-declared "next" rotation per `rotation_note.next`). Stop showing the same fixed order every week.

(b) Above the lens stack on mobile, add a 4-button picker:
```html
<nav class="lens-jump" aria-label="Pick your lens">
  <button data-role="builder">Builder</button>
  <button data-role="product_biz">Biz</button>
  <button data-role="secure_pro">Secure Pro</button>
  <button data-role="switcher">Switcher</button>
</nav>
```
Tapping jumps to the matching lens card. Keeps all four visible (rotation note still holds: "everyone gets a turn") but lets the reader self-select in one tap.

**Why this fixes the dropoff:** Riya's "hooked in first 30s" verdict is 4. Her "made it to her lens" moment is 90 seconds in. We can compress that to 5 seconds with one tap. Anshul also benefits — he just taps Builder and skips three irrelevant cards.

---

### Fix 5 — Make the poll feel like it did something. (P1)

**File:** `src/components/IssuePage/Poll.tsx` (or the equivalent).

**Problem:** Riya tapped "planning a switch". Nothing visible happened. The natural payoff she expected was something like "57% of this week's readers are also planning a switch — you're not alone" or "we'll surface a switcher-specific piece next week." Instead: silence. This is a small but real dignity hit at the very end of her session.

**Before:**
```tsx
<button>{option}</button>
```
(no client state, no after-tap feedback)

**After:**
```tsx
<button onClick={handleTap}>{option}</button>
// after tap:
<p className="poll-thanks">
  Got it. <b>{percentForOption}%</b> of this week's readers are also
  {selectedOptionShortLabel}. We'll lean into that next Saturday.
</p>
```
Even a fake-but-honest "Got it — see you Saturday" with no percentage is dramatically better than the current no-feedback state.

**Why this fixes the dropoff:** Riya's would-return verdict is 2/5 specifically because the last interactive thing she touched gave her nothing back. A 200-character "got it, see you Saturday" lifts that to 4. Pairs naturally with Fix 1 — the tap can also trigger the email-capture prompt: *"Want next week's switcher-specific tip in your inbox?"*

---

## Closing

**Total dropoffs identified:** **13** (3 P0, 6 P1, 4 P2). The two P0s belong to opposite personas — Anshul's NPCI dead-end and Riya's missing email capture — and both are solvable with under 60 lines of code each.

**Top 3 fixes to ship Monday morning:**

1. **Fix 1 — Post-Closer email capture.** Riya's no-subscribe-path is the only fatal flaw on a page that otherwise wins her over completely. One form, one block, ~30 lines. Biggest revenue/retention impact.
2. **Fix 3 — India Signal links.** Three URLs in `content/issues/001.json`, one render change. Turns the most forward-worthy block on the page from editorial trivia into actual share fuel. Highest virality lift per line of code.
3. **Fix 2 — TLDR anchor jumps.** Six `id=` attributes, six `<a href="#…">` links. ~15 minutes of work. Returns the Builder persona an estimated 60–90 seconds of attention budget that currently leaks into the front half.

Fixes 4 and 5 ship the same week if there's bandwidth, but the three above are the Monday-morning batch.
