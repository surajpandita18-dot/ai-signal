// The Bigger Picture · "The photo that wasn't on the schedule" (Overview Effect). 8 slides 1080x1350. node slides.js
const { chromium } = require('playwright'); const fs = require('fs');
const D = __dirname, PH = D + '/photos', OUT = D + '/out'; fs.mkdirSync(OUT, { recursive: true });
const F = D + '/fonts/node_modules/@fontsource';
const css = `
@font-face{font-family:IS;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-normal.woff2)}
@font-face{font-family:IS;font-style:italic;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-italic.woff2)}
@font-face{font-family:DS;font-weight:400;src:url(file://${F}/dm-sans/files/dm-sans-latin-400-normal.woff2)}
@font-face{font-family:DS;font-weight:500;src:url(file://${F}/dm-sans/files/dm-sans-latin-500-normal.woff2)}
@font-face{font-family:DS;font-weight:600;src:url(file://${F}/dm-sans/files/dm-sans-latin-600-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden}
.k{background:#000;color:#F1ECE3}.c{background:#1B1916;color:#F1ECE3}.p{background:#EFE9DF;color:#1B1916}
.t{position:absolute;left:84px;right:84px}
.h1{font:400 92px/1.02 IS;letter-spacing:-.01em;text-wrap:balance}
.h2{font:400 66px/1.06 IS;text-wrap:balance}
.b{font:400 34px/1.48 DS;text-wrap:pretty}.b p+p{margin-top:16px}
.q{font:italic 400 52px/1.18 IS;text-wrap:balance}
.s{font:500 25px/1.35 DS}
.meta{font:600 19px DS;letter-spacing:.18em;text-transform:uppercase}
.cr{position:absolute;font:400 18px DS;letter-spacing:.01em}
.ph{position:absolute;left:0;width:1080px;background-size:cover;background-position:center}
.fade{-webkit-mask-image:linear-gradient(transparent,#000 160px,#000 calc(100% - 160px),transparent)}
em{font-style:italic}
.acc{color:#C9A57A}
`;
const N = 8;
const foot = (i, pos, col) => `<div class="t meta" style="${pos};display:flex;justify-content:space-between;color:${col}"><span>05 · The Bigger Picture</span><span>0${i} / 0${N}</span></div>`;
const S = [
 // 1 hook — black space above Earthrise
 ['k', `<div class="ph fade" style="top:270px;height:1080px;background-image:url(file://${PH}/01_earthrise.jpg)"></div>
  ${foot(1, 'top:84px', '#8A8378')}
  <div class="t h1" style="top:170px">The most famous photo of Earth <em class="acc">wasn't on the schedule.</em></div>
  <div class="cr" style="right:84px;top:560px;color:#8A8378">Earthrise · Apollo 8, 24 Dec 1968 · NASA (via NASA Goddard / CC BY 2.0)</div>`],
 // 2 context — split
 ['c', `<div class="ph" style="top:0;height:705px;background-image:url(file://${PH}/02_apollo8_crew.jpg)"></div>
  <div class="cr" style="right:24px;top:713px;color:#8A8378">Borman, Lovell and Anders · NASA (via NASA Goddard / CC BY 2.0)</div>
  <div class="t" style="top:770px"><div class="h2">December 1968. Three men become the first humans to orbit the Moon.</div>
   <div class="b" style="margin-top:22px;color:#D9D2C5">Their job was the Moon: study it, photograph it, scout places to land. On their fourth orbit, something came up over the horizon.</div></div>
  ${foot(2, 'bottom:72px', '#8A8378')}`],
 // 3 discovery — transcript (quote layout)
 ['p', `${foot(3, 'top:84px', '#8A7E6D')}
  <div class="t meta" style="top:200px;color:#8A5A3B">Onboard recording, Apollo 8</div>
  <div class="t" style="top:260px">
   <div class="s" style="color:#8A7E6D">ANDERS</div><div class="q" style="margin-top:8px">“Oh my God! Look at that picture over there! There's the Earth comin' up. Wow, is that pretty!”</div>
   <div class="s" style="margin-top:40px;color:#8A7E6D">BORMAN</div><div class="q" style="margin-top:8px">“Hey, don't take that, it's not scheduled.”</div></div>
  <div class="t b" style="top:700px;color:#3B352D">Anders took it anyway. He asked for colour film, Lovell found a roll, and the picture became <em style="font:italic 400 38px IS">Earthrise.</em></div>
  <div class="t s" style="bottom:72px;font-size:19px;color:#8A7E6D">Transcript: NASA Goddard Scientific Visualization Studio, “Earthrise” (2018)</div>`],
 // 4 turn — Blue Marble, what the photos did
 ['k', `<div class="ph fade" style="top:-40px;height:1000px;background-size:contain;background-repeat:no-repeat;background-image:url(file://${PH}/04_blue_marble.jpg)"></div>
  <div class="cr" style="right:24px;top:930px;color:#8A8378">The Blue Marble · Apollo 17, 7 Dec 1972 · NASA (via NASA Goddard / CC BY 2.0)</div>
  <div class="t" style="top:990px"><div class="h2" style="font-size:58px">They went to discover the Moon. They came back with a picture of home.</div>
   <div class="b" style="margin-top:18px;color:#D9D2C5;font-size:31px">Earthrise is often credited with helping spark the environmental movement. The first Earth Day came 16 months later.</div></div>
  ${foot(4, 'bottom:56px', '#8A8378')}`],
 // 5 deeper — the overview effect
 ['c', `<div class="ph" style="top:0;height:710px;background-image:url(file://${PH}/05_hurricane_earl_iss.jpg)"></div>
  <div class="cr" style="right:24px;top:718px;color:#8A8378">Hurricane Earl from the ISS, 2010 · NASA (via NASA Goddard / CC BY 2.0)</div>
  <div class="t" style="top:775px"><div class="h2">In 1987, Frank White gave it a name: <em class="acc">the Overview Effect.</em></div>
   <div class="b" style="margin-top:18px;color:#D9D2C5">“A cognitive shift in awareness.” Apollo 14's Edgar Mitchell put it more bluntly:</div>
   <div class="q" style="margin-top:14px;font-size:40px;color:#F1ECE3">“You develop an instant global consciousness… and a compulsion to do something about it.”</div></div>
  <div class="t s" style="bottom:108px;font-size:18px;color:#8A8378">Mitchell, People magazine, 8 April 1974</div>
  ${foot(5, 'bottom:56px', '#8A8378')}`],
 // 6 twist — minimal type
 ['p', `${foot(6, 'top:84px', '#8A7E6D')}
  <div class="t meta" style="top:200px;color:#8A5A3B">But here's the twist</div>
  <div class="t h1" style="top:250px;font-size:84px">Maybe the Overview Effect is partly a story we told astronauts.</div>
  <div class="t b" style="top:560px;color:#3B352D"><p>Space historian Jordan Bimm argues it isn't a universal, automatic reaction. It's shaped by culture and by Cold War-era photos like these.</p>
   <p>Astronauts now fly <em style="font:italic 400 38px IS">expecting</em> to feel it, so the idea partly fulfils itself. Not everyone comes back changed.</p></div>
  <div class="t s" style="bottom:72px;font-size:19px;color:#8A7E6D">Bimm, “Rethinking the Overview Effect”, Quest: The History of Spaceflight, 2014</div>`],
 // 7 reflection — Saturn
 ['k', `${foot(7, 'top:84px', '#8A8378')}
  <div class="ph fade" style="top:160px;height:638px;background-image:url(file://${PH}/07_day_earth_smiled.jpg)"></div>
  <div class="cr" style="right:24px;top:806px;color:#8A8378">Saturn from Cassini, 19 Jul 2013 · NASA/JPL-Caltech/SSI, processed by Kevin M. Gill (CC BY 2.0)</div>
  <div class="t" style="top:870px"><div class="b" style="color:#D9D2C5">In 2013, Cassini looked back from Saturn, 1.44 billion km away. Earth was a single point of light.</div>
   <div class="q" style="margin-top:20px;font-size:50px">“Look again at that dot. That's here. That's home. That's us.”</div>
   <div class="s" style="margin-top:14px;font-size:19px;color:#8A8378">Carl Sagan, Pale Blue Dot (1994), on Voyager 1's 1990 photo</div></div>`],
 // 8 ending
 ['k', `<div class="ph" style="top:0;height:720px;background-image:url(file://${PH}/08_belgium_night_iss.jpg)"></div>
  <div class="cr" style="right:24px;top:728px;color:#8A8378">Belgium at night from the ISS · NASA (via NASA Goddard / CC BY 2.0)</div>
  <div class="t" style="top:790px"><div class="h2">Every light down there is someone's ordinary evening.</div>
   <div class="b" style="margin-top:20px;color:#D9D2C5">You will probably never see this view. But you can still ask the question it asks: <em class="acc" style="font:italic 400 38px IS">from far enough away, what would still matter?</em></div></div>
  ${foot(8, 'bottom:72px', '#8A8378')}`],
];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const f = OUT + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body class="${S[i][0]}">${S[i][1]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/overview-effect-slide-${i + 1}.png` }); }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
