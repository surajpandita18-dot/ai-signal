interface EditorialQuoteProps {
  quote: string
  attribution?: string
}

export function EditorialQuote({ quote, attribution = '— AI Signal Editorial' }: EditorialQuoteProps) {
  return (
    <div className="editorial-quote">
      <p className="editorial-quote-text">{quote}</p>
      <div className="eq-attribution">{attribution}</div>
    </div>
  )
}
