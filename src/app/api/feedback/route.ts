import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

const VALID_RATINGS = ['changed', 'thinking', 'good_to_know', 'not_relevant'] as const
type Rating = typeof VALID_RATINGS[number]

const RATING_LABELS: Record<Rating, string> = {
  changed:      '🟢 Changed something I\'m building',
  thinking:     '🟡 Made me think differently',
  good_to_know: '🔵 Good to know',
  not_relevant: '⚪ Not relevant today',
}

export async function POST(req: NextRequest) {
  let rating: string, message: string | undefined, replyEmail: string | undefined, signalNumber: number | undefined
  try {
    const body = await req.json()
    rating       = body.rating
    message      = body.message?.trim() || undefined
    replyEmail   = body.reply_email?.trim() || undefined
    signalNumber = body.signal_number ? Number(body.signal_number) : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!VALID_RATINGS.includes(rating as Rating)) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  // 1. Save to Supabase (best-effort — doesn't block response)
  try {
    const supabase = createAdminSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('feedback').insert({
      rating,
      message:       message ?? null,
      reply_email:   replyEmail ?? null,
      signal_number: signalNumber ?? null,
      source:        'website',
    })
  } catch { /* table may not exist yet — email still goes out */ }

  // 2. Email Suraj with the feedback
  try {
    const resend  = new Resend(process.env.RESEND_API_KEY)
    const from    = process.env.EMAIL_FROM ?? 'AI Signal <signal@getaisignal.org>'
    const subject = `💬 Feedback — ${RATING_LABELS[rating as Rating]}`
    const signalLine = signalNumber ? `Signal: #${signalNumber}\n` : ''
    const messageLine = message ? `\nMessage:\n${message}\n` : ''
    const replyLine = replyEmail ? `\nReply to: ${replyEmail}` : ''

    await resend.emails.send({
      from,
      to:      'surajpandita18@gmail.com',
      subject,
      text:    `New feedback on AI Signal\n\n${signalLine}Rating: ${RATING_LABELS[rating as Rating]}\n${messageLine}${replyLine}`,
      html:    `<p><strong>New feedback on AI Signal</strong></p>${signalNumber ? `<p>Signal: #${signalNumber}</p>` : ''}<p>Rating: ${RATING_LABELS[rating as Rating]}</p>${message ? `<p>Message:</p><blockquote>${message}</blockquote>` : ''}${replyEmail ? `<p>Reply to: <a href="mailto:${replyEmail}">${replyEmail}</a></p>` : ''}`,
      ...(replyEmail ? { replyTo: replyEmail } : {}),
    })
  } catch (err) {
    console.error('[feedback] email failed:', err)
  }

  return NextResponse.json({ ok: true })
}
