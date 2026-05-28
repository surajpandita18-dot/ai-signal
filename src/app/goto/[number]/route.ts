import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

const getLatestIssueNumber = unstable_cache(
  async (): Promise<number | null> => {
    const supabase = createAdminSupabaseClient()
    const { data } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.issue_number ?? null
  },
  ['latest-issue-number'],
  { revalidate: 300 }
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const issueNumber = parseInt(number, 10)
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

  try {
    const latest = await getLatestIssueNumber()
    if (latest === issueNumber) {
      return NextResponse.redirect(base, { status: 302 })
    }
  } catch {
    // DB error — fall through to article page
  }

  return NextResponse.redirect(`${base}/signal/${issueNumber}`, { status: 302 })
}
