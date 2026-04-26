# /run-pipeline
> Manually trigger the full pipeline for today's date. Use for testing or if the cron failed.
> Usage: /run-pipeline [optional: date in YYYY-MM-DD format]

Trigger the AI Signal daily pipeline manually.

Steps:
1. Check if a brief already exists for today in Supabase `briefs` table
2. If yes, confirm with user before overwriting
3. Run `agents/orchestrator.ts` pipeline function directly (not via Inngest cron — use Inngest `inngest.send()`)
4. Stream progress to terminal: "✓ Fetcher done (47 stories)" / "✓ Scorer done (4 Critical, 8 Monitor)"
5. Report final status: total time, email scheduled?, any errors?

If a date argument is provided, fetch stories from that date's archive and re-generate the brief.
