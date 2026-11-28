// Use the pre-installed headless Chromium if present (cloud sessions); otherwise let Remotion download one.
import fs from 'fs';
const root = '/opt/pw-browsers';
let found = null;
if (fs.existsSync(root)) {
  for (const d of fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell'))) {
    for (const sub of fs.readdirSync(`${root}/${d}`)) {
      const p = `${root}/${d}/${sub}/chrome-headless-shell`;
      if (fs.existsSync(p)) found = p;
    }
  }
}
export const browserExecutable = found;
