import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        signal: {
          DEFAULT: '#2B5BFF',
          deep: '#1F44CC',
          soft: '#E5EBFF',
          faint: '#F4F6FF',
        },
        warm: {
          DEFAULT: '#FF6B35',
          soft: '#FFE8DD',
        },
        green: {
          DEFAULT: '#1B7A3E',
          soft: '#E0F2E5',
        },
        ink: '#2B4A8F',
        beige: {
          DEFAULT: '#F0E9D8',
          deep: '#E5DCC4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        hand: ['var(--font-hand)', 'cursive'],
      },
      maxWidth: {
        content: '720px',
        wire: '1280px',
      },
    },
  },
  plugins: [],
}

export default config
