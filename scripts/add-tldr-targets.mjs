// Patches content/issues/*.json with TLDR row -> anchor target mappings.
// Idempotent; re-running just rewrites the same targets.
import { readFile, writeFile } from 'node:fs/promises'

const TARGETS = {
  'Big one': '01',
  'Build Notes': 'bn',
  'Jobs': '03',
  'Reality': '07',
}

for (const slug of ['001', '002', '003']) {
  const p = `/Users/surajpandita/ai_signal/content/issues/${slug}.json`
  const c = JSON.parse(await readFile(p, 'utf8'))
  c.tldr = c.tldr.map((row) => ({
    ...row,
    target: TARGETS[row.label] ?? row.target ?? undefined,
  }))
  await writeFile(p, JSON.stringify(c, null, 2) + '\n')
  const sample = c.tldr.map((r) => `${r.label}→${r.target}`).join(', ')
  console.log(`${slug}: ${sample}`)
}
