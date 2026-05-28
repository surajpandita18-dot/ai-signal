import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

async function getLatestIssueNumber(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  const res = await fetch(
    `${url}/rest/v1/issues?select=issue_number&status=eq.published&order=published_at.desc&limit=1`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 300 },
    }
  )
  if (!res.ok) return null
  const rows = (await res.json()) as Array<{ issue_number: number }>
  return rows[0]?.issue_number ?? null
}

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
