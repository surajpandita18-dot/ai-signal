'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SiteNavProps {
  signalNumber?: number
}

export function SiteNav({ signalNumber }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(docHeight > 0 ? Math.min(1, y / docHeight) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-nav-inner${scrolled ? ' site-nav-shadow' : ''}`}>
      {/* Wordmark */}
      <div className="nav-mark anim d1">
        <div className="nav-mark-icon-wrap">
          <svg
            className="nav-mark-icon-svg"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <circle cx="18" cy="18" r="16" className="nav-ring-bg" />
            <circle
              cx="18" cy="18" r="16"
              className="nav-ring-fill"
              strokeDashoffset={100.5 * (1 - scrollPct)}
            />
          </svg>
          <div className="nav-mark-icon-center">
            <div className="nav-mark-icon-box">
              S
              <span className="nav-mark-icon-pip" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="nav-mark-text">
          <span className="nav-mark-name">
            AI{' '}
            <em className="ital">Signal</em>
          </span>
          <span className="nav-mark-tag">daily signal</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="nav-meta anim d1" aria-label="Site navigation">
        <Link href="/archive" className="nav-cta-link">Archive</Link>

        <button
          type="button"
          className="nav-soon"
          data-soon="Live with your subscription"
          aria-disabled="true"
          disabled
        >
          About<span className="nav-soon-dot" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="nav-soon"
          data-soon="Live with your subscription"
          aria-disabled="true"
          disabled
        >
          Sponsor<span className="nav-soon-dot" aria-hidden="true" />
        </button>

        <a href="#subscribe" className="nav-cta-link">Subscribe →</a>
      </nav>
    </header>
  )
}
