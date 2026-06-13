'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

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
  const barRef = useRef<HTMLDivElement>(null)

  // Roving-tabindex arrow-key navigation between chips.
  // Index 0 = "Show all"; indices 1..labels.length map to labels[i-1].
  const totalChips = labels.length + 1
  const focusedIndex = selected === null ? 0 : selected + 1

  function focusChip(i: number) {
    const bar = barRef.current
    if (!bar) return
    const chips = bar.querySelectorAll<HTMLButtonElement>('button.track-chip')
    const next = chips[i]
    if (next) next.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const key = e.key
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return
    e.preventDefault()
    let next = focusedIndex
    if (key === 'ArrowRight') next = (focusedIndex + 1) % totalChips
    else if (key === 'ArrowLeft') next = (focusedIndex - 1 + totalChips) % totalChips
    else if (key === 'Home') next = 0
    else if (key === 'End') next = totalChips - 1
    setSelected(next === 0 ? null : next - 1)
    focusChip(next)
  }

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
      <div
        ref={barRef}
        className="track-bar sticky-mobile"
        role="toolbar"
        aria-label="Filter lenses"
        onKeyDown={onKeyDown}
      >
        <button
          type="button"
          className={`track-chip${selected === null ? ' on kesari' : ''}`}
          onClick={() => setSelected(null)}
          aria-pressed={selected === null}
          tabIndex={focusedIndex === 0 ? 0 : -1}
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
            tabIndex={focusedIndex === i + 1 ? 0 : -1}
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
