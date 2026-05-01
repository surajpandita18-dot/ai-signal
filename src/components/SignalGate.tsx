import { SubscribeInput } from './SubscribeInput'

interface SignalGateProps {
  headline: string
  publishedAt: string
  signalNumber: number
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function SignalGate({ headline, publishedAt, signalNumber }: SignalGateProps) {
  const formattedDate = dateFormatter.format(new Date(publishedAt))

  return (
    <div>
      {/* Signal metadata */}
      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}
      >
        Signal #{signalNumber} · {formattedDate}
      </p>

      {/* Headline — visible, not linked */}
      <p
        className="font-serif"
        style={{
          fontSize: '22px',
          lineHeight: 1.35,
          color: 'var(--text-primary)',
          marginBottom: '32px',
        }}
      >
        {headline}
      </p>

      {/* Gate message */}
      <p
        className="font-sans"
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: '24px',
        }}
      >
        This signal is in the archive. Subscribe to read past signals.
      </p>

      <SubscribeInput label="Join to access the archive." />
    </div>
  )
}
