'use client'

import { useState, useEffect } from 'react'
import type { Database } from '../../db/types/database'
import { SiteNav } from '@/components/SiteNav'
import { HeroZone } from '@/components/HeroZone'
import { HeroBridge } from '@/components/HeroBridge'
import { NotebookFacts } from '@/components/NotebookFacts'
import { StoryArticle } from '@/components/StoryArticle'
import { ReadingSidebar } from '@/components/ReadingSidebar'
import { ArchiveSection } from '@/components/ArchiveSection'
import { SubscribeSection } from '@/components/SubscribeSection'
import { SiteFooter } from '@/components/SiteFooter'

type StoryType = Database['public']['Tables']['stories']['Row']

interface HomePageClientProps {
  story: StoryType
  publishedAt: string
  signalNumber: number
  broadcastPhrases?: string[]
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 3,
        zIndex: 100,
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #2B5BFF, #FF6B35)',
        transition: 'width 0.1s linear',
      }}
    />
  )
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

export function HomePageClient({ story, publishedAt, signalNumber, broadcastPhrases }: HomePageClientProps) {
  const [readPct, setReadPct] = useState(0)

  return (
    <>
      <style>{`
        .main-article-grid {
          max-width: 1280px;
          margin: 60px auto 0;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 1080px) {
          .main-article-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .main-article-grid aside {
            position: static !important;
          }
        }
        @media (max-width: 640px) {
          .main-article-grid {
            padding: 0 16px;
            margin-top: 40px;
          }
        }
      `}</style>
      <ProgressBar pct={readPct} />
      <SiteNav signalNumber={signalNumber} />
      <HeroZone broadcastPhrases={broadcastPhrases} />
      <HeroBridge />
      <NotebookFacts />

      {/* Main grid: article + sidebar */}
      <div className="main-article-grid">
        <StoryArticle
          story={story}
          publishedAt={publishedAt}
          signalNumber={signalNumber}
          onReadPctChange={setReadPct}
        />
        <ReadingSidebar readPct={readPct} signalNumber={signalNumber} />
      </div>

      <ArchiveSection />
      <SubscribeSection />
      <SiteFooter />

      <RevealObserver />
    </>
  )
}
