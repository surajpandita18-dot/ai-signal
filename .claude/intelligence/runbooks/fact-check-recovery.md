# Fact-Check Log Monitoring

## Mode: WARN-ONLY (articles always publish)

The fact-check layer runs as an audit after every article generation. It **never blocks publish**. Every article publishes regardless of fact-check result. This is intentional — daily consistency matters more than false positives.

## What to check (daily, at 7 AM IST)

Scan Vercel logs for these prefixes:

| Log prefix | Meaning | Action |
|---|---|---|
| `[FACT-CHECK]` | Audit ran — top-line result | No action needed (informational) |
| `[FACT-CHECK-WARN]` | Minor concerns, 1–3 MEDIUM or LOW severity | Optional: read concerns before next day |
| `[FACT-CHECK-FIX-SKIPPED]` | 4+ MEDIUM concerns — model flagged many issues | Review article in Supabase; fix manually if real |
| `[FACT-CHECK-ALERT]` | HIGH severity concerns or `block_publish=true` | Review article within 24h. Patch or add correction note. |
| `[FACT-CHECK-SKIP]` | Audit skipped (low confidence or API/parse error) | No action needed — article published normally |

## On a [FACT-CHECK-ALERT] entry

The article **already published**. This is a reactive review, not a blocking review.

**Step 1: Find the article**
```sql
SELECT id, issue_number, published_at
FROM issues
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;
```

**Step 2: Read the Vercel log entry**
The `[FACT-CHECK-ALERT]` log contains `high_concerns` JSON — read the `claim`, `reason`, and `suggested_action` fields.

**Step 3: Decide**

| Situation | Action |
|---|---|
| Real factual error | Patch the story field in DB (see below) |
| False positive (model wrong) | No action needed |
| Major credibility issue | Add a correction note in `editor_note` |

**Patch a story field:**
```sql
UPDATE stories
SET headline = 'corrected headline here'
WHERE issue_id = '<issue_id>';
```

**Add a correction note to the issue (visible to admin):**
```sql
UPDATE issues
SET editor_note = '[CORRECTION] Brief description of what was fixed'
WHERE id = '<issue_id>';
```

## Notes

- `[FACT-CHECK-ALERT]` in logs = article published, HIGH concern flagged for review
- `[FACT-CHECK-WARN]` in logs = article published, minor concerns noted
- `[FACT-CHECK-FIX-SKIPPED]` in logs = article published, many MEDIUM concerns — worth a manual look
- `[FACT-CHECK-SKIP]` in logs = fact-check skipped entirely (low confidence or error), article published
- Articles about very recent AI models (post–knowledge cutoff) typically get `overall_confidence < 30` and result in `SKIP` — this is expected and correct behavior
- The `markIssuePending` function exists in `generate-signal.ts` but is NOT called in warn-only mode. It is preserved for potential future use if blocking mode is ever re-enabled.
