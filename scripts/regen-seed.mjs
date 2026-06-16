// Regenerate db/seed.sql from current content/issues/001.json
// so the seed matches the post-audit content updates.
import { readFile, writeFile } from 'node:fs/promises'

const c = JSON.parse(await readFile('content/issues/001.json', 'utf8'))

const j = (obj) => `$json$${JSON.stringify(obj)}$json$::jsonb`
const t = (s) => s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`

const sql = `-- AI, Basically. — seed
-- Inserts Issue 001 (regenerated from content/issues/001.json) + one test subscriber.
-- Idempotent.

insert into issues (
  issue_number, slug, status, published_at,
  hero_eyebrow, hero_headline_html, hero_sub_html,
  date_display, read_time_min, streak_caption,
  tldr,
  one_thing, so_what, build_notes, job_signal, under_the_hood,
  the_rep, toolbox, reality_check, india_signal,
  sponsor, closer, poll, foot
) values (
  ${c.issue_number},
  '${c.slug}',
  '${c.status}',
  ${c.published_at ? `'${c.published_at}'` : 'null'},
  ${t(c.hero_eyebrow)},
  ${t(c.hero_headline_html)},
  ${t(c.hero_sub_html)},
  ${t(c.date_display)},
  ${c.read_time_min},
  ${t(c.streak_caption)},
  ${j(c.tldr)},
  ${j(c.one_thing)},
  ${j(c.so_what)},
  ${j(c.build_notes)},
  ${j(c.job_signal)},
  ${j(c.under_the_hood)},
  ${j(c.the_rep)},
  ${c.toolbox == null ? 'null' : j(c.toolbox)},
  ${j(c.reality_check)},
  ${j(c.india_signal)},
  ${c.sponsor == null ? 'null' : j(c.sponsor)},
  ${j(c.closer)},
  ${j(c.poll)},
  ${j(c.foot)}
)
on conflict (issue_number) do nothing;

-- Test subscriber — Suraj himself, Builder track.
insert into subscribers (email, role, source)
values ('suraj.pandita18@gmail.com', 'builder', 'seed')
on conflict (email) do nothing;
`

await writeFile('db/seed.sql', sql)
console.log('regenerated db/seed.sql:', sql.length, 'chars')
