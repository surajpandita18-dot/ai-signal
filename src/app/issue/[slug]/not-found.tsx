import Link from 'next/link'

export default function IssueNotFound() {
  return (
    <main
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '48px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '720px', textAlign: 'center' }}>
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
          404
        </p>
        <p
          className="font-serif"
          style={{
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}
        >
          Issue not found.
        </p>
        <Link
          href="/"
          className="font-sans"
          style={{ fontSize: '15px', color: 'var(--accent)', textDecoration: 'none' }}
        >
          ← Back to latest issue
        </Link>
      </div>
    </main>
  )
}
