'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading progress bar. Driven by a passive scroll listener that writes
 * `width: N%` directly to the bar element. Respects prefers-reduced-motion
 * by zeroing out the CSS transition (the position still updates — just
 * without animation).
 */
export default function ReadingProgressClient() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.style.transition = 'none'
    }

    let rafId = 0
    let pending = false

    function read() {
      pending = false
      if (!el) return
      // Take the larger of documentElement / body — some layouts scroll the
      // body, some the html. Subtract the viewport to get the scrollable range.
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      )
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      const h = scrollHeight - window.innerHeight
      const pct = h > 0 ? Math.min(100, Math.max(0, (scrollTop / h) * 100)) : 0
      el.style.width = `${pct}%`
    }

    // Coalesce scroll/resize bursts to one read per animation frame to avoid
    // layout thrash on long pages.
    function schedule() {
      if (pending) return
      pending = true
      rafId = requestAnimationFrame(read)
    }

    // Defer the first read until after layout has settled — components below
    // mount asynchronously, so scrollHeight at useEffect time can be stale.
    rafId = requestAnimationFrame(read)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return <div ref={ref} className="progress" id="prog" aria-hidden="true" />
}
