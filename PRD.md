# AI Signal — Product Requirements Document v2

Owner: Suraj | Status: Direction locked, ready to build | Last updated: April 27, 2026

---

## 1. Positioning

**One-liner:** One story. Every day. Gone in 24 hours.

### Why this exists

AI news in 2026 is not undersupplied — it's oversupplied. The Rundown has 1.75M+ readers. TLDR AI, Superhuman AI each cross 1.25M. 100+ new AI newsletters launch every month. The pain isn't access to AI news. The pain is that serious professionals subscribe to 5–10 of them, get the same 6 stories repeated across all of them, and unsubscribe out of cognitive exhaustion.

Every existing newsletter competes on breadth: more stories, more analysis, more coverage. No one competes on **scarcity and authority**. The signal is lost in the noise precisely because there's no one willing to say: this is the one thing that matters today. Everything else can wait.

The FOMO mechanic is the product insight. Not manufactured scarcity — earned scarcity. If you can only pick one story from the last 24 hours of AI news, your pick means something. And if you miss it, it's gone.

### Audience, in priority order

- **Primary:** AI-curious professionals already subscribed to 2+ AI newsletters who feel the overlap fatigue. PMs, founders, builders, designers in tech — people who want to stay informed without being consumed.
- **Secondary:** AI-curious professionals not yet subscribed to anything who want to start with one source instead of five.
- **Explicitly not:** ML researchers (Latent Space, Import AI serve them), pure tool-discovery seekers (TAAFT serves them), enterprise buyers needing case studies (DataNorth serves them).

### What makes this different

Every other newsletter gives you everything. AI Signal gives you one thing. The constraint is the point. One story per day, scouted from the best sources across the last 24 hours, written with a role lens, and gone after 24 hours. Non-subscribers see the current signal. After 24 hours, they hit the gate — subscribe to access past signals. The FOMO is built into the model: read it now or lose it. The subscribe CTA is never a popup. It's the wall you hit when you miss the window.

---

## 2. Pain points being solved

| Pain | What's actually happening | How AI Signal solves it |
|---|---|---|
| Overlap fatigue | Reader subscribes to 4 AI newsletters and the same OpenAI launch is the top story in all of them, summarised slightly differently. | De-duplicate across sources. One canonical summary per story, drawing on the best version from each newsletter. |
| Awareness without action | 'OpenAI launched X' — okay, but what changes in the reader's actual work this week? Existing newsletters mostly answer the first question, not the second. | Every story has a 'why it matters' frame, plus an optional role-specific lens (PM / Founder / Builder). |
| Inbox cognitive load | 121 emails/day average. Newsletter unsubscribe rates more than doubled in 2025. People aren't anti-information; they're protecting cognitive bandwidth. | One email per week, not five per day. Web archive does the heavy reading. Email is the index, not the read. |
| One-size content | PM, founder, builder all get the same summary or the same overwhelming detail. Personalisation is mostly absent or buried in onboarding friction. | Two-layer content. Top layer scannable for anyone. 'Go deeper' opens a role-specific lens, picked once during onboarding. |

---

## 3. Scope — MVP vs deferred

MVP exists to test one hypothesis: does a daily single-story pick with a 24-hour expiry create more urgency and habit than a weekly digest? Everything that doesn't directly test that hypothesis is deferred.

### In MVP (build now)

- Web — homepage that IS today's signal. One story, fully rendered, with a visible expiry badge showing time remaining.
- Web — signal page (`/signal/[slug]`) for direct links — same layout as homepage. After 24h, non-subscribers see a gate: "This signal has expired. Subscribe to access the archive."
- Story card with two-layer content. Top layer: headline, summary, why it matters, sources. Expand: PM/Founder/Builder lenses + deeper read.
- Expiry mechanic — `published_at + 24h` determines the window. Countdown shown on the current signal. After expiry: SignalExpired state on homepage ("Tomorrow's signal drops at 9 AM IST. Subscribe to be first.").
- Subscriber archive gate — past signals are accessible only to subscribers. Non-subscribers see the title and expiry date of past signals, with a subscribe CTA.
- Email — daily morning email (9 AM IST). Email version is the full story (headline, summary, why it matters, role lenses) with 'Read on web' link. One email. One story.
- Onboarding — single-question role pick (PM / Founder / Builder / Just curious) at signup. Stored. Used to set default lens in expanded view.
- Subscribe flow — email-only. No password. Magic link if needed for unsubscribe management.
- Content engine — admin tool to compose a daily signal: paste raw newsletter text from the last 24h, Claude API drafts the pick with de-duplication and lens, edit and publish for 9 AM IST delivery.

### Deferred (post-MVP, not now)

- Paid tier and any payment infrastructure.
- Multi-category filtering. Add when there are 30+ past signals, not before.
- User accounts beyond email subscription. No saved favourites, no reading history.
- Mobile app, browser extension, RSS feed, podcast version.
- Personalised feeds beyond the single role-lens choice.
- Full-text search across the subscriber archive.
- Native sharing tools. Browser-native sharing is enough for v1.
- Weekly round-up email ("Best of the week" digest). Only if subscribers ask for it post-launch.

---

## 4. Product surfaces — what gets built

### 4.1 Homepage (/)

Single goal: get the visitor to read today's signal or subscribe. Nothing else.

**State A — Active signal (within 24h window):**
- Top: wordmark `AI SIGNAL`, one-line tagline in mono ("One story. Every day. Gone in 24 hours."), no nav menu.
- Expiry badge: `TODAY'S SIGNAL — EXPIRES IN 14H 32M` — mono font, text-secondary, live countdown on client.
- The full signal card rendered inline — one story, StoryCard with both collapsed and expanded states.
- Below the story: subscribe input ("Get tomorrow's signal in your inbox.") — one line, no modal.
- Footer: about link, LinkedIn link only. No archive link (archive is subscriber-only).

**State B — Between signals (after 24h expiry, before next drop):**
- Wordmark + tagline.
- `SIGNAL EXPIRED` in mono with the date it dropped.
- The expired signal's headline in italic serif — not linkable for non-subscribers.
- CTA: "Tomorrow's signal drops at 9 AM IST. Subscribe to be first."
- Single email input.

**State C — No signal yet (first run, nothing published):**
- Wordmark + tagline.
- `FIRST SIGNAL COMING SOON.` in mono. Subscribe input.

### 4.2 Signal page (/signal/[slug])

Direct link to a specific signal. Within 24h: same layout as homepage State A.

After 24h, non-subscriber: signal headline and drop date visible. Card is gated. Copy: "This signal has expired. Subscribers can access the full archive." Subscribe CTA. No tricks — the gate is honest.

After 24h, subscriber (Phase 5+): full story visible, reading date in header, no countdown.

### 4.3 Archive (/archive)

Subscriber-only. Non-subscribers see signal headlines (date + headline, no body) and a subscribe gate.

Subscribers: reverse-chronological list. Each entry: date, headline, 1-line summary, "read signal" link. No filtering in MVP.

### 4.4 About (/about)

One short page. Why this exists, who's behind it, how the curation works (build trust by being transparent about source newsletters), how to reach out. No team page, no fancy story.

### 4.5 Story card (the core component)

Used once per daily signal. The single piece of UI that has to be exceptional.

**Collapsed (default)**

- Category tag (Models / Tools / Business / Policy / Research) + read-time estimate. No story number (there's only one per day).
- Headline — serif, 22px, line-height 1.3, max two lines.
- Summary — sans, 15px, 2–3 sentences max.
- 'Why it matters' block — 3px accent left-border, one short paragraph. This is the differentiator. It must be the strongest sentence on the card.
- 'Go deeper' button — outlined, secondary.

**Expanded (after click)**

- Three-lens grid: For PMs, For Founders, For Builders. Two-line take per lens. The user's chosen role (from onboarding) is highlighted; the others are still visible.
- 'The deeper read' — one paragraph of original synthesis. This is where Suraj's voice lives.
- Sources — labelled, 2–4 source links. Original publishers and source newsletters credited.

### 4.6 Email — daily signal

One email per day. Sent at 9 AM IST. The full signal (not just an index).

- Plain semantic HTML. No expand/collapse. Top-layer only.
- Story: headline + summary + why-it-matters + role lenses (all three, visually separated) + 'Read on web' link.
- Subject line formula: `AI Signal — [one-phrase headline]`
- Editor's note opens, one-pick long read closes.
- Mobile-first layout. ~600px max width. System fonts, no web fonts.

### 4.7 Onboarding

Goal: zero friction. Inverse of every product that asks 5 questions. One question, one tap.

1. Visitor enters email on homepage and submits.
2. Single screen: 'What best describes you?' — four options as large tappable cards (PM / Founder / Builder / Just curious). One tap.
3. Confirmation screen: 'You're in. Next issue lands Sunday.' Done.

No password, no profile, no preferences. Role pick is editable later via a link in every email footer.

### 4.8 Admin compose tool

Internal-only. Suraj uses this every Saturday to compose Sunday's issue.

- Paste-and-process: drop raw text from N source newsletters into a text area, the tool drafts de-duplicated summaries via Claude API, surfaces likely overlap clusters, drafts the three role-lens takes.
- Editorial UI: edit drafts inline, reorder stories, add the editor's note, mark category tags, add sources.
- Preview: render the full web issue and the email version side-by-side before publish.
- Publish: writes to Supabase, generates static issue page, queues email send.

This tool is the 80/20 of the whole product. Without it, weekly cadence collapses by week 4. Treat it as first-class scope, not a hack.

---

## 5. Design principles

References, ranked: The Pragmatic Engineer (clean editorial typography, generous whitespace), Stratechery (restraint, black/white/one accent), Are.na (modular, library-feel), Linear's blog and changelog (soft surfaces, confident hierarchy).

Avoid: Substack defaults, gradient-heavy SaaS aesthetics, neon dark mode, AI-startup tropes, emoji headers, brutalism.

### Type system

- **Headings** (H1, H2, H3, story headlines): editorial serif. Try 'Source Serif 4' or 'Newsreader' from Google Fonts.
- **Body and UI:** clean sans. Inter is the default; system fallback acceptable.
- **Mono** only for sources / metadata. Sparingly.

### Colour

- Light mode: off-white background (#FAFAF7 or similar warm white), near-black text (#1A1A1A), one accent for the 'why it matters' block — a soft warm grey or muted accent.
- Dark mode: required. Soft black (#0F0F0E), warm off-white text, same accent shifted appropriately.
- Three colours total in the system. No gradients. No shadows except subtle focus rings.

### Spacing and rhythm

- Generous whitespace. Story cards have breathing room. Vertical rhythm in multiples of 8px.
- Max content width 720px. The page is a column of words, not a dashboard.

### Interaction

- Expand/collapse is the only interactive primitive on the page. Smooth, sub-200ms transition. No layout shift on expand.
- Subscribe is one input. No newsletter modals, no exit intents, no popups. Trust the content.

---

## 6. Success metrics

Don't over-instrument. Three numbers matter for the first 90 days.

- **Daily active readers (DARs):** unique email opens + unique web signal visits per day. Target: 50 by day 14, 200 by day 30. If below 20 by day 14, distribution is the problem — fix before building more.
- **Subscribe-on-expire rate:** % of non-subscribers who hit the 24h expiry gate and subscribe. Target: above 10%. This validates the FOMO mechanic. If it's below 5% by week 3, the gate is either too aggressive or not compelling — adjust.
- **Day-over-day return rate:** % of yesterday's web readers who come back today. Target: above 40%. This is the habit metric. Without it, the FOMO model is a leaky bucket — you're acquiring readers but not building a ritual.

Vanity metrics to ignore: subscriber count in isolation, time on page, email click-through. They look good but don't drive product decisions.

---

## 7. From the previous AI Signal build — delete vs reuse

| Component | Action | Why |
|---|---|---|
| Two-zone homepage | Delete | Old positioning is dead. New homepage is the latest issue itself. |
| Signal cards (CTO early-warning UI) | Delete | Different product. Story card replaces it entirely with new model. |
| Freemium gating | Delete (now) | MVP is fully free. Re-introduce when there's a paid tier. Code worth saving in a branch, not in main. |
| Product Intelligence System (curation framework) | Reuse | Conceptual foundation transfers. Editorial standards, source-ranking logic, tone guidelines — all apply. |
| Next.js + Tailwind + TypeScript scaffold | Reuse | Stack stays. Project structure stays. Auth/session if any — assess and likely simplify. |
| Supabase schema | Rewrite | Old tables don't map to new model. Fresh schema for issues, stories, subscribers, role. |
| Claude API integration | Reuse + extend | API client and prompt patterns transfer. New use cases: de-duplication, lens drafting. |
| All previous frontend pages, components | Delete | Start FE clean from new component library. |

---

## 8. Data model — minimal v1 schema

Supabase tables. Keep it embarrassingly small until pain forces expansion.

### issues

```
id            uuid pk
issue_number  int unique
slug          text unique      (e.g. '2026-04-27')
published_at  timestamptz
editor_note   text
long_read     jsonb            { title, url, source, why_pick }
status        text             'draft' | 'published'
created_at    timestamptz default now()
```

### stories

```
id             uuid pk
issue_id       uuid fk -> issues.id
position       int              (1..7, for ordering within issue)
category       text             'models'|'tools'|'business'|'policy'|'research'
headline       text
summary        text
why_it_matters text
deeper_read    text
lens_pm        text
lens_founder   text
lens_builder   text
sources        jsonb            [ { label, url } ]
read_minutes   int default 3
```

### subscribers

```
id                uuid pk
email             text unique
role              text             'pm'|'founder'|'builder'|'curious'
status            text             'active'|'unsubscribed'
subscribed_at     timestamptz default now()
unsubscribe_token text unique
```

No reading history, no favourites, no analytics tables. Email opens and click tracking handled by the email service provider (Resend/Postmark).

---

## 9. Editorial workflow — what every morning looks like

This is the loop that has to be sustainable. If it takes more than 30 minutes per day, the signal dies in two months. It should not.

- **Step 1. Every morning (~15 min):** skim the last 24h of source newsletters: TLDR AI, The Rundown, Ben's Bites, The Neuron, Stratechery, The Pragmatic Engineer, Latent Space. The question is one question: *what is the single most important thing that happened in AI in the last 24 hours?* If nothing, post nothing — a missed day is better than a weak signal.
- **Step 2. Compose (~10 min):** paste the relevant source content into the admin tool. Claude API drafts the summary, why-it-matters, and three role lenses. Review the pick one more time — if it doesn't feel important, stop and pick something else or skip.
- **Step 3. Edit (~5 min):** tighten the 'why it matters' — that's the differentiator. Edit the lenses. Add sources.
- **Step 4. Schedule:** set for 9 AM IST publish (or publish immediately if already past 9 AM). Done.

Total target: under 30 minutes. The admin tool's Claude integration does the drafting; Suraj does the judgment and editing only.

---

## 10. Honest risks

**Risk 1 — Daily cadence is harder than it looks.** 365 picks per year, each one needs to clear the bar. Mitigation: the bar is intentionally stated as "skip the day if nothing is worth it." A missed day is honest. A weak signal destroys the brand. The admin tool + Claude API keeps editorial time to under 30 minutes.

**Risk 2 — FOMO mechanic feels gimmicky.** If the expiry counter reads as manufactured scarcity, readers will distrust the curation. Mitigation: the gate must be earned. Every signal must genuinely clear a quality threshold. If Suraj would share this on LinkedIn unprompted, it's worth publishing. If not, skip the day.

**Risk 3 — 'Aggregating curators' could be perceived as parasitic by source newsletters.** Mitigation: always credit sources prominently. Link back. Reach out personally to the writers we lean on most. Reframe as 'we make their work more valuable to readers who couldn't subscribe to all of them.'

**Risk 4 — The 'expand for depth' interaction may have low engagement.** Mitigation: collapsed top-layer is designed to be complete on its own. If expand rate is below 15% by day 30, the deep layer is dead weight — kill it.

**Risk 5 — Distribution.** Building is the easy part. Getting the first 50 daily readers is the hard part. Mitigation: every signal must be designed to be shared on LinkedIn. The format is ideal for it — one sharp take, one story, specific enough to quote. Suraj's existing network is the distribution wedge.

**Risk 6 — Naming collision with AlphaSignal.** Tolerable for now, revisit at signal 30 with reader signal. If confusion shows up in feedback, rename.

---

## 11. Build workflow — Claude Code, phase-gated

### Build phases

| Phase | Description | Scope |
|---|---|---|
| Phase 0 | Setup — multi-agent workspace, PLAN.md, STATE.md | ARIA only |
| Phase 1 | Schema + data layer + seed one fake issue | SEED + LENS |
| Phase 2 | Story card component with both states (collapsed/expanded) | FORGE + LENS + VEIL |
| Phase 3 | Issue page that renders one issue end-to-end | FORGE + LENS + VEIL |
| Phase 4 | Homepage (latest issue) + archive page | FORGE + LENS + VEIL |
| Phase 5 | Subscribe form + onboarding role pick | FORGE + SEED + LENS + VEIL |
| Phase 6 | Admin compose tool (paste → draft → edit → publish) | FORGE + SEED + SAGE + LENS + VEIL |
| Phase 7 | Email rendering + send pipeline | FORGE + SEED + SAGE + LENS |

### Phase gates — non-negotiable

After each phase: working code, browser test, git commit. Never start phase N+1 on a broken phase N.

### Token efficiency

- Use `@filename` references for every file mention — never paste contents.
- Server components by default, client components only when needed.
- After each phase: git commit with a clear message. The commits are the undo button.

---

## 12. What to do right now

1. Stay in this terminal (ARIA at root). Say "Plan Phase 1 per PRD section 11."
2. ARIA will write a brief in `/system/briefs/`.
3. Open a second terminal in `/db/`, run `claude`, say "Read your brief and execute."
4. After SEED finishes, open `/qa/` terminal, invoke LENS for review.
5. Return to ARIA with the verdict.
