'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  primaryLabel: string
  labels: string[]
  children: ReactNode
}

/**
 * Renders the track-picker chip bar above the lenses, and toggles the
 * `.dim` class on lens children (matched by `[data-lens-i]`) based on
 * the chip selection. Default: "Show all" is .on .kesari, no lens dimmed.
 *
 * Source of truth: <script> block, function #1, in ai-basically-FINAL.html.
 */
export default function LensTrackPicker({ primaryLabel, labels, children }: Props) {
  // selected = null means "Show all".
  const [selected, setSelected] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // primaryLabel is part of the contract (so the parent can declare which
  // lens is "this week's deep one"), but the chip rendering uses `labels`
  // directly. Reference it to keep the prop meaningful and silence TS.
  void primaryLabel

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const lenses = root.querySelectorAll<HTMLElement>('[data-lens-i]')
    lenses.forEach((el) => {
      const i = Number(el.dataset.lensI)
      if (selected === null) {
        el.classList.remove('dim')
      } else {
        el.classList.toggle('dim', i !== selected)
      }
    })
  }, [selected])

  return (
    <div ref={containerRef}>
      <div className="track-bar sticky-mobile">
        <button
          type="button"
          className={`track-chip${selected === null ? ' on kesari' : ''}`}
          onClick={() => setSelected(null)}
          aria-pressed={selected === null}
          style={{ font: 'inherit' }}
        >
          Show all
        </button>
        {labels.map((name, i) => (
          <button
            key={i}
            type="button"
            className={`track-chip${selected === i ? ' on' : ''}`}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            style={{ font: 'inherit' }}
          >
            {name}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}
