import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'About — AI Signal',
  description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
  openGraph: {
    title: 'About AI Signal',
    description: 'One story. Every day. Gone in 24 hours.',
    url: 'https://aisignal.so/about',
    siteName: 'AI Signal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About AI Signal',
    description: 'One story. Every day. Gone in 24 hours.',
  },
}

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main
        style={{
          maxWidth: '720px',
          margin: '80px auto 0',
          padding: '0 32px 80px',
        }}
      >
        <Link
          href="/"
          className="font-mono"
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-mute)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '48px',
          }}
        >
          ← Back
        </Link>

        <h1
          className="font-serif"
          style={{
            fontSize: '30px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '32px',
          }}
        >
          About AI Signal
        </h1>

        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text)',
            marginBottom: '20px',
          }}
        >
          AI Signal is one story, every day — the single most important thing that happened in AI in
          the last 24 hours. It expires after 24 hours. That constraint is the point.
        </p>

        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text)',
            marginBottom: '20px',
          }}
        >
          Curated by Suraj Pandita. Every pick comes from scanning TLDR AI, The Rundown, Ben&apos;s
          Bites, The Neuron, Stratechery, Latent Space, and The Pragmatic Engineer. Sources are always
          credited.
        </p>

        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text)',
            marginBottom: '32px',
          }}
        >
          If nothing clears the bar, there&apos;s no signal that day. A missed day is better than a
          weak pick.
        </p>

        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            color: 'var(--text)',
          }}
        >
          Reach out on{' '}
          <a
            href="https://linkedin.com/in/surajpandita"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text)' }}
          >
            LinkedIn ↗
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
