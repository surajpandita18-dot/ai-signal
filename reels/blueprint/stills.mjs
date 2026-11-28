// node stills.mjs 120 480 900  -> stills/f120.png ... at half scale
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {browserExecutable} from './browser.mjs';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Reel', browserExecutable});
fs.mkdirSync('stills', {recursive: true});
for (const f of process.argv.slice(2).map(Number)) {
  await renderStill({composition: comp, serveUrl, frame: f, output: `stills/f${f}.png`, scale: 0.5, browserExecutable});
  console.log('ok', f);
}
