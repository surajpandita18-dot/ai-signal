# Newcomer + Skeptic Journey Audit — 2026-06-12

Personas: Arpit (29, biz analyst, Mumbai, 3-min window, Rundown subscriber)
and Tanvi (36, head of growth, Bengaluru, 7 newsletters in, allergic to FOMO).

Files audited:
- `/Users/surajpandita/ai_signal/src/app/page.tsx`
- `/Users/surajpandita/ai_signal/src/app/about/page.tsx`
- `/Users/surajpandita/ai_signal/src/app/archive/page.tsx`
- `/Users/surajpandita/ai_signal/content/issues/001.json`

---

## 1. Step-by-step journey

### a) Landing — first 8 seconds

**What both personas read in 8s** (top-to-bottom scan of `page.tsx`):

1. Wordmark: **"AI, Basically."** with tagline **"Explained like a normal person would."**
2. Meta line: **"Weekly · Saturday 08:00 IST"**
3. Eyebrow: **"A newsletter, basically"**
4. H1: **"AI changed overnight. Here's *what to build.*"**
5. Sub: "One curated read every Saturday... No hype, no takes, no '10 tools you must try.'"
6. Subscribe input.

**Arpit (newcomer, 8s):**
- He gets *that it is a newsletter* (wordmark + meta + eyebrow all say so — slightly redundant, but it works for him).
- The tagline **"Explained like a normal person would"** lands. He pattern-matches it to "like Rundown but less bro-y."
- The H1 **"AI changed overnight. Here's what to build."** — he reads "what to build" and thinks *"I'm not a builder, I work in a bank."* Risk: he silently disqualifies himself in the first 4 seconds. He doesn't know "build" is metaphorical for "what to do Monday." Nothing on the page corrects this in 8s.
- He scrolls *once* to see if there's a sample. There isn't. The subscribe input appears before he's earned any reason to subscribe. He half-fills email or bounces. Decision balance: 55/45 for bounce. He's 3 minutes between meetings — without a visible "see a sample issue" link, he leaves.
- **"Saturday 08:00 IST"**: clear. He notices it. Mild positive — "ok, this isn't a US thing."

**Tanvi (skeptic, 8s):**
- She reads the H1 and immediately runs her allergy test. **"AI changed overnight"** trips her urgency alarm. She has read this exact framing in 4 of the 7 newsletters she's already subscribed to. The italicised *"what to build"* reads slightly LinkedIn-y to her.
- The sub-copy **"No hype, no takes, no '10 tools you must try'"** partially redeems it — this is restraint signalling, which she respects. But "no takes" is itself a take, and she clocks the irony.
- She does not subscribe yet. Tanvi *always* checks the About page before subscribing. She is hunting for the writer.
- **"A newsletter, basically"** eyebrow + **"AI, Basically."** wordmark + **"Explained like a normal person would"** tagline = the word "basically/normal" is invoked 3 times in 6 lines. To Tanvi this reads as the writer leaning too hard on the brand voice before earning it. **First voice slip flagged.**

**Subscribe input:** invisible-ish. Not intimidating, not inviting — it just sits there. No social proof number ("1,217 subscribers"), no sample-issue link beside it, no "see what last Saturday's looked like." For a pre-PMF newsletter where the brand has no authority signal, this is the single biggest gap on the landing.

**Meta line "WEEKLY · SATURDAY 08:00 IST":** clear to both. Tanvi reads it as a credibility signal (a fixed slot = adult discipline). Arpit just registers "weekly, ok."

### b) About page

Both click `/about`. The page has 4 sections: *Why this exists / Who's behind it / How the curation works / How to reach me.*

**Arpit on About:**
- Reads "Suraj Pandita. PM background, now building solo." — name means nothing to him. No company, no prior product, no LinkedIn, no photo, no Twitter handle, nothing. To a Mumbai bank analyst this is *just a name*. He is mildly more confused, not less.
- The "I read about thirty newsletters, twenty papers, and an embarrassing amount of X every week" line is the **best line on the page** for him — it tells him a human is doing real work. He believes it.
- "If a week doesn't have one, I'll tell you that too, instead of inventing one." — he reads this twice. Restraint registered. Marginal trust gained.
- But there's no "read a sample issue" CTA at the bottom of About. Dead end. He hits back, sees the landing again, still no sample link. **He bounces.** Time elapsed: ~90 seconds.

**Tanvi on About:**
- The H1 **"One newsletter, written like a *normal person.*"** repeats the landing tagline almost verbatim. To her it reads as the writer not knowing what else to say. She wanted *the editorial mission*, not the same tagline reskinned.
- "PM background, now building solo. I'm not a researcher and I don't pretend to be." — she likes the second clause (honesty), tolerates the first (vague — *which* PM, *where*, *what shipped*).
- "I read about thirty newsletters, twenty papers..." — this is the *single* sentence on the whole site that buys her trust. Specific, falsifiable-feeling, no FOMO.
- "I'll tell you that too, instead of inventing one." — strong. Closes the trust loop a bit.
- *But*: no photo, no LinkedIn link, no shipped-product names, no link to a sample issue, no archive link. Tanvi's harsh-judge mode: "this is a person who *might* be a good writer, but I cannot verify them in any way. I'm not subscribing without reading the actual prose." She wants out of About and into the issue. No link exists.
- The mailto `hello@aibasically.co` is a small positive — real address, custom domain. She notices.

**Verdict on About:** It's well-written but it does *not* close the loop. The page should end with "Read last Saturday's issue →". It doesn't.

### c) Getting to Issue 001 — the structural hole

**There is no link from `/` or `/about` to `/i/001` or to any sample issue.** Neither persona will find Issue 001 organically. The only way they reach it is via the URL we handed them (`?preview=1`).

This is a **P0 navigation failure** for the whole funnel. The product asks for an email *before* showing the work. No serious skeptic subscribes blind, and no rushed newcomer hunts for samples.

Once they do land on `/i/001?preview=1`:

**Arpit's first impression:**
- Hero headline "This week, RBI quietly *changed the rules.*" — instant relevance. He works at a bank. He leans in. The product just earned 45 seconds of his attention back.
- Sub: "Skim it in 5, or go deep in 12 — your call." — he loves it. Permission to skim is the most generous thing a newsletter has said to him today.
- TLDR with "Big one / Build Notes / Jobs / Reality" — he scans. "Jobs" pulls him.
- He reads the "One Thing" lede with the IRCTC analogy. **This is the moment he converts mentally.** The IRCTC analogy is exactly the "normal person" voice promised on the landing. He thinks "ok, this person actually writes for me."
- He'd now go back and subscribe — *if he could find his way back*. There is no "← back to subscribe" or sticky subscribe CTA on the issue page (not visible in the JSON; if the rendered page lacks it, this is a P0 conversion leak).

**Tanvi's first impression:**
- Hero: she clocks the restraint of "quietly" and the lower-case "this week" — typographic taste. Positive.
- "No panic. No hype." in the sub — she trusts it more here than on landing, because the issue immediately delivers on it.
- The "Skip List" block ("Skip this week: 'GPT-6 leak' threads. Why: it's not a leak, it's marketing.") — **this is the moment Tanvi converts.** It's the one thing she's never seen a newsletter do: tell her what *not* to read. This is editorial taste with teeth.
- The Builder Notes section ("Your RAG hallucinates in prod...") — she reads the skim_html and the metric. Specific number (71% → 89%), real paper citation (Longpre et al., EMNLP). Restraint *and* substance. She is sold on the writing.
- Closer ("dark-joke"): she reads it twice. "Machines wrong at the speed of light." She screenshots it. She will share it.

**The issue is dramatically better than the landing.** Both personas would convert from the issue. Neither will reach the issue organically. **That is the headline finding of this audit.**

### d) Archive

Both navigate to `/archive` (manually typing the URL — there's no link from `/` or `/about` here either).

**What they see** (from `archive/page.tsx`):
- H1 "Every past issue."
- Sub (locked state): **"The archive is open to subscribers who've referred at least one friend. Refer one — unlock everything. [Back to home →]"**
- Then a list of issues with title text but no link (because they're locked).

**Arpit on Archive:** Confused. He hasn't even subscribed yet and the page is asking him to refer someone. There's no logic gate that says "first subscribe, then refer to unlock archive." To him it reads as "pay-with-a-friend to read." He bounces. The gate is **hostile to a first-time visitor** because the visitor isn't yet a subscriber.

**Tanvi on Archive:** She reads "Refer one — unlock everything" and clocks the growth-hack vibe immediately. She has unsubscribed from 3 newsletters this year for exactly this. The word "everything" is the offender — it reads like a CTA, not editorial. She might tolerate "Refer one friend to read past issues" with a sentence of context (why the gate exists), but bare "Refer one — unlock everything" reads as transactional. **Trust dent.**

Also — the archive page shows the **headlines as plain text** when locked. So she can see what she's missing but can't read it. This is the right move *if* the headlines are good (they are — "RBI quietly changed the rules"). But she also wants a way to read *one* issue free without referring. There isn't one.

---

## 2. Friction inventory

| # | Severity | Where | Friction |
|---|---|---|---|
| F1 | **P0** | Landing → Issue | No link from `/` to any sample issue. The subscribe form is asking for the most valuable thing (email + trust) before showing the product. |
| F2 | **P0** | About → Issue | No "read last Saturday's issue →" CTA at the bottom of About. Dead-end page. |
| F3 | **P0** | Issue → Subscribe | No sticky / inline subscribe CTA visible from the issue source — readers who convert *on* the issue have no path to act. (Verify in rendered page; the issue JSON exposes no subscribe hook.) |
| F4 | **P0** | Archive | Referral gate triggers on first visit, before subscription. Logic should be: visitor sees teaser → subscriber sees referral gate. Right now the page treats every unauthenticated visitor as a hostile freeloader. |
| F5 | **P1** | Landing H1 | "Here's what to build" silently disqualifies non-builders (PMs, analysts, switchers — the 3 of 4 personas the issue itself targets). The issue's own `so_what` lenses include Product/Biz, Secure Pro, Switcher — but the H1 only speaks to one. |
| F6 | **P1** | Landing | Word "basically/normal" appears 3 times in 6 lines (wordmark, eyebrow, tagline). Reads as voice over-insistence. Cut one. |
| F7 | **P1** | About H1 | "One newsletter, written like a *normal person.*" duplicates the landing tagline. Wastes a chance to deepen the proposition. |
| F8 | **P1** | About | No photo, no LinkedIn, no prior-product name, no Twitter/X handle. Single biggest reason Tanvi doesn't subscribe even though the prose is good. |
| F9 | **P1** | Landing subscribe | No social proof number, no "no spam, one click to unsubscribe", no preview of what arrives. The most loaded action on the site has the least scaffolding. |
| F10 | **P1** | Archive copy | "Refer one — unlock everything." Word "everything" is growth-hacky. Trips Tanvi's allergy. |
| F11 | **P2** | Landing eyebrow | "A newsletter, basically" — cute but redundant with the wordmark "AI, Basically." Both say the same thing one above the other. |
| F12 | **P2** | Landing "What you get" | "Four small promises. Held to them every week." — "held to them" is slightly stiff vs. the rest of the page's voice. |
| F13 | **P2** | Archive locked state | The locked issue rows show the headline but render it as `<span>` instead of a Link. Visually this gives no affordance that it *would* be clickable post-referral. A small lock icon next to each row would communicate the gate without copy. |
| F14 | **P2** | About | No mention of cadence ("every Saturday") or unsubscribe promise. About is the place skeptics look for these guarantees. |
| F15 | **P2** | Landing | No footer with archive link, RSS, prior-issue link, or contact. Site feels like 1 page deep. |

**Friction points found: 15.**

---

## 3. Subscribe decision

**Arpit (newcomer):**
- **Would he subscribe from landing alone?** No. He has no reason to. He pattern-matches it to Rundown without seeing the substance.
- **Would he subscribe after reading Issue 001?** Yes, with ~75% probability. The IRCTC analogy + "skim in 5 or go deep in 12" + the Jobs section close him.
- **What changes his mind:** A "See last Saturday's issue →" button under the subscribe form on landing. One click. He converts.

**Tanvi (skeptic):**
- **Would she subscribe from landing alone?** No, 0%. She does not subscribe to anything without reading prose first.
- **Would she subscribe after About?** Still no. About earns mild trust but does not show the work.
- **Would she subscribe after reading Issue 001?** Yes, ~85%. The Skip List and the specific Longpre et al. citation are her trust triggers. The dark-joke closer makes her *want* to share it, which is the upstream signal to subscribing.
- **What changes her mind:** Same as Arpit — a path to the issue. Plus a photo + one verifiable prior credential on About ("ex-PM at X" or a LinkedIn link). Without that, even after loving the issue, she pauses.

**Headline finding (repeated, because it's the single biggest one):** Both personas convert *on the issue, not on the landing*. The landing's job is to get them to the issue. Today it doesn't.

---

## 4. Voice audit — is it consistent?

**Landing voice:** *Plain-spoken, slightly cute, slightly over-insistent on the "normal person" brand.*

**About voice:** *Same as landing, slightly more confessional, lands clean by the end.*

**Issue voice:** *Sharper, more confident, more editorial. This is the voice the landing is promising and not quite delivering.*

**Voice slips (quoted):**

1. **Landing eyebrow "A newsletter, basically"** vs. **wordmark "AI, Basically."** — the brand keyword is invoked in two adjacent elements. Reads as un-confident.

2. **Landing sub "No hype, no takes, no '10 tools you must try.'"** — the issue's actual Skip List ("Skip this week: 'GPT-6 leak' threads. Why: it's not a leak, it's marketing.") does this *and shows the work*. The landing version is performative restraint; the issue version is restraint. Skeptics can tell the difference.

3. **About H1 "written like a *normal person*"** is the third use of "normal/basically" the user encounters in under a minute. Brand voice ≠ saying the brand word three times.

4. **Landing "What you get" → "Four small promises. Held to them every week."** vs. issue voice (e.g. "We spent two years teaching AI to sound confident. We spent zero teaching it to say 'I don't know.'"). The landing copy here is the writer talking *about* the newsletter. The issue copy is the writer *being* the newsletter. The latter is what sells.

5. **Archive: "Refer one — unlock everything."** — this is the only sentence on the whole product that sounds like it could have been written by a growth marketer rather than the writer. It does not match the editorial voice anywhere else. Tanvi clocks it instantly.

**Verdict:** the voice is mostly consistent across landing and about, but it gets *better* on the issue and *worse* on the archive gate. The landing under-sells the writer that the issue reveals. The archive briefly hands the mic to a different (worse) voice.

---

## 5. Top 5 concrete fixes

### Fix 1 — Add a "Read last Saturday's issue" link under the subscribe form
**File:** `/Users/surajpandita/ai_signal/src/app/page.tsx`
**Region:** lines 31–32, immediately after `<SubscribeForm />` inside the hero section.

**Before:**
```tsx
<SubscribeForm />
</section>
```

**After:**
```tsx
<SubscribeForm />
<p className="sub" style={{ marginTop: 14, fontSize: 14 }}>
  Or <a href="/i/001">read last Saturday&rsquo;s issue first</a> &mdash; no email needed.
</p>
</section>
```

**Why it fixes the bail:** Arpit and Tanvi both convert on the issue, not the landing. This single link is the difference between a 0% subscribe rate from the landing and the actual conversion rate the writing deserves. It also signals confidence: *we'll show you the work first.*

---

### Fix 2 — Add a sample-issue CTA at the end of About
**File:** `/Users/surajpandita/ai_signal/src/app/about/page.tsx`
**Region:** lines 82–98, the "How to reach me" section is currently the last block; About dead-ends here.

**Before:**
```tsx
        <section className="sec">
          <div className="label">
            <span className="nm-lab">How to reach me</span>
          </div>
          <div className="lede">
            <p>
              Reply to any issue and it lands in my inbox. Or email{' '}
              <a
                href="mailto:hello@aibasically.co"
                style={{ color: 'var(--accent)' }}
              >
                hello@aibasically.co
              </a>
              . I read everything, and I reply to most of it.
            </p>
          </div>
        </section>
```

**After:** (add a new section *after* the reach-me block)
```tsx
        <section className="sec">
          <div className="label">
            <span className="nm-lab">Read one first</span>
          </div>
          <div className="lede">
            <p>
              The best way to decide is to read one. Here&rsquo;s{' '}
              <a href="/i/001" style={{ color: 'var(--accent)' }}>
                the most recent issue
              </a>
              . If the voice fits, subscribe at the top. If not, no harm done.
            </p>
          </div>
        </section>
```

**Why it fixes the bail:** Tanvi's verdict on About is "good prose, can't verify." Sending her into the issue is exactly the verification she wants. Also closes a dead end Arpit hits.

---

### Fix 3 — Rewrite landing H1 to stop disqualifying non-builders
**File:** `/Users/surajpandita/ai_signal/src/app/page.tsx`
**Region:** lines 21–24.

**Before:**
```tsx
<h1>
  AI changed overnight.<br />
  Here&rsquo;s <em>what to build.</em>
</h1>
```

**After:** (option A — keep the validated tagline by moving "what to build" out of the H1)
```tsx
<h1>
  AI changed overnight.<br />
  Here&rsquo;s <em>what to do Monday.</em>
</h1>
```

**Why it fixes the bail:** The issue's own `so_what` lenses target Builder, Product/Biz, Secure Pro, and Switcher — four audiences. The current H1 speaks to one. Arpit (analyst) and Tanvi (growth) both read "build" and silently disqualify. "What to do Monday" maps to all four lenses and matches the issue's own copy ("what to actually do about it on Monday morning"). It also keeps the "AI changed overnight" half that the brand has validated.

*(Tanvi-safe alternative if "Monday" feels stale: "Here's *the one thing that matters.*" — pure restraint, no urgency.)*

---

### Fix 4 — Soften the archive gate copy and add a subscriber-only gate logic
**File:** `/Users/surajpandita/ai_signal/src/app/archive/page.tsx`
**Region:** lines 31–36.

**Before:**
```tsx
{!unlocked && (
  <p className="sub">
    The archive is open to subscribers who&apos;ve referred at least one friend.
    Refer one — unlock everything. <Link href="/">Back to home →</Link>
  </p>
)}
```

**After:**
```tsx
{!unlocked && (
  <p className="sub">
    Subscribers can unlock the archive by sending one issue to a friend who&apos;d
    like it. It&rsquo;s how the newsletter grows without ads. Not a subscriber yet?{' '}
    <Link href="/">Start with the latest issue →</Link>
  </p>
)}
```

**Why it fixes the bail:** Removes "unlock everything" (growth-hack tell) and "Refer one —" (transactional dash). Names the *why* of the gate (no ads), which Tanvi respects. Routes non-subscribers somewhere useful instead of bouncing them. Note: ideally the gate also distinguishes "not subscribed" from "subscribed but hasn't referred" — but that's a logic change, not a copy fix.

---

### Fix 5 — Cut one of the three "basically/normal" mentions on the landing
**File:** `/Users/surajpandita/ai_signal/src/app/page.tsx`
**Region:** lines 7–20 (mast + hero eyebrow).

**Before:**
```tsx
<span className="wordmark">
  AI, Basically<span className="dot">.</span>
</span>
<span className="tagline">Explained like a normal person would.</span>
...
<section className="hero">
  <div className="eyebrow">A newsletter, basically</div>
```

**After:** (drop the eyebrow — wordmark + tagline already say it)
```tsx
<span className="wordmark">
  AI, Basically<span className="dot">.</span>
</span>
<span className="tagline">Explained like a normal person would.</span>
...
<section className="hero">
  <div className="eyebrow">Weekly · No hype</div>
```

**Why it fixes the bail:** Tanvi's harsh-judge mode flags "the writer is leaning on the brand word too hard." Cutting one of three mentions buys back confidence. The replacement eyebrow ("Weekly · No hype") doubles as a positioning line. Also: removes the redundancy between wordmark and eyebrow.

---

## 6. Verdict per persona (1–5)

### Arpit (newcomer)

| Metric | Score |
|---|---|
| Understood the product in 10s | **3 / 5** — knows it's a newsletter, doesn't know it's for him |
| Trusted the brand by the end of About | **2 / 5** — "Suraj Pandita" is just a name with no verifiable trail |
| Made it to Issue 001 | **1 / 5** — would not, without the URL we handed him |
| Would subscribe | **2 / 5** from landing alone; **4 / 5** if he reaches the issue |
| Would tell a friend | **2 / 5** from landing; **4 / 5** after the issue (he'd Whatsapp the IRCTC analogy) |

### Tanvi (skeptic)

| Metric | Score |
|---|---|
| Understood the product in 10s | **3 / 5** — gets the proposition, suspicious of the framing |
| Trusted the brand by the end of About | **2 / 5** — likes the prose, can't verify the human |
| Made it to Issue 001 | **1 / 5** — would not navigate there without the URL |
| Would subscribe | **1 / 5** from landing/about; **4 / 5** after the issue (Skip List + Longpre cite close her) |
| Would tell a friend | **1 / 5** from landing; **5 / 5** after the closer (she'd screenshot the dark joke) |

**The verdict spread tells the whole story.** Both personas score 1/5 on "made it to Issue 001" and 4–5/5 on "would subscribe / share" *if they got there*. The product is failing on navigation, not on writing.

---

## Summary

**Friction points found: 15** (4 × P0, 6 × P1, 5 × P2).

**Top 3 fixes to ship Monday:**

1. **Add `<a href="/i/001">read last Saturday's issue first</a>` under the subscribe form on `/`.** (Fix 1.) This is the single highest-leverage change on the entire site. It converts the landing from a faith-based ask into a show-your-work ask. ~5 min of work.

2. **Add a "Read one first → /i/001" section at the bottom of `/about`.** (Fix 2.) Closes the dead end Tanvi hits after deciding she can't trust the page on prose alone. ~5 min of work.

3. **Rewrite the archive gate copy** (Fix 4) to remove "unlock everything" and route non-subscribers to the latest issue instead of bouncing them home. This is the only place on the product where the voice slips into growth-marketer mode; fix it before a skeptic ever sees it. ~3 min of work.

All three are copy/link-level changes, no schema or logic work required. They unblock the funnel the writing already deserves.
