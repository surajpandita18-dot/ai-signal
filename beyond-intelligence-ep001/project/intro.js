// Beyond Intelligence 2.6 s logo sting -> PNG frames at 30 fps. Usage: node intro.js <outdir>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { C, css } = require('./lib.js');
const OUT = path.resolve(process.argv[2]);
const FPS = 30, DUR = 2.6, W = 1080, H = 1920;

// mark geometry (same proportions as lib.mark), size 300 centred
const s = 300, g = s / 4.2, o = s * .14, r = s * .052, dy = g * .9;
const node = (x, y) => [o + x * g, o + y * g + dy];
const order = [[0, 2], [1, 2], [0, 1], [2, 2], [1, 1], [0, 0], [2, 1], [1, 0], [2, 0]];
const ex = o + 3 * g - g * .05, ey = o - g * .95 + dy;
let svg = '';
for (let i = 0; i < 3; i++) {
  const [hx1, hy] = node(0, i), [hx2] = node(2, i), [vx, vy1] = node(i, 0), [, vy2] = node(i, 2);
  svg += `<line class="ln" style="animation-delay:${0.9 + i * .06}s" x1="${hx1}" y1="${hy}" x2="${hx2}" y2="${hy}" pathLength="1"/>`;
  svg += `<line class="ln" style="animation-delay:${0.95 + i * .06}s" x1="${vx}" y1="${vy1}" x2="${vx}" y2="${vy2}" pathLength="1"/>`;
}
order.forEach(([x, y], k) => { const [cx, cy] = node(x, y); svg += `<circle class="nd" style="animation-delay:${0.12 + k * .085}s;transform-origin:${cx}px ${cy}px" cx="${cx}" cy="${cy}" r="${r}"/>`; });
const [tx, ty] = node(2, 0);
svg += `<line class="esc" x1="${tx}" y1="${ty}" x2="${ex}" y2="${ey}" pathLength="1"/>
<circle class="am" style="transform-origin:${tx}px ${ty}px" cx="${ex}" cy="${ey}" r="${r * 1.35}"/>`;

const html = `<html><head><style>${css}
body{width:${W}px;height:${H}px;background:${C.bg};overflow:hidden;position:relative}
.wrap{position:absolute;left:0;right:0;top:640px;display:flex;flex-direction:column;align-items:center;animation:push 2.6s linear both}
@keyframes push{from{transform:scale(1)}to{transform:scale(1.05)}}
.nd{fill:${C.ink};opacity:0;animation:pop .32s cubic-bezier(.2,1.6,.4,1) both}
@keyframes pop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
.ln{stroke:${C.ink};stroke-opacity:.35;stroke-width:${s * .018};stroke-dasharray:1;stroke-dashoffset:1;animation:draw .3s ease-out both}
@keyframes draw{to{stroke-dashoffset:0}}
.esc{stroke:${C.amber};stroke-width:${s * .018};stroke-dasharray:1;stroke-dashoffset:1;animation:draw .22s 1.22s ease-in both}
.am{fill:${C.amber};opacity:0;animation:fly .3s 1.22s cubic-bezier(.3,.0,.2,1) both}
@keyframes fly{from{opacity:0;transform:translate(0,0) scale(.4)}40%{opacity:1}to{opacity:1;transform:translate(0,0) scale(1)}}
.flash{position:absolute;left:${540 - 150 + ex - 60}px;top:${640 + ey - 60}px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,${C.amber}aa,transparent 70%);opacity:0;animation:fl .7s 1.42s ease-out both}
@keyframes fl{0%{opacity:0;transform:scale(.3)}25%{opacity:.9}100%{opacity:0;transform:scale(3)}}
.w1{margin-top:70px;font-weight:300;font-size:96px;color:${C.ink};letter-spacing:.42em;margin-right:-.42em;line-height:.92;animation:track .9s 1.45s cubic-bezier(.2,.8,.2,1) both}
@keyframes track{from{opacity:0;letter-spacing:.9em;margin-right:-.9em;filter:blur(6px)}to{opacity:1;letter-spacing:.42em;margin-right:-.42em;filter:blur(0)}}
.w2{font-weight:700;font-size:96px;letter-spacing:.06em;margin-top:12px;animation:rise .7s 1.6s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.tg{margin-top:40px;font-size:26px;letter-spacing:.14em;color:${C.grey};animation:fade .6s 1.9s both}
@keyframes fade{from{opacity:0}to{opacity:1}}
.out{position:absolute;inset:0;background:${C.bg};opacity:0;animation:fade .25s 2.35s both}
</style></head><body>
<div class="wrap"><svg width="${s}" height="${s + dy}" viewBox="0 0 ${s} ${s + dy}" style="overflow:visible">${svg}</svg>
<div class="w1">BEYOND</div><div class="w2">INTELLIGENCE</div><div class="tg">UNDERSTANDING THE INTELLIGENCE BEHIND THE MACHINES</div></div>
<div class="flash"></div><div class="vig"></div><div class="grain"></div><div class="out"></div></body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const f = path.join(OUT, '_intro.html'); fs.writeFileSync(f, html);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) {
    await pg.evaluate(t => document.getAnimations().forEach(a => a.currentTime = t), i * 1000 / FPS);
    await pg.screenshot({ path: path.join(OUT, `f${String(i).padStart(3, '0')}.png`) });
  }
  await b.close(); fs.unlinkSync(f); console.log('frames', N);
})();
