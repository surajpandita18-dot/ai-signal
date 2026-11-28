import React, { useId } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing, staticFile } from 'remotion';

export const C = {
  bg: '#F8F8F9', grid: '#ECECEF', ink: '#111114', grey: '#8B8B92', soft: '#B9B9C0', line: '#E5E5EA',
  blue: '#2F62E9', blueSoft: '#E9EFFD', blueMid: '#C9D7FB', red: '#E5484D', redSoft: '#FDECEC',
  green: '#1F9D57', greenSoft: '#E6F6EC', claude: '#D97757', beige: '#EFE3CC', white: '#FFFFFF',
};
export const SANS = 'Inter, sans-serif';
export const SERIF = '"Instrument Serif", Georgia, serif';
export const MONO = '"JetBrains Mono", monospace';

export const FontFace: React.FC = () => (
  <style>{`@font-face{font-family:"Instrument Serif";font-style:italic;font-weight:400;src:url(${staticFile('serif-italic.woff2')}) format("woff2");}`}</style>
);

// ---------- motion helpers ----------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
export const easeIO = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
export const usePop = (at: number, damping = 13, stiffness = 180) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.7 } });
};
export const typed = (text: string, f: number, at: number, cps = 32) =>
  text.slice(0, Math.max(0, Math.floor(((f - at) / 30) * cps)));

// ---------- surfaces ----------
export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{
    background: C.white, borderRadius: 26, border: `2px solid ${C.line}`,
    boxShadow: '0 22px 50px rgba(20,20,40,0.08), 0 3px 8px rgba(20,20,40,0.04)', ...style,
  }}>{children}</div>
);

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.grey, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, letterSpacing: 4, color, textTransform: 'uppercase', ...style }}>{children}</div>
);

export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tone?: 'blue' | 'plain' | 'green' | 'red' }> = ({ children, style, tone = 'plain' }) => {
  const t = {
    blue: { background: C.blue, color: C.white, border: C.blue },
    plain: { background: C.white, color: C.ink, border: C.line },
    green: { background: C.greenSoft, color: C.green, border: '#BFE6CE' },
    red: { background: C.redSoft, color: C.red, border: '#F6C6C8' },
  }[tone];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 999,
      background: t.background, color: t.color, border: `2px solid ${t.border}`,
      fontFamily: SANS, fontWeight: 700, fontSize: 26, whiteSpace: 'nowrap', ...style,
    }}>{children}</div>
  );
};

export const SerifBox: React.FC<{ children: React.ReactNode; p?: number; size?: number; style?: React.CSSProperties }> = ({ children, p = 1, size = 1, style }) => (
  <span style={{ position: 'relative', display: 'inline-block', padding: `0 ${10 * size}px`, ...style }}>
    <span style={{
      position: 'absolute', inset: `${4 * size}px 0 ${2 * size}px 0`, background: C.blueSoft,
      border: `${2 * size}px solid ${C.blue}66`, borderRadius: 6 * size, clipPath: `inset(0 ${100 - p * 100}% 0 0)`,
    }} />
    <span style={{ position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: '#1D3A8F' }}>{children}</span>
  </span>
);

// ---------- icons ----------
export const ClaudeMark: React.FC<{ size?: number; spin?: number }> = ({ size = 60, spin = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${spin}deg)` }}>
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x="46" y="6" width="8" height="44" rx="4" fill={C.claude} transform={`rotate(${i * 36} 50 50)`} />
    ))}
  </svg>
);

export const FolderIcon: React.FC<{ size?: number; glyph?: 'doc' | 'star' | 'pen' | 'none'; open?: number }> = ({ size = 120, glyph = 'none', open = 0 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 150 120">
    <path d="M6 18a10 10 0 0 1 10-10h36l14 14h68a10 10 0 0 1 10 10v74a10 10 0 0 1-10 10H16a10 10 0 0 1-10-10z" fill="#9DB7F7" />
    <path d={`M6 ${40 + open * 10}h138v64a10 10 0 0 1-10 10H16a10 10 0 0 1-10-10z`} fill={C.blue} />
    {glyph === 'doc' && <path d="M62 60h22l8 8v26H62z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />}
    {glyph === 'star' && <path d="M75 56l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#fff" />}
    {glyph === 'pen' && <path d="M62 94l4-14 22-22 10 10-22 22z" fill="#fff" />}
  </svg>
);

export const DocIcon: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.grey }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 30 36"><path d="M3 2h16l8 8v24H3z" fill="#fff" stroke={color} strokeWidth="3" strokeLinejoin="round" /><path d="M19 2v8h8" fill="none" stroke={color} strokeWidth="3" /><path d="M8 18h14M8 24h14M8 30h9" stroke={color} strokeWidth="2.5" strokeLinecap="round" /></svg>
);

export const CheckDot: React.FC<{ p: number; size?: number; solid?: boolean }> = ({ p, size = 40, solid = true }) => (
  <div style={{
    width: size, height: size, borderRadius: size, flexShrink: 0, border: `3px solid ${p > 0.02 ? C.blue : C.soft}`,
    background: solid && p > 0.5 ? C.blue : C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transform: `scale(${0.9 + 0.1 * p})`,
  }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={solid ? '#fff' : C.blue} strokeWidth={3.6} strokeLinecap="round"
        strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - p)} />
    </svg>
  </div>
);

export const Lines: React.FC<{ widths: number[]; color?: string; h?: number; gap?: number }> = ({ widths, color = C.line, h = 16, gap = 16 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {widths.map((w, i) => <div key={i} style={{ width: `${w}%`, height: h, borderRadius: h, background: color }} />)}
  </div>
);

// ---------- the doodle (original character, hand-drawn "boil") ----------
export const Doodle: React.FC<{ size?: number; talking?: boolean; ring?: boolean; style?: React.CSSProperties }> = ({ size = 200, talking = false, ring = false, style }) => {
  const f = useCurrentFrame();
  const id = useId().replace(/:/g, '');
  const seed = Math.floor(f / 4) % 4;
  const blink = f % 96 > 90;
  const open = talking && Math.floor(f / 3) % 2 === 0;
  const sw = 5;
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0, position: 'relative',
      ...(ring ? { padding: size * 0.05, background: 'linear-gradient(45deg,#F9CE34,#EE2A7B,#6228D7)' } : {}), ...style,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ display: 'block', borderRadius: ring ? size : 0, background: ring ? '#fff' : 'transparent' }}>
        <defs>
          <filter id={`b${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} /><feDisplacementMap in="SourceGraphic" scale="3.2" /></filter>
          <clipPath id={`c${id}`}><circle cx="100" cy="100" r="99" /></clipPath>
        </defs>
        <g filter={`url(#b${id})`} clipPath={ring ? `url(#c${id})` : undefined} stroke="#111" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {/* shirt + neck */}
          <path d="M30 205 Q42 168 100 166 Q158 168 170 205" fill="#fff" />
          <path d="M84 150 L84 168 Q100 178 116 168 L116 150" fill="#fff" />
          {/* ears */}
          <path d="M50 104 Q36 100 40 118 Q44 132 56 128" fill="#fff" />
          <path d="M150 104 Q164 100 160 118 Q156 132 144 128" fill="#fff" />
          {/* head */}
          <path d="M52 92 Q50 50 100 46 Q150 50 148 96 Q150 146 100 156 Q52 148 52 92 Z" fill="#fff" />
          {/* hair: side-swept quiff */}
          <path d="M48 98 Q38 52 70 34 Q96 18 130 28 Q160 38 156 74 Q150 92 146 98 Q140 74 126 66 Q108 78 84 70 Q64 66 56 84 Z" fill="#111" />
          <path d="M70 36 Q84 26 104 30" stroke="#fff" strokeWidth="3" fill="none" />
          {/* brows */}
          <path d="M68 92 Q78 86 90 91" fill="none" strokeWidth="6" />
          <path d="M110 91 Q122 86 132 92" fill="none" strokeWidth="6" />
          {/* eyes */}
          {blink ? (<><path d="M72 108 Q80 112 88 108" fill="none" /><path d="M112 108 Q120 112 128 108" fill="none" /></>) : (
            <><ellipse cx="80" cy="108" rx="5.5" ry="7.5" fill="#111" /><ellipse cx="120" cy="108" rx="5.5" ry="7.5" fill="#111" /></>)}
          {/* nose */}
          <path d="M100 112 Q94 126 102 129" fill="none" strokeWidth="4" />
          {/* mouth */}
          {open ? <path d="M84 138 Q100 156 116 138 Q100 142 84 138 Z" fill="#111" /> : <path d="M84 138 Q100 150 116 138" fill="none" />}
          {/* stubble */}
          {[[78, 148], [90, 153], [110, 153], [122, 148], [100, 156]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.2" strokeWidth="2.4" />)}
        </g>
        <circle cx="66" cy="126" r="7" fill="#F2A68F" opacity="0.45" />
        <circle cx="134" cy="126" r="7" fill="#F2A68F" opacity="0.45" />
      </svg>
    </div>
  );
};

export const Sparkles: React.FC<{ n?: number; seed?: number; color?: string }> = ({ n = 14, seed = 3, color = '#8FA9F2' }) => {
  const f = useCurrentFrame();
  const r = (i: number) => { const x = Math.sin(i * 999 + seed * 77) * 10000; return x - Math.floor(x); };
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 14 + i));
        const s = 14 + r(i + 5) * 16;
        return (
          <svg key={i} width={s} height={s} viewBox="0 0 20 20" style={{ position: 'absolute', left: `${r(i) * 92 + 4}%`, top: `${r(i + 9) * 80 + 10}%`, opacity: tw }}>
            <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0Z" fill={color} />
          </svg>
        );
      })}
    </>
  );
};
