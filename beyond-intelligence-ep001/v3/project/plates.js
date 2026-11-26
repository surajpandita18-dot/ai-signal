// B-roll plates for Ep 001. Rendered at 1188x2112 (10% push-in headroom).
// Content is laid out in the centre 1080x1920 "final" box.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { C, css, mark } = require('./lib.js');
const OUT = path.resolve(process.argv[2]), A = path.resolve(process.argv[3]);
const W = 1188, H = 2112;

const grade = 'grayscale(.35) contrast(1.06) brightness(.78) sepia(.12)';
const kicker = (t, top = 300) => `<div style="position:absolute;left:84px;top:${top}px;font-size:26px;letter-spacing:.32em;color:${C.amber};font-weight:600">${t}</div>
  <div style="position:absolute;left:84px;top:${top + 46}px;height:2px;width:90px;background:${C.amber}"></div>`;
const title = (t, top = 372, sz = 84) => `<div style="position:absolute;left:84px;right:84px;top:${top}px;font-size:${sz}px;font-weight:700;line-height:1.02;letter-spacing:.01em">${t}</div>`;
const tag = (t, top = 1330) => `<div style="position:absolute;left:84px;top:${top}px;font-size:20px;letter-spacing:.12em;color:${C.grey}">${t}</div>`;
const photo = (img, { top = 640, h = 660, pos = 'center', fit = 'cover', inset = 0 } = {}) =>
  `<div style="position:absolute;left:${inset}px;right:${inset}px;top:${top}px;height:${h}px;background:url(file://${A}/${img}) ${pos}/${fit} no-repeat;filter:${grade}"></div>`;
const fade = (top, h) => `<div style="position:absolute;left:-60px;right:-60px;top:${top}px;height:${h}px;background:linear-gradient(180deg,${C.bg},transparent 22%,transparent 78%,${C.bg})"></div>`;

// small board diagram of 5 game slots
function score(results, highlight = -1) {
  return `<div style="position:absolute;left:84px;right:84px;top:880px;display:flex;gap:26px">${results.map((r, i) => `
    <div style="flex:1;text-align:center">
      <div style="font-size:22px;letter-spacing:.2em;color:${C.grey}">GAME ${i + 1}</div>
      <div style="margin:26px auto 0;width:118px;height:118px;border-radius:50%;${r === 'A' ? `background:radial-gradient(circle at 35% 30%,#4a463f,#0b0a09 62%);border:2px solid #6a645a` : r === 'H' ? `background:${C.ink};box-shadow:inset -10px -12px 24px rgba(0,0,0,.25)${i === highlight ? `,0 0 0 8px ${C.bg},0 0 0 11px ${C.amber}` : ''}` : `border:2px dashed #3a362f`}"></div>
      <div style="margin-top:24px;font-size:24px;font-weight:600;letter-spacing:.06em;color:${r === 'H' ? C.amber : r ? C.ink : '#3a362f'}">${r === 'A' ? 'AlphaGo' : r === 'H' ? 'Lee Sedol' : '—'}</div></div>`).join('')}</div>`;
}

function net(cx, cy, s, col) { // tiny 3-4-2 network drawing
  const L = [[0, 3], [1, 4], [2, 2]], P = [];
  L.forEach(([li, n]) => { const arr = []; for (let k = 0; k < n; k++) arr.push([cx + (li - 1) * s, cy + (k - (n - 1) / 2) * s * .62]); P.push(arr); });
  let e = '';
  for (let l = 0; l < 2; l++) for (const a of P[l]) for (const b of P[l + 1]) e += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-opacity=".35" stroke-width="2"/>`;
  for (const l of P) for (const [x, y] of l) e += `<circle cx="${x}" cy="${y}" r="${s * .09}" fill="${C.bg}" stroke="${col}" stroke-width="3"/>`;
  return e;
}
function miniBoard(x, y, s, stones) {
  let g = `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="#5a554c" stroke-width="1.5"/>`;
  for (let i = 1; i < 6; i++) g += `<line x1="${x + i * s / 6}" y1="${y}" x2="${x + i * s / 6}" y2="${y + s}" stroke="#3d3a33"/><line x1="${x}" y1="${y + i * s / 6}" x2="${x + s}" y2="${y + i * s / 6}" stroke="#3d3a33"/>`;
  for (const [i, j, w] of stones) g += `<circle cx="${x + i * s / 6}" cy="${y + j * s / 6}" r="${s / 15}" fill="${w ? C.ink : '#0b0a09'}" stroke="${w ? 'none' : '#55504a'}" stroke-width="1.5"/>`;
  return g;
}
const ST = [[[1, 1, 0], [2, 3, 1], [4, 2, 0], [3, 4, 1]], [[2, 2, 0], [3, 2, 1], [3, 3, 0], [1, 4, 1], [4, 4, 0]], [[1, 2, 1], [2, 1, 0], [4, 3, 1], [5, 1, 0], [2, 4, 0], [3, 5, 1]]];

const plates = {
  // cold-open hook: the AlphaGo side of the table (operator, clock, board)
  p00_hook: `${photo('match_game.jpg', { top: 0, h: 1920, pos: '22% 58%', fit: 'auto 132%' })}
    <div style="position:absolute;left:-60px;right:-60px;top:0;height:1920px;background:linear-gradient(180deg,rgba(18,17,16,.92) 0%,rgba(18,17,16,.55) 30%,rgba(18,17,16,.1) 48%,rgba(18,17,16,.2) 70%,rgba(18,17,16,.85) 100%)"></div>
    ${kicker('SEOUL · MARCH 2016', 300)}${title('THE MOVE EXPERTS<br>CALLED A <span style="color:#FFC83D">MISTAKE</span>', 372, 86)}`,
  // "Let's go back to 2016" / DeepMind made AlphaGo, match with Lee Sedol (opening ceremony photo)
  p01_2016: `${kicker('SEOUL · MARCH 2016')}${title('THE ALPHAGO<br>EXPERIMENT')}
    ${photo('handshake.jpg', { top: 640, h: 720, pos: '50% 62%' })}${fade(640, 720)}
    ${tag('Google DeepMind Challenge Match · Seoul, March 2016', 1360)}`,
  // Lee Sedol intro
  p02_lee: `${kicker('THE OPPONENT')}${title('LEE SEDOL')}
    <div style="position:absolute;left:84px;top:470px;font-size:34px;color:${C.ink};opacity:.85">18 international titles</div>
    ${photo('match_game.jpg', { top: 620, h: 760, pos: '84% 55%', fit: 'auto 135%' })}${fade(620, 760)}`,
  // Go explained
  p03_go: `${kicker('THE GAME')}${title('GO')}
    <div style="position:absolute;left:84px;top:470px;font-size:34px;opacity:.85">Ancient Chinese board game · 19 × 19 grid</div>
    ${photo('go_board.jpg', { top: 600, h: 780, pos: '50% 50%', fit: 'auto 100%' })}${fade(600, 780)}`,
  p04_game1: `${kicker('THE MATCH · BEST OF 5')}${title('GAME 1')}${score(['A', '', '', '', ''])}`,
  p05_game2: `${kicker('THE MATCH · BEST OF 5')}${title('GAME 2')}${score(['A', 'A', '', '', ''])}`,
  // suspense card before reveal
  p06_m37title: `<div style="position:absolute;left:0;right:0;top:700px;text-align:center">
    <div style="font-size:26px;letter-spacing:.34em;color:${C.amber};font-weight:600">GAME 2</div>
    <div style="font-size:190px;font-weight:700;letter-spacing:.02em;margin-top:20px">MOVE 37</div></div>`,
  p07_m37board: `${kicker('GAME 2 · MOVE 37')}${title('THE MOVE NOBODY<br>EXPECTED', 372, 70)}
    <div style="position:absolute;left:84px;right:84px;top:560px;height:912px;background:#f6f5f2;border-radius:6px;overflow:hidden">
      <div style="position:absolute;inset:0;background:url(file://${A}/move37_diagram.jpg) center/cover;filter:contrast(1.05)"></div>
      <div style="position:absolute;left:${690 / 960 * 912 - 62}px;top:${473 / 960 * 912 - 62}px;width:124px;height:124px;border-radius:50%;border:6px solid ${C.amber}"></div></div>
    ${tag('Board diagram: Quartz (qz.com)', 1490)}`,
  p08_10k: `${kicker('HUMAN PROBABILITY OF THIS MOVE')}
    <div style="position:absolute;left:84px;top:560px;font-size:120px;font-weight:300;letter-spacing:.02em">1 in</div>
    <div style="position:absolute;left:78px;top:680px;font-size:250px;font-weight:700;letter-spacing:-.02em;color:${C.amber}">10,000</div>
    <div style="position:absolute;left:84px;top:1000px;font-size:36px;line-height:1.35;opacity:.85">based on how human professionals<br>had historically played</div>
    ${tag('Source: DeepMind, 2016', 1180)}`,
  p09_human: `${kicker('STEP 1 · LEARN FROM HUMANS')}${title('THOUSANDS OF<br>EXPERT GAMES', 372, 74)}
    <svg width="1080" height="760" style="position:absolute;left:0;top:600px">
      ${miniBoard(84, 40, 200, ST[0])}${miniBoard(84, 290, 200, ST[1])}${miniBoard(84, 540, 200, ST[2])}
      <path d="M320 400 L520 400" stroke="${C.amber}" stroke-width="3" stroke-dasharray="10 9"/><path d="M510 388 L528 400 L510 412" fill="none" stroke="${C.amber}" stroke-width="3"/>
      <g>${net(770, 400, 170, C.ink)}</g>
      <text x="770" y="680" fill="${C.grey}" font-family="I" font-size="24" letter-spacing="3" text-anchor="middle">PATTERNS</text></svg>
    ${tag('Illustration', 1380)}`,
  p10_selfplay: `${kicker('STEP 2 · REINFORCEMENT LEARNING')}${title('SELF-PLAY', 372, 84)}
    <svg width="1080" height="760" style="position:absolute;left:0;top:560px">
      ${net(250, 260, 150, C.ink)}${net(830, 260, 150, C.grey)}
      <text x="250" y="470" fill="${C.ink}" font-family="I" font-size="26" font-weight="600" text-anchor="middle" letter-spacing="2">ALPHAGO</text>
      <text x="830" y="470" fill="${C.grey}" font-family="I" font-size="26" font-weight="600" text-anchor="middle" letter-spacing="2">PAST ALPHAGO</text>
      <text x="540" y="276" fill="${C.amber}" font-family="I" font-size="40" font-weight="300" text-anchor="middle">vs</text>
      <text x="300" y="640" fill="${C.ink}" font-family="I" font-size="96" font-weight="700" text-anchor="middle">+1</text>
      <text x="300" y="690" fill="${C.grey}" font-family="I" font-size="24" text-anchor="middle" letter-spacing="2">WIN</text>
      <text x="780" y="640" fill="${C.amber}" font-family="I" font-size="96" font-weight="700" text-anchor="middle">−1</text>
      <text x="780" y="690" fill="${C.grey}" font-family="I" font-size="24" text-anchor="middle" letter-spacing="2">LOSS</text></svg>
    ${tag('Illustration · millions of games against itself', 1380)}`,
  p11_improve: `${kicker('STEP 2 · REINFORCEMENT LEARNING')}${title('PLAY MORE,<br>GET BETTER', 372, 84)}
    <svg width="1080" height="700" style="position:absolute;left:0;top:640px">
      <line x1="120" y1="600" x2="980" y2="600" stroke="#3d3a33" stroke-width="2"/><line x1="120" y1="80" x2="120" y2="600" stroke="#3d3a33" stroke-width="2"/>
      <path d="M120 560 C 320 540, 420 430, 560 330 S 820 120, 980 100" fill="none" stroke="${C.amber}" stroke-width="5"/>
      <text x="980" y="650" fill="${C.grey}" font-family="I" font-size="22" text-anchor="end" letter-spacing="3">GAMES PLAYED →</text>
      <text x="140" y="70" fill="${C.grey}" font-family="I" font-size="22" letter-spacing="3">STRENGTH</text></svg>
    ${tag('Illustration', 1380)}`,
  p12_final: `${kicker('FINAL RESULT · MARCH 2016')}${title('4 – 1', 372, 150)}${score(['A', 'A', 'A', 'H', 'A'], 3)}`,
  p13_m78: `${kicker('GAME 4 · LEE SEDOL (WHITE)')}${title('MOVE 78', 372, 84)}
    <div style="position:absolute;left:84px;right:84px;top:560px;height:912px;border-radius:6px;overflow:hidden">
      <div style="position:absolute;inset:0;background:url(file://${A}/move78_board.jpg) center/cover"></div>
      <div style="position:absolute;inset:0;background:rgba(18,17,16,.28)"></div>
      <div style="position:absolute;left:${527 / 959 * 912 - 58}px;top:${433 / 959 * 912 - 58}px;width:116px;height:116px;border-radius:50%;border:6px solid ${C.amber};box-shadow:0 0 0 3000px rgba(18,17,16,.25)"></div></div>
    ${tag('Game 4 position · Lee Sedol’s move 78 at L11', 1490)}`,
  p08b_g2win: `${kicker('GAME 2 · RESULT')}${title('ALPHAGO<br>WINS', 372, 110)}${score(['A', 'A', '', '', ''])}`,
  p14b_rethink: `${photo('match_game.jpg', { top: 0, h: 1920, pos: '79% 49%', fit: 'auto 175%' })}
    <div style="position:absolute;left:-60px;right:-60px;top:0;height:1920px;background:linear-gradient(180deg,rgba(18,17,16,.9) 0%,rgba(18,17,16,.2) 30%,rgba(18,17,16,.1) 60%,rgba(18,17,16,.85) 100%)"></div>
    ${kicker('LEE SEDOL · SEOUL, 2016', 300)}`,
  p14_win: `<div style="position:absolute;left:0;right:0;top:640px;text-align:center">
    <div style="font-size:26px;letter-spacing:.34em;color:${C.amber};font-weight:600">GAME 4</div>
    <div style="font-size:112px;font-weight:700;line-height:1.02;margin-top:26px">LEE SEDOL<br>WINS</div>
    <div style="font-size:30px;color:${C.grey};margin-top:34px;letter-spacing:.06em">The only game a human won</div></div>`,
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [name, html] of Object.entries(plates)) {
    const f = path.join(OUT, '_' + name + '.html');
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body style="width:${W}px;height:${H}px;position:relative;background:${C.bg};overflow:hidden">
      <div style="position:absolute;left:54px;top:96px;width:1080px;height:1920px">${html}</div><div class="vig"></div><div class="grain"></div></body></html>`);
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    await pg.goto('file://' + f, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, name + '.png') });
    await pg.close(); fs.unlinkSync(f);
  }
  await b.close();
  console.log('plates', Object.keys(plates).length);
})();
