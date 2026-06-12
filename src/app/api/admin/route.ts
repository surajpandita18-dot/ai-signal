// TEMPORARY admin route — collapses 3 one-shot bootstrap tasks behind ?action=:
//   ?action=publish-002 / publish-003 — read content/issues/<slug>.json and
//     upsert as published. Idempotent.
//   ?action=send-test  — render IssueEmail for ?slug= and send via Resend to
//     ?to=. For email-flow QA. Bypasses the cron-only auth gate.
// Auth: hardcoded ?key= param. Will be deleted in the very next commit once
// it has done its work.
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { render } from '@react-email/render'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { resend } from '@/lib/resend'
import IssueEmail from '../../../../emails/IssueEmail'
import type { IssueContent } from '@/lib/content-model'

const KEY = 'aibasically-bootstrap-2026-06-12'

async function readIssue(slug: string): Promise<IssueContent> {
  const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
  return JSON.parse(await readFile(file, 'utf8')) as IssueContent
}

async function upsertPublished(slug: string) {
  const c = await readIssue(slug)
  const supabase = createAdminSupabaseClient()

  const { data: existing } = await supabase
    .from('issues')
    .select('id, status')
    .eq('slug', c.slug)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'published') {
      return { status: 'already_published', id: existing.id }
    }
    const { error } = await supabase
      .from('issues')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('slug', c.slug)
    if (error) throw new Error(`update_failed: ${error.message}`)
    return { status: 'bumped_to_published', id: existing.id }
  }

  const { error: insertErr } = await supabase.from('issues').insert({
    issue_number: c.issue_number,
    slug: c.slug,
    status: 'published',
    published_at: new Date().toISOString(),
    hero_eyebrow: c.hero_eyebrow,
    hero_headline_html: c.hero_headline_html,
    hero_sub_html: c.hero_sub_html,
    date_display: c.date_display,
    read_time_min: c.read_time_min,
    streak_caption: c.streak_caption,
    tldr: c.tldr,
    one_thing: c.one_thing,
    so_what: c.so_what,
    build_notes: c.build_notes,
    job_signal: c.job_signal,
    under_the_hood: c.under_the_hood,
    the_rep: c.the_rep,
    toolbox: c.toolbox,
    reality_check: c.reality_check,
    india_signal: c.india_signal,
    sponsor: c.sponsor,
    closer: c.closer,
    poll: c.poll,
    foot: c.foot,
  })
  if (insertErr) throw new Error(`insert_failed: ${insertErr.message}`)
  return { status: 'inserted_and_published' }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== KEY) {
    return new NextResponse('nope', { status: 401 })
  }
  const action = url.searchParams.get('action')

  try {
    if (action === 'publish-002' || action === 'publish-003') {
      const slug = action === 'publish-002' ? '002' : '003'
      const result = await upsertPublished(slug)
      return NextResponse.json({ action, ...result })
    }

    if (action === 'send-test') {
      const slug = url.searchParams.get('slug') ?? '001'
      const to = url.searchParams.get('to')
      if (!to) {
        return NextResponse.json({ error: 'missing_to_param' }, { status: 400 })
      }
      const c = await readIssue(slug)
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'
      const html = await render(IssueEmail({ content: c, siteUrl }))

      // Use a stable demo token for the test — no per-recipient interpolation.
      const demoHtml = html
        .replaceAll('YOUR_CODE', 'demo-code')
        .replaceAll('UNSUB_TOKEN', 'demo-unsub')

      const subjectKicker =
        c.tldr[0]?.body && c.tldr[0].body.length >= 20
          ? c.tldr[0].body
          : c.hero_eyebrow
      const subject = `AI, Basically. — ${subjectKicker}`

      const { data, error } = await resend().emails.send({
        from: process.env.EMAIL_FROM ?? 'hello@aibasically.co',
        to: [to],
        subject,
        html: demoHtml,
        headers: {
          'List-Unsubscribe': `<${siteUrl}/u/demo-unsub>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (error) {
        return NextResponse.json({ error: 'send_failed', detail: error }, { status: 500 })
      }
      return NextResponse.json({ status: 'sent', id: data?.id, to, subject })
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json(
      { error: 'admin_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
