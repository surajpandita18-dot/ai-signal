import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p
          className="font-mono"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}
        >
          404 — Signal not found.
        </p>
        <Link
          href="/"
          className="font-mono"
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}
        >
          ← Back to today's signal
        </Link>
      </div>
    </div>
  )
}
