// Use the pre-installed headless Chromium if present (cloud sessions); otherwise let Remotion download one.
import fs from 'fs';
const root = '/opt/pw-browsers';
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
let found = null;
if (isDir(root)) {
  for (const d of fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell-') && isDir(`${root}/${d}`))) {
    for (const sub of fs.readdirSync(`${root}/${d}`)) {
      const p = `${root}/${d}/${sub}/chrome-headless-shell`;
      if (fs.existsSync(p)) found = p;
    }
  }
}
export const browserExecutable = found;
