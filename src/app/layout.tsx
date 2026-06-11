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
     Archivo Expanded       600/700/800   <- NOT exposed by next/font/google.
                                            We fall back to a stylesheet <link>.
   Every family gets a CSS variable consumed by issue.css.
---------------------------------------------------------------------------- */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-serif',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
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
        {/* Archivo Expanded is not exposed by next/font/google, so we load
            it via the Google Fonts CSS endpoint. The family name 'Archivo
            Expanded' inside issue.css resolves to this stylesheet. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-expanded:'Archivo Expanded',system-ui,sans-serif}`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
