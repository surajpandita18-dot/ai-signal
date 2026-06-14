/**
 * OG image for an issue page. Specced in CLAUDE.md; built here.
 *
 * URL: /og/<slug>  e.g. /og/001
 *
 * Renders a 1200×630 social card matching the brand palette (cream paper,
 * oxblood accent, warm-black ink, Fraunces serif headline). When the slug
 * doesn't resolve to a published row, returns a neutral fallback card so
 * link previews never break — never returns an error image.
 *
 * Vercel + Next 15: ImageResponse runs on the Node runtime here so it can
 * reach Supabase via the server client; fonts are fetched on cold start and
 * cached for the function lifetime.
 */
import { ImageResponse } from 'next/og'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

// Brand tokens (kept in sync with src/styles/tokens.css).
const BG = '#F4F1E8'
const INK = '#191712'
const ACCENT = '#9C4A2E'
const GREY = '#6F6A60'
const HAIR = '#DCD6C8'

// Cache the OG image at the edge. The underlying issue content doesn't change
// after publish; revalidate hourly is plenty for a social-share card.
export const revalidate = 3600

function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchFromJson(
  slug: string,
): Promise<{ issue_number: number; date_display: string; hero_headline_html: string } | null> {
  try {
    const file = path.join(process.cwd(), 'content/issues', `${slug}.json`)
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw) as {
      issue_number: number
      date_display: string
      hero_headline_html: string
    }
    return parsed
  } catch {
    return null
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ issue: string }> },
) {
  const { issue: slug } = await ctx.params

  // Pull issue from Supabase; fall back to the seed JSON when the DB lookup
  // misses (mirrors the issue page's fallback behavior so OG works in QA too).
  let issue_number = 0
  let date_display = ''
  let headline = ''

  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('issue_number, date_display, hero_headline_html')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (data) {
    issue_number = data.issue_number
    date_display = data.date_display
    headline = stripHtml(data.hero_headline_html)
  } else {
    const seed = await fetchFromJson(slug)
    if (seed) {
      issue_number = seed.issue_number
      date_display = seed.date_display
      headline = stripHtml(seed.hero_headline_html)
    } else {
      // Neutral fallback so link previews never break.
      headline = 'Explained like a normal person would.'
      date_display = 'Weekly · Saturday 08:00 IST'
    }
  }

  const padded = issue_number > 0 ? String(issue_number).padStart(3, '0') : ''

  // Headline length governs font size. Long headlines (think regulator-speak
  // or a multi-clause title) drop to 64px so they still fit two lines on the
  // 1200×630 canvas without truncating.
  const headlineSize = headline.length > 80 ? 64 : headline.length > 50 ? 76 : 88

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          fontFamily: 'serif',
          color: INK,
          position: 'relative',
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingBottom: 24,
            borderBottom: `2px solid ${INK}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>
              AI, Basically
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: ACCENT,
                marginLeft: 1,
              }}
            >
              .
            </span>
          </div>
          {padded && (
            <span
              style={{
                fontSize: 18,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: GREY,
                fontFamily: 'sans-serif',
                fontWeight: 600,
              }}
            >
              № {padded} · {date_display}
            </span>
          )}
        </div>

        {/* Headline */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: headlineSize,
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: INK,
              maxWidth: 1040,
            }}
          >
            {headline}
          </div>
        </div>

        {/* Footer line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 20,
            borderTop: `1px solid ${HAIR}`,
            fontFamily: 'sans-serif',
            fontSize: 18,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: GREY,
          }}
        >
          <span>Explained like a normal person would.</span>
          <span style={{ color: ACCENT, fontWeight: 600 }}>
            ai-signal-eta.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
