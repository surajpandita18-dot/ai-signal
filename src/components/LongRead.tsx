import type { LongRead as LongReadType } from '../../db/types/database'

interface LongReadProps {
  longRead: LongReadType
}

export function LongRead({ longRead }: LongReadProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '40px',
        marginTop: '40px',
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        Long read of the week
      </p>

      <p
        className="font-serif"
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '4px',
          lineHeight: 1.4,
        }}
      >
        {longRead.title}
      </p>

      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {longRead.source}
      </p>

      <p
        className="font-sans"
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}
      >
        {longRead.why_pick}
      </p>

      <a
        href={longRead.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans long-read-link"
        style={{
          fontSize: '13px',
          color: 'var(--accent)',
          textDecoration: 'none',
        }}
      >
        Read it →
      </a>
    </footer>
  )
}
