import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SubscriberRole } from '../../../../db/types/database'

const VALID_ROLES: SubscriberRole[] = ['pm', 'founder', 'builder', 'curious']

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

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('subscribers').insert({
    email: email.toLowerCase().trim(),
    role,
    status: 'active',
    unsubscribe_token: crypto.randomUUID(),
  })

  if (error) {
    if (error.code === '23505') {
      // Already subscribed — treat as success
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
