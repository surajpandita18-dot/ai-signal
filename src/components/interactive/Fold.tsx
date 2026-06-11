'use client'

import { useState, type ReactNode } from 'react'

type Props = {
  buttonClass: string
  closedLabel: string
  openLabel: string
  foldClassName: string
  children: ReactNode
}

/**
 * Generic disclosure: button + collapsible div, mirrors the .foldbtn /
 * .deepfold and .bn-foldbtn / .bn-fold behaviour in the source HTML.
 * Open state toggles `.open` on the button and `.show` on the fold.
 */
export default function Fold({
  buttonClass,
  closedLabel,
  openLabel,
  foldClassName,
  children,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className={`${buttonClass}${open ? ' open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? openLabel : closedLabel}
      </button>
      <div className={`${foldClassName}${open ? ' show' : ''}`}>{children}</div>
    </>
  )
}
