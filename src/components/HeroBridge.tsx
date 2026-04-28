export function HeroBridge() {
  return (
    <>
      <style>{`
        @keyframes bridgeFlow {
          0% { left: -30%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .hero-bridge-line {
          flex: 1;
          height: 1px;
          max-width: 280px;
          background: linear-gradient(90deg, transparent, var(--warm) 30%, var(--warm) 70%, transparent);
          opacity: 0.35;
          position: relative;
          overflow: hidden;
        }
        .hero-bridge-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: -30%;
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--warm), transparent);
          animation: bridgeFlow 4s ease-in-out infinite;
        }
      `}</style>
      <div
        className="anim d5"
        style={{
          maxWidth: 1280,
          margin: '24px auto 0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          justifyContent: 'center',
        }}
      >
        <span className="hero-bridge-line" aria-hidden="true" />
        <span
          style={{
            fontFamily: 'var(--ff-display)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--text-faint)',
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
          }}
        >
          What you&apos;re about to read
        </span>
        <span className="hero-bridge-line" aria-hidden="true" />
      </div>
    </>
  )
}
