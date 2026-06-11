import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './emails/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F1E8',
        ink: '#191712',
        accent: '#9C4A2E',
        clay: '#B5683E',
        sand: '#E3DBC9',
        faint: '#ECE7DA',
        hair: '#DCD6C8',
        grey: '#6F6A60',
        'dark-band': '#211E18',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        read: ['var(--font-read)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        narrow: ['var(--font-narrow)', 'system-ui', 'sans-serif'],
        expanded: ['var(--font-expanded)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        issue: '1000px',
        prose: '600px',
        wide: '1160px',
      },
    },
  },
  plugins: [],
}

export default config
