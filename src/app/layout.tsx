import type { Metadata } from 'next'
import {
  Fraunces,
  Newsreader,
  Archivo,
  Archivo_Narrow,
  Spline_Sans_Mono,
} from 'next/font/google'

import './globals.css'
import '../styles/tokens.css'
import '../styles/issue.css'

/* ----------------------------------------------------------------------------
   Fonts
   --------------------------------------------------------------------------
   Source HTML's <link> URL declares:
     Fraunces       ital,opsz,wght — 400/500/600 + italic 400/500
     Newsreader     ital,opsz,wght — 400/500 + italic 400
     Archivo                400/500/600/700
     Archivo Narrow         500/600
     Spline Sans Mono       400/500/600
     Archivo Expanded       600/700/800   <- NOT a real Google Fonts family
                                            (CSS endpoint returns 400). We alias
                                            it to Archivo + font-stretch:125%.
   Every family gets a CSS variable consumed by issue.css.
---------------------------------------------------------------------------- */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-read',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-narrow',
  display: 'swap',
})

const splineSansMono = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI, Basically.',
  description: 'Explained like a normal person would. Every Saturday.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontClasses = [
    fraunces.variable,
    newsreader.variable,
    archivo.variable,
    archivoNarrow.variable,
    splineSansMono.variable,
  ].join(' ')

  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/* 'Archivo Expanded' is not a real Google Fonts family — the CSS
            endpoint returns 400. We alias the literal family name used in
            issue.css to the already-loaded Archivo variable, and apply
            font-stretch:125% on every selector that asked for the expanded
            cut, so the visual "display weight" effect survives without an
            extra font load. */}
        <style>{`:root{--font-expanded:var(--font-sans)}
.issue .spotlight .stat,
.issue .interview .iv-q .q,
.issue .hstep .hn,
.issue .reality h3,
.issue .signal li i,
.issue .sig h4,
.issue .poll .q{font-family:var(--font-sans);font-stretch:125%}`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
