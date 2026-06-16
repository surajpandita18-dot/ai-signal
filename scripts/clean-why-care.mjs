// Strip "↳ Why you care: …" prefix from india_signal.cards[].why_you in
// content/issues/*.json. The template (IndiaSignal.tsx web + IssueEmail.tsx)
// already renders the prefix; keeping it in the value caused a duplicate.
import { readFile, writeFile } from 'node:fs/promises'

const RE = /^\s*[↳⤷→]?\s*Why you care\s*[:\-—]\s*/i

for (const slug of ['001', '002', '003']) {
  const p = `/Users/surajpandita/ai_signal/content/issues/${slug}.json`
  const c = JSON.parse(await readFile(p, 'utf8'))
  let changed = 0
  for (const card of c.india_signal.cards) {
    const before = card.why_you
    card.why_you = String(before).replace(RE, '').trim()
    if (card.why_you !== before) changed += 1
  }
  await writeFile(p, JSON.stringify(c, null, 2) + '\n')
  console.log(`${slug}: stripped ${changed} card(s)`)
}
