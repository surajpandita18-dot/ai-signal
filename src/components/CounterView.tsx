interface CounterViewProps {
  headline: string
  body: string
}

export function CounterView({ headline, body }: CounterViewProps) {
  return (
    <div className="counter-block">
      <span className="counter-stamp">
        Devil&apos;s Advocate
      </span>
      <div className="counter-eyebrow">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        The Counter-View
      </div>
      <div className="counter-content">
        <h4 className="counter-headline">{headline}</h4>
        <div
          className="counter-body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </div>
  )
}
