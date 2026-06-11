'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  code?: string
  inviteUrl?: string
}

const DEFAULT_SITE = 'https://ai-signal-eta.vercel.app'

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
  const url = inviteUrl ?? `${site}/r/${code ?? 'your-code'}`

  function handleClick() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      className={`ref-copy${copied ? ' copied' : ''}`}
      onClick={handleClick}
    >
      {copied ? '✓ Link copied' : '⧉ Copy your invite link'}
    </button>
  )
}
