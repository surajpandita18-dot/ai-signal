// "The Idea Worth Sharing" — What if your life is already happening? 8 slides, 1080x1350. node slides.js <projectdir>
const { chromium } = require('playwright'); const fs = require('fs');
const D = process.argv[2], PH = D + '/photos', OUT = D + '/out'; fs.mkdirSync(OUT, { recursive: true });
const NR = '/tmp/claude-0/-home-user-ai-signal/5976107c-b177-5eb8-bcfe-35877bf990a4/scratchpad/indiv/ep3/project/node_modules/@fontsource/newsreader/files', IN = '/usr/share/fonts/opentype/inter';
const CR = Object.fromEntries(JSON.parse(fs.readFileSync(PH + '/credits.json')).map(c => [c.file, c]));
const LIC = c => ({ by: 'CC BY', 'by-sa': 'CC BY-SA', cc0: 'CC0', pdm: 'Public Domain' }[c.license] + (['cc0', 'pdm'].includes(c.license) ? '' : ' ' + c.license_version));
const T = { L: { bg: '#EDE6DA', ink: '#1E1C19', body: '#3B352D', mut: '#7A6E5F', rule: '#CFC5B4' }, D: { bg: '#1E1C19', ink: '#F4EFE6', body: '#D8D0C2', mut: '#8E8475', rule: '#3A362F' } };
const css = `
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-italic.woff2);font-weight:400;font-style:italic}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-italic.woff2);font-weight:500;font-style:italic}
@font-face{font-family:I;src:url(file://${IN}/Inter-Regular.otf);font-weight:400}
@font-face{font-family:I;src:url(file://${IN}/Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${IN}/Inter-SemiBold.otf);font-weight:600}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden}
.ph{position:absolute;left:0;width:1080px;background-size:cover;filter:saturate(.86) sepia(.07) contrast(1.02)}
.txt{position:absolute;left:96px;right:96px}
.hl{font:500 62px/1.08 NR;letter-spacing:-.005em}
.cap{font:500 60px/1.1 NR;letter-spacing:.01em;text-transform:uppercase}
.bd{font:400 36px/1.45 I}
.bd p+p{margin-top:18px}
.it{font:italic 400 46px/1.28 NR}
.cap,.hl,.it{text-wrap:balance}.bd p{text-wrap:pretty}
.lab{font:600 20px I;letter-spacing:.2em;text-transform:uppercase}
.cred{position:absolute;right:24px;font:500 15px I;letter-spacing:.02em}
`;
const grain = d => `<div style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:${d ? 'screen' : 'multiply'};opacity:${d ? .06 : .14};background-image:url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>&quot;)"></div>`;
// slide: [theme, photo, photo position 'top'|'bottom', photo height, y-focus %, html]
const S = [
 ['D', '01_rainy_window.jpg', 'top', 860, 50, t => `<div class="txt" style="top:930px"><div class="cap" style="color:${t.ink}">We spend so much time waiting for life to begin.</div>
   <div class="it" style="margin-top:28px;color:#C9A57A">Maybe that's why we miss most of it.</div></div>`],
 ['L', '02_shibuya_crossing.jpg', 'top', 600, 60, t => `<div class="txt" style="top:660px"><div class="hl">We all have a picture of an extraordinary life.</div>
   <div class="bd" style="margin-top:24px;color:${t.body}"><p>A career we're proud of. Places we've never seen. People who make us feel understood. Experiences worth remembering.</p>
   <p>We tell ourselves: <i style="font:italic 400 40px NR;color:${t.ink}">once I get there, life will finally feel complete.</i></p></div></div>`],
 ['D', '03_train_window.jpg', 'bottom', 600, 45, t => `<div class="txt" style="top:120px"><div class="hl">But somewhere along the way, we stop living in the present.</div>
   <div class="bd" style="margin-top:24px;color:${t.body}"><p>Monday becomes something to get through. We wait for Friday. Then the holidays. Then the next promotion. Then the next big thing.</p>
   <p style="color:${t.ink}">Our entire life becomes a countdown to something else.</p></div></div>`],
 ['L', '04_morning_coffee_book.jpg', 'top', 600, 55, t => `<div class="txt" style="top:660px"><div class="hl">Here's the strange part.</div>
   <div class="bd" style="margin-top:24px;color:${t.body}"><p>We spend years chasing moments that will become memories. But when those moments actually arrive, we're often too busy thinking about what comes next.</p></div>
   <div class="it" style="margin-top:26px;color:${t.ink}">Physically present. Mentally somewhere else.</div></div>`],
 ['D', '05_couple_walking.jpg', 'bottom', 590, 55, t => `<div class="txt" style="top:110px"><div class="hl">Maybe an extraordinary life isn't what we think it is.</div>
   <div class="bd" style="margin-top:22px;color:${t.body}"><p>Not just the big trips, promotions or once-in-a-lifetime experiences.</p>
   <p>Also the random conversation that makes you laugh, the person who remembers the little things, and an ordinary afternoon you wish could last longer.</p></div></div>`],
 ['L', '06_sunlit_window.jpg', 'top', 640, 50, t => `<div class="txt" style="top:710px"><div class="hl">The ordinary isn't the opposite of extraordinary.</div>
   <div class="it" style="margin-top:16px;color:#8A5A3B">Sometimes, it's where the extraordinary is hiding.</div>
   <div class="bd" style="margin-top:22px;color:${t.body}"><p>Our lives don't always lack beautiful moments. Sometimes, we're simply not paying attention.</p></div></div>`],
 ['L', '07_rooftop_dinner.jpg', 'bottom', 610, 50, t => `<div class="txt" style="top:110px"><div class="hl">Think about it.</div>
   <div class="bd" style="margin-top:22px;color:${t.body}"><p>One day, you might miss the routine you've been complaining about. The familiar faces. The daily walks. The conversations that feel so ordinary today.</p></div>
   <div class="it" style="margin-top:22px;color:${t.ink}">We rarely recognise a moment while we're still inside it.</div></div>`],
 ['D', '08_walk_alone.jpg', 'top', 540, 50, t => `<div class="txt" style="top:610px"><div class="cap" style="font-size:56px;color:${t.ink}">Stop waiting for your life to become extraordinary.</div>
   <div class="bd" style="margin-top:26px;color:${t.body}"><p>You might be living through some of the moments you'll miss the most.</p></div>
   <div class="it" style="margin-top:24px;color:#C9A57A">Maybe the life you've been waiting for is already here. You just haven't noticed it yet.</div></div>`],
];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) {
    const [th, ph, pos, h, fy, body] = S[i], t = T[th], c = CR[ph];
    const y = pos === 'top' ? 0 : 1350 - h;
    const credit = `Photo: ${c.creator} / ${LIC(c)}`;
    const credY = pos === 'top' ? `top:${h + 10}px` : `top:${y - 26}px`;
    const foot = pos === 'top' ? `bottom:52px` : `top:${y - 0}px;display:none`;
    const head = pos === 'top' ? '' : '';
    const footer = `<div class="txt lab" style="${pos === 'top' ? 'bottom:56px' : 'top:56px'};display:flex;justify-content:space-between;color:${t.mut}"><span>The Idea Worth Sharing</span><span>0${i + 1} / 08</span></div>`;
    const html = `<html><head><style>${css}</style></head><body style="background:${t.bg};color:${t.ink}">
      <div class="ph" style="top:${y}px;height:${h}px;background-image:url(file://${PH}/${ph});background-position:50% ${fy}%"></div>
      ${body(t)}<div class="cred" style="${credY};color:${t.mut}">${credit}</div>${footer}${grain(th === 'D')}</body></html>`;
    const f = OUT + '/_s.html'; fs.writeFileSync(f, html); await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/life-already-happening-slide-${i + 1}.png` });
  }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
