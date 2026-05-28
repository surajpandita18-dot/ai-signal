import { NextRequest } from 'next/server'

export const runtime = 'edge'

async function getLatestIssueNumber(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  try {
    const res = await fetch(
      `${url}/rest/v1/issues?select=issue_number&status=eq.published&order=published_at.desc&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Vercel Data Cache: shared across ALL Edge instances globally.
        // Only ONE real DB call per 5 min worldwide — everyone else hits cache.
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const rows = (await res.json()) as Array<{ issue_number: number }>
    return rows[0]?.issue_number ?? null
  } catch {
    return null
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
    // fall through to article page
  }

  // Use native Response (not NextResponse) to prevent Next.js from
  // overriding Cache-Control. Header is also set in next.config.mjs.
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
    },
  })
}
