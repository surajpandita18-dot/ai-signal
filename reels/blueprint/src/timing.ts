import T from '../data/timing.json';

export const FPS = 30;
export type W = { w: string; s: number; e: number; line: number; chunk: number; style: string };
export const WORDS = T.words as W[];
export const LINES = T.lines as { scene: string; s: number; e: number }[];
export const DURATION = Math.ceil(T.duration * FPS);

const LEAD = 0.12; // scene starts slightly before its first word
export const SCENES = LINES.map((l, i) => ({
  id: l.scene,
  from: Math.max(0, Math.round((l.s - LEAD) * FPS)),
  to: i < LINES.length - 1 ? Math.round((LINES[i + 1].s - LEAD) * FPS) : DURATION,
}));

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.?]/g, '').replace(/[.?]+$/, '');

/** Frame (relative to the scene start) at which `word` is spoken in scene `idx`. */
export const cueOf = (idx: number, word: string, nth = 0): number => {
  const hits = WORDS.filter((w) => w.line === idx && norm(w.w) === norm(word));
  const hit = hits[Math.min(nth, hits.length - 1)];
  if (!hit) throw new Error(`cue not found: ${word} in scene ${idx}`);
  return Math.round(hit.s * FPS) - SCENES[idx].from;
};

/** Is any word being spoken at absolute frame f? (drives the doodle's mouth) */
export const speakingAt = (f: number) => {
  const t = f / FPS;
  return WORDS.some((w) => t >= w.s && t <= w.e - 0.02);
};
