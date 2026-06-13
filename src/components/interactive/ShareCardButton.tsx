'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  text: string
}

/**
 * "Copy as share card" button. Copies `${text}\n\n— AI, Basically.` and
 * flips the label to "✓ Copied — go forward it" for ~1800ms.
 */
export default function ShareCardButton({ text }: Props) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    const payload = `${text}\n\n— AI, Basically.`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).catch(() => {})
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      className={`share-card${copied ? ' copied' : ''}`}
      aria-label={copied ? 'Share card copied' : 'Copy as share card'}
      aria-live="polite"
      onClick={handleClick}
    >
      <span aria-hidden="true">
        {copied ? '✓ Copied — go forward it' : '⧉ Copy as share card'}
      </span>
    </button>
  )
}
