'use client'

import { useState, useCallback } from 'react'

const UPI_ID = 'suraj.pandita132@ybl'
const UPI_LINK = 'upi://pay?pa=suraj.pandita132@ybl&pn=Suraj%20Pandita&am=&cu=INR&tn=Buy%20me%20a%20chai'
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(UPI_LINK)}`

export function ChaiButton() {
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
      <button className="chai-btn" onClick={handleClick}>
        ☕ Buy me a chai
      </button>

      {open && (
        <div className="chai-backdrop" onClick={() => setOpen(false)}>
          <div className="chai-modal" onClick={e => e.stopPropagation()}>
            <button className="chai-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <p className="chai-modal-title">Buy me a chai ☕</p>
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
