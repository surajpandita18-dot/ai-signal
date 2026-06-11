---
name: Subscription System Audit
description: Full diagnostic of subscribe UI, API, DB, and email delivery as of 2026-05-07
type: project
---

# Subscription System Audit — 2026-05-07

## Current State (one paragraph)

The **collection half is complete**: UI exists, API route works, Supabase `subscribers` table is live, and emails are stored correctly (1 real row confirmed). The **delivery half does not exist**: no email service is integrated, no confirmation email fires, no welcome email fires, no daily dispatch sends to subscribers. Subscribers are collected into a database that nothing reads.

---

## What Works

| Component | Status | Notes |
|---|---|---|
| `SubscribeSection.tsx` | ✅ Full UI | Homepage black card with email input |
| `SubscribeInput.tsx` | ✅ Full UI | Inline form used in sidebar/nav contexts |
| `POST /api/subscribe` | ✅ Works | Validates email, inserts to Supabase, handles duplicate (409→200) |
| `subscribers` table | ✅ Live | Fields: id, email, role, status, subscribed_at, unsubscribe_token |
| Duplicate handling | ✅ Correct | `error.code === '23505'` returns ok:true silently |
| Role capture | ✅ Schema ready | `SubscriberRole`: pm / founder / builder / curious — passed in body |
| `unsubscribe_token` | ✅ Generated | `crypto.randomUUID()` on insert — token stored but never used |

---

## What's Missing

### 1. No email service installed
- No `resend`, `sendgrid`, `nodemailer`, `loops`, `postmark`, or `brevo` in `package.json`
- No email API key in `.env.local`
- The `formula-evolution` cron mentions Resend by name as the intended integration ("After 30 days, replace heuristic judge with actual subscriber open rates from Resend") — Resend is the planned choice

### 2. No confirmation / double opt-in email
- `/api/subscribe` inserts directly to `active` status
- No email sent to confirm the address is real
- GDPR risk: no proof of consent

### 3. No welcome email
- After subscribe → Supabase insert → silence
- User sees "You're in. See you tomorrow at 06:14 IST." but receives nothing

### 4. No daily dispatch to subscribers
- `generate-signal.ts` generates content but sends nothing
- `daily-signal` cron triggers Inngest, Inngest generates the story — no step reads `subscribers` table
- Subscribers are a dead-end list

### 5. No unsubscribe flow
- `unsubscribe_token` generated but never used
- No `/unsubscribe?token=...` route exists
- No unsubscribe link to put in emails

### 6. No role-segmented content
- `SubscribeSection` submits no role — defaults to `curious` for everyone
- Only `SubscribeInput` could pass a role if the parent provided one
- `formula-evolution` cron notes this gap: "Wire the role pick from subscribe flow. Send role-specific email variant."

---

## Gap Map

```
User enters email → POST /api/subscribe → Supabase insert ✅
                                                  ↓
                                    [NOTHING HAPPENS AFTER THIS]
                                                  ↓
                           Should be: confirmation email → verified
                                         → welcome email
                                         → daily 06:14 dispatch
                                         → unsubscribe link in every email
```

---

## Estimated Fix Time

| Scope | Time | Description |
|---|---|---|
| **Minimal** (collect + confirm) | **2–3 hr** | Add Resend, fire confirmation email on subscribe, add unsubscribe route |
| **Standard** (full launch-ready) | **5–7 hr** | Above + welcome email + daily digest Inngest step that reads subscribers and sends via Resend |
| **Full** (role-segmented) | **8–10 hr** | Above + role capture in UI + per-role email variants + open-rate tracking |

**Recommended starting point:** Minimal (2–3 hr) — gets real subscribers receiving real emails before launch. Daily dispatch can come in the next sprint.

---

## Recommended Stack

- **Email service:** Resend (already named in codebase comments, good Next.js SDK, free tier 3k/month)
- **Transactional emails:** Resend React email templates
- **Daily dispatch:** New Inngest step `send-daily-digest` that queries `subscribers WHERE status='active'` and fires one email per subscriber

---

## Files to Create/Edit for Fix

| File | Change |
|---|---|
| `.env.local` | Add `RESEND_API_KEY` |
| `package.json` | Add `resend` package |
| `src/app/api/subscribe/route.ts` | Fire confirmation email after insert |
| `src/app/api/unsubscribe/route.ts` | New route — validate token, set status='unsubscribed' |
| `src/inngest/generate-signal.ts` | Add `send-daily-digest` step after story published |
| `src/components/SubscribeSection.tsx` | Add role selector to capture pm/founder/builder/curious |

---

## Subscriber Count
- **1 row** in DB (test entry from 2026-04-27)
- Email: `test***` (redacted), role: pm, status: active
