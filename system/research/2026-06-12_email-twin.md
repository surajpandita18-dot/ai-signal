# Email twin audit — `IssueEmail.tsx` × Issue 001

**Date:** 2026-06-12
**Scope:** `/Users/surajpandita/ai_signal/emails/IssueEmail.tsx` rendered against `/Users/surajpandita/ai_signal/content/issues/001.json`, compared to the design-contract `<div class="email">` block in `/Users/surajpandita/Downloads/ai-basically-FINAL.html` (lines 351–411).
**Method:** `@react-email/render` → static HTML → Playwright screenshots at 700px (Gmail desktop preview pane), 375px (iPhone Mail), 360px (Android narrow). Source HTML dump: `/tmp/email-out.html` (27,180 bytes). Screenshots at `/tmp/email-{gmail-desktop-640,iphone-mail-375,narrow-360}.png`.

**TL;DR for the impatient.** The email renders, doesn't break in any inbox, and the table/inline-style scaffolding is sound. But it is **a meaningfully shorter, lower-density product than the web — and noticeably shorter than the design-contract email** in two places that matter (Job Signal upskill ladder, Build Notes density). On top of that, **two visible rendering bugs leak escaped HTML tags into the reader's screen** inside the Build Notes dark band. Subject line is decent; preview text is wasted.

---

## 1. Render confirmed

Rendered HTML stats:
- 23 `<table>` blocks, 10 `<div>` blocks (mostly preview-text container + react-email column wrappers — table-based layout confirmed).
- 0 `<img>`, 0 `<svg>`, 0 `<script>`. No external URLs.
- 1 `max-width:600px` declaration (the container).
- 40 occurrences of `Georgia` font stack, 19 of `Helvetica` (sans for labels), 7 of `Courier New` (code/mono labels). Consistent with intent.
- 0 `@media` queries — the email is **not** mobile-adaptive. Renders fine because the 600px container + low font sizes already squeeze into 375px, but see Section 7 fix.

---

## 2. Per-persona walkthrough

### Persona A — Gmail desktop, weekday morning (3 min, coffee, skim mode)

**Inbox row.** Sender = whatever `EMAIL_FROM` is set to (env-driven; not auditable from code). Subject: **"AI, Basically. — The RBI AI-lending circular nobody read — bigger than the GPT-6 noise."** (87 chars). Gmail truncates the subject at ~70 chars on desktop inbox, so the reader sees roughly:
> `AI, Basically. — The RBI AI-lending circular nobody read — big…`

The good bit ("nobody read") survives. The kicker ("bigger than the GPT-6 noise") **does not**, which is a real loss — that's the part that earns the click.

Preview text shown beside the subject: `"No panic. No hype. Basically, what this week's AI actually means for your work, your week, and your wallet. Skim it in 5"` — 120 chars of generic positioning copy, **not specific to this issue**. The same preview text will ship in every issue (since the template uses `hero_sub_html`, which is reused). Gmail will then auto-append the start of the body, so the reader sees a soup of "AI, Basically. — The RBI… No panic. No hype. Basically, what this week's AI…" — two AI-Basically restatements before any specific value lands.

**Opens the email.** First paint at ~640px content width inside Gmail's preview pane:
- Masthead line: "AI, Basically." left, "#001 · 13.06.2026 · Browser" right — clean.
- Hero: "This week, RBI quietly *changed the rules.*" — 30px serif, italic on accent. Lands well.
- Italic sub: long. He scans it.
- TLDR box: black border, 4 rows. **This is where the skim-reader actually engages.** TLDR rows work.
- Section 01 "The One Thing": fine. Skip List stamp visible.
- Section 02 "So What For Me": **his eye goes to "BUILDER"** — but he isn't a builder, he's a PM. The non-primary lenses are grey-labeled, look like footnotes, and the action line is missing for non-primary lenses (see Section 4 / Top 10 fix #4). He skims past and never sees "→ Do: add one line to your live PRD today." — the line that would have made him do something.
- Build Notes dark band: **breaks**. Sees literal text `<b style="color:#fff">The 20-second version:` because the inline-HTML tokenizer doesn't accept tags with style attributes. Same for `<b style="color:#C8794B">Ship metric:`. Looks like a broken template to him. (See bug #1 in Top 10.)
- 03 Job Signal: spotlight stat "11,000+" is striking. But the surrounding `spotlight.header` ("This week's hard number") is missing, the `sodo_html` ("↳ So do this: search LinkedIn for…") is missing, and the **entire upskill ladder section** ("If you're unemployed or scared right now…") is missing. He doesn't know about the Hugging Face + Anthropic free-eval rung that's literally written in the JSON.
- 04 Under the Hood: the dabba analogy lands. The third hood step ("What this means for you") **is missing** — only steps[0] and steps[1] render (see code, lines 775–792, only `hood.steps[0]` and `hood.steps[1]` are referenced).
- 05 The Rep: only the `lite_html` ships. The "Full · 15 min" version is missing. The "Done looks like" line is missing. The reader-win quote ships but is mis-attributed: the email writes `Last week: "…" — Priya — Pune · last week's Rep`, double-stating "last week".
- 06 Toolbox: copy is there, but `try_html` ("Try it on the next email you're nervous about →") is missing.
- 07 Reality Check: the `h3` ("Your 'make me 10 images' habit has a water bill") is missing — the section just opens with the body paragraph. Loses the punchy headline.
- 08 India Signal: cards render, but the `why_you` lines ("↳ Why you care: …") are stripped. Those are the lines that earn the "why am I reading this" beat.
- Closer: black band reads "ONE LAST THING" → joke. The `format_label` ("This week: the dark one") is missing, so it doesn't land as a recurring "the dark one / the absurd one / the provocation" rotation.
- Referral CTA: ships. Looks good.
- Footer: ships.

**Engagement window before standup:** he reads to about Section 03, sees the missing spotlight context, gets a vague "11,000+ Bengaluru" stat, doesn't click anywhere, marks as read. Verdict: he came for the signal, got 60% of it.

### Persona B — iPhone Mail, Saturday 8:30am IST, lazy read

- Inbox row in Mail.app: subject truncates around ~50–60 chars depending on width. Sees: `AI, Basically. — The RBI AI-lending circular nob…` Preview text: same generic copy as A.
- Opens. At 375px viewport, the rendered email looks like the screenshot at `/tmp/email-iphone-mail-375.png`:
  - Masthead's right column (`#001 · 13.06.2026 · Browser`) is on `whiteSpace: 'nowrap'` and at 360px starts pressing against the right edge. At 320px (iPhone SE width) this will overflow horizontally because `nowrap` + `letter-spacing:.12em` + `padding:0 20px` doesn't leave enough room. See fix #6.
  - Hero headline (`<br>` honored from the JSON) reads:
    > This week, RBI
    > quietly *changed
    > the rules.*
    Lands well on mobile.
  - TLDR rows wrap fine. Width OK.
  - Lens labels (`■ BUILDER →`, `PRODUCT / BIZ →`) wrap inline before the body, so on a narrow screen the label sticks with the first sentence. Acceptable, not pretty.
  - Build Notes dark band: same literal-`<b style="…">` bug visible, and on mobile it's even more jarring because the dark band is the email's biggest visual moment.
  - The "11,000+" spotlight stat is set in 26px serif bold — looks great on mobile. **One of the email's strongest moments.**
  - Interview Q&A: the four numbered steps run as a single dense paragraph (`{s.n}. body  {next.n}. body …`). On mobile, that's a wall. The web shows them as stacked `.step` rows. See fix #7.
  - India Signal cards: each card's `cat` chip (e.g. "Transport · Bengaluru") wraps OK. The `body` lines are present; `why_you` lines missing — same as desktop.
  - The closer dark band lands hard ("wrong at the speed of light"). This is the best single beat in the email and the spans punch correctly. The format_label is missing — a small loss.
  - Referral CTA button: clickable, sized fine (9×16px padding, 12px text).

**Bail point.** She'll either read all the way through (Saturday, in bed) or bail at the Build Notes dark band when she sees the literal `<b style=` text and assumes it's broken. The risk is real and avoidable.

### Persona C — Gmail Promotions tab

- Sender domain: depends on the configured `EMAIL_FROM` (not auditable here — but Gmail flags Promotions on: sender reputation, bulk-list signals, "Unsubscribe" present in body, promotional language, lots of images, lots of links). This email has: no images (good), one CTA button (good), an Unsubscribe link (neutral — Gmail wants this, also a Promotions signal), no list-unsubscribe header set from code (the Resend API call doesn't set `headers['List-Unsubscribe']` or `List-Unsubscribe-Post` — verified by reading `route.ts:168–174`). **Missing list-unsubscribe is a real Promotions-tab risk on Gmail.**
- Preview text: generic across issues. Doesn't earn the pull-out.
- Subject prefix "AI, Basically. —" is brand-first, body-second. Brand-first subjects on a newsletter typically read as promo. Consider issue-first ("RBI just changed AI lending in India — AI, Basically. #001") for inbox dwell time.
- Verdict: if Promotions-tagged, **the current preview text won't rescue it**. The body of the email is sober and link-light, but the headers and preview are the deciding signal here.

### Persona D — Outlook (rendering pessimism)

Outlook on Windows uses the Word/MSO rendering engine. Concerns:
- All layout is `<table>` based — react-email outputs proper presentation tables. ✓ Confirmed: 23 tables, 0 layout `<div>`s for structure.
- Inline styles only — `padding`, `background`, `border`, `font-family` all OK in MSO.
- The dark-band `background:#14241C` will render as dark in Outlook (background colour on `<td>` works). ✓
- The Build Notes `borderLeft: '5px solid #C8794B'` quote box — supported on `<td>` in MSO. ✓
- `letter-spacing` — Outlook supports this on `<span>` text but inconsistent on table cells. The all-caps section labels still read.
- `whitespace:nowrap` on masthead right column — Outlook respects.
- The SVG diagrams are dropped (good — Outlook strips SVG anyway). The text fallback "Diagram in the browser version → open issue" is present. **It reads intentional, not broken.** ✓
- The big concern: the **Build Notes literal `<b style="…">` leak** is even worse here because Outlook tends to render escaped angle brackets as actual `&lt;` text on first paint. Bug shows.
- Heading sizes: `<h1>` at 30px renders fine; `<h4>` at 16px fine.
- Referral CTA: rendered as an `<a>` with `display:inline-block; background:#9C4A2E; padding:9px 16px` — Outlook respects this when wrapped in a table cell. It is wrapped, so OK.

Verdict: **Outlook holds**, but the visible HTML leak is the worst-case impression there.

---

## 3. Email-safety audit

| Rule | Status | Notes |
| --- | --- | --- |
| No `<script>` | ✓ Pass | grep confirms 0 `<script` tags. |
| No external images | ✓ Pass | 0 `<img>` tags, 0 `src="http…"`. |
| Table-based layout | ✓ Pass | 23 tables; react-email outputs presentation tables on every `Section`/`Row`/`Column`. |
| Georgia serif consistent | ✓ Pass | 40 occurrences of Georgia; Helvetica reserved for section labels + small caps; Courier reserved for code/mono accents. |
| Inline styles only | ✓ Pass | All style is in `style={…}` props. No `<style>` block, no `@media`. |
| Width ≤ 600px | ✓ Pass | Container `maxWidth: 600`. |
| No horizontal overflow at 360px | ⚠ **Borderline** | At 360px the masthead right column ("#001 · 13.06.2026 · Browser") uses `whiteSpace: 'nowrap'` + `letter-spacing:.12em` and pushes against the right padding. At 320px (iPhone SE 1st gen) it will overflow. Fix: drop letter-spacing on mobile or relax `nowrap` on the right column. (See fix #6.) |
| Unsubscribe present | ✓ Pass | `UNSUB_TOKEN` placeholder is swapped per recipient in `route.ts`. |
| List-Unsubscribe header | ✗ **Missing** | `route.ts:168–174` doesn't set `headers['List-Unsubscribe']` or `List-Unsubscribe-Post`. Real Promotions/spam risk. (Top 10 fix #2.) |
| Token swap safe | ⚠ Minor | `route.ts` does `baseHtml.replaceAll('YOUR_CODE', referralCode)` — works, but a malformed referral code containing `$&` or similar would not be a concern because the second arg is a literal string. No bug, just noting. |

---

## 4. Content parity audit (email vs. web vs. design contract)

The email under-renders **a lot** of what the JSON carries. Concrete deltas vs. the design contract `<div class="email">` block AND vs. the JSON's full set of fields:

### Missing from the email entirely

1. **`so_what.rotation_note`** — `{ primary: 'Builder', next: 'Secure Pro', aside: 'Everyone gets a turn…' }` is in JSON, on the web, **not in email**. Readers don't know whose turn is next, so there's no retention pull ("come back next week for Secure Pro").
2. **`so_what.lenses[*].caption`** — "You ship the thing", "You decide the roadmap" etc. Web shows these as `<small>` under the lens label. Email shows nothing.
3. **`so_what.lenses[*].action` for non-primary lenses** — only the primary lens's action ("→ Do: ship a 'why' field…") renders. The PM-Biz, Secure-Pro, and Switcher actions ("→ Do: add one line to your live PRD today.", "→ Do: write the 'why' on your next big decision.", "→ First rung: read the circular's 1-page summary + write 3 plain-English bullets…") are dropped. **This is the biggest single content gap** because the whole point of the lens system is that every reader gets one concrete action this week.
4. **`build_notes.title`** — wait, this IS rendered (`{bn.title}` at line 546). ✓
5. **`build_notes.paper_ref`** — "▸ unpacked from: Longpre et al., 'Entity-Based Knowledge Conflicts in QA' (EMNLP) + 2024 RAG-survey follow-ups" — missing from email. Reduces technical credibility for the Build Notes audience.
6. **`build_notes.struggle_html` and `build_notes.finding_html`** — the "Your retrieval looks perfect in eval… maddening, hard to debug" and "The model retrieves the right chunk, then overrides it" lines. The email only renders `skim_html` + `fix_html` + `ship_this_week_html`. The struggle/finding setup beats are gone, so the dark band feels declarative rather than the "I've felt this exact pain" moment it earns on the web.
7. **`build_notes.metric_html`** — "Measured on 200 production queries: faithfulness **71% → 89%**, with no latency change." — missing. **This is the scorecard's "C3 technical credibility" win mentioned at the top of the design contract.** Dropping it in email is a self-inflicted wound.
8. **`build_notes.code`** — the python snippet `def disagreement_rate(rows): …`. The design contract email omits it too, so this may be intentional (code blocks are noisy in Gmail). Keep dropped or add a small `<pre>`. Decision lives at the editor.
9. **`job_signal.rows`** — the two trend lines ("Fintech + GCCs are driving the hiring", "AI evals is the skill heating up") are entirely missing. The web shows them above the spotlight. The email goes straight to the stat.
10. **`job_signal.spotlight.header`** — "This week's hard number" label above the 11,000+ stat. Missing. The stat lands without a verbal label, which reads like a random number.
11. **`job_signal.spotlight.sodo_html`** — "↳ So do this: search LinkedIn for `'AI' + 'evaluation' OR 'RAG' + Bengaluru` and read 5 JDs. Start with Wells Fargo GCC, Target India, and Walmart Global Tech…" Missing. This is the actionable beat under the stat.
12. **`job_signal.upskill` (entire section)** — title "If you're unemployed or scared right now — start here", intro, 3-rung ladder (project / free resource / done-looks-like), and the closing note. **Completely absent from the email.** This is one of the highest-empathy beats in the issue and is missing for the reader who needs it most (unemployed switcher reading on a Saturday).
13. **`under_the_hood.steps[2]`** — "What this means for you" / "the fix is almost never a bigger model. It's better notes and better retrieval — things you actually control" — missing. Only steps[0] and steps[1] render. The "so what for you" payoff is dropped.
14. **`under_the_hood.source`** — "Decoded from: 'Memory in LLM Agents' survey (arXiv 2024)" — missing.
15. **`the_rep.full_html`** — the 15-minute version. The email is named "The 15-Min Rep" but only renders the 2-min `lite_html`. Naming/content mismatch.
16. **`the_rep.done`** — "Done looks like: the AI caught at least one charge you'd never noticed. Reply with your screenshot — featured results are shared with permission." Missing. This is the **reply-magnet** — strongest engagement loop in the issue.
17. **`the_rep.type`** — "audit" rotates weekly. Web shows it; email doesn't. Loses the rotation cue.
18. **`toolbox.try_html`** — "Try it on the next email you're nervous about →" Missing. Tiny but it's the CTA on the Toolbox section.
19. **`reality_check.h3`** — "Your 'make me 10 images' habit has a water bill" — **the headline of the section is missing.** The body paragraph leads cold.
20. **`reality_check.harm_tag`** — "this week: environment" rotation chip. Missing. Reduces the "this rotates — come back" effect.
21. **`india_signal.cards[*].why_you`** — "↳ Why you care: this is what real Indian-scale AI deployment looks like — boring, unglamorous, and actually shipped." Missing for all three cards. Without these, the cards are news bullets, not "Signal".
22. **`india_signal.cards[*].status`** — "shipped", "open-source", "data drop" status chips. Missing. (`status_hot` flag IS used to colour the cat label orange on hot cards, which is good, but the status label itself doesn't render.)
23. **`india_signal.foot` + `foot_cta`** — "Spotted something India-only worth a Signal? · Reply and send it →" Missing. Another reply-magnet, dropped.
24. **`closer.format_label`** — "This week: the dark one" — missing. The rotation device (dark / absurd / provocation) is invisible to email readers.
25. **`poll`** — the whole `{question, options}` block. Polls in email are typically rendered as three tracked links (e.g. `https://site.com/poll/{id}/building`). Implementing this is a separate decision; **not flagging as a bug**, but flagging as deliberate scope-drop the audit caller should know about.

### Extra in the email vs. design contract

- The "Diagram in the browser version → open issue" caption inside the Build Notes dark band is **email-only** (the design contract doesn't have it). It's a smart "intentional skip" signal — keep it.
- The "Browser" link in the masthead is rendered (good — design contract has it, web doesn't have a strict equivalent).

### Content parity, deltas vs. the design-contract email block specifically

The design contract's `.email` block has these beats the React version is missing:
- The lens block's "Switcher" line in the contract reads `<span class="act">Forward this issue to one friend eyeing a switch.</span>` — an action focused on referral. The JSON's Switcher action is different ("First rung: read the circular's 1-page summary…"). **Decision divergence** — the contract email used Switcher as a forward CTA; the JSON uses it as an upskill rung. Editor needs to pick one. The contract version arguably has better referral mechanics.
- The contract email has "BUILD NOTES" with no number; the React version also omits a number. ✓
- The contract email's Job Signal section number is **04**, the React version's is **03**. Numbering schemes diverged when sections moved around — the React version's numbering matches the web (where Build Notes is unnumbered between 02 and 03). ✓ Fine, but document the choice.
- The contract email sponsor slot reads `Presented by — your brand here · One clean sponsor message per issue…`. The React version's sponsor block is fully gated on `content.sponsor`, which is `null` in Issue 001 → **no sponsor block renders**. Correct conditional behavior.

---

## 5. Subject line + preview text audit

### Subject as it ships today

The send route at `src/app/api/cron/send/route.ts:127–132`:

```ts
const tldrBody = firstTldr?.body?.trim() ?? ''
const subject =
  tldrBody.length >= 20
    ? `AI, Basically. — ${tldrBody.slice(0, 90)}`
    : `AI, Basically. — ${content.hero_eyebrow}`
```

For Issue 001, `tldr[0].body = "The RBI AI-lending circular nobody read — bigger than the GPT-6 noise."` (71 chars), which is ≥20, so the inbox sees:

> **AI, Basically. — The RBI AI-lending circular nobody read — bigger than the GPT-6 noise.**

(87 chars total, ASCII em-dashes preserved.)

**Brutal audit:**
- **Gmail desktop inbox truncates at ~70 chars** → reader sees `AI, Basically. — The RBI AI-lending circular nobody read — big…`. The kicker ("bigger than the GPT-6 noise") gets clipped.
- **iPhone Mail truncates at ~40–55 chars** depending on rotation → reader sees `AI, Basically. — The RBI AI-lending circ…`. The brand prefix eats 16 chars before any value.
- **Brand-first prefix is a Promotions signal.** Newsletters that read as "Brand. — content" frame the email as marketing. Compare "RBI just rewrote AI lending. (AI, Basically. #001)" or "The RBI AI rule nobody read — AI, Basically."
- **Decent in absolute terms**, but burns 16 characters before any specific value lands. For a non-paying audience that doesn't yet know the brand, the order is wrong.

### Preview text as it ships today

Component line 276:
```ts
const previewText = stripTags(content.hero_sub_html).slice(0, 120)
```

For Issue 001:
> **"No panic. No hype. Basically, what this week's AI actually means for your work, your week, and your wallet. Skim it in 5"**

(120 chars exactly.)

**Brutal audit:**
- This is **the same preview text every week**, because it's pulled from `hero_sub_html`, which is the recurring positioning copy ("No panic. No hype. … Skim it in 5, or go deep in 12 — your call.") that lives in every issue's hero.
- It's brand boilerplate, not signal. After issue 3, regular readers will recognise the pattern: "AI, Basically. — [TLDR]" + "No panic. No hype…" — and the preview line becomes invisible.
- It doesn't pull a Promotions-tagged reader out of Promotions, because it doesn't say anything specific.
- Easy fix: use `tldr[0].body` (or a dedicated `preview_text` field added to `IssueContent`) as the preview. For Issue 001 this would give a preview of "The RBI AI-lending circular nobody read — bigger than the GPT-6 noise." — which fights for the open.

---

## 6. Top 10 concrete fixes

### Fix #1 — Make the inline-HTML tokenizer accept attributed `<b>` / `<i>` / `<span>` tags (or strip the attributes safely)

**File:** `emails/IssueEmail.tsx`, lines 50–51 (the regex) and 60–67 (the open-tag handling).

**Why:** `build_notes.skim_html` contains `<b style="color:#fff">` and `<b style="color:#C8794B">`. The tokenizer's regex is `/<(\/?)(em|strong|b|code|br|span)(?:\s+class="([^"]*)")?\s*\/?>/gi` — it only matches a `class` attribute, only on the span case. Anything with `style=` falls through, gets passed through `decodeEntities` as plain text, and the reader sees literal `<b style="color:#fff">The 20-second version:` in the dark band. The matching `</b>` close does match (no attributes), so it consumes nothing on the stack and the supposed-to-be-bold text isn't bold either.

**Before** (line 50–51):
```ts
const re =
  /<(\/?)(em|strong|b|code|br|span)(?:\s+class="([^"]*)")?\s*\/?>/gi
```

**After:**
```ts
// Accept any inline tag with arbitrary attributes; we ignore attrs except class.
const re =
  /<(\/?)(em|strong|b|i|code|br|span)(\s[^>]*)?\s*\/?>/gi
```

Then in the open-token handling (lines 63–65), parse `class="…"` out of the attribute string if needed:
```ts
const attrs = m[3] || ''
const classMatch = /class="([^"]*)"/i.exec(attrs)
const cls = classMatch ? classMatch[1] : undefined
```

Tradeoff: this is a silent change in tokenizer behavior. To be safe-by-default for the editor, also escape unknown attributes in plain text (current behavior on unknown tags). The change above only relaxes the attribute matcher for the already-whitelisted tags.

### Fix #2 — Add a `List-Unsubscribe` header on the Resend send call

**File:** `src/app/api/cron/send/route.ts`, lines 168–174.

**Why:** Gmail's 2024+ bulk-sender rules effectively require `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` for newsletters >5k/day, and reward it for smaller senders by reducing Promotions-tab incidence. The current send sets only `to`, `from`, `subject`, `html`, `replyTo`.

**Before:**
```ts
return client.emails.send({
  from,
  to: [sub.email],
  subject,
  html,
  replyTo,
})
```

**After:**
```ts
const unsubUrl = `${siteUrl}/u/${sub.unsubscribe_token}`
return client.emails.send({
  from,
  to: [sub.email],
  subject,
  html,
  replyTo,
  headers: {
    'List-Unsubscribe': `<${unsubUrl}>, <mailto:${process.env.EMAIL_REPLY_TO ?? from}?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
})
```

(Verify Resend's TS SDK accepts a `headers` field — newer versions do; older ones require sending via `react` + `tags` instead. Confirm in the SDK docs.)

### Fix #3 — Render `tldr[0].body` as preview text instead of `hero_sub_html`

**File:** `emails/IssueEmail.tsx`, line 276.

**Why:** Same preview text every week is wasted real estate. The first TLDR is hand-tightened by the editor and is the strongest single sentence in the email.

**Before:**
```ts
const previewText = stripTags(content.hero_sub_html).slice(0, 120)
```

**After:**
```ts
const firstTldr = content.tldr?.[0]?.body?.trim()
const previewText = (firstTldr && firstTldr.length >= 20
  ? firstTldr
  : stripTags(content.hero_sub_html)
).slice(0, 120)
```

For Issue 001 this yields: `"The RBI AI-lending circular nobody read — bigger than the GPT-6 noise."` (71 chars; Gmail will append more body after, but the editorial line lands first).

### Fix #4 — Render the action line for **every** lens, not just the primary

**File:** `emails/IssueEmail.tsx`, lines 495–511 (the `otherLenses.map(...)` block).

**Why:** The whole point of the lens system is one concrete action per role. Today the email gives an action only to the primary lens. PM/Secure Pro/Switcher readers get a label + body, no action — undercuts the whole "your turn this week" promise.

**Before** (lines 495–511):
```tsx
{otherLenses.map((lens, i) => (
  <Text key={lens.role} style={{ … }}>
    <b style={{ color: GREY }}>{lens.label.toUpperCase()} &rarr;</b>{' '}
    {renderInlineHtml(lens.body_html)}
  </Text>
))}
```

**After:**
```tsx
{otherLenses.map((lens) => (
  <Text key={lens.role} style={{ … }}>
    <b style={{ color: GREY }}>{lens.label.toUpperCase()} &rarr;</b>{' '}
    {renderInlineHtml(lens.body_html)}
    {lens.action ? (
      <span style={{ display: 'block', fontWeight: 'bold', fontSize: 12.5, marginTop: 3, color: INK }}>
        {lens.action}
      </span>
    ) : null}
  </Text>
))}
```

### Fix #5 — Render the missing Build Notes density: paper_ref, struggle/finding, metric

**File:** `emails/IssueEmail.tsx`, the Build Notes dark-band block (lines 515–609).

**Why:** Today the email renders title → skim → fix → ship-this-week → "diagram in the browser" caption. It drops `paper_ref`, `struggle_html`, `finding_html`, `metric_html`. The metric line ("**71% → 89%** faithfulness, no latency change") is the single most credibility-earning bit in the whole issue and **it's not in the email at all**.

**Add** (after the title `<Heading>` at line 547, before the existing skim block):
```tsx
<Text style={{ fontFamily: "'Courier New', monospace", color: '#86B098', fontSize: 11, lineHeight: 1.5, margin: '0 0 10px' }}>
  {bn.paper_ref}
</Text>
```

**Add** (in the dark band, between the existing `bn.skim_html` and `bn.fix_html`):
```tsx
<Text style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.6, color: '#B8C9BB', margin: '10px 0 0', fontStyle: 'italic' }}>
  {renderInlineHtml(bn.struggle_html)}
</Text>
<Text style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.65, color: '#DCE7DD', margin: '8px 0 0' }}>
  {renderInlineHtml(bn.finding_html)}
</Text>
```

**Add** (after the Ship-this-week block):
```tsx
<Text style={{ fontFamily: SERIF, fontSize: 13, color: '#A2C2AC', margin: '8px 0 0', fontStyle: 'italic' }}>
  {renderInlineHtml(bn.metric_html)}
</Text>
```

(Editor's call whether to also render the `code.body` python snippet inside a `<pre>` — recommend yes, in a small box, as a credibility cue. Gmail handles `<pre>` fine.)

### Fix #6 — Fix masthead overflow at 360–320px

**File:** `emails/IssueEmail.tsx`, lines 320–340.

**Why:** Right column has `whiteSpace: 'nowrap'` + `letter-spacing:.12em` + content "#001 · 13.06.2026 · Browser" (~24 chars). At 360px container + 20px side padding, this hits the edge; at 320px it overflows horizontally.

**Before** (line 328):
```ts
whiteSpace: 'nowrap',
```

**After:** drop `nowrap`, and split into a left+right pair on mobile by collapsing the columns to stacked at narrow widths. Lightest fix: just remove `nowrap` and let the date wrap to the second line. Better: shorten the right column to `#001 · 13.06.2026` and move "Browser" to its own row, or render an MSO/`<br>` line break:

```tsx
<Column align="right">
  <span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: GREY }}>
    {`#${content.slug} · ${content.date_display}`}
    <br />
    <Link href={`${SITE}/i/${content.slug}`} style={{ color: GREY, textDecoration: 'underline' }}>
      Open in browser
    </Link>
  </span>
</Column>
```

### Fix #7 — Stack the interview steps vertically, not inline

**File:** `emails/IssueEmail.tsx`, lines 707–723.

**Why:** Today the four interview steps render as `1. body  2. body  3. body  4. body` inside a single `<Text>` paragraph. On mobile that's a wall of grey. The web shows them stacked.

**Before** (lines 707–720):
```tsx
{job.interview.steps.map((s, i) => (
  <React.Fragment key={s.n}>
    <b style={{ color: ACCENT, fontFamily: "'Courier New', monospace" }}>
      {s.n}.
    </b>{' '}
    {renderInlineHtml(s.body_html)}
    {i < job.interview.steps.length - 1 ? '  ' : ''}
  </React.Fragment>
))}
<br />
<i>{renderInlineHtml(job.interview.tip_html)}</i>
```

**After:** lift each step to its own block so vertical rhythm carries:
```tsx
{job.interview.steps.map((s) => (
  <div key={s.n} style={{ margin: '6px 0' }}>
    <b style={{ color: ACCENT, fontFamily: "'Courier New', monospace", marginRight: 4 }}>{s.n}.</b>
    {renderInlineHtml(s.body_html)}
  </div>
))}
<div style={{ marginTop: 8, fontStyle: 'italic', color: GREY }}>
  {renderInlineHtml(job.interview.tip_html)}
</div>
```

(Note: `Text` will wrap these in `<p>` inside react-email — if you want pure block control use a bare `<div>` styled cell. The above swaps to `<div>` for clarity.)

### Fix #8 — Render the missing section headlines: `reality_check.h3`, `under_the_hood.steps[2]`, `india_signal.cards[*].why_you`, `india_signal.foot`, `closer.format_label`

**File:** `emails/IssueEmail.tsx`, multiple sites.

**Why:** Each is a 1–2 line content gap with a clear home in the design contract. Cheap to add, each restores a beat.

**Reality Check headline** (insert at line 849, before the body Text):
```tsx
<Heading as="h3" style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 'bold', margin: '8px 0', color: INK }}>
  {rc.h3}
</Heading>
```

**Under the Hood step[2]** (after the existing `hood.steps[1]` block at line 792):
```tsx
{hood.steps[2] ? (
  <Text style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, margin: '8px 0 0', color: INK }}>
    {renderInlineHtml(hood.steps[2].body_html)}
  </Text>
) : null}
```

**India Signal `why_you`** (add inside the card map at line 937, after the body Text):
```tsx
<Text style={{ fontFamily: SERIF, fontSize: 12.5, color: GREY, fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.5 }}>
  {card.why_you}
</Text>
```

**India Signal foot** (add after the `.cards.map`):
```tsx
<Text style={{ fontFamily: SANS, fontSize: 11, color: GREY, margin: '12px 0 0', letterSpacing: '.04em' }}>
  {india.foot}{' '}
  <Link href={india.foot_cta_url} style={{ color: ACCENT }}>{india.foot_cta}</Link>
</Text>
```

**Closer `format_label`** (insert before the closer body, in the `<Section style={{ background: INK, … }}>` block around line 994):
```tsx
<Text style={{ fontFamily: SANS, fontSize: 10, color: '#C8794B', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>
  {closer.format_label}
</Text>
```

### Fix #9 — Render the upskill ladder (or explicitly decide to drop it)

**File:** `emails/IssueEmail.tsx`, inside the Job Signal section (around line 661, between Spotlight and Interview).

**Why:** The entire `job_signal.upskill` object — title, intro, 3 rungs, note — is in the JSON, on the web, and **completely absent in email**. This is the highest-empathy beat for the Switcher reader who's reading on a Saturday morning specifically because they're scared. If the audit caller's intent was "email mirrors the high points of the web", this is the biggest single miss.

**Add** (between Spotlight Section close and Interview Section open):
```tsx
{job.upskill ? (
  <Section style={{ borderTop: `1px solid ${HAIR}`, paddingTop: 12, marginTop: 12 }}>
    <Text style={{ fontFamily: SERIF, fontWeight: 'bold', fontSize: 14.5, lineHeight: 1.4, margin: '0 0 4px', color: INK }}>
      {job.upskill.title}
    </Text>
    <Text style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, margin: '0 0 6px', color: INK }}>
      {renderInlineHtml(job.upskill.intro_html)}
    </Text>
    {job.upskill.rungs.map((rung, i) => (
      <Text key={i} style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.55, margin: '6px 0', color: INK }}>
        <b style={{ color: ACCENT, textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '.08em', fontFamily: SANS, display: 'block', marginBottom: 2 }}>
          {rung.label}
        </b>
        {renderInlineHtml(rung.body_html)}
      </Text>
    ))}
    <Text style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: 'italic', color: GREY, margin: '8px 0 0', lineHeight: 1.5 }}>
      {renderInlineHtml(job.upskill.note_html)}
    </Text>
  </Section>
) : null}
```

(Trade-off: this lengthens the email materially. If retention data shows readers bail before Section 03 today, the upskill ladder is the wrong place to add weight. But the JSON's voice ("you need to understand rules, not certificates") is one of the strongest in the issue, and it doesn't exist anywhere else in the reader's life.)

### Fix #10 — Restructure subject prefix to lead with signal, not brand

**File:** `src/app/api/cron/send/route.ts`, lines 127–132.

**Why:** "AI, Basically. — " burns 16 chars before any value, and reads as promotional. Two cheaper options:

**Option A** (issue-first):
```ts
const subject =
  tldrBody.length >= 20
    ? `${tldrBody.slice(0, 70)} — AI, Basically. #${content.slug}`
    : `AI, Basically. — ${content.hero_eyebrow}`
```

For Issue 001 that produces: `"The RBI AI-lending circular nobody read — bigger than the GP — AI, Basically. #001"` — except the slice already eats the punchline. Better: don't slice, let it ride.

**Option B** (dedicated subject field — recommended):
Add `subject_line` to `IssueContent` (in `src/lib/content-model.ts`) and let the editor hand-tighten one line per issue. Falls back to current logic if not provided. This is the most honest fix — the subject is the most important sentence in the email and shouldn't be derived from another field.

```ts
const subject =
  (content as { subject_line?: string }).subject_line?.trim() ||
  (tldrBody.length >= 20
    ? `AI, Basically. — ${tldrBody.slice(0, 90)}`
    : `AI, Basically. — ${content.hero_eyebrow}`)
```

(Tradeoff: requires SEED to add the column, SAGE to fill it. If you can't change the model now, ship Option A as a stopgap.)

---

## 7. Verdicts (1–5)

| Question | Score | Why |
| --- | :-: | --- |
| **Sender + subject + preview pull reader in** | **2** | Subject is OK once the reader's brain skips the "AI, Basically. — " prefix. Preview text is recycled every issue, not specific. No `List-Unsubscribe` header risks Promotions tab. |
| **Email renders correctly in Gmail desktop** | **3** | Layout, tables, fonts all hold. The Build Notes literal-`<b style=…>` leak (Fix #1) is the one visible defect. Otherwise clean. |
| **Email renders correctly in iPhone Mail** | **3** | Same content as desktop renders fine at 375px. Masthead is borderline at 360px (Fix #6). Interview steps are a dense wall (Fix #7). Otherwise OK. |
| **Email renders correctly in Outlook** | **3** | Table scaffolding is solid; SVGs already dropped with a "browser" caption. Same `<b style=…>` leak makes Outlook look worst-case. |
| **Reader makes it past TLDR** | **4** | TLDR box is tight, visually contained, with strong row labels (Big one / Build Notes / Jobs / Reality). Best part of the email. |
| **Reader engages with One Thing** | **4** | Section 01 reads well; the Skip List clay-quote is a strong visual punctuation. Holds attention. |
| **Reader clicks through to web (Read on web / Browser link)** | **2** | The only "browser" prompts are: tiny masthead "Browser" link (visually weak), the "Diagram in the browser version → open issue" inside Build Notes, and the issue link buried in the unsubscribe footer. There's no end-of-issue "Read the full version on the web →" CTA. Readers who notice the missing 15-min Rep, missing upskill rungs, missing why_you bullets have no inviting click out. |

---

## Summary

**Total issues found in the email twin: 28**, grouped as:
- **2 render bugs** (literal `<b style="…">` leak in Build Notes skim, masthead overflow at 360px).
- **20 content-parity gaps** vs. the JSON / web — fields that exist but the email never reads.
- **2 deliverability/header gaps** (no `List-Unsubscribe`, recycled preview text).
- **2 inbox / subject pull issues** (brand-first prefix, generic preview).
- **2 structural beats missing** (no end-of-issue "Read on web" CTA; no rotation cues from `rotation_note` / `format_label` / `harm_tag` / `the_rep.type`).

### Top 3 fixes to ship Monday

1. **Fix #1 — kill the `<b style="…">` leak in the Build Notes dark band.** This is a visible "your email is broken" moment to every reader, every issue, in every client. 5 lines of regex change in `emails/IssueEmail.tsx`. Highest ROI.
2. **Fix #2 — add the `List-Unsubscribe` + `List-Unsubscribe-Post` headers in `route.ts`.** Single biggest lever on Promotions-tab incidence and Gmail bulk-sender compliance. Doesn't touch the template at all. Free deliverability win.
3. **Fix #3 + Fix #4 (ship as a pair) — preview text = `tldr[0].body`, and render the action line for every lens.** Together these recover the two clearest "every reader gets something specific" beats: a unique inbox preview per issue, and a per-role action that completes the lens system's promise. Both are small additive changes in `IssueEmail.tsx`.

(Honorable mention: Fix #5, the missing Build Notes metric "71% → 89%, no latency change". That line is the issue's single strongest credibility moment for the Builder lens, and it currently doesn't reach email readers at all.)
