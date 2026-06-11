# Brief — FORGE Scaffold: Next.js 14 + Design Tokens + Base Layout

**Assigned to:** FORGE (/src/)
**Date:** 2026-04-27
**Phase:** Pre-Phase 2 groundwork (parallel to Phase 1 SEED work)

---

## Task

Scaffold the complete Next.js 14 project. Install dependencies, configure Tailwind with the full design token system, set up fonts, create the base layout, set up Supabase client. This is the foundation every subsequent phase builds on.

---

## Files to create (root level)

```
/package.json
/tsconfig.json
/next.config.ts
/tailwind.config.ts
/postcss.config.js
/.env.local.example
```

## Files to create (/src)

```
/src/app/layout.tsx
/src/app/globals.css
/src/app/page.tsx           (placeholder — "AI Signal coming soon")
/src/lib/supabase.ts
/src/lib/supabase-server.ts
/src/IMPLEMENTATION_LOG.md
```

---

## Exact specifications

### package.json

```json
{
  "name": "ai-signal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.29",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/ssr": "^0.3.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // No new dependencies or plugins without ARIA approval
}

export default nextConfig
```

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tailwind.config.ts

Implement the full design token system from /design/design-system.md. The config must define:

```typescript
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
        // All multiples of 8px — override defaults to enforce rhythm
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
```

### .env.local.example

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #FAFAF7;
    --text-primary: #1A1A1A;
    --text-secondary: #4A4A4A;
    --accent: #8B7355;
    --border: #E8E4DC;
    --card-bg: #F3F0E8;
  }

  .dark {
    --background: #0F0F0E;
    --text-primary: #F0EDE6;
    --text-secondary: #9A9590;
    --accent: #C4A882;
    --border: #2A2A28;
    --card-bg: #1A1A18;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    background-color: var(--background);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-inter), system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    background-color: var(--background);
    color: var(--text-primary);
  }

  h1, h2, h3, h4 {
    font-family: var(--font-source-serif), Georgia, serif;
    font-weight: 600;
  }
}
```

### src/app/layout.tsx

Use `next/font/google` to load Source Serif 4 and Inter. Apply them as CSS variables. Dark mode via `class` strategy — check `prefers-color-scheme` on first load and set `.dark` on `<html>`.

```tsx
import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Signal',
  description: 'One clean digest of the week\'s AI news. No overlap. Read in 5 minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### src/app/page.tsx

Minimal placeholder — just enough to verify the app boots:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center" style={{ maxWidth: '720px', padding: '48px 24px' }}>
        <h1 className="font-serif text-3xl" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
          AI Signal
        </h1>
        <p className="font-sans text-base" style={{ color: 'var(--text-secondary)' }}>
          One clean digest of the week&apos;s AI news. No overlap. Read in 5 minutes.
        </p>
      </div>
    </main>
  )
}
```

### src/lib/supabase.ts

Client-side Supabase client (for use in client components):

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../db/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### src/lib/supabase-server.ts

Server-side Supabase client (for use in server components and API routes):

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../db/types/database'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

---

## Acceptance criteria

- [ ] `npm install` completes without errors
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run dev` boots the app at localhost:3000
- [ ] Source Serif 4 and Inter load via next/font
- [ ] Tailwind generates all design token classes
- [ ] Dark mode toggles correctly on the placeholder page
- [ ] Both supabase clients have correct TypeScript generics (imports from db/types/database.ts)
- [ ] IMPLEMENTATION_LOG.md written

---

## Do NOT

- Do not add any packages beyond what is listed in package.json above
- Do not create any page beyond the placeholder page.tsx
- Do not set up authentication (no middleware, no auth helper)
- Do not import from db/types/database.ts at runtime if the file doesn't exist yet — the import is for TypeScript types only, it will be satisfied once SEED completes
- Do not create an admin route, API route, or any component beyond layout and page
- Do not add ESLint (not in scope)
- Do not add Prettier (not in scope)
- Do not touch anything outside /src and the root config files
