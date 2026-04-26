# AI Signal — CLAUDE.md
> Claude Code reads this file at the start of every session. Keep it under 2,000 tokens.
> Last updated: 26 Apr 2026

---

## What is this project?

AI Signal is a **daily AI intelligence newsletter for CTOs at seed–Series A startups.**
It converts 500+ daily AI signals into a 4-minute actionable brief, scored and filtered through a CTO decision lens.

This is a production Next.js application. Every decision should be production-quality.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | Strict TypeScript. No `any`. |
| Styling | Tailwind CSS + shadcn/ui | Dark theme by default. Design system in `/design-system.md` |
| Database | Supabase (Postgres + pgvector) | pgvector for story dedup. RLS for subscriber tiers. |
| Email delivery | Beehiiv | All newsletter sending goes through Beehiiv API |
| Transactional email | Resend | Welcome, upgrade, password flows only |
| AI (agents) | Claude Sonnet 4 (`claude-sonnet-4-20250514`) | Haiku for Personalizer (cost-efficiency) |
| Job queue | Inngest | Cron + event-driven. All agents run as Inngest functions |
| Auth | Supabase Auth | Magic link only. No passwords. |
| Payments | Stripe | Customer Portal handles plan changes |
| Analytics | PostHog | Click tracking feeds back into Scorer agent |
| Deployment | Vercel | Preview deployments on every PR |

---

## Project File Structure

```
ai-signal/
├── CLAUDE.md                        ← you are here
├── AGENT.md                         ← CTO persona + scoring rubric (read before any agent work)
├── PRD.md                           ← living product requirements document
├── .claude/
│   ├── commands/                    ← slash commands (/run-pipeline, /send-brief, /quality-check)
│   └── agents/                      ← subagent definitions (fetcher, scorer, writer, etc.)
├── prompts/                         ← versioned prompt templates (commit every change)
│   ├── scorer-system.md
│   ├── writer-system.md
│   └── brand-voice.md
├── app/                             ← Next.js App Router
│   ├── layout.tsx                   ← root layout (dark theme, Fraunces + DM Sans fonts)
│   ├── page.tsx                     ← landing page
│   ├── brief/
│   │   ├── page.tsx                 ← latest brief (free gated)
│   │   └── [date]/page.tsx          ← archive
│   ├── dashboard/page.tsx           ← pro subscriber dashboard
│   └── api/
│       ├── subscribe/route.ts
│       ├── webhook/stripe/route.ts
│       ├── webhook/beehiiv/route.ts
│       └── inngest/route.ts         ← Inngest event handler
├── agents/                          ← agent implementation (TypeScript)
│   ├── orchestrator.ts
│   ├── fetcher.ts
│   ├── scorer.ts
│   ├── writer.ts
│   ├── personalizer.ts
│   ├── formatter.ts
│   └── sender.ts
├── lib/
│   ├── supabase.ts
│   ├── beehiiv.ts
│   ├── anthropic.ts
│   └── stripe.ts
└── supabase/
    └── migrations/
```

---

## Agent Rules (non-negotiable)

1. **Each agent does ONE job.** Never add a second responsibility to an existing agent.
2. **Use `claude-sonnet-4-20250514` for Scorer and Writer.** Use `claude-haiku-4-5-20251001` for Personalizer.
3. **max_tokens caps:** Summaries = 300 tokens. Scores = 150 tokens. Action templates = 400 tokens.
4. **Never exceed 20k tokens of MCP context** — context bloat kills Claude performance. Load only what the agent needs.
5. **All prompts live in `/prompts/*.md`** — versioned in git. Never hardcode prompts in TypeScript.
6. **Inject `AGENT.md` into every agent call** as the system prompt prefix. This ensures consistent CTO persona.
7. **Agents run via Inngest.** Never call agents directly from API routes — always enqueue an Inngest event.
8. **Error handling:** Every agent wraps its Claude call in try/catch. On failure, log to Supabase `agent_errors` table and continue pipeline — a partial brief is better than no brief.

---

## Coding Rules

- **TypeScript strict mode.** Every function has explicit return types.
- **No `console.log` in production.** Use a structured logger: `import { log } from '@/lib/logger'`
- **Environment variables:** All secrets in `.env.local`. Never hardcode. Use `process.env.VAR_NAME!` with the `!` only after checking in the relevant lib file.
- **Database:** Always use typed Supabase client. Never write raw SQL in component files — put it in `lib/supabase.ts` helper functions.
- **API routes:** Every route returns `{ data, error }` shape. Never throw unhandled errors.
- **Commits:** Conventional commits. `feat:`, `fix:`, `prompt:` (for prompt changes), `agent:` (for agent logic changes).

---

## Design Rules

See `PRD.md — Section 10` for full design system.

Quick reference:
- Background: `#0A0812`
- Text primary: `#F5F0E8`
- Accent purple: `#7C3AED`
- Font display: Fraunces (serif)
- Font body: DM Sans
- Font mono: JetBrains Mono
- Signal Critical: `#EF4444`
- Signal Monitor: `#3B82F6`
- Signal Tool: `#F59E0B`
- Signal Funding: `#22C55E`

---

## What NOT to do

- ✗ Don't create new files outside this structure without asking
- ✗ Don't change the agent architecture without updating `.claude/agents/` definitions
- ✗ Don't modify prompts without a git commit tagged `prompt: [agent-name]`
- ✗ Don't add new npm packages without checking if Supabase/Next.js already handles it
- ✗ Don't use `any` in TypeScript
- ✗ Don't write inline styles in React — use Tailwind classes only

---

## Current Sprint

Check `PRD.md — Section 14 (Build Sequence)` for the active sprint tasks.
Update this section when sprint changes.

**Active: Sprint 1 — Foundation (Days 1–3)**
- [x] Init repo + Supabase project + Vercel deploy
- [ ] Supabase schema + RLS policies
- [ ] Landing page (dark theme, Tailwind only)
