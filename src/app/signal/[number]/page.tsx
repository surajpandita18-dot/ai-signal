import React from 'react'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SignalGate } from '@/components/SignalGate'
import { SignalPageClient } from '@/components/SignalPageClient'
import { isWithin24h } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ number: string }>
}

async function fetchSignal(signalNumber: number) {
  const supabase = await createServerSupabaseClient()
  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .eq('issue_number', signalNumber)
    .in('status', ['published', 'no_signal'])
    .maybeSingle()
  if (!issue) return null

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('issue_id', issue.id)
    .order('position', { ascending: true })
    .limit(1)

  return { issue, story: stories && stories.length > 0 ? stories[0] : null }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

function buildDescription(summary: string, whyItMatters: string): string {
  const strip = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
  const truncate = (s: string) => s.length <= 155 ? s : s.slice(0, s.lastIndexOf(' ', 152)) + '...'
  const s = strip(summary)
  if (s.length >= 100) return truncate(s)
  const first = strip(whyItMatters.split(/\.\s+/)[0].replace(/\.$/, ''))
  return truncate(`${s}. ${first}.`)
}

export async function generateMetadata({ params }: PageProps) {
  const { number } = await params
  const n = parseInt(number, 10)
  if (isNaN(n)) return { title: 'AI Signal' }

  const result = await fetchSignal(n)
  if (!result) return { title: 'AI Signal' }

  const headline = result.story?.headline ?? `Signal #${n}`
  const summary = result.story?.summary ?? ''
  const whyItMatters = result.story?.why_it_matters ?? ''
  const description = buildDescription(
    summary || 'One story. Every day. Gone in 24 hours.',
    whyItMatters
  )
  const title = `Signal #${n} — ${headline}`
  const url = `${SITE_URL}/signal/${n}`
  const ogImage = `${SITE_URL}/og/${n}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'AI Signal',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: headline }],
      authors: ['AI Signal'],
      publishedTime: result.issue.published_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function SignalPage({ params }: PageProps) {
  const { number } = await params
  const n = parseInt(number, 10)
  if (isNaN(n)) notFound()

  const result = await fetchSignal(n)
  if (!result) notFound()

  const { issue, story } = result

  const gateStyle: React.CSSProperties = {
    maxWidth: 720,
    margin: '64px auto 80px',
    padding: '0 32px',
  }

  // No signal day
  if (issue.status === 'no_signal') {
    return (
      <>
        <SiteNav signalNumber={issue.issue_number} />
        <main style={gateStyle}>
          <p
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-mute)',
              marginBottom: '16px',
            }}
          >
            Signal #{issue.issue_number} — No signal today.
          </p>
          {issue.editor_note && (
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text)' }}>
              {issue.editor_note}
            </p>
          )}
        </main>
        <SiteFooter />
      </>
    )
  }

  // In development always show the full article so we can iterate on design
  const isDev = process.env.NODE_ENV !== 'production'
  const active = isDev || (issue.published_at ? isWithin24h(issue.published_at) : false)

  // Past 24h — non-subscriber gate (prod only)
  if (!active) {
    return (
      <>
        <SiteNav signalNumber={issue.issue_number} />
        <main style={gateStyle}>
          <SignalGate
            headline={story?.headline ?? ''}
            publishedAt={issue.published_at ?? new Date().toISOString()}
            signalNumber={issue.issue_number}
          />
        </main>
        <SiteFooter />
      </>
    )
  }

  // Active signal — full editorial layout
  return (
    <>
      <SiteNav signalNumber={issue.issue_number} />
      <SignalPageClient
        story={story}
        issue={issue}
        signalNumber={issue.issue_number}
      />
      <SiteFooter />
    </>
  )
}
