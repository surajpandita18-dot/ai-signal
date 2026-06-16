'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  code?: string
  inviteUrl?: string
}

const DEFAULT_SITE = 'https://aibasically.co'

/**
 * "Copy your invite link" button. Prefers `inviteUrl` if given, else
 * builds `${SITE}/r/${code ?? 'your-code'}`. SITE comes from
 * NEXT_PUBLIC_SITE_URL when set.
 */
export default function InviteCopyButton({ code, inviteUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE
  // Disable the button when no real code is available — copying a
  // placeholder URL would mislead the reader.
  const hasRealCode = Boolean(inviteUrl || code)
  const url = inviteUrl ?? `${site}/r/${code ?? 'your-code'}`

  function handleClick() {
    if (!hasRealCode) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      className={`ref-copy${copied ? ' copied' : ''}`}
      aria-label={
        copied
          ? 'Invite link copied to clipboard'
          : hasRealCode
          ? 'Copy your invite link to clipboard'
          : 'Subscribe first to get your invite link'
      }
      aria-live="polite"
      disabled={!hasRealCode}
      onClick={handleClick}
    >
      <span aria-hidden="true">
        {copied ? '✓ Link copied' : '⧉ Copy your invite link'}
      </span>
    </button>
  )
}
