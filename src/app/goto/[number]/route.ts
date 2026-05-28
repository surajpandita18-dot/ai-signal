import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

async function getLatestIssueNumber(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 2000)

  try {
    const res = await fetch(
      `${url}/rest/v1/issues?select=issue_number&status=eq.published&order=published_at.desc&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: ac.signal }
    )
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ issue_number: number }>
    return rows[0]?.issue_number ?? null
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const issueNumber = parseInt(number, 10)
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

  let destination = `${base}/signal/${issueNumber}`

  try {
    const latest = await getLatestIssueNumber()
    if (latest === issueNumber) destination = base
  } catch {
    // timed out or DB error — fall through to article page
  }

  return NextResponse.redirect(destination, {
    status: 302,
    headers: {
      // CDN caches this redirect for 5 min — function only runs once per URL per 5 min
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  })
}
