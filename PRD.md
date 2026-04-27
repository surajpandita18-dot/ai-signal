# AI Signal — Product Requirements Document v2

Owner: Suraj | Status: Direction locked, ready to build | Last updated: April 27, 2026

---

## 1. Positioning

**One-liner:** AI Signal reads the best AI newsletters of the week so you don't have to. One clean digest. No overlap. With a lens for your role.

### Why this exists

AI news in 2026 is not undersupplied — it's oversupplied. The Rundown has 1.75M+ readers. TLDR AI, Superhuman AI each cross 1.25M. 100+ new AI newsletters launch every month. The pain isn't access to AI news. The pain is that serious professionals subscribe to 5–10 of them, get the same 6 stories repeated across all of them, and unsubscribe out of cognitive exhaustion.

The third-party tools people are paying for in 2026 — Readless, Remy, Forage Mail — exist to consolidate newsletters into one digest. That market signal is the actual product opportunity. Curation of curation, not yet another curator.

### Audience, in priority order

- **Primary:** AI-curious professionals already subscribed to 2+ AI newsletters who feel the overlap fatigue. PMs, founders, builders, designers in tech.
- **Secondary:** AI-curious professionals not yet subscribed to anything who want to start with one source instead of five.
- **Explicitly not:** ML researchers (Latent Space, Import AI serve them), pure tool-discovery seekers (TAAFT serves them), enterprise buyers needing case studies (DataNorth serves them).

### What makes this different

Most AI newsletters compete on speed of summary or breadth of coverage. AI Signal does neither. It assumes you already have access to the news — the problem is making sense of it across sources. The product is the de-duplication, the prioritisation, and the role lens. Mechanical aggregators (Readless, Remy) give you everyone's summary of the GPT-5 launch. AI Signal gives you the summary plus what changed across the week, why it matters, and what to do about it — with a default lens for whether you're shipping product, running a company, or building the system.

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

MVP exists to test one hypothesis: do people prefer one weekly de-duplicated digest over five separate newsletters? Everything that doesn't directly test that hypothesis is deferred.

### In MVP (build now)

- Web — homepage with the latest weekly issue rendered.
- Web — issue page (`/issue/[slug]`) that displays a single weekly digest with 5–7 stories, hero editor's note, and a one-pick 'long read of the week' footer.
- Story card with two-layer content. Top layer: headline, summary, why it matters, sources. Expand: PM/Founder/Builder lenses + deeper read.
- Web — archive page listing past issues by date.
- Email — weekly digest sent every Sunday morning IST. Email version is top-layer only with 'read full version on web' link per story.
- Onboarding — single-question role pick (PM / Founder / Builder / Just curious) at signup. Stored. Used to set default lens in expanded view.
- Subscribe flow — email-only. No password. Magic link if needed for unsubscribe management.
- Content engine — admin tool to compose an issue: paste raw input from N source newsletters, get drafted summaries with de-duplication and lens drafts, edit, publish.

### Deferred (post-MVP, not now)

- Paid tier and any payment infrastructure.
- Multi-category filtering on archive (Models / Tools / Business / Policy). Add when archive has 8+ issues, not before.
- User accounts beyond email subscription. No saved favourites, no reading history, no comments.
- Mobile app, browser extension, RSS feed, podcast version.
- Personalised feeds beyond the single role-lens choice.
- Search across archive.
- Native sharing tools (custom share images, copy-as-LinkedIn-post). Browser-native sharing is enough for v1.

---

## 4. Product surfaces — what gets built

### 4.1 Homepage (/)

Single goal: get the visitor to either read this week's issue or subscribe. Nothing else.

- Top: brand wordmark, one-line tagline ('One clean digest of the week's AI news. No overlap. Read in 5 minutes.'), single email subscribe input. No nav menu.
- Below fold: the full latest issue, rendered inline. The homepage IS the issue page for the current week. No separate landing/marketing page.
- Issue header: issue number, date, one-paragraph editor's note in editorial voice.
- 5–7 story cards stacked vertically with the two-layer pattern.
- Footer: archive link, about link (single page), subscribe again, social link (LinkedIn primarily).

### 4.2 Issue page (/issue/[slug])

Same layout as homepage, but for a specific past issue. Pure read view. Subscribe CTA at top and bottom only.

### 4.3 Archive (/archive)

Reverse chronological list of past issues. Each entry: issue number, date, editor's note (one line), 'read issue' link. No filtering in MVP.

### 4.4 About (/about)

One short page. Why this exists, who's behind it, how the curation works (build trust by being transparent about source newsletters), how to reach out. No team page, no fancy story.

### 4.5 Story card (the core component)

Used 5–7 times per issue. The single piece of UI that has to be exceptional.

**Collapsed (default)**

- Category tag (Models / Tools / Business / Policy / Research) + story number + read-time estimate.
- Headline — serif, 22px, line-height 1.3, max two lines.
- Summary — sans, 15px, 2–3 sentences max.
- 'Why it matters' block — soft-grey background, one short paragraph. This is the actual differentiator. It must be the strongest sentence on the card.
- 'Go deeper' button — outlined, secondary.

**Expanded (after click)**

- Three-lens grid: For PMs, For Founders, For Builders. Two-line take per lens. The user's chosen role (from onboarding) is highlighted; the others are still visible.
- 'The deeper read' — one paragraph of original synthesis. Connects this story to the broader thread of the week. This is where Suraj's voice lives.
- Sources — labelled, 2–4 source links. Original publishers and source newsletters credited.

### 4.6 Email digest

Email is the index, not the experience. Constraints are real: no JavaScript, inconsistent CSS support, low render fidelity across clients.

- Plain semantic HTML. No expand/collapse. Top-layer only.
- Each story: headline + summary + why-it-matters + 'Read the full version' link to the web issue page (with anchor to that story).
- Subject line formula: `AI Signal #N — [editor's one-phrase headline of the week]`
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

- **Weekly active readers (WARs):** unique email opens + unique web issue visits per week. Target: 200 by issue 8, 1000 by issue 20.
- **Expand rate:** % of web readers who click 'Go deeper' on at least one story. Target: above 25%. If it's below 15% by issue 4, the deep layer isn't earning its cost — cut it.
- **Forwarding / sharing rate:** % of issues that get one share or forward (LinkedIn post, Twitter share, email forward via a tracked link). Target: above 5%. This is the leading indicator of organic growth — without it, distribution is dead.

Vanity metrics to ignore: subscriber count, time on page, email click-through. They look good but don't drive product decisions.

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

## 9. Editorial workflow — what Saturday looks like

This is the loop that has to be sustainable. If it takes more than 3 hours weekly, the newsletter dies in two months.

- **Step 1. Friday:** passively read inboxes. Source newsletters: TLDR AI, The Rundown, Ben's Bites, The Neuron, Stratechery, The Pragmatic Engineer, Latent Space. Star anything notable. No writing yet.
- **Step 2. Saturday morning (90 min):** paste starred content into the admin compose tool. Tool drafts de-duplicated summaries and clusters overlapping coverage. Pick top 5–7 by judgement, not by tool score.
- **Step 3. Saturday afternoon (60 min):** edit drafts. Tighten 'why it matters' on each — that's the differentiator, deserves the most attention. Write the editor's note. Pick the long read.
- **Step 4. Saturday evening (15 min):** preview both web and email versions, fix anything off, schedule for Sunday 9am IST publish.
- **Step 5. Sunday 9am:** auto-publish. Auto-send. Take the day off.

---

## 10. Honest risks

**Risk 1 — Solo content burden.** Weekly cadence with original synthesis is hard to sustain. Mitigation: the admin compose tool reduces this from 'writing 7 stories' to 'editing 7 drafts'. If that's still too much by issue 6, drop to bi-weekly without shame.

**Risk 2 — 'Aggregating curators' could be perceived as parasitic by source newsletters.** Mitigation: always credit sources prominently. Link back. Reach out personally to the writers we lean on most. Reframe as 'we make their work more valuable to readers who couldn't subscribe to all of them.'

**Risk 3 — The 'expand for depth' interaction may have low engagement.** Mitigation: collapsed top-layer is designed to be complete on its own. If expand rate is below 15% by issue 4, the deep layer is dead weight — kill it and lean fully into the top layer.

**Risk 4 — Distribution.** Building is the easy part. Getting the first 200 readers is the hard part. Mitigation: every issue must be designed to be shared on LinkedIn — not as an afterthought, as the primary distribution mechanism. Suraj's existing network is the wedge.

**Risk 5 — Naming collision with AlphaSignal.** Tolerable for now, revisit at issue 10 with reader signal. If confusion shows up in feedback, rename.

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
