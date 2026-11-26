// ThinkSafari No. 01 — The Social Media Sea Change. 8 slides, 1080x1350. node slides.js
const { chromium } = require('playwright'); const fs = require('fs');
const D = __dirname, P = D + '/photos', OUT = D + '/out'; fs.mkdirSync(OUT, { recursive: true });
const F = D + '/../carousel3/fonts/node_modules/@fontsource';
const C = { paper: '#F4F3F0', ink: '#141414', grey: '#77746E', dk: '#151515', dkText: '#ECEAE5', dkGrey: '#8D8A84', white: '#FFFFFF' };
const css = `
@font-face{font-family:IS;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-normal.woff2)}
@font-face{font-family:IS;font-style:italic;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-italic.woff2)}
@font-face{font-family:DS;font-weight:400;src:url(file://${F}/dm-sans/files/dm-sans-latin-400-normal.woff2)}
@font-face{font-family:DS;font-weight:500;src:url(file://${F}/dm-sans/files/dm-sans-latin-500-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:DS}
.a{position:absolute}.m{left:84px;right:84px}
.h{font:400 80px/1.02 IS;letter-spacing:-.012em;text-wrap:balance}
.q{font:italic 400 60px/1.1 IS;text-wrap:balance}
.b{font:400 33px/1.45 DS;letter-spacing:-.003em;text-wrap:pretty}
.cap{font:400 22px/1.35 DS;letter-spacing:.003em}
.foot{left:84px;right:84px;bottom:56px;display:flex;justify-content:space-between;font:400 20px DS;letter-spacing:.01em}
img{display:block;position:absolute}
`;
const foot = (i, col) => `<div class="a foot" style="color:${col}"><span>ThinkSafari · The Social Media Sea Change</span><span>${i} / 8</span></div>`;
const S = [
 // 1 — hook
 [C.paper, `<img src="file://${P}/01_kl_subway.jpg" style="left:84px;top:96px;width:912px;height:684px;object-fit:cover">
  <div class="a cap" style="right:84px;top:792px;color:${C.grey}">Morning commute, Kuala Lumpur. Photo: Franck Michel (CC BY 2.0)</div>
  <div class="a m" style="top:880px"><div class="h" style="font-size:88px">We didn’t quit social media.</div>
   <div class="q" style="margin-top:10px;font-size:62px;color:#3A3936">It quietly stopped being social.</div></div>
  ${foot(1, C.grey)}`],
 // 2 — the relatable moment
 [C.paper, `<div class="a m" style="top:140px"><div class="h" style="font-size:72px">You open the app to see your friends.</div>
   <div class="b" style="margin-top:28px;color:#2C2B29;max-width:800px">Twenty minutes later you’ve watched a stranger renovate a kitchen, three ads and a man explaining the economy. You can’t name one thing a friend posted.</div></div>
  <img src="file://${P}/02_silhouette_phone.jpg" style="left:240px;top:680px;width:840px;height:489px;object-fit:cover">
  <div class="a cap" style="right:84px;top:1181px;color:${C.grey}">Photo: Warren Wong (CC0)</div>
  ${foot(2, C.grey)}`],
 // 3 — the deeper question (archival)
 [C.paper, `<div class="a m" style="top:120px"><div class="h" style="font-size:72px">Maybe it isn’t you. Maybe the place changed.</div></div>
  <img src="file://${P}/03_thiollier_village_1910.jpg" style="left:84px;top:330px;width:912px;height:678px;object-fit:cover">
  <div class="a cap" style="left:84px;top:1018px;color:${C.grey}">Neighbours on a village street, Auvergne, c. 1910. Félix Thiollier / The Met (public domain)</div>
  <div class="a m b" style="top:1078px;font-size:31px;color:#2C2B29">Anne Helen Petersen watched her feed turn “from a neighborhood populated with friends to a glossy condo development of brands.”</div>
  ${foot(3, C.grey)}`],
 // 4 — the discovery (data)
 [C.paper, `<img src="file://${P}/04_times_square_1910.jpg" style="left:0;top:0;width:1080px;height:608px;object-fit:cover">
  <div class="a cap" style="right:84px;top:620px;color:${C.grey}">Times Square billboards, c. 1910 (public domain)</div>
  <div class="a" style="left:84px;top:672px;width:420px"><div style="font:400 200px/1 IS;letter-spacing:-.03em">7%</div><div class="b" style="font-size:28px;color:${C.grey};margin-top:6px">Instagram</div></div>
  <div class="a" style="left:540px;top:672px;width:456px"><div style="font:400 200px/1 IS;letter-spacing:-.03em">17%</div><div class="b" style="font-size:28px;color:${C.grey};margin-top:6px">Facebook</div></div>
  <div class="a m b" style="top:960px;color:#2C2B29">Of all the time people spent on these apps in 2025, that’s how much went to posts from friends. Two years earlier it was 11% and 22%.</div>
  <div class="a m cap" style="top:1172px;color:${C.grey}">Meta’s own figures, from its opening slides in the FTC antitrust trial, April 2025.</div>
  ${foot(4, C.grey)}`],
 // 5 — the story (type only)
 [C.dk, `<div class="a m b" style="top:250px;color:${C.dkGrey};max-width:820px">The day before Christmas Eve, Anne Helen Petersen deleted Instagram and email from her phone. She meant to put them back. Days passed. She kept not doing it.</div>
  <div class="a m" style="top:640px"><div class="q" style="font-size:84px;line-height:1.04;color:${C.dkText}">“I haven’t come to value it less; instead, it’s become less valuable.”</div></div>
  ${foot(5, C.dkGrey)}`],
 // 6 — the twist
 [C.paper, `<img src="file://${P}/06_palm_springs_mall.jpg" style="left:0;top:0;width:1080px;height:810px;object-fit:cover">
  <div class="a cap" style="right:84px;top:822px;color:${C.grey}">Palm Springs Mall, California. Photo: Woolox (CC BY-SA 4.0)</div>
  <div class="a m" style="top:890px"><div class="h" style="font-size:72px">That sounds like willpower. It isn’t.</div>
   <div class="b" style="margin-top:20px;color:#2C2B29">We rarely leave because we got stronger. We leave when a place stops giving back what it takes. The apps didn’t lose us. They lost their use.</div></div>
  ${foot(6, C.grey)}`],
 // 7 — the bigger idea
 [C.dk, `<img src="file://${P}/07_subway_reading.jpg" style="left:0;top:120px;width:860px;height:571px;object-fit:cover">
  <div class="a cap" style="left:84px;top:703px;color:${C.dkGrey}">Photo: Alexandre Dulaunoy (CC BY-SA 2.0)</div>
  <div class="a m" style="top:790px"><div class="q" style="font-size:80px;color:${C.dkText}">“Boredom is when life happens.”</div>
   <div class="cap" style="margin-top:14px;font-size:20px;color:${C.dkGrey}">Kate Lindsay, quoted by Petersen</div>
   <div class="b" style="margin-top:26px;color:#C9C6C0">The book on the train. Small talk in a slow pharmacy queue. The errand you keep putting off. Life, quietly happening off-screen.</div></div>
  ${foot(7, C.dkGrey)}`],
 // 8 — the ending
 [C.white, `<div class="a m b" style="top:130px;color:${C.grey};max-width:830px">When she left Instagram, her first worry was embarrassingly simple: how would people know she’d gone skiing? That she had friends?</div>
  <div class="a m" style="top:350px"><div class="q" style="font-size:96px;line-height:1.02;color:${C.ink}">“‘People’ may not know, but I do.”</div></div>
  <img src="file://${P}/08_skier.jpg" style="left:0;top:580px;width:1080px;height:606px;object-fit:cover;object-position:50% 55%">
    <div class="a cap" style="right:84px;top:1198px;color:${C.grey}">Grand Teton National Park. Photo: NPS (public domain)</div>
  ${foot(8, C.grey)}`],
];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const f = OUT + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body style="background:${S[i][0]};color:${C.ink}">${S[i][1]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/01-social-media-sea-change-${i + 1}.png` }); }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
