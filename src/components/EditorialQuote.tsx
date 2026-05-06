import React from 'react'

function parseBold(text: string): React.ReactNode {
  if (!text.includes('**')) return text
  return text.split(/(\*\*.*?\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  )
}

interface EditorialQuoteProps {
  quote: string
  attribution?: string
}

export function EditorialQuote({ quote, attribution = '— AI Signal Editorial' }: EditorialQuoteProps) {
  return (
    <div className="editorial-quote">
      <p className="editorial-quote-text">{parseBold(quote)}</p>
      <div className="eq-attribution">{attribution}</div>
    </div>
  )
}
