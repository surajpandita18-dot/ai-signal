# AI, Basically. — System State

```
current_phase:        Phase 4 — awaiting Suraj's destructive steps
status:               PREVIEW_LIVE
active_agents:        none
last_completed_task:  Pixel QA on Vercel preview deploy — desktop + mobile parity confirmed
next_task:            Suraj runs CUTOVER.md steps 1-3 (secrets paste · migration apply · merge to main)
blockers:             5 secrets in .env.local empty (SUPABASE_SERVICE_ROLE_KEY + 4 others) — only Suraj has them
task_counter:         6
last_updated:         2026-06-12
preview_url:          https://ai-signal-jjcbe62vv-surajpandita18-dots-projects.vercel.app
```

## Task log

| # | Task | Agent | Result | Date |
|---|---|---|---|---|
| 0 | Phase 0 — audit, plan, decisions, safety tag, branch, demolition | ARIA | DONE | 2026-06-12 |
| 1 | Phase 1+2 — A (design) + B (data) + C (sections) + E (email twin) parallel | A/B/C/E | DONE | 2026-06-12 |
| 2 | Phase 3 — D (interactions) + F (pipeline + cron) parallel | D/F | DONE | 2026-06-12 |
| 3 | next.config layout font fix (axes vs explicit weight) | ARIA | DONE | 2026-06-12 |
| 4 | Production build verified — 10 routes, 102KB First Load JS | ARIA | DONE | 2026-06-12 |
| 5 | Pixel QA via Playwright — desktop + mobile parity vs HTML source | ARIA | DONE | 2026-06-12 |
| 6 | aibasically branch pushed to origin, Vercel preview live | ARIA | DONE | 2026-06-12 |

## Follow-up migration (Phase 4)

Per Agent F integration notes, add to a follow-up migration:
- `issues.sent_at TIMESTAMPTZ NULL` — cron stamps after a successful send; next run filters on `sent_at IS NULL` (replaces the fragile published_at < 7d proxy).
- `issues._rubric JSONB NULL` — pipeline persists rubric verdict + blockers so the editor sees them inline.

## Open decisions (resolved 2026-06-12)

- **A** Cadence: weekly Sat 08:00 IST. ✅
- **B** Domain: rebrand + project rename to `ai-basically.vercel.app`; custom domain `aibasically.co` deferred.
- **C** Subscribers: opt-in migration. ✅
- **D** Repo: in-place, branch `aibasically`, safety tag `pre-aibasically-2026-06-12` on `0a929a7`. ✅
- **E** Section list: HTML wins (8 numbered + Build Notes + Reader Win inside Rep + Toolbox kept). ✅
- **F** Issue ID: zero-padded `001/002/003`. ✅
- **G** Supabase: same project, one migration drops old. ✅
- **H** Resend: new audience + sender `hello@aibasically.co` (post-domain). ✅
- **I** `ai-signal-v2/` — untouched forever. ✅
- **J** Design contract locked: `~/Downloads/ai-basically-FINAL.html` (71KB, 784 lines, 2026-06-12). ✅
