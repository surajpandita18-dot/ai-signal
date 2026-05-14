import type { Metadata } from 'next'
import { Inter, Fraunces, Instrument_Serif, JetBrains_Mono, Caveat } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  weight: ['500', '600', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-signal-eta.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'AI Signal — One story. Every day. Gone in 24 hours.',
    template: '%s — AI Signal',
  },
  description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
  openGraph: {
    siteName: 'AI Signal',
    type: 'website',
    images: [{ url: `${SITE_URL}/og/default`, width: 1200, height: 630, alt: 'AI Signal' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
