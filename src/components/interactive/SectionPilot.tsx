'use client'

/**
 * SectionPilot — a small "you are here" navigator for issue pages.
 *
 * Renders a calm pill at the bottom-right that:
 *   - stays hidden until the reader scrolls past the hero
 *   - shows the currently-visible section (§{n} · {label})
 *   - on tap, opens a compact list of every anchor in the issue
 *   - tap any entry to jump (smooth scroll, respects prefers-reduced-motion)
 *   - dismisses on outside click / Escape
 *
 * Watches DOM elements with the IDs we wire in the page: `sec-01`..`sec-08`,
 * `bn`, `decoder`, `closer`. Order is the visual reading order of the issue.
 */
import { useEffect, useRef, useState } from 'react'

type NavItem = { id: string; label: string }

const ITEMS: NavItem[] = [
  { id: 'sec-01', label: '01 · The One Thing' },
  { id: 'sec-02', label: '02 · So What For Me?' },
  { id: 'bn',     label: '◆ Build Notes' },
  { id: 'sec-03', label: '03 · Job Signal' },
  { id: 'sec-04', label: '04 · Under the Hood' },
  { id: 'sec-05', label: '05 · The Rep' },
  { id: 'sec-06', label: '06 · Toolbox' },
  { id: 'sec-07', label: '07 · Reality Check' },
  { id: 'sec-08', label: '08 · India Signal' },
  { id: 'decoder', label: '◆ Decoder' },
  { id: 'closer', label: '◆ One Last Thing' },
]

export default function SectionPilot() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('sec-01')
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // Show after hero; pick the section with the most viewport coverage.
  useEffect(() => {
    const heroEl = document.querySelector('.hero')
    const sectionEls = ITEMS.map((it) =>
      document.getElementById(it.id),
    ).filter((el): el is HTMLElement => el !== null)

    if (!heroEl) {
      setVisible(true)
    } else {
      const heroObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            // Show pilot only AFTER the hero leaves the viewport.
            setVisible(!e.isIntersecting)
          }
        },
        { rootMargin: '-30% 0px 0px 0px', threshold: 0 },
      )
      heroObs.observe(heroEl)
    }

    if (sectionEls.length === 0) return

    let ratios = new Map<string, number>()
    const secObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.intersectionRatio)
        }
        // Pick the most visible section.
        let bestId = activeId
        let bestRatio = -1
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r
            bestId = id
          }
        }
        if (bestRatio > 0) setActiveId(bestId)
      },
      { threshold: [0.05, 0.25, 0.5, 0.75, 1] },
    )
    sectionEls.forEach((el) => secObs.observe(el))

    return () => {
      secObs.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDoc(ev: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(ev.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!visible) return null

  const active = ITEMS.find((it) => it.id === activeId) ?? ITEMS[0]

  return (
    <div
      ref={wrapRef}
      className="section-pilot"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 50,
        fontFamily: "'Archivo Narrow', sans-serif",
      }}
    >
      {open && (
        <div
          role="menu"
          aria-label="Issue sections"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            minWidth: 220,
            maxHeight: 'min(60vh, 480px)',
            overflowY: 'auto',
            background: 'var(--bg)',
            border: '1px solid var(--ink)',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            padding: '6px 0',
          }}
        >
          {ITEMS.map((it) => {
            const isActive = it.id === activeId
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '8px 14px',
                  fontSize: 13,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'var(--faint)' : 'transparent',
                  borderLeft: isActive
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                }}
              >
                {it.label}
              </a>
            )
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Currently reading: ${active.label}. Open section menu.`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: 'var(--ink)',
          color: '#fff',
          border: '1px solid var(--ink)',
          borderRadius: 4,
          fontFamily: "'Archivo Narrow', sans-serif",
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,.18)',
        }}
      >
        <span style={{ color: 'var(--accent)' }}>§</span>
        <span>{active.label}</span>
        <span aria-hidden="true">{open ? '▾' : '▴'}</span>
      </button>
    </div>
  )
}
