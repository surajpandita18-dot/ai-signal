import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const REF_CODE_RE = /^[A-Za-z0-9_-]{4,32}$/

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  const homeUrl = new URL('/', req.url)
  const res = NextResponse.redirect(homeUrl, { status: 302 })
  // Attribution redirect must never be cached by browsers/CDNs — each visit
  // needs to actually hit this route so the cookie gets set.
  res.headers.set('Cache-Control', 'no-store, max-age=0')

  if (!code || typeof code !== 'string' || !REF_CODE_RE.test(code)) {
    return res
  }

  const supabase = createAdminSupabaseClient()
  const { data: referrer } = await supabase
    .from('subscribers')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (referrer) {
    res.cookies.set('aib_ref', code, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: REF_COOKIE_MAX_AGE,
    })
  }

  return res
}
