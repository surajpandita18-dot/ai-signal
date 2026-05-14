import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SubscriberRole } from '../../../../db/types/database'

const VALID_ROLES: SubscriberRole[] = ['pm', 'founder', 'builder', 'curious']
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

export async function POST(req: NextRequest) {
  let email: string
  let roleRaw: string | undefined
  try {
    const body = await req.json()
    email = body.email
    roleRaw = body.role
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const role: SubscriberRole = VALID_ROLES.includes(roleRaw as SubscriberRole)
    ? (roleRaw as SubscriberRole)
    : 'curious'

  if (
    !email ||
    typeof email !== 'string' ||
    email.length < 3 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const unsubscribeToken = crypto.randomUUID()
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('subscribers').insert({
    email: email.toLowerCase().trim(),
    role,
    status: 'active',
    unsubscribe_token: unsubscribeToken,
  })

  if (error) {
    if (error.code === '23505') {
      // Already subscribed — treat as success, skip welcome email
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  // Send welcome email — never blocks subscription on failure
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`
    await resend.emails.send({
      from: 'AI Signal <onboarding@resend.dev>',
      to: email.toLowerCase().trim(),
      subject: 'Welcome to AI Signal ☕',
      text: `Hey,

Welcome to AI Signal.

Starting tomorrow, you'll get one AI story every morning at 6:14 IST. Gone in 24 hours.

No noise. No hype. Just the signal that matters for builders, PMs, and founders shipping AI products.

First signal arrives tomorrow.

— Suraj

P.S. Reply anytime. I read every message.

Unsubscribe: ${unsubscribeUrl}`,
    })
  } catch (emailError) {
    console.error('[subscribe] welcome email failed:', emailError)
  }

  return NextResponse.json({ ok: true })
}
