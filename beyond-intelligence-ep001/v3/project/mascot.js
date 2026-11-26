// "Node" — the brand's escaped amber dot as a tiny machine character. Renders alpha PNG frames.
// Usage: node mascot.js <outdir>   -> <outdir>/{confused,thinking,surprised}/f000.png ...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(process.argv[2]);
const FPS = 30, DUR = 2.0, W = 380, H = 380;
const AMBER = '#D99A3D', INK = '#121110', PAPER = '#EDE8DE';

const page = (mood) => `<html><head><style>
*{margin:0;padding:0}html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:sans-serif}
.rig{position:absolute;left:150px;top:170px;width:120px;height:120px;animation:slide ${DUR}s both}
@keyframes slide{0%{transform:translateX(260px)}22%{transform:translateX(-8px)}28%{transform:translateX(0)}78%{transform:translateX(0)}100%{transform:translateX(260px)}}
.body{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F0BE6A,${AMBER} 55%,#A86E22);box-shadow:0 10px 26px rgba(0,0,0,.45);animation:bob .9s .5s ease-in-out infinite alternate}
@keyframes bob{to{transform:translateY(-7px)}}
.eye{position:absolute;top:38px;width:30px;height:${mood === 'surprised' ? 36 : 30}px;border-radius:50%;background:${PAPER};animation:blink ${DUR}s both}
.eye.l{left:24px}.eye.r{left:64px}
@keyframes blink{0%,48%{transform:scaleY(1)}51%{transform:scaleY(.1)}54%,100%{transform:scaleY(1)}}
.pup{position:absolute;left:7px;top:9px;width:13px;height:13px;border-radius:50%;background:${INK};animation:look ${DUR}s both}
@keyframes look{0%,25%{transform:translate(4px,0)}35%,100%{transform:translate(-5px,${mood === 'thinking' ? -5 : 1}px)}}
.brow{position:absolute;top:26px;width:26px;height:5px;border-radius:3px;background:${INK};opacity:${mood === 'confused' ? 1 : 0}}
.brow.l{left:26px;transform:rotate(-14deg)}.brow.r{left:66px;transform:rotate(14deg) translateY(-6px)}
.mouth{position:absolute;left:47px;top:86px;width:${mood === 'surprised' ? 18 : 24}px;height:${mood === 'surprised' ? 18 : 5}px;border-radius:${mood === 'surprised' ? '50%' : '3px'};background:${INK};${mood === 'confused' ? 'transform:rotate(-12deg)' : ''}}
.bub{position:absolute;left:-46px;top:-78px;min-width:70px;height:70px;padding:0 14px;border-radius:35px;background:${PAPER};color:${INK};font:800 46px/70px Inter,sans-serif;text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.35);opacity:0;animation:pop ${DUR}s both}
.bub:after{content:'';position:absolute;right:12px;bottom:-10px;width:22px;height:22px;background:${PAPER};transform:rotate(45deg);border-radius:4px}
@keyframes pop{0%,30%{opacity:0;transform:scale(.3)}38%{opacity:1;transform:scale(1.08)}42%,72%{opacity:1;transform:scale(1)}78%,100%{opacity:0;transform:scale(.6)}}
</style><style>@font-face{font-family:Inter;src:url(file:///usr/share/fonts/opentype/inter/Inter-ExtraBold.otf);font-weight:800}</style></head><body>
<div class="rig"><div class="body"></div><div class="brow l"></div><div class="brow r"></div>
<div class="eye l"><div class="pup"></div></div><div class="eye r"><div class="pup"></div></div><div class="mouth"></div>
<div class="bub">${{ confused: '?', thinking: '…', surprised: '!' }[mood]}</div></div></body></html>`;

(async () => {
  const b = await chromium.launch();
  for (const mood of ['confused', 'thinking', 'surprised']) {
    const dir = path.join(OUT, mood); fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, '_m.html'); fs.writeFileSync(f, page(mood));
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => document.getAnimations().forEach(a => a.pause()));
    for (let i = 0; i < Math.round(DUR * FPS); i++) {
      await pg.evaluate(t => document.getAnimations().forEach(a => a.currentTime = t), i * 1000 / FPS);
      await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(3, '0')}.png`), omitBackground: true });
    }
    await pg.close(); fs.unlinkSync(f);
  }
  await b.close(); console.log('mascot ok');
})();
