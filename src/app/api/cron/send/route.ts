/**
 * Weekly cron — sends the latest published issue.
 *
 * Schedule (set in vercel.json, not here): Sat 02:30 UTC = 08:00 IST.
 * Vercel Cron only calls GET, so we only export GET.
 *
 * Auth: accept either Vercel's automatic `x-vercel-cron: 1` header OR a
 * `Authorization: Bearer ${CRON_SECRET}` for manual testing.
 *
 * Flow:
 *   1. Fetch latest published issue (status='published', published_at <= now).
 *   2. Skip if there's no such issue, or if it's older than 7 days
 *      (we already sent it last week — see note in report on adding a
 *      `sent_at` column in a follow-up migration).
 *   3. Render IssueEmail to a base HTML string once per issue.
 *   4. Pull active subscribers in batches of 100; per recipient, replace the
 *      YOUR_CODE and UNSUB_TOKEN template tokens in the base HTML, then send.
 *   5. Tiny inter-batch backoff to be kind to Resend.
 */

import { NextResponse } from 'next/server'
import * as React from 'react'
import { render } from '@react-email/render'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { resend } from '@/lib/resend'
import IssueEmail from '../../../../../emails/IssueEmail'
import type { IssueContent } from '@/lib/content-model'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BATCH_SIZE = 100
const BATCH_BACKOFF_MS = 50
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(req: Request) {
  // ── Auth ───────────────────────────────────────────────────────────────
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const auth = req.headers.get('authorization') ?? ''
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null
  const hasBearer = !!expected && auth === expected

  if (!isVercelCron && !hasBearer) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminSupabaseClient()

    // ── Find the latest published issue ────────────────────────────────
    const nowIso = new Date().toISOString()
    const { data: issue, error: issueErr } = await supabase
      .from('issues')
      .select('*')
      .eq('status', 'published')
      .lte('published_at', nowIso)
      .order('issue_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (issueErr) {
      console.error('[cron/send] issue lookup failed:', issueErr.message)
      return NextResponse.json(
        { ok: false, error: issueErr.message },
        { status: 500 },
      )
    }
    if (!issue) {
      return NextResponse.json({ skipped: true, reason: 'no published issue' })
    }

    // Skip if older than 7 days — proxy for "already sent last week".
    // (See report: a `sent_at` column is the proper fix in a follow-up
    // migration; this is the v1 invariant.)
    const publishedAt = issue.published_at ? Date.parse(issue.published_at) : 0
    if (Date.now() - publishedAt > SEVEN_DAYS_MS) {
      return NextResponse.json({
        skipped: true,
        reason: 'already sent',
        issue_number: issue.issue_number,
      })
    }

    // ── Build the IssueContent shape the email component needs ─────────
    const content: IssueContent = {
      issue_number: issue.issue_number,
      slug: issue.slug,
      status: issue.status,
      published_at: issue.published_at,
      date_display: issue.date_display,
      read_time_min: issue.read_time_min,
      streak_caption: issue.streak_caption,
      hero_eyebrow: issue.hero_eyebrow,
      hero_headline_html: issue.hero_headline_html,
      hero_sub_html: issue.hero_sub_html,
      tldr: issue.tldr,
      one_thing: issue.one_thing,
      so_what: issue.so_what,
      build_notes: issue.build_notes,
      job_signal: issue.job_signal,
      under_the_hood: issue.under_the_hood,
      the_rep: issue.the_rep,
      toolbox: issue.toolbox,
      reality_check: issue.reality_check,
      india_signal: issue.india_signal,
      sponsor: issue.sponsor,
      // Pass decoder through when the row carries it. Until the
      // 20260612000001_add_decoder migration is applied to the live DB,
      // issue.decoder is undefined at runtime; coerce to null so the email
      // component renders the (empty) branch cleanly. Once the column lands
      // and an issue populates it, the email picks it up automatically.
      decoder: issue.decoder ?? null,
      closer: issue.closer,
      poll: issue.poll,
      foot: issue.foot,
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibasically.co'

    // ── Render once. Per-recipient swaps happen on the HTML string. ────
    const baseHtml = await render(
      React.createElement(IssueEmail, { content, siteUrl }),
    )

    // ── Subject line ───────────────────────────────────────────────────
    // Decision: use the eyebrow as the subject prefix only if the first
    // TLDR item is missing or generic; otherwise prefer the first TLDR's
    // body (more compelling — TLDR is hand-tightened by the editor).
    // Falls back to a stable template when neither is available.
    const firstTldr = Array.isArray(content.tldr) ? content.tldr[0] : undefined
    const tldrBody = firstTldr?.body?.trim() ?? ''
    const subject =
      tldrBody.length >= 20
        ? `AI, Basically. — ${tldrBody.slice(0, 90)}`
        : `AI, Basically. — ${content.hero_eyebrow}`

    const replyTo = process.env.EMAIL_REPLY_TO

    // ── Loop over active subscribers in batches ────────────────────────
    let sent = 0
    let failed = 0
    let offset = 0

    while (true) {
      const { data: subs, error: subErr } = await supabase
        .from('subscribers')
        .select('email, referral_code, unsubscribe_token')
        .eq('status', 'active')
        .order('subscribed_at', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1)

      if (subErr) {
        console.error('[cron/send] subscribers fetch failed:', subErr.message)
        return NextResponse.json(
          { ok: false, error: subErr.message, sent, failed },
          { status: 500 },
        )
      }
      if (!subs || subs.length === 0) break

      // Send each batch in parallel (Promise.allSettled — one bad email
      // doesn't kill the run).
      const results = await Promise.allSettled(
        subs.map(async (sub) => {
          const html = baseHtml
            .replaceAll('YOUR_CODE', sub.referral_code)
            .replaceAll('UNSUB_TOKEN', sub.unsubscribe_token)
          const client = resend()
          const from = process.env.EMAIL_FROM
          if (!from) throw new Error('EMAIL_FROM env var is not set')
          // Gmail's 2024+ bulk-sender rules: List-Unsubscribe + One-Click.
          // Reduces Promotions-tab incidence and is effectively required at
          // scale. The URL is the per-recipient unsubscribe token endpoint.
          const unsubUrl = `${siteUrl}/u/${sub.unsubscribe_token}`
          return client.emails.send({
            from,
            to: [sub.email],
            subject,
            html,
            replyTo,
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          })
        }),
      )

      for (const r of results) {
        if (r.status === 'fulfilled') {
          // Resend returns { data, error } even on a 200 — surface a
          // logical-error as a failure.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const v = r.value as any
          if (v && v.error) {
            failed += 1
            console.error('[cron/send] resend logical error:', v.error)
          } else {
            sent += 1
          }
        } else {
          failed += 1
          console.error('[cron/send] send rejected:', String(r.reason))
        }
      }

      if (subs.length < BATCH_SIZE) break
      offset += BATCH_SIZE
      // Tiny backoff between batches.
      await new Promise((r) => setTimeout(r, BATCH_BACKOFF_MS))
    }

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      issue_number: issue.issue_number,
      slug: issue.slug,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/send] unhandled:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
