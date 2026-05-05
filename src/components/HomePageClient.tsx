'use client'

import { useState, useEffect } from 'react'
import type { Database } from '../../db/types/database'
import type { DidYouKnowFact, TomorrowDraft, TickerData, PreviewCard } from '@/lib/types/extended-data'
import { SiteNav } from '@/components/SiteNav'
import { HeroZone } from '@/components/HeroZone'
import { HeroBridge } from '@/components/HeroBridge'
import { NotebookStrip } from '@/components/NotebookStrip'
import { StoryArticle } from '@/components/StoryArticle'
import { ReadingSidebar } from '@/components/ReadingSidebar'
import { ArchiveSection, type ArchiveIssue } from '@/components/ArchiveSection'
import { SubscribeSection } from '@/components/SubscribeSection'
import { SiteFooter } from '@/components/SiteFooter'

type StoryType = Database['public']['Tables']['stories']['Row']

interface UpcomingTeaser {
  dayOfWeek: string
  date: string
  text: string
  status: 'lead' | 'sealed'
}

interface HomePageClientProps {
  story: StoryType
  publishedAt: string
  signalNumber: number
  broadcastPhrases?: string[]
  teasers?: UpcomingTeaser[]
  archiveIssues?: ArchiveIssue[]
}

function ProgressBar({ pct }: { pct: number }) {
  return <div className="reading-progress-bar" style={{ width: `${pct}%` }} />
}

function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))

    // Immediately show anything already in the viewport
    els.forEach((el) => {
      const { top, bottom } = el.getBoundingClientRect()
      if (top < window.innerHeight && bottom > 0) {
        el.classList.add('in')
      }
    })

    // Watch the rest as they scroll into view
    const remaining = els.filter((el) => !el.classList.contains('in'))
    if (remaining.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    )
    remaining.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}

export function HomePageClient({ story, publishedAt, signalNumber, broadcastPhrases, teasers, archiveIssues }: HomePageClientProps) {
  const [readPct, setReadPct] = useState(0)

  // Extract extended_data fields with null-safety — DB jsonb is untyped at runtime
  const rawExt = story.extended_data as Record<string, unknown> | null
  const didYouKnowFacts = Array.isArray(rawExt?.did_you_know_facts)
    ? (rawExt!.did_you_know_facts as DidYouKnowFact[])
    : undefined
  const tomorrowDrafts = Array.isArray(rawExt?.tomorrow_drafts)
    ? (rawExt!.tomorrow_drafts as TomorrowDraft[])
    : undefined
  const tickers = Array.isArray(rawExt?.tickers)
    ? (rawExt!.tickers as TickerData[])
    : undefined
  const previewCards = Array.isArray(rawExt?.preview_cards)
    ? (rawExt!.preview_cards as PreviewCard[])
    : undefined

  // Derive issueDate and publishTime from publishedAt ISO string
  const publishedDate = publishedAt ? new Date(publishedAt) : new Date()
  const issueDate = publishedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const publishTime = '06:14 IST'

  return (
    <>
      <ProgressBar pct={readPct} />
      <SiteNav signalNumber={signalNumber} />
      <HeroZone
        issueDate={issueDate}
        publishTime={publishTime}
        readMinutes={story.read_minutes}
        phrases={broadcastPhrases ?? []}
        category={story.category ?? undefined}
        tickers={tickers}
        previewCards={previewCards}
      />
      <HeroBridge />
      <NotebookStrip facts={didYouKnowFacts} />

      {/* Main grid: article + sidebar */}
      <div className="main-article-grid">
        <StoryArticle
          story={story}
          publishedAt={publishedAt}
          signalNumber={signalNumber}
          onReadPctChange={setReadPct}
        />
        <ReadingSidebar readPct={readPct} signalNumber={signalNumber} teasers={teasers} drafts={tomorrowDrafts} />
      </div>

      <ArchiveSection issues={archiveIssues} />
      <SubscribeSection />
      <SiteFooter />

      <RevealObserver />
    </>
  )
}
