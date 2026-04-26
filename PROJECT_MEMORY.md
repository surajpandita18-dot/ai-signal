# AI Signal — Project Memory
> Living doc. Update at end of each sprint day. Keep under 150 lines.
> Last updated: 27 Apr 2026

---

## What Currently Works

| Feature | Status | Notes |
|---|---|---|
| Supabase schema (7 tables + email_html col) | ✅ Live | Migration 002 applied |
| Landing page (dark theme) | ✅ Live | `GET /` |
| Magic link auth | ✅ Live | `POST /api/auth/magic-link` |
| Fetcher agent (RSS + HN) | ✅ Live | `GET /api/test-fetcher?lookback=72` |
| Scorer agent (claude-sonnet-4-5) | ✅ Live | `GET /api/test-pipeline?lookback=72` |
| Writer agent (claude-sonnet-4-5) | ✅ Live | `GET /api/test-pipeline?lookback=72` |
| Personalizer agent (TypeScript, no Claude) | ✅ Live | Free vs Pro gating |
| Formatter agent (TypeScript, no Claude) | ✅ Live | Email HTML + WebBriefPayload |
| Sender agent (Beehiiv) | ✅ Built | Skips gracefully — needs BEEHIIV_API_KEY |
| Orchestrator (9-step Inngest cron) | ✅ Live | Mon–Fri 5:30 AM IST |
| `/brief` web page (latest brief) | ✅ Live | Free/Pro gated, SSR |
| `/brief/[date]` archive page | ✅ Live | 7-day limit for free users |
| `briefs.email_html` column | ✅ Live | Dedicated column, 16k chars |

---

## Sprint Progress

### Sprint 1 — Foundation (Days 1–3) ✅ COMPLETE
- [x] Repo + Vercel deploy + Supabase schema + RLS
- [x] Landing page (dark theme, Tailwind)
- [x] Magic link auth (NextAuth removed)

### Sprint 2 — Pipeline (Days 4–7) ✅ COMPLETE
- [x] Day 4: Fetcher agent (`agents/fetcher.ts`)
- [x] Day 5: Scorer agent (`agents/scorer.ts`)
- [x] Day 6: Writer agent (`agents/writer.ts`)
- [x] Day 7: Orchestrator + Inngest cron (`agents/orchestrator.ts`)

### Sprint 3 — Delivery (Days 8–10) ✅ COMPLETE
- [x] Day 8: Personalizer (`agents/personalizer.ts`) + `lib/beehiiv.ts` + `lib/supabase-admin.ts`
- [x] Day 9: Formatter polish + `/brief` + `/brief/[date]` pages + `email_html` column
- [x] Day 10: Sender agent (`agents/sender.ts`) + orchestrator Step 9

---

## Full Pipeline (9 steps, Inngest durable)

```
[Cron: UTC 00:00, Mon–Fri = 5:30 AM IST]
Step 1  fetch-stories      Fetcher → RSS + HN (lookback 24h)
Step 2  score-stories      Scorer → Claude sonnet-4-5, batches of 20
Step 3  write-brief        Writer → Claude sonnet-4-5, CRITICAL+MONITOR+TOOL
Step 4  personalize-brief  Personalizer → free/pro split (TypeScript)
Step 5  format-brief       Formatter → email HTML + WebBriefPayload (TypeScript)
Step 6  save-brief         Supabase upsert → briefs table (free/pro/web/email_html)
Step 7  send-brief         Sender → Beehiiv draft + schedule 6 AM IST send
Step 8  log-pipeline-run   Supabase insert → pipeline_runs table
Step 9  update-pipeline-state  Supabase upsert → pipeline_state (Scorer memory)
```

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| Scorer batches 20 stories per Claude call | 8192 token output cap |
| Scorer compact output (id+scores+rationale) | Avoids rawText echo bloat |
| Writer max 14 stories (5 CRITICAL + 8 MONITOR + 1 TOOL) | 6000 token output budget |
| Personalizer: TypeScript, no Claude | Rules are deterministic; 500 max_tokens insufficient for story arrays |
| Formatter: TypeScript, no Claude | Template rendering; no creativity needed |
| Sender: graceful no-op if no Beehiiv creds | Enables local dev without keys |
| email_html in dedicated column | Cleaner than JSONB; migration 002 applied |
| /brief SSR with BriefView client component | SEO for free content + client auth for pro toggle |
| 7-day archive limit for free users | Incentivizes Pro upgrade |

---

## To Activate Beehiiv Sending

Add to `.env.local` and Vercel env:
```
BEEHIIV_API_KEY=your_key_here
BEEHIIV_PUBLICATION_ID=pub_xxxxxxxx
```

Pipeline will then create a draft and schedule at 6 AM IST automatically.

---

## Pending (Post-Sprint 3)

- Stripe integration — pro tier payments (`/upgrade` page wires to Stripe)
- PostHog click tracking — feeds `clickHistory` into Scorer
- Vercel deploy verification — check all env vars set in Vercel dashboard
- First real subscriber — test full flow end-to-end with real email
