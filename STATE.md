# AI, Basically. — System State

```
current_phase:        Phase 4 — Cleanup + first issue + Vercel cutover
status:               READY
active_agents:        none — Phases 1+2+3 complete
last_completed_task:  Phase 3 — interactions + pipeline + cron
next_task:            Apply migration to Supabase + seed Issue 001 + visual QA via next dev + project rename
blockers:             —
task_counter:         4
last_updated:         2026-06-12
```

## Task log

| # | Task | Agent | Result | Date |
|---|---|---|---|---|
| 0 | Phase 0 — audit, plan, decisions, safety tag, branch, demolition | ARIA | DONE | 2026-06-12 |
| 1 | Phase 1+2 — A (design) + B (data) + C (sections) + E (email twin) parallel | A/B/C/E | DONE | 2026-06-12 |
| 2 | Phase 3 — D (interactions) + F (pipeline + cron) parallel | D/F | DONE | 2026-06-12 |
| 3 | next.config layout font fix (axes vs explicit weight) | ARIA | DONE | 2026-06-12 |
| 4 | Production build verified — 10 routes, 102KB First Load JS | ARIA | DONE | 2026-06-12 |

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
