import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const issueNumber = parseInt(number, 10)
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

  try {
    const supabase = createAdminSupabaseClient()
    const { data: latest } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest?.issue_number === issueNumber) {
      // Still the active story — homepage features it
      return NextResponse.redirect(base, { status: 302 })
    }
  } catch {
    // On any DB error, fall through to article page
  }

  // Old story — go to specific article
  return NextResponse.redirect(`${base}/signal/${issueNumber}`, { status: 302 })
}
