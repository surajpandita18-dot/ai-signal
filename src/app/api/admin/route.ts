// TEMPORARY one-shot route — sends Issue <slug> (or welcome) to <to> via
// Resend, using the same render path the weekly cron uses. Key-gated.
// Deleted in the very next commit.
import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { render } from '@react-email/render'
import { resend } from '@/lib/resend'
import IssueEmail from '../../../../emails/IssueEmail'
import WelcomeEmail from '../../../../emails/WelcomeEmail'
import type { IssueContent } from '@/lib/content-model'

const KEY = 'aibasically-send-2026-06-12'

export async function POST(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== KEY) {
    return new NextResponse('nope', { status: 401 })
  }
  const action = url.searchParams.get('action')
  const to = url.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'missing_to' }, { status: 400 })

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

  try {
    if (action === 'welcome') {
      const html = await render(WelcomeEmail({ siteUrl, unsubscribeToken: 'demo' }))
      const { data, error } = await resend().emails.send({
        from: process.env.EMAIL_FROM ?? 'hello@aibasically.co',
        to: [to],
        subject: 'You’re in. First issue Saturday 08:00 IST.',
        html,
        headers: {
          'List-Unsubscribe': `<${siteUrl}/u/demo>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      if (error) return NextResponse.json({ error: 'send_failed', detail: error }, { status: 500 })
      return NextResponse.json({ status: 'sent', type: 'welcome', id: data?.id, to })
    }

    if (action === 'issue') {
      const slug = url.searchParams.get('slug') ?? '003'
      const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
      const c = JSON.parse(await readFile(file, 'utf8')) as IssueContent
      const html = await render(IssueEmail({ content: c, siteUrl }))
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
      if (error) return NextResponse.json({ error: 'send_failed', detail: error }, { status: 500 })
      return NextResponse.json({ status: 'sent', type: 'issue', slug, id: data?.id, to, subject })
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json(
      { error: 'admin_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
