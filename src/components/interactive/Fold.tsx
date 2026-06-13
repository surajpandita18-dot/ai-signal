'use client'

import { useId, useState, type ReactNode } from 'react'

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
  // Stable id for the disclosure so the button can name aria-controls.
  const id = useId()

  return (
    <>
      <button
        type="button"
        className={`${buttonClass}${open ? ' open' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? openLabel : closedLabel}
      </button>
      <div id={id} className={`${foldClassName}${open ? ' show' : ''}`}>
        {children}
      </div>
    </>
  )
}
