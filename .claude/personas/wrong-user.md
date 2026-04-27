# Persona: The Wrong User

**Name:** Dev / Alex / Nikhil (archetype)

**Role:** Software engineer, CS student, AI hobbyist, or researcher-adjacent. Interested in AI professionally or intellectually, but NOT making daily product decisions with budget authority.

**Key distinction from ICP:** They consume AI news for curiosity or career development — not to make decisions that cost them money if wrong.

---

## Why they find AI Signal

- Googles "AI news tool" or "best AI newsletter"
- Sees it on HN, ProductHunt, or Twitter
- Referred by a friend who is in the ICP

---

## Why they use it (briefly)

- The dark UI looks cool
- The signal scoring feels technical and interesting
- They like the idea of "cutting through the noise"
- Zone 2 card grid is satisfying to browse

---

## Why they will NOT pay — ever

**Root cause: no decision cost.** They are not building a product where missing a signal costs them real money or time. The pain is intellectual, not financial.

Specific reasons:

1. **No budget authority.** They are an IC engineer or student — even if they wanted to pay, it requires justification they can't make.

2. **Curiosity, not urgency.** They read AI news because it's interesting, not because they have a sprint planning meeting in 2 hours that depends on it.

3. **The TAKEAWAY doesn't land.** "Migrate your vector store before pricing changes" means nothing to someone not operating a vector store in production.

4. **Free tier is enough.** The first 3 signals satisfy their curiosity. They don't feel gated — they feel done.

5. **They optimize for volume, not signal.** They actually want more articles, not fewer. The product's core promise (reduction) is the opposite of what they want.

---

## How they behave in product

- High page views, low save rate
- Browses Zone 2 more than Zone 1
- Dismisses rarely (not engaged enough to dismiss)
- Never clicks upgrade CTA with intent — maybe out of curiosity
- Churns within 7 days (no habit formed because no daily decision trigger)
- May return when a big model drop happens (event-driven, not habitual)

---

## Dangerous because

- They inflate DAU/MAU without contributing revenue signal
- Their feedback ("I want more sources", "show me arXiv papers", "add a filter for topic") will push the product away from ICP needs
- High save rate for arXiv links skews the feedback loop signal
- If you A/B test on this cohort, you'll optimize for the wrong user

---

## How to identify them in analytics

- Session time > 8 minutes but 0 saves and 0 upgrade clicks
- Return visits only on major news days (GPT-5 drop, major model release)
- Source: direct or social (not founder communities or newsletters)
- Timezone: student hours (late night browsing, not 6–9am)
- Device: primarily mobile (ICP uses desktop/morning routine)

---

## What to do with them

- Do NOT optimize Zone 2 for browsing satisfaction
- Do NOT add "more sources" or topic filters based on their requests
- DO track them separately in PostHog as a separate cohort
- DO use their session behavior to understand what's interesting (content signal) but NOT to make product decisions
- Their virality value is real — they share — but treat as acquisition, not retention

---

## PostHog Cohort: Wrong User (do not optimize for)

**Cohort name:** `wrong-user-cohort`

**Conditions (ALL must match):**
- `session_duration > 480` seconds (8 min)
- `signal_saved = 0`
- `upgrade_clicked = 0`
- `return_visit_count < 3` in 30 days OR returns only on `major_news_days`
- `device_type = mobile` (primary)

**Action:** Tag this cohort. Exclude from all A/B tests. Use only for content signal analysis — which signals get read, which topics drive session depth.

**Implementation:** Add to Phase 4 PostHog instrumentation. Cohort is computed weekly via PostHog's cohort builder, not in real-time.
