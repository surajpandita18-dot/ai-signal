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

    function update() {
      if (!el) return
      const h = document.documentElement.scrollHeight - window.innerHeight
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0
      el.style.width = `${pct}%`
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div ref={ref} className="progress" id="prog" aria-hidden="true" />
}
