'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  textToCopy: string
  children: ReactNode
  doneLabel?: string
}

/**
 * Wraps `children` in a `.copyable` div. On click, writes textToCopy to
 * the clipboard and flashes the `.copied` class for ~1500ms. doneLabel
 * is accepted for parity with the brief but unused — the visual change
 * is driven entirely by CSS on `.copyable.copied`.
 */
export default function CopyOnClick({ textToCopy, children, doneLabel }: Props) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // doneLabel exists in the contract for future overrides; CSS handles
  // the current visual state. Reference it to keep TS quiet.
  void doneLabel

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        // clipboard can reject in non-secure contexts; ignore silently.
      })
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className={`copyable${copied ? ' copied' : ''}`}
      onClick={handleClick}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
      aria-live="polite"
      style={{
        font: 'inherit',
        color: 'inherit',
        textAlign: 'inherit',
        display: 'block',
        width: '100%',
      }}
    >
      {children}
    </button>
  )
}
