import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import path from 'path';
import {browserExecutable} from './browser.mjs';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'Reel', browserExecutable});
await renderMedia({composition: comp, serveUrl, codec: 'h264', outputLocation: 'out/silent.mp4', browserExecutable, crf: 18, concurrency: 4});
console.log('done: out/silent.mp4');
