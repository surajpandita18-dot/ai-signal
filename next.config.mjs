/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // CDN caches the redirect for 5 min — overrides Next.js default max-age=0
        source: '/goto/:number',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
}

export default nextConfig
