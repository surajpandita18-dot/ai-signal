interface SignalExpiredProps {
  headline: string
  publishedAt: string
  signalNumber: number
  tomorrowCategory?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function SignalExpired({
  headline,
  publishedAt,
  signalNumber,
  tomorrowCategory,
}: SignalExpiredProps) {
  const formattedDate = dateFormatter.format(new Date(publishedAt))

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Label */}
      <p
        className="font-mono"
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        Signal #{signalNumber} · {formattedDate} · Expired
      </p>

      {/* Expired headline — visible but not linkable */}
      <p
        className="font-serif"
        style={{
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          marginBottom: '24px',
          opacity: 0.5,
        }}
      >
        {headline}
      </p>

      {/* Divider */}
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--border)',
          margin: '24px 0',
        }}
      />

      {/* Tomorrow tease */}
      <p
        className="font-sans"
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}
      >
        Tomorrow&apos;s signal drops at 9 AM IST.
      </p>

      {tomorrowCategory && (
        <span
          className="font-mono"
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
            borderRadius: '3px',
            padding: '2px 8px',
            marginTop: '12px',
          }}
        >
          Tomorrow: {tomorrowCategory.toUpperCase()}
        </span>
      )}
    </div>
  )
}
