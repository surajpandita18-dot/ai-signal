import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { C, SANS, SERIF, FontFace, Doodle, clamp01, easeIO, ease } from './ui';
import { WORDS, SCENES, FPS, DURATION } from './timing';
import { SCENE_COMPONENTS } from './scenes';

export { DURATION };

// ---------- background ----------
const Grid: React.FC = () => {
  const f = useCurrentFrame();
  const cta = SCENES.find((s) => s.id === 'cta')!;
  const g = ease(f, cta.from - 6, cta.from + 14);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{
        backgroundColor: C.bg,
        backgroundImage: `linear-gradient(${C.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.grid} 1.5px, transparent 1.5px)`,
        backgroundSize: '54px 54px',
      }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(248,248,249,0) 30%, #DCE6FD 78%, #C3D4FB 100%)', opacity: g }} />
    </AbsoluteFill>
  );
};

// ---------- kinetic captions (top) ----------
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let cur = -1;
  for (let i = 0; i < WORDS.length; i++) if (WORDS[i].s <= t + 0.04) cur = i;
  if (cur < 0) return null;
  const cw = WORDS[cur];
  const chunk = WORDS.map((w, i) => ({ ...w, i })).filter((w) => w.line === cw.line && w.chunk === cw.chunk && w.i <= cur);
  const lastInLine = WORDS.filter((w) => w.line === cw.line).slice(-1)[0];
  const isLast = WORDS[WORDS.length - 1] === lastInLine && chunk[chunk.length - 1].i === WORDS.length - 1;
  // fade the chunk out if there is a long silence after it (but keep the final line)
  const out = isLast ? 0 : clamp01((t - (cw.e + 0.9)) / 0.25);
  return (
    <div style={{
      position: 'absolute', top: 250, left: 70, right: 70, minHeight: 150, display: 'flex', flexWrap: 'wrap',
      justifyContent: 'center', alignItems: 'baseline', columnGap: 16, rowGap: 4, opacity: 1 - out, filter: `blur(${out * 8}px)`,
    }}>
      {chunk.map((w) => {
        const p = clamp01((t - w.s) / 0.2);
        const base: React.CSSProperties = {
          display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 7}px)`, transform: `translateY(${(1 - p) * 10}px)`,
          fontFamily: SANS, fontSize: 56, letterSpacing: -1, lineHeight: 1.25,
        };
        if (w.style === 's') {
          const bp = clamp01((t - w.s) / 0.3);
          return (
            <span key={w.i} style={{ ...base, position: 'relative', padding: '0 10px' }}>
              <span style={{ position: 'absolute', inset: '8px 0 2px 0', background: C.blueSoft, border: `2.5px solid ${C.blue}77`, borderRadius: 8, clipPath: `inset(0 ${100 - bp * 100}% 0 0)` }} />
              <span style={{ position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontSize: 66, color: '#1D3A8F', letterSpacing: 0 }}>{w.w}</span>
            </span>
          );
        }
        return <span key={w.i} style={{ ...base, fontWeight: w.style === 'b' ? 700 : 500, color: w.style === 'b' ? C.ink : C.grey }}>{w.w}</span>;
      })}
    </div>
  );
};

// ---------- left progress rail with the doodle ----------
export const STEPS: Record<string, string> = {
  why: 'The problem', folder: 'One folder', code: 'Prompt 01', voice: 'voice.md',
  keyline: 'The key line', topic: 'Prompt 02', result: 'Before / after', feedback: 'Feedback',
};
const STEP_IDS = Object.keys(STEPS);
const RX = 62; const AY = 520; const DROP = 300; const TR = 20;

const Rail: React.FC = () => {
  const f = useCurrentFrame();
  const first = SCENES.find((s) => s.id === STEP_IDS[0])!;
  const lastStep = SCENES.find((s) => s.id === STEP_IDS[STEP_IDS.length - 1])!;
  const summary = SCENES.find((s) => s.id === 'summary')!;
  if (f < first.from - 8 || f >= summary.from + 10) return null;
  const si = SCENES.findIndex((s) => f >= s.from && f < s.to);
  const scene = SCENES[si];
  const stepIdx = Math.max(0, STEP_IDS.indexOf(scene?.id ?? STEP_IDS[0]));
  const local = f - (scene?.from ?? 0);
  // rail draws in from the top on the first step
  const draw = ease(f, first.from - 8, first.from + 10);
  // step change: doodle walks down, then the world scrolls back up
  const isStep = STEP_IDS.includes(scene?.id);
  const k1 = isStep && stepIdx > 0 ? easeIO(local, 0, TR * 0.5) : 1;
  const k2 = isStep && stepIdx > 0 ? easeIO(local, TR * 0.5, TR) : 1;
  const walking = isStep && stepIdx > 0 && local < TR;
  const ay = walking ? AY + DROP * k1 - DROP * k2 : AY;
  const pillIdx = walking && local < TR * 0.5 ? stepIdx - 1 : stepIdx;
  const pillP = walking ? (local < TR * 0.5 ? 1 - k1 : k2) : ease(f, first.from, first.from + 10);
  const fadeOut = 1 - ease(f, summary.from - 4, summary.from + 10);
  const ringP = walking && local >= TR * 0.5 ? k2 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fadeOut * (f > lastStep.to + 4 ? 0 : 1) }}>
      <div style={{ position: 'absolute', left: RX - 3, top: 0, width: 6, height: 1920 * draw, background: C.line }} />
      <div style={{ position: 'absolute', left: RX - 3, top: 0, width: 6, height: Math.min(ay, 1920 * draw), background: C.blue, borderRadius: 3 }} />
      {walking && local < TR * 0.5 && (
        <div style={{ position: 'absolute', left: RX - 2, top: AY, width: 0, height: DROP * k1, borderLeft: `4px dashed ${C.blue}` }} />
      )}
      {ringP > 0 && (
        <div style={{ position: 'absolute', left: RX - 22, top: AY - 22 + 0, width: 44, height: 44, borderRadius: 44, border: `4px solid ${C.blue}`, opacity: 1 - ringP * 0.8, transform: `scale(${0.6 + ringP})` }} />
      )}
      <div style={{ position: 'absolute', left: RX - 34, top: ay - 34, opacity: draw }}>
        <Doodle size={68} />
      </div>
      <div style={{
        position: 'absolute', left: RX + 46, top: ay - 22, opacity: pillP, transform: `translateX(${(1 - pillP) * -16}px)`,
        display: 'flex', alignItems: 'center', gap: 10, background: C.blue, color: '#fff', borderRadius: 999,
        padding: '8px 18px 8px 10px', fontFamily: SANS, fontWeight: 700, fontSize: 24,
      }}>
        <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '2px 10px', fontSize: 20 }}>{String(pillIdx + 1).padStart(2, '0')}</span>
        {STEPS[STEP_IDS[pillIdx]]}
      </div>
    </div>
  );
};

// ---------- scene wrapper: enter + exit ----------
const SceneWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const out = ease(f, dur - 7, dur);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: `blur(${out * 6}px)`, transform: `translateY(${-out * 40}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: SANS }}>
    <FontFace />
    <Grid />
    {SCENES.map((s, i) => {
      const Comp = SCENE_COMPONENTS[s.id];
      const dur = s.to - s.from;
      return (
        <Sequence key={i} from={s.from} durationInFrames={dur}>
          <SceneWrap dur={i === SCENES.length - 1 ? dur + 100 : dur}><Comp idx={i} dur={dur} /></SceneWrap>
        </Sequence>
      );
    })}
    <Rail />
    <Captions />
  </AbsoluteFill>
);
