import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SubscribeSection } from '@/components/SubscribeSection'

export const metadata = {
  title: 'Archive — AI Signal',
  description: 'All past signals. Subscribe to access.',
}

export default function ArchivePage() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 720, margin: '80px auto 0', padding: '0 32px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(36px,5vw,56px)',
          lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', marginBottom: 16 }}>
          Past <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>transmissions</em>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text-mute)', marginBottom: 48 }}>
          The full archive is available to subscribers. Subscribe below to unlock every signal from day one.
        </p>
        <div style={{ padding: '28px 0', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)', marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--signal)',
            marginBottom: 12 }}>Coming in Phase 5</p>
          <p style={{ fontSize: 15, color: 'var(--text-mute)', lineHeight: 1.6 }}>
            Subscriber-only archive with full signal history, streak counter, and search.{' '}
            <Link href="/" style={{ color: 'var(--signal)', textDecoration: 'none',
              borderBottom: '1px solid var(--signal-soft)' }}>
              ← Back to today&apos;s signal
            </Link>
          </p>
        </div>
      </main>
      <SubscribeSection />
      <SiteFooter />
    </>
  )
}
