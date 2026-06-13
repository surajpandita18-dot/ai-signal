'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  code: string
}

/**
 * Sits inside `.codeblock` next to a `<pre>`. Copies the code prop on
 * click and flips the label to "✓ copied" for ~1500ms.
 */
export default function CodeCopy({ code }: Props) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {})
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className={`codecopy${copied ? ' copied' : ''}`}
      aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
      aria-live="polite"
      onClick={handleClick}
    >
      <span aria-hidden="true">{copied ? '✓ copied' : '⧉ copy'}</span>
    </button>
  )
}
