import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAF7',
          dark: '#0F0F0E',
        },
        'text-primary': {
          DEFAULT: '#1A1A1A',
          dark: '#F0EDE6',
        },
        'text-secondary': {
          DEFAULT: '#4A4A4A',
          dark: '#9A9590',
        },
        accent: {
          DEFAULT: '#8B7355',
          dark: '#C4A882',
        },
        border: {
          DEFAULT: '#E8E4DC',
          dark: '#2A2A28',
        },
        'card-bg': {
          DEFAULT: '#F3F0E8',
          dark: '#1A1A18',
        },
      },
      fontFamily: {
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg: ['17px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.35' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        headline: ['22px', { lineHeight: '1.3' }],
      },
      spacing: {
        // All multiples of 8px — enforce rhythm
      },
      maxWidth: {
        content: '720px',
      },
      borderRadius: {
        card: '4px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [],
}

export default config
