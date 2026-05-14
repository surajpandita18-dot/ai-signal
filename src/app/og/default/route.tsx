import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#0a0a0a',
          padding: '60px 72px',
          position: 'relative',
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
            display: 'flex',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#94a3b8',
            display: 'flex',
          }}
        />

        {/* Top badge */}
        <div style={{ display: 'flex', marginBottom: '32px' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              border: '1.5px solid #94a3b8',
              padding: '5px 14px',
              borderRadius: '4px',
            }}
          >
            Daily
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'serif',
              fontSize: '72px',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.15,
              maxWidth: '960px',
            }}
          >
            One AI story. Every day. Gone in 24 hours.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.06em',
            }}
          >
            The single most important thing in AI, curated daily.
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '15px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.28em',
            }}
          >
            AI SIGNAL
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
