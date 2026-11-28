import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  C, SANS, SERIF, MONO, Card, Kicker, Chip, SerifBox, ClaudeMark, FolderIcon, DocIcon, CheckDot, Lines, Doodle, Sparkles,
  ease, easeIO, usePop, typed, clamp01,
} from './ui';
import { cueOf, speakingAt, SCENES } from './timing';

type P = { idx: number; dur: number };
const useCue = (idx: number) => (w: string, n = 0) => cueOf(idx, w, n);
const abs = (x: number, y: number, extra?: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', left: x, top: y, ...extra });

// ======================================================= HOOK
const GenericPost: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <Card style={{ width: 820, padding: '34px 40px', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
      <div style={{ width: 66, height: 66, borderRadius: 66, background: '#D9DCE3' }} />
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.ink }}>You</div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: C.grey }}>Just now · Public</div>
      </div>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 38, fontWeight: 500, lineHeight: 1.35, color: '#2A2A30' }}>
      In today's fast-paced world, AI is changing everything. Here are 5 game-changing lessons I learned:
    </div>
    <div style={{ marginTop: 24 }}><Lines widths={[92, 80, 64]} /></div>
    <div style={{ display: 'flex', gap: 34, marginTop: 30, paddingTop: 22, borderTop: `2px solid ${C.line}`, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.grey }}>
      <span>Like</span><span>Comment</span><span>Repost</span>
    </div>
  </Card>
);

const Hook: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const tPost = c('post') - 6; const tAI = c('AI');
  const move = easeIO(f, tPost, tPost + 12);
  const talking = speakingAt(f + SCENES[idx].from);
  const intro = usePop(0, 11, 200);
  const card = usePop(tPost + 4, 14);
  const stamp = usePop(tAI, 8, 320);
  const c1 = usePop(tAI + 10); const c2 = usePop(tAI + 18);
  const shake = f >= tAI && f < tAI + 10 ? Math.sin(f * 2.6) * 10 * (1 - (f - tAI) / 10) : 0;
  const size = interpolate(move, [0, 1], [420, 120]);
  return (
    <AbsoluteFill>
      <div style={abs(interpolate(move, [0, 1], [540 - 210, 130]), interpolate(move, [0, 1], [640, 600]), { transform: `scale(${0.6 + 0.4 * intro})`, opacity: intro })}>
        <Doodle size={size} talking={talking} />
      </div>
      <div style={abs(130, 760, { opacity: card, transform: `translateY(${(1 - card) * 140}px) translateX(${shake}px)` })}>
        <GenericPost />
        <div style={{
          position: 'absolute', right: 30, top: 120, transform: `rotate(-12deg) scale(${2.4 - 1.4 * stamp})`, opacity: clamp01(stamp * 3),
          border: `7px solid ${C.red}`, color: C.red, borderRadius: 14, padding: '6px 22px', fontFamily: SANS, fontWeight: 900, fontSize: 62,
          letterSpacing: 2, background: 'rgba(255,255,255,0.85)',
        }}>AI-WRITTEN</div>
      </div>
      {[{ p: c1, t: 'lol, ChatGPT wrote this', y: 1390, x: 180 }, { p: c2, t: '"game-changing" gave it away', y: 1490, x: 300 }].map((m) => (
        <div key={m.t} style={abs(m.x, m.y, { opacity: m.p, transform: `scale(${0.7 + 0.3 * m.p})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 14 })}>
          <div style={{ width: 50, height: 50, borderRadius: 50, background: '#D9DCE3' }} />
          <div style={{ background: C.white, border: `2px solid ${C.line}`, borderRadius: '24px 24px 24px 6px', padding: '14px 24px', fontFamily: SANS, fontSize: 30, fontWeight: 600, color: C.ink, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>{m.t}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ======================================================= PROMISE
const PromiseScene: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const tear = easeIO(f, 0, 16);
  const head = usePop(10, 14);
  const mark = usePop(c('Claude'), 10);
  const ser = ease(f, c('tumhari'), c('tumhari') + 12);
  const chips = ['1 folder', '10 posts', '2 prompts', '~40 sec'];
  const talking = speakingAt(f + SCENES[idx].from);
  const halves = [{ clip: 'inset(0 50% 0 0)', rot: -16, dx: -320 }, { clip: 'inset(0 0 0 50%)', rot: 16, dx: 320 }];
  return (
    <AbsoluteFill>
      {tear < 1 && halves.map((h, i) => (
        <div key={i} style={abs(130, 760, { clipPath: h.clip, opacity: 1 - tear, transform: `translate(${h.dx * tear}px, ${600 * tear * tear}px) rotate(${h.rot * tear}deg)` })}>
          <GenericPost />
        </div>
      ))}
      <div style={abs(130, 640, { opacity: head, transform: `translateY(${(1 - head) * 60}px)` })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ transform: `scale(${mark})` }}><ClaudeMark size={46} spin={f * 0.6} /></div>
          <Kicker>Claude · write like me</Kicker>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: -4, color: C.ink, marginTop: 22, lineHeight: 1 }}>Generic AI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 6, opacity: ser, transform: `translateX(${(1 - ser) * -30}px)` }}>
          <svg width="96" height="50" viewBox="0 0 96 50"><path d="M4 26 Q40 20 82 25 M66 10 L84 25 L66 40" fill="none" stroke={C.blue} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="140" strokeDashoffset={140 * (1 - ser)} /></svg>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: C.blue, lineHeight: 1.05 }}>sounds like you</span>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
          {chips.map((t, i) => { const p = ease(f, 22 + i * 5, 32 + i * 5); return <Chip key={t} style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>{t}</Chip>; })}
        </div>
      </div>
      <div style={abs(700, 1180, { opacity: head })}><Doodle size={230} talking={talking} /></div>
    </AbsoluteFill>
  );
};

// ======================================================= WHY (01)
const Why: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const tB = c('padha') - 8;
  const board = usePop(tB, 13);
  const dim = ease(f, c('kyunki'), c('kyunki') + 10);
  return (
    <AbsoluteFill>
      <div style={abs(150, 650, { display: 'flex', gap: 18 })}>
        {Array.from({ length: 5 }).map((_, i) => {
          const p = usePop(4 + i * 4, 13);
          return (
            <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px)`, textAlign: 'center' }}>
              <Card style={{ width: 150, height: 210, padding: 18, borderRadius: 18, filter: `grayscale(${dim})`, opacity: 1 - 0.35 * dim }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 26, background: '#D9DCE3' }} />
                  <div style={{ width: 60, height: 10, borderRadius: 10, background: C.line }} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#555', lineHeight: 1.3, marginBottom: 10 }}>In today's fast-paced world…</div>
                <Lines widths={[95, 80, 88, 60]} h={9} gap={9} />
              </Card>
              <div style={{ fontFamily: SANS, fontSize: 22, color: C.soft, marginTop: 10, textDecoration: 'line-through' }}>same</div>
            </div>
          );
        })}
      </div>
      <div style={abs(150, 1000, { opacity: board, transform: `translateY(${(1 - board) * 80}px) rotate(${(1 - board) * 2}deg)` })}>
        <div style={{ width: 860, height: 400, background: C.beige, borderRadius: 26, position: 'relative', boxShadow: '0 20px 40px rgba(120,90,40,0.12)' }}>
          <Kicker color="#9C8462" style={{ position: 'absolute', left: 30, top: 26 }}>What Claude knows about you</Kicker>
          <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)', background: C.white, borderRadius: 18, padding: '20px 34px', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, whiteSpace: 'nowrap', boxShadow: '0 10px 24px rgba(0,0,0,0.08)' }}>
            Your writing: <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 50, color: '#8A6D45' }}>never read?</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= FOLDER (02)
const Folder: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const main = usePop(2, 12);
  const name = typed('Write Like Me', f, c('folder'), 26);
  const br = ease(f, c('usme') - 2, c('usme') + 12);
  const tFiles = c('das');
  const count = Math.max(0, Math.min(10, Math.floor((f - tFiles) / 3)));
  const subs: { n: string; g: 'doc' | 'star' | 'pen'; x: number }[] = [{ n: 'samples', g: 'doc', x: 250 }, { n: 'voice', g: 'star', x: 520 }, { n: 'drafts', g: 'pen', x: 790 }];
  const CX = 585;
  return (
    <AbsoluteFill>
      <div style={abs(CX - 120, 660, { opacity: main })}><Chip style={{ fontSize: 20, padding: '6px 14px' }}>This computer</Chip></div>
      <div style={abs(CX - 100, 720, { transform: `scale(${main})`, textAlign: 'center', width: 200 })}>
        <FolderIcon size={200} />
        <div style={{ marginTop: 8, display: 'inline-block', padding: '6px 18px', borderRadius: 10, fontFamily: SANS, fontWeight: 700, fontSize: 26, whiteSpace: 'nowrap', background: name ? C.white : C.blue, color: name ? C.ink : '#fff', border: `2px solid ${name ? C.blue : C.blue}` }}>
          {name || 'New folder'}
        </div>
      </div>
      <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M${CX} 1000 V1040 M${subs[0].x + 60} 1040 H${subs[2].x + 60} M${subs[0].x + 60} 1040 V1080 M${subs[1].x + 60} 1040 V1080 M${subs[2].x + 60} 1040 V1080`}
          fill="none" stroke={C.blue} strokeWidth="4" strokeDasharray="1400" strokeDashoffset={1400 * (1 - br)} />
      </svg>
      {subs.map((s, i) => {
        const p = usePop(c('usme') + 6 + i * 6, 12);
        return (
          <div key={s.n} style={abs(s.x, 1090, { width: 120, textAlign: 'center', transform: `scale(${p})`, opacity: p })}>
            <FolderIcon size={120} glyph={s.g} open={s.n === 'samples' ? count / 10 : 0} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.ink }}>{s.n}/</div>
            {s.n === 'samples' && count > 0 && (
              <div style={{ position: 'absolute', right: -24, top: -16 }}><Chip tone="blue" style={{ fontSize: 22, padding: '4px 14px' }}>{count} posts</Chip></div>
            )}
          </div>
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const t = ease(f, tFiles + i * 3 - 6, tFiles + i * 3 + 6);
        if (t <= 0 || t >= 1) return null;
        return (
          <div key={i} style={abs(interpolate(t, [0, 1], [880 - i * 30, 290]), interpolate(t, [0, 1], [1420 + (i % 3) * 40, 1110]), { opacity: 1 - t * 0.4, transform: `rotate(${(i % 2 ? 1 : -1) * 18 * (1 - t)}deg)` })}>
            <DocIcon size={44} color={C.blue} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ======================================================= CLAUDE CODE (03)
const Code: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const card = usePop(2, 13);
  const tLocal = c('kholo');
  const local = ease(f, tLocal, tLocal + 6);
  const path = typed('~/Desktop/Write Like Me', f, tLocal + 4, 40);
  const pathDone = path.length >= 23;
  const tP = c('prompt');
  const drop = easeIO(f, tP + 4, tP + 20);
  const appear = usePop(tP - 4, 13);
  const running = f > tP + 20;
  return (
    <AbsoluteFill>
      <div style={abs(150, 640, { opacity: card, transform: `translateY(${(1 - card) * 60}px)` })}>
        <Card style={{ width: 860, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: C.blue, color: '#fff', fontSize: 40, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>+</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.ink }}>New Claude Code chat</div>
              <div style={{ fontFamily: SANS, fontSize: 22, color: C.grey }}>Code tab · desktop app</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, background: '#F1F1F4', borderRadius: 999, padding: 8, marginTop: 24 }}>
            {['Cloud', 'Local'].map((t, i) => {
              const on = i === 1 ? local : 1 - local;
              return (
                <div key={t} style={{ flex: 1, textAlign: 'center', padding: '16px 0', borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 30, background: i === 1 ? `rgba(47,98,233,${on})` : `rgba(255,255,255,${on})`, color: i === 1 && on > 0.5 ? '#fff' : on > 0.5 ? C.ink : C.soft, boxShadow: on > 0.5 && i === 0 ? '0 4px 10px rgba(0,0,0,0.08)' : 'none' }}>{t}</div>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, padding: '16px 20px', borderRadius: 16, border: `2px solid ${pathDone ? C.blue : C.line}`, opacity: f > tLocal + 2 ? 1 : 0.35 }}>
            <FolderIcon size={40} />
            <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: C.ink, flex: 1 }}>{path}</span>
            {pathDone && <CheckDot p={ease(f, tLocal + 26, tLocal + 34)} size={36} />}
          </div>
        </Card>
      </div>
      {/* drop zone */}
      <div style={abs(585 - 150, 1130, { width: 300, height: 300, borderRadius: 300, border: `4px ${running ? 'solid' : 'dashed'} ${running ? C.blue : C.soft}`, background: running ? C.blueSoft : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: card })}>
        <ClaudeMark size={100} spin={running ? (f - tP) * 6 : 0} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: running ? C.blue : C.grey }}>{running ? 'Running…' : 'Drop prompt'}</div>
      </div>
      {f > tP - 6 && drop < 1 && (
        <div style={abs(interpolate(drop, [0, 1], [420, 470]), interpolate(drop, [0, 1], [1060, 1250]), { opacity: appear * (1 - drop), transform: `rotate(${interpolate(drop, [0, 1], [-5, 0])}deg) scale(${1 - drop * 0.7})`, transformOrigin: 'center' })}>
          <Card style={{ width: 520, padding: '18px 22px', border: `2px solid ${C.blue}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Chip tone="blue" style={{ fontSize: 18, padding: '4px 12px', fontFamily: MONO }}>PROMPT 01</Chip>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>Learn my voice</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.grey, marginTop: 10 }}>Read every post in /samples. Write voice.md…</div>
          </Card>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================================================= VOICE.MD (04)
const Voice: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const CX = 585, CY = 1080;
  const center = usePop(2, 12);
  const named = f >= c('voice.md');
  const read = ease(f, 0, c('voice.md'));
  const spokes = [
    { at: c('shuru'), x: CX, y: 760, t: 'How you open', s: 'a moment, not a claim' },
    { at: c('khatam'), x: 875, y: 1080, t: 'How you end', s: 'no neat moral' },
    { at: c('words'), x: CX, y: 1400, t: 'Words you use', s: 'short, plain' },
    { at: c('nahi'), x: 295, y: 1080, t: 'Never says', s: '"game-changer"', red: true },
  ];
  const n = spokes.filter((s) => f >= s.at).length;
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={CX} cy={CY} r="300" fill="none" stroke={C.line} strokeWidth="3" strokeDasharray="10 12" opacity={center} />
        {spokes.map((s, i) => { const p = ease(f, s.at - 2, s.at + 8); return <line key={i} x1={CX} y1={CY} x2={CX + (s.x - CX) * p} y2={CY + (s.y - CY) * p} stroke={C.blue} strokeWidth="4" />; })}
      </svg>
      <div style={abs(CX - 120, CY - 130, { transform: `scale(${center})` })}>
        <Card style={{ width: 240, height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: named ? `3px solid ${C.blue}` : `2px solid ${C.line}` }}>
          <DocIcon size={64} color={named ? C.blue : C.soft} />
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: named ? C.ink : C.grey }}>{named ? 'voice.md' : 'reading…'}</div>
          {!named && <div style={{ width: 160, height: 10, borderRadius: 10, background: C.line }}><div style={{ width: `${read * 100}%`, height: 10, borderRadius: 10, background: C.blue }} /></div>}
        </Card>
        {named && <div style={{ textAlign: 'center', marginTop: -20 }}><Chip tone="blue" style={{ fontSize: 22, padding: '4px 14px' }}>{n}/4 rules</Chip></div>}
      </div>
      {spokes.map((s, i) => {
        const p = usePop(s.at, 12);
        return (
          <div key={i} style={abs(s.x - 125, s.y - 58, { width: 250, transform: `scale(${p})`, opacity: p })}>
            <Card style={{ padding: '16px 18px', textAlign: 'center', borderRadius: 18, border: s.red ? `2px solid #F6C6C8` : `2px solid ${C.line}` }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: s.red ? C.red : C.ink }}>{s.t}</div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 28, color: s.red ? C.red : C.blue, textDecoration: s.red ? 'line-through' : 'none' }}>{s.s}</div>
            </Card>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ======================================================= KEY LINE (05)
const Keyline: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const card = usePop(2, 13);
  const hl = ease(f, c('learn') - 2, c('learn') + 8);
  const diff = ease(f, c('copy') - 4, c('copy') + 8);
  const L = ['# Learn my voice', 'Read every post in /samples.', 'Write voice.md: openings, endings,', 'words I use, words I never use.', 'Learn my rules, not my phrases.', 'Then wait for my topic.'];
  const row = (n: number | string, text: string, opts: { bg?: string; color?: string; star?: boolean; strike?: boolean; bold?: boolean; op?: number; h?: number } = {}) => (
    <div key={String(n) + text} style={{ display: 'flex', alignItems: 'center', height: opts.h ?? 58, overflow: 'hidden', background: opts.bg ?? 'transparent', opacity: opts.op ?? 1, margin: '0 -28px', padding: '0 28px' }}>
      <span style={{ width: 44, fontFamily: MONO, fontSize: 22, color: C.soft }}>{n}</span>
      <span style={{ width: 30, color: C.claude, fontSize: 26 }}>{opts.star ? '★' : ''}</span>
      <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: opts.bold ? 800 : 500, color: opts.color ?? '#3A3A42', textDecoration: opts.strike ? 'line-through' : 'none', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={abs(150, 650, { opacity: card, transform: `translateY(${(1 - card) * 60}px)` })}>
        <Card style={{ width: 860, padding: '0 28px 22px', overflow: 'hidden' }}>
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.grey, padding: '18px 28px', margin: '0 -28px 10px', borderBottom: `2px solid ${C.line}`, background: '#FAFAFB' }}>prompt-01.md</div>
          {L.slice(0, 4).map((t, i) => row(i + 1, t, { op: 1 - 0.55 * hl, bold: i === 0 }))}
          {row(5, L[4], { bg: `rgba(233,239,253,${hl})`, color: hl > 0.5 ? C.blue : '#3A3A42', star: hl > 0.5, bold: hl > 0.5 })}
          {row('−', 'copy my old posts', { bg: C.redSoft, color: C.red, strike: true, h: 58 * diff, op: diff })}
          {row('+', 'learn how I write', { bg: C.greenSoft, color: C.green, bold: true, h: 58 * diff, op: diff })}
          {row(6, L[5], { op: 1 - 0.55 * hl })}
        </Card>
      </div>
      <div style={abs(150, 1290, { opacity: diff, transform: `translateY(${(1 - diff) * 20}px)` })}>
        <Chip tone="red">without it: a copy of your old posts</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= TOPIC (06)
const Topic: React.FC<P> = ({ idx, dur }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const card = usePop(0, 13);
  const body = typed('Using voice.md, write a post on:', f, 2, 50);
  const topic = usePop(c('topic'), 11);
  const sent = f > dur - 12;
  return (
    <AbsoluteFill>
      <div style={abs(150, 680, { opacity: card, transform: `translateY(${(1 - card) * 60}px)` })}>
        <Card style={{ width: 860, padding: 0, overflow: 'hidden', border: `2px solid ${C.blue}55` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 28px', borderBottom: `2px solid ${C.line}`, background: '#FAFAFB' }}>
            <Chip tone="blue" style={{ fontSize: 20, padding: '4px 12px', fontFamily: MONO }}>PROMPT 02</Chip>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>Write</span>
          </div>
          <div style={{ padding: '28px 28px 30px', minHeight: 250 }}>
            <div style={{ fontFamily: MONO, fontSize: 32, color: C.ink }}>{body}</div>
            <div style={{ marginTop: 22, transform: `scale(${topic})`, transformOrigin: 'left center', opacity: topic, fontSize: 60 }}>
              <SerifBox size={1.4}>why I quit my job</SerifBox>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 28px 24px' }}>
            {sent ? <Chip tone="green">Sent ✓</Chip> : <Chip tone="blue">Send ↵</Chip>}
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= BEFORE / AFTER (07)
const Result: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const left = usePop(2, 13);
  const tAb = c('Ab?');
  const right = usePop(tAb, 11);
  const x = ease(f, tAb, tAb + 8);
  const talking = speakingAt(f + SCENES[idx].from) && f > tAb;
  return (
    <AbsoluteFill>
      <div style={abs(150, 660, { opacity: left * (1 - 0.45 * x), transform: `translateY(${(1 - left) * 60}px) scale(${1 - 0.05 * x}) rotate(${-2 * x}deg)` })}>
        <Card style={{ width: 400, height: 640, padding: 28, position: 'relative', background: '#FBFBFC' }}>
          <Kicker>Before</Kicker>
          <div style={{ position: 'relative', fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: '#77777F', marginTop: 24 }}>
            In today's fast-paced world, careers are changing faster than ever.
            {[0.22, 0.5, 0.78].map((y, i) => <div key={i} style={{ position: 'absolute', left: -6, top: `${y * 100}%`, height: 6, width: `${ease(f, tAb + i * 3, tAb + 8 + i * 3) * 104}%`, background: C.red, borderRadius: 3 }} />)}
          </div>
          <div style={{ position: 'absolute', left: 28, bottom: 28 }}><Chip tone="red">sounds like AI</Chip></div>
        </Card>
      </div>
      <div style={abs(580, 640, { opacity: right, transform: `translateY(${(1 - right) * 80}px) scale(${0.9 + 0.1 * right})` })}>
        <Card style={{ width: 440, height: 680, padding: 30, position: 'relative', border: `3px solid ${C.blue}`, boxShadow: `0 0 0 10px ${C.blueSoft}, 0 24px 50px rgba(47,98,233,0.18)` }}>
          <Kicker color={C.blue}>After</Kicker>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: C.ink, marginTop: 22, letterSpacing: -1 }}>
            I quit on a Tuesday.<br />Nobody <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.blue, fontSize: 60 }}>noticed.</span>
          </div>
          <div style={{ position: 'absolute', left: 30, bottom: 30, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Doodle size={110} talking={talking} />
            <Chip tone="green">sounds like you</Chip>
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= FEEDBACK (08)
const Feedback: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const phone = usePop(2, 13);
  const note = usePop(c('seedha') - 2, 12);
  const saved = usePop(c('fix'), 10);
  const pulse = 1 + 0.04 * Math.sin(clamp01((f - c('fix')) / 12) * Math.PI);
  return (
    <AbsoluteFill>
      <div style={abs(150, 660, { opacity: phone, transform: `translateY(${(1 - phone) * 60}px) scale(${pulse})` })}>
        <Card style={{ width: 380, height: 680, padding: 26, borderRadius: 40, position: 'relative', background: 'linear-gradient(180deg,#fff 0%,#F1F5FF 100%)' }}>
          <div style={{ display: 'inline-block', border: `2px solid ${C.ink}`, borderRadius: 8, padding: '4px 12px', fontFamily: SANS, fontWeight: 800, fontSize: 20 }}>THE HOOK</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, lineHeight: 1.15, color: C.ink, marginTop: 20 }}>I quit on a Tuesday. Nobody noticed.</div>
          <div style={{ marginTop: 22 }}><Lines widths={[90, 76, 84]} h={13} gap={13} /></div>
          <div style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)' }}><Doodle size={170} /></div>
        </Card>
      </div>
      <div style={abs(570, 760, { opacity: note, transform: `scale(${0.7 + 0.3 * note})`, transformOrigin: 'left center' })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: C.blue, borderRadius: 999, padding: '18px 26px', width: 420 }}>
          <svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#fff" /><path d="M15 11 L29 20 L15 29 Z" fill={C.blue} /></svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
            {Array.from({ length: 26 }).map((_, i) => <div key={i} style={{ width: 5, borderRadius: 4, background: '#fff', height: 8 + 28 * Math.abs(Math.sin(i * 1.7 + f * 0.35)) * (i % 5 === 0 ? 1 : 0.7) }} />)}
          </div>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, color: C.grey, marginTop: 12, marginLeft: 10 }}>"thoda chhota, aur zyada me"</div>
      </div>
      <div style={abs(570, 960, { opacity: saved, transform: `translateY(${(1 - saved) * 20}px)` })}>
        <Chip tone="green" style={{ fontSize: 28 }}>✓ Saved to voice.md · rule 5</Chip>
      </div>
      <div style={abs(570, 1040, { opacity: saved })}>
        <Card style={{ width: 420, padding: '16px 20px', borderRadius: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.green, fontWeight: 700 }}>+ hooks: under 8 words</div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= SUMMARY
const Summary: React.FC<P> = ({ dur }) => {
  const f = useCurrentFrame();
  const items = ['Start · generic AI', 'One folder', '10 of your posts', 'Prompt 01', 'voice.md', 'The key line', 'Prompt 02', 'Before / after', 'Feedback', 'Sounds like you'];
  const step = (dur * 0.72) / items.length;
  const prog = Math.min(items.length - 1, Math.max(0, (f - 4) / step));
  const cur = Math.floor(prog);
  const Y0 = 620, H = 84;
  return (
    <AbsoluteFill>
      <div style={abs(119, Y0 + 20, { width: 6, height: (items.length - 1) * H, background: C.line })} />
      <div style={abs(119, Y0 + 20, { width: 6, height: prog * H, background: C.blue })} />
      {items.map((t, i) => {
        const p = ease(f, 4 + i * step, 4 + i * step + 6);
        const last = i === items.length - 1;
        return (
          <div key={t} style={abs(102, Y0 + i * H, { display: 'flex', alignItems: 'center', gap: 26, opacity: 0.35 + 0.65 * Math.max(p, i <= cur ? 1 : 0) })}>
            {i === cur && f < 4 + items.length * step ? <div style={{ width: 40, height: 40 }} /> : <CheckDot p={p} size={40} />}
            <div style={{ fontFamily: SANS, fontWeight: last ? 800 : 600, fontSize: last ? 44 : 34, color: last && p > 0.5 ? C.blue : C.ink }}>{t}</div>
          </div>
        );
      })}
      <div style={abs(122 - 36, Y0 + prog * H - 16, {})}><Doodle size={72} /></div>
      <div style={abs(700, 980, { transform: `rotate(8deg) translateY(${(1 - ease(f, 6, 20)) * 80}px)`, opacity: ease(f, 6, 20) })}>
        <Card style={{ width: 280, height: 460, borderRadius: 36, border: `6px solid ${C.blue}`, background: 'linear-gradient(180deg,#fff,#EAF0FF)', padding: 22, position: 'relative' }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, lineHeight: 1.15 }}>I quit on a Tuesday.</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 36, color: C.blue }}>Nobody noticed.</div>
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}><Doodle size={140} /></div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================= CTA
const Cta: React.FC<P> = ({ idx }) => {
  const f = useCurrentFrame(); const c = useCue(idx);
  const card = usePop(2, 13);
  const save = usePop(c('Save'), 9, 260);
  const prof = usePop(c('try') - 10, 13);
  const tClick = c('try') + 12;
  const following = f > tClick;
  const cur = ease(f, c('try'), tClick);
  const talking = speakingAt(f + SCENES[idx].from);
  return (
    <AbsoluteFill>
      <Sparkles />
      <div style={abs(120, 620, { opacity: card, transform: `translateY(${(1 - card) * 60}px)` })}>
        <Card style={{ width: 840, padding: '26px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <Doodle size={70} ring />
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30 }}>thinksafari</span>
            <span style={{ fontFamily: SANS, fontSize: 26, color: C.grey }}>caption</span>
          </div>
          {[['PROMPT 01', 'Learn my voice: read every post in /samples…'], ['PROMPT 02', 'Using voice.md, write a post on…']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
              <Chip tone="blue" style={{ fontSize: 18, padding: '4px 12px', fontFamily: MONO }}>{k}</Chip>
              <span style={{ fontFamily: SANS, fontSize: 27, color: '#3A3A42', whiteSpace: 'nowrap', overflow: 'hidden' }}>{v}</span>
            </div>
          ))}
          <div style={{ fontFamily: SANS, fontSize: 24, color: C.grey, marginTop: 6 }}>… more</div>
        </Card>
        <div style={{ position: 'absolute', right: -14, top: -50, transform: `scale(${save}) rotate(${(1 - save) * -20}deg)`, opacity: clamp01(save * 2) }}>
          <div style={{ width: 120, height: 120, borderRadius: 30, background: C.white, boxShadow: '0 12px 30px rgba(47,98,233,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="60" height="70" viewBox="0 0 24 28"><path d="M3 3h18v22l-9-6-9 6z" fill={C.blue} stroke={C.blue} strokeWidth="2.5" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}><Chip tone="blue" style={{ fontSize: 20, padding: '4px 14px' }}>Saved</Chip></div>
        </div>
      </div>
      <div style={abs(0, 1130, { width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: prof, transform: `translateY(${(1 - prof) * 60}px)` })}>
        <Doodle size={190} ring talking={talking} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: -1, marginTop: 14 }}>@thinksafari</div>
        <div style={{ fontFamily: SANS, fontSize: 28, color: C.grey, marginTop: 2 }}>Suraj · AI Made Simple</div>
        <div style={{ position: 'relative', marginTop: 26 }}>
          {following
            ? <div style={{ padding: '18px 48px', borderRadius: 999, background: C.white, border: `2px solid ${C.line}`, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.ink }}><span style={{ color: C.green }}>✓</span> Following</div>
            : <div style={{ padding: '18px 72px', borderRadius: 999, background: C.blue, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#fff' }}>Follow</div>}
          <svg width="56" height="64" viewBox="0 0 24 28" style={{ position: 'absolute', left: interpolate(cur, [0, 1], [380, 170]), top: interpolate(cur, [0, 1], [160, 40]), opacity: cur > 0 ? 1 : 0, transform: `scale(${following && f < tClick + 5 ? 0.85 : 1})` }}>
            <path d="M3 2 L3 22 L8.5 17 L12 25 L15.5 23.5 L12 16 L19 16 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_COMPONENTS: Record<string, React.FC<P>> = {
  hook: Hook, promise: PromiseScene, why: Why, folder: Folder, code: Code, voice: Voice, keyline: Keyline,
  topic: Topic, result: Result, feedback: Feedback, summary: Summary, cta: Cta,
};
