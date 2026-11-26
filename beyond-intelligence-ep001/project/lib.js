const F = '/usr/share/fonts/opentype/inter/';
const C = { bg: '#121110', bg2: '#1B1916', ink: '#EDE8DE', amber: '#D99A3D', grey: '#8C867B', hair: '#2E2B26' };

const css = `
@font-face{font-family:I;src:url(file://${F}Inter-Light.otf);font-weight:300}
@font-face{font-family:I;src:url(file://${F}Inter-Regular.otf);font-weight:400}
@font-face{font-family:I;src:url(file://${F}Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${F}Inter-SemiBold.otf);font-weight:600}
@font-face{font-family:I;src:url(file://${F}Inter-Bold.otf);font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent;font-family:I,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:overlay;
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 40%,rgba(0,0,0,.55) 100%)}
`;

// The mark: a 3x3 lattice (Go intersections / network nodes) and one amber node
// that has stepped outside the grid -> "beyond".
function mark(size, { stroke = C.ink, accent = C.amber, line = true } = {}) {
  const s = size, g = s / 4.2, o = s * 0.14, r = s * 0.052, lw = Math.max(1.2, s * 0.018);
  let el = '';
  if (line) for (let i = 0; i < 3; i++) {
    el += `<line x1="${o}" y1="${o + 2 * g - i * g + g * 0}" x2="${o + 2 * g}" y2="${o + 2 * g - i * g}" stroke="${stroke}" stroke-opacity=".35" stroke-width="${lw}"/>`;
    el += `<line x1="${o + i * g}" y1="${o + 0 + g * 0}" x2="${o + i * g}" y2="${o + 2 * g}" stroke="${stroke}" stroke-opacity=".35" stroke-width="${lw}"/>`;
  }
  // grid sits in lower-left; shift down so the escaped node has room top-right
  const dy = g * 0.9;
  let nodes = '';
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++)
    nodes += `<circle cx="${o + x * g}" cy="${o + y * g}" r="${r}" fill="${stroke}"/>`;
  const ex = o + 2 * g + g * 0.95, ey = o - g * 0.95;
  const esc = `<line x1="${o + 2 * g}" y1="${o}" x2="${ex}" y2="${ey}" stroke="${accent}" stroke-width="${lw}" stroke-dasharray="${lw * 2.2} ${lw * 2}"/>
  <circle cx="${ex}" cy="${ey}" r="${r * 1.35}" fill="${accent}"/>`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><g transform="translate(0 ${dy})">${el}${nodes}${esc}</g></svg>`;
}

function word(sz, { gap = 0.42, color = C.ink } = {}) {
  return `<div style="line-height:.92;letter-spacing:${gap}em;font-weight:300;font-size:${sz}px;color:${color};margin-right:-${gap}em">BEYOND</div>
  <div style="line-height:1.05;letter-spacing:.06em;font-weight:700;font-size:${sz * 1.0}px;color:${color};margin-top:${sz * .12}px">INTELLIGENCE</div>`;
}

module.exports={C,css,mark,word};
