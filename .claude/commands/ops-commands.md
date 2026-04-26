# /quality-check
> Spot-check the last 5 briefs against brand voice + scoring consistency.
> Usage: /quality-check [optional: n=10 to check last 10 briefs]

Run a quality audit on recent AI Signal briefs.

Steps:
1. Fetch last 5 (or n) briefs from Supabase `briefs` table
2. For each brief, check:
   - Are CRITICAL story summaries ≤2 sentences? Flag any violations.
   - Do headlines lead with numbers/changes (not company names)? Flag violations.
   - Are action templates using approved verbs from AGENT.md? Flag violations.
   - Is the hype discount being applied? Check: are any clearly marketing stories rated CRITICAL?
   - Average CRITICAL count per brief — should be 2–5. Flag if consistently >5 or <2.
3. Produce a quality report:
   ```
   Quality Report — Last 5 Briefs
   ================================
   ✓ Headline format: 4/5 compliant (1 violation: 2026-04-22)
   ✓ Summary length: 5/5 compliant
   ⚠️  Action verb usage: 3/5 compliant (2 violations — "consider" used twice)
   ✓ Avg Critical count: 3.4 (target: 2–5)
   ⚠️  Hype discount: 1 possible over-score (2026-04-24 — "revolutionary" story rated CRITICAL)
   ```
4. Ask user: "Want me to update the Writer or Scorer prompt to address these issues?"

---

# /prompt-update
> Update a prompt file with proper versioning. Always use this instead of editing prompts directly.
> Usage: /prompt-update [scorer|writer|brand-voice] "[description of change]"

Update a versioned prompt file safely.

Steps:
1. Read the current contents of `/prompts/[agent]-system.md`
2. Show the current version header
3. Ask user to describe the change they want (or use the argument provided)
4. Make the change
5. Update the version header at the top of the file:
   ```
   Version: X.Y → X.Y+1
   Changed: [date] → [description]
   Changed by: Suraj
   ```
6. Git commit with message: `prompt: [agent-name] - [description]`
7. Report: "Prompt updated to v[X.Y+1]. Previous version recoverable via git log."

IMPORTANT: Never let prompt changes be uncommitted. Every prompt change must be a git commit.

---

# /send-brief
> Send today's brief manually via Beehiiv API. Use if the auto-send failed.
> Usage: /send-brief [optional: preview-only to just create a draft without scheduling]

Manually send today's AI Signal brief.

Steps:
1. Check Supabase for today's brief — if not found, abort with error
2. Check pipeline_runs table — confirm pipeline completed successfully
3. Check Beehiiv API for any existing draft for today — if found, show status
4. If `preview-only`: create Beehiiv draft and return preview URL. Do NOT schedule.
5. If no argument: confirm with user ("Send to [N] subscribers?"), then:
   - POST to Beehiiv API with `send_at: "now"` (override scheduled send)
   - Log to pipeline_runs: `{manual_send: true, sent_at: timestamp}`
6. Return confirmation with Beehiiv post URL
