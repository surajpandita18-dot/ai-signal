# AI Signal — Product Requirements Document
> Version: 1.0 | 26 Apr 2026
> This is a living document. Update the change log every time this file changes.
> Never delete old change log entries — prepend new ones.

---

## Change Log

| Version | Date | Author | What Changed |
|---|---|---|---|
| 1.0 | 26 Apr 2026 | Suraj | Initial PRD — full product definition |
| — | — | — | *next change goes here* |

---

## 1. Product in One Line

AI Signal converts 500+ daily AI signals into a 4-minute actionable brief, scored and filtered through a CTO decision lens.

---

## 2. The Problem (precise)

Early-stage startup CTOs spend 30–45 min/day scanning AI news that doesn't translate into decisions. The existing newsletters (Rundown, Superhuman AI, TLDR) have three shared failures:

1. **No persona filter** — same brief for a Fortune 500 head of AI as for a 5-person seed startup CTO
2. **No triage** — every item is presented with equal weight; CTOs can't tell what requires action today vs. next quarter
3. **No action layer** — "here's what happened" without "here's what you should do about it"

---

## 3. The Solution

A daily brief that:
- Scores every story on 4 dimensions (infra impact, speed-to-action, competitive relevance, hype discount)
- Labels each story: Critical / Monitor / Tool / Ignore
- Writes action templates for Critical stories: who owns it, what to do, by when
- Gates action templates behind a Pro subscription ($29/mo)
- Gets smarter over time via reader click signals feeding back into the Scorer

---

## 4. User Personas

### Primary: The Overloaded CTO (Aryan)
- CTO/VP Eng, seed–Series A AI startup, 5–25 engineers
- Reads mobile, 6–8 AM IST, before standup, max 4 minutes
- Upgrade trigger: missed an action template 3+ times, or Slack bot saves him in a meeting

### Secondary: The Technical Founder
- Solo founder who is also the technical lead
- Higher viral coefficient — shares issues with their network
- Upgrade trigger: weekly deep-dive PDF + Slack bot

---

## 5. Brief Structure

```
[SIGNAL SCORE HEADER]
4 Critical · 7 Monitor · 26 Apr 2026

────────────────────────────
🔴 CRITICAL
────────────────────────────

[headline — 12 words max, number-first]
[summary — 2 sentences, ~50 words]
[action template — gated on free tier]

... (up to 5 Critical stories)

────────────────────────────
🔵 MONITOR
────────────────────────────

[headline]
[summary — 2 sentences, ~40 words]

... (up to 8 Monitor stories)

────────────────────────────
⚡ TOOL OF THE DAY
────────────────────────────

[tool name + 1-sentence value prop]

────────────────────────────
💬 CTO PROMPT OF THE DAY
────────────────────────────

[1 question for standup]
```

---

## 6. Freemium Gating

| Feature | Free | Pro ($29/mo) |
|---|---|---|
| CRITICAL story summaries | 3 of 5 | All 5 |
| MONITOR story summaries | 3 of 8 | All 8 |
| Action templates | Blurred with upgrade CTA | Full |
| Signal Score breakdown | Score number only | Full 4-dimension card |
| Web archive | Last 7 days | Unlimited + search |
| Slack bot | No | Yes |
| Weekly deep-dive PDF | No | Yes |
| Timezone delivery | IST only | Any timezone |

---

## 7. Agent Architecture

See `.claude/agents/` for full definitions of each agent.

Pipeline: Orchestrator → Fetcher → Scorer → Writer → Personalizer → Formatter → Sender

All agents run as Inngest functions. Cron triggers at 5:30 AM IST Mon–Fri.

---

## 8. Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js 15 + TypeScript | TypeScript guides Claude Code well. App Router handles SSR + gating. |
| Styling | Tailwind CSS + shadcn/ui | Fastest to ship. Claude Code knows Tailwind deeply. |
| Database | Supabase (Postgres + pgvector) | pgvector for dedup. RLS for tier gating. Free tier generous. |
| Email delivery | Beehiiv | Native referral system, segmentation, analytics. |
| Transactional email | Resend | React email components. Clean API. |
| AI (agents) | Claude Sonnet 4 + Haiku | Sonnet for Writer/Scorer. Haiku for Personalizer (cost). |
| Job queue | Inngest | Durable workflows. Visual debugger. |
| Auth | Supabase Auth | Magic link only — no password friction for newsletter readers. |
| Payments | Stripe | Customer Portal handles plan changes without custom code. |
| Analytics | PostHog | Click tracking feeds Scorer. Open source. |
| Deployment | Vercel | Zero-config Next.js. Preview deployments on every PR. |

---

## 9. Supabase Schema

```sql
-- Enable pgvector
create extension if not exists vector;

-- Stories (raw + scored)
create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  source text not null,
  published_at timestamptz not null,
  raw_text text,
  embedding vector(1536),          -- for dedup
  infra_score int,
  speed_score int,
  competitive_score int,
  hype_discount int,
  final_score int,
  tier text,                       -- 'critical' | 'monitor' | 'tool' | 'ignore'
  score_rationale text,
  fetched_at timestamptz default now()
);

-- Briefs (daily assembled briefs)
create table briefs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  slug text not null unique,       -- e.g. '2026-04-26'
  free_content jsonb not null,
  pro_content jsonb not null,
  web_payload jsonb not null,
  created_at timestamptz default now()
);

-- Subscribers
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  tier text default 'free',        -- 'free' | 'pro'
  stripe_customer_id text,
  beehiiv_subscriber_id text,
  slack_webhook_url text,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now()
);

-- Pipeline runs (for monitoring + calibration)
create table pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  duration_ms int,
  story_count int,
  critical_count int,
  monitor_count int,
  emails_scheduled boolean,
  manual_send boolean default false,
  success boolean,
  errors jsonb,
  created_at timestamptz default now()
);

-- Agent errors (for debugging)
create table agent_errors (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  error text not null,
  context jsonb,
  created_at timestamptz default now()
);

-- Pipeline state (orchestrator memory)
create table pipeline_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Pro subscribers (extended data)
create table pro_subscribers (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  slack_webhook_url text,
  timezone text default 'Asia/Kolkata',
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);
```

---

## 10. Design System

### Colors
```
Background:    #0A0812  (near-black, warm)
Text primary:  #F5F0E8  (warm white)
Text muted:    rgba(232,226,217,0.55)
Accent:        #7C3AED  (purple)
Glow:          rgba(167,139,250,0.18)
Critical:      #EF4444
Monitor:       #3B82F6
Tool:          #F59E0B
Funding:       #22C55E
```

### Typography
```
Display:  Fraunces (serif, variable) — editorial, premium
Body:     DM Sans — clean, mobile-readable
Mono:     JetBrains Mono — scores, timestamps, code
```

### Email-specific rules
- Max width: 600px
- Provide light-mode fallback styles
- No images in critical sections — colored text/borders only
- Signal badges: styled `<span>` elements, not images
- Mobile-first: readable at 375px

---

## 11. Go-To-Market Phases

### Phase 1: 0 → 500 subscribers (Month 1–2)
- Week 1–2: Ship MVP. Test pipeline with 10 beta subscribers.
- Week 3–4: Founder-led. LinkedIn + Twitter + HN Show HN.
- Month 2: Beehiiv referral program live ("Refer 3, get Pro free for 1 month")

### Phase 2: 500 → 5,000 (Month 3–6)
- CTO community distribution: IIT alumni, YC Slack, Bengaluru startup network
- SEO: weekly long-form deep-dive on Next.js blog
- 1 co-authored issue with a known CTO

### Phase 3: 5,000+ (Month 6+)
- Sponsored placements ($500/issue minimum)
- Pro conversion optimization (A/B test blur depth)
- Target: 5% free-to-Pro = $7,250 MRR at 5k subscribers

---

## 12. Success Metrics

| Metric | Month 1 | Month 6 | Why |
|---|---|---|---|
| Subscribers | 200 | 5,000 | Top-line growth |
| Open rate | 35%+ | 45%+ | Beats B2B avg (39.5%) |
| Click-through rate | 3%+ | 5%+ | Proves actionability |
| Pro conversion | — | 5% | Revenue viability |
| Referral rate | 10% | 20% | Viral growth |
| Pro churn | — | <5%/mo | PMF signal |
| Pipeline SLA | 95% by 6 AM | 99% by 6 AM | Reliability = trust |

---

## 13. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Scorer quality drift | High | Weekly /quality-check command. Prompt version control. |
| API cost blowup | Medium | Hard token caps per agent. Cost alert in PostHog. |
| Email deliverability | High | Beehiiv handles. Custom domain from day 1. |
| Brand voice drift | Medium | /quality-check catches it. Human review every 5th issue initially. |
| Source availability | Medium | 40+ sources — 5 failures don't break the brief. |

---

## 14. Build Sequence

**Sprint 1 — Foundation (Days 1–3)**
- [ ] Day 1: Init repo + CLAUDE.md + .env.local + Supabase project + Vercel deploy
- [ ] Day 2: Supabase schema (run migrations above) + RLS policies
- [ ] Day 3: Landing page (dark, Rundown/Superhuman-inspired design)

**Sprint 2 — Agent Pipeline (Days 4–7)**
- [ ] Day 4: Fetcher agent — 10 RSS sources → Supabase
- [ ] Day 5: Scorer agent — Signal Score working on 50 test stories
- [ ] Day 6: Writer agent — summaries + action templates generating
- [ ] Day 7: Orchestrator + Inngest cron — full pipeline end-to-end

**Sprint 3 — Email + Web (Days 8–11)**
- [ ] Day 8: Beehiiv API integration — subscriber sync + draft creation
- [ ] Day 9: Email template — dark theme, mobile-tested
- [ ] Day 10: Web brief page + archive + free gating
- [ ] Day 11: First real send to 10 test subscribers

**Sprint 4 — Pro + Payments (Days 12–14)**
- [ ] Day 12: Stripe integration + tier update on payment
- [ ] Day 13: Pro content unlock + action template reveal
- [ ] Day 14: Slack bot MVP

**Sprint 5 — Launch (Days 15–17)**
- [ ] Day 15: PostHog analytics + click tracking for feedback loop
- [ ] Day 16: Referral system (Beehiiv native) + SEO meta tags
- [ ] Day 17: First public send + distribution

---

*Update this doc when requirements change. Commit message format: `prd: [section] - [what changed]`*
