'use client'

import { useState, useCallback } from 'react'

const UPI_ID = 'suraj.pandita132@ybl'
const UPI_LINK = 'upi://pay?pa=suraj.pandita132@ybl&pn=Suraj%20Pandita&am=&cu=INR&tn=AI%20Signal%20chai'
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(UPI_LINK)}`

export function InlineChaiStrip() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(() => {
    const isTouch = navigator.maxTouchPoints > 0 || window.innerWidth < 768
    if (isTouch) {
      window.location.href = UPI_LINK
    } else {
      setOpen(true)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <>
      <div className="chai-strip">
        <div className="chai-strip-inner">
          <div className="chai-strip-text">
            <span className="chai-strip-eyebrow">From the editor</span>
            <span className="chai-strip-copy">
              Built solo. No VC money, no ads — ever.<br />
              If this saved you 30 minutes, consider sending a chai.
            </span>
          </div>
          <button className="chai-strip-btn" onClick={handleClick}>
            ☕ Send a chai →
          </button>
        </div>
        <span className="chai-strip-note">UPI · Any amount · No pressure</span>
      </div>

      {open && (
        <div className="chai-backdrop" onClick={() => setOpen(false)}>
          <div className="chai-modal" onClick={e => e.stopPropagation()}>
            <button className="chai-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <p className="chai-modal-title">Send a chai ☕</p>
            <img className="chai-qr" src={QR_SRC} alt="Scan to pay via UPI" width={200} height={200} />
            <p className="chai-upi-id">{UPI_ID}</p>
            <button className="chai-copy" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy UPI ID'}
            </button>
            <p className="chai-note">Any amount. No pressure.</p>
          </div>
        </div>
      )}
    </>
  )
}
