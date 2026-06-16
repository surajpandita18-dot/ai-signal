#!/usr/bin/env node
/**
 * Scaffold a new weekly issue.
 *
 *   node scripts/new-issue.mjs <number>
 *   node scripts/new-issue.mjs 004
 *
 * What it does:
 *   1. Clones the most recent issue JSON (or a specific --from <slug>) as the
 *      structural template — same shape, same section spine.
 *   2. Resets identity fields (issue_number, slug, status='draft', published_at=null).
 *   3. Sets date_display to the next Saturday after today (DD.MM.YYYY) so the cron
 *      lines up naturally; override with --date DD.MM.YYYY if you want a specific day.
 *   4. Replaces every editorial text field with a clear `[TODO: …]` placeholder so you
 *      see in your editor exactly what needs writing.
 *   5. Leaves structural fields (rotation_note shape, lens roles, status_hot bools,
 *      decoder term keys, etc.) intact as scaffolding hints.
 *   6. Adds the full interview-prep-brief skeleton (framework_name, sample_answer_html,
 *      counters[], traps[], …) per system/INTERVIEW-RUBRIC.md so you can write directly
 *      to the deep shape — no need to remember the rubric structure from memory.
 *   7. Validates the JSON parses, prints a clear "what to write next" punch list.
 *
 * What it does NOT do:
 *   - Call Anthropic / OpenAI / any LLM to draft content. Per CLAUDE.md, "The One
 *     Thing" first draft is always human-written.
 *   - Push to Supabase. After editing, follow the seed pattern (or paste
 *     system/ops/*.sql as needed).
 *   - Rotate primary lens / rep type / harm tag for you — those are editorial choices
 *     you make per-issue.
 *
 * Idempotent: refuses to overwrite an existing issue file unless --force.
 */
import { readFile, writeFile, readdir, access } from 'node:fs/promises'
import path from 'node:path'

const REPO = path.resolve(import.meta.dirname, '..')
const ISSUES_DIR = path.join(REPO, 'content/issues')

const TODO = (hint) => `[TODO: ${hint}]`
const TODO_HTML = (hint) => `<!-- TODO: ${hint} -->`

function parseArgs(argv) {
  const args = { force: false }
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force') args.force = true
    else if (a === '--from') args.from = argv[++i]
    else if (a === '--date') args.date = argv[++i]
    else if (!a.startsWith('--')) positional.push(a)
  }
  args.number = positional[0]
  return args
}

function pad3(n) {
  return String(n).padStart(3, '0')
}

function nextSaturday(from = new Date()) {
  // Returns the next Saturday strictly AFTER `from` (i.e., if today is
  // Saturday, returns next Saturday, not today).
  const d = new Date(from)
  const day = d.getDay() // 0=Sun, 6=Sat
  const daysToAdd = ((6 - day + 7) % 7) || 7
  d.setDate(d.getDate() + daysToAdd)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}.${mm}.${yyyy}`
}

async function pickFromSlug() {
  // Latest existing issue file (highest numeric slug) becomes the template.
  const files = await readdir(ISSUES_DIR)
  const slugs = files
    .filter((f) => /^\d{3}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort()
  if (slugs.length === 0) {
    throw new Error('No existing issue JSONs to template from. Add at least one before running.')
  }
  return slugs[slugs.length - 1]
}

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

function scaffoldEditorialPlaceholders(template) {
  const t = structuredClone(template)

  // ── hero
  t.hero_headline_html = TODO_HTML('hero headline: 2-3 lines, lead with the specific shift, e.g. "This week, RBI<br>quietly <em>changed<br>the rules.</em>"')
  t.hero_sub_html = TODO_HTML('1-2 sentences: what happened + the calm framing. Ends with: <strong>Skim it in 5, or go deep in 12 — your call.</strong>')

  // ── tldr — keep label + target as scaffolding, blank the body
  if (Array.isArray(t.tldr)) {
    t.tldr = t.tldr.map((r) => ({
      ...r,
      body: TODO(`tldr "${r.label}" one-line summary`),
    }))
  }

  // ── one_thing
  t.one_thing.head = TODO('the one thing — short headline')
  t.one_thing.lede_html = TODO_HTML('one_thing lede: 1 paragraph, the actual story + why it matters this week. The hand-written soul of the issue.')
  t.one_thing.skip_list.body = TODO('skip list: name the thing not worth reading this week + 1-line why')

  // ── so_what — keep rotation_note shape + lens roles, blank bodies
  t.so_what.rotation_note.primary = TODO('which lens is primary this week (Builder / Product+Biz / Secure Pro / Switcher)')
  t.so_what.rotation_note.next = TODO('next primary lens')
  if (Array.isArray(t.so_what.lenses)) {
    t.so_what.lenses = t.so_what.lenses.map((l) => ({
      ...l,
      body_html: TODO_HTML(`${l.label} lens body: 2-3 sentences, scenario-grounded, ends with a concrete next move`),
      action: TODO(`${l.label} action: "→ Do: <concrete weekend artifact>"`),
      is_primary: false,
    }))
    // mark first lens as primary by default; editor toggles
    if (t.so_what.lenses[0]) t.so_what.lenses[0].is_primary = true
  }

  // ── build_notes
  t.build_notes.title = TODO('Build Notes title — the specific gotcha, e.g. "Quantization in plain English — and the one knob that quietly breaks your model."')
  t.build_notes.paper_ref = TODO('paper ref — "Author et al., \\"Title\\" (Venue Year)"')
  t.build_notes.paper_link = TODO('paper URL (arxiv preferred) — leave "" if none')
  t.build_notes.eval_link = TODO('eval/code link — leave "" if none')
  t.build_notes.skim_html = TODO_HTML('Build Notes skim: 20-second version with one ship-metric')
  t.build_notes.struggle_html = TODO_HTML('the production struggle the reader knows')
  t.build_notes.finding_html = TODO_HTML('what the paper found, with one real number + source')
  t.build_notes.fix_html = TODO_HTML('the fix, named, concrete enough to ship')
  t.build_notes.metric_html = TODO_HTML('measured impact (before/after with one specific number)')
  t.build_notes.ship_this_week_html = TODO_HTML('one-line "copy-paste this code" guidance')
  t.build_notes.code.lang = 'python'
  t.build_notes.code.body = '# TODO: 10-15 line copyable artifact — the one reader can paste\n'
  t.build_notes.diagram_svg = TODO('inline SVG diagram (viewBox + role="img" + aria-label)')

  // ── job_signal
  if (Array.isArray(t.job_signal.rows)) {
    t.job_signal.rows = t.job_signal.rows.map((r) => ({
      ...r,
      what_html: TODO_HTML('job row: one concrete hiring trend, named org or stack'),
    }))
  }
  t.job_signal.spotlight.header = TODO('spotlight header — the one stat that frames this week')
  t.job_signal.spotlight.stat = TODO('stat (e.g. "₹42 LPA")')
  t.job_signal.spotlight.stat_sub = TODO('stat sub — what the number means')
  t.job_signal.spotlight.source = TODO('source (specific named report + year)')
  t.job_signal.spotlight.sodo_html = TODO_HTML('"↳ So do this: <concrete action this week>"')
  t.job_signal.upskill.title = TODO('upskill ladder title')
  t.job_signal.upskill.intro_html = TODO_HTML('upskill intro — 1 sentence framing the ladder')
  if (Array.isArray(t.job_signal.upskill.rungs)) {
    t.job_signal.upskill.rungs = t.job_signal.upskill.rungs.map((r) => ({
      label: TODO('rung label (e.g. "Week 1")'),
      body_html: TODO_HTML('rung body: 1 concrete action'),
    }))
  }
  t.job_signal.upskill.note_html = TODO_HTML('upskill ladder closing note')

  // ── interview prep brief — FULL skeleton per system/INTERVIEW-RUBRIC.md
  t.job_signal.interview = {
    q_label: TODO('q_label (e.g. "AI PM · regulated stack")'),
    q: TODO('the question, verbatim. Scenario-grounded. ~30-80 words.'),
    framework_name: TODO('memorable named framework (e.g. "Counterfactual → slice → observability → kill criteria")'),
    why_they_ask_html: TODO_HTML('section 2 — what they\'re testing, why the obvious answer is the trap. 100-150 words.'),
    steps: [
      { n: 1, body_html: TODO_HTML('framework step 1') },
      { n: 2, body_html: TODO_HTML('framework step 2') },
      { n: 3, body_html: TODO_HTML('framework step 3') },
      { n: 4, body_html: TODO_HTML('framework step 4') },
    ],
    sample_answer_html: TODO_HTML('section 4 — first-person spoken sample answer, 300-450 words. Include 3-5 <span class="why">[why this works: ...]</span> annotations.'),
    depth_guide_html: TODO_HTML('section 5 — what to lead with vs hold for the probe. 80-120 words.'),
    counters: [1, 2, 3, 4].map((i) => ({
      q: TODO(`counter-question ${i} — the follow-up they ask`),
      strong_html: TODO_HTML(`counter ${i} strong answer: 1-3 sentences`),
      weak_html: TODO_HTML(`counter ${i} weak answer: the common wrong move`),
      why_weak_loses_html: TODO_HTML(`counter ${i} why the weak answer loses signal`),
    })),
    traps: [1, 2, 3].map((i) => ({
      move: TODO(`trap ${i} — the specific wrong move (≤15 words, scannable)`),
      signal_lost_html: TODO_HTML(`trap ${i} — what seniority signal this loses (1-2 sentences)`),
    })),
    good_vs_great_html: TODO_HTML('section 8 — the ONE move that takes the answer from hire to strong-hire. 80-120 words.'),
    meta_skill_html: TODO_HTML('the durable transferable skill — 1 sentence.'),
    tip_html: TODO_HTML('back-compat closer (legacy field; deep brief uses meta_skill_html instead)'),
    read_time_min: 8,
  }

  // ── under_the_hood
  t.under_the_hood.question_html = TODO_HTML('Under the Hood entry-point question, plain English')
  t.under_the_hood.diagram_svg = TODO('inline SVG diagram (viewBox + role="img" + aria-label)')
  if (Array.isArray(t.under_the_hood.steps)) {
    t.under_the_hood.steps = t.under_the_hood.steps.map((s, i) => ({
      n: String(i + 1).padStart(2, '0'),
      title: TODO(`UTH step ${i + 1} title`),
      body_html: TODO_HTML(`UTH step ${i + 1} body`),
    }))
  }
  t.under_the_hood.source = {
    text: TODO('UTH source text (named paper + year)'),
    link: TODO('UTH source URL'),
  }

  // ── the_rep — rotate type
  t.the_rep.type = TODO('rep type: "audit" | "build" | "compare" | "break" (rotate weekly)')
  t.the_rep.lite_html = TODO_HTML('rep LITE: the 15-min version')
  t.the_rep.full_html = TODO_HTML('rep FULL: the deep weekend version')
  t.the_rep.done = TODO('"Done looks like: <one-liner>"')
  t.the_rep.reader_win = {
    quote: TODO('reader win quote (real or curated)'),
    by: TODO('attribution (Name, Role)'),
    link: TODO('attribution link if any (else "")'),
  }

  // ── toolbox
  if (t.toolbox) {
    t.toolbox.tool_html = TODO_HTML('one tool + 1-line "what it actually does for you"')
    t.toolbox.try_html = TODO_HTML('"try this in 5 min: <concrete action>" — show payoff, not CTA')
  }

  // ── reality_check
  t.reality_check.harm_tag = TODO('harm: "environment" | "labor" | "bias" | "privacy" | "power"')
  t.reality_check.h3 = TODO('Reality Check h3 — the honest line')
  t.reality_check.body_html = TODO_HTML('1-2 paragraphs, named source + year, no doom')
  t.reality_check.honest_html = TODO_HTML('the honest bit: what we don\'t know / what we\'re still wrong about')
  t.reality_check.source = TODO('source (specific named, year)')

  // ── india_signal
  if (Array.isArray(t.india_signal.cards)) {
    t.india_signal.cards = t.india_signal.cards.map((c, i) => ({
      cat: TODO(`card ${i + 1} category (e.g. "Transport · Bengaluru")`),
      status: TODO('status (e.g. "shipped" / "open-source" / "data drop")'),
      status_hot: false,
      h4: TODO(`card ${i + 1} headline`),
      body: TODO(`card ${i + 1} body — 1-2 lines, concrete + sourced`),
      why_you: TODO(`card ${i + 1} why_you — concrete reader benefit, not platitude`),
      source_url: '',
    }))
  }
  t.india_signal.foot = TODO('India Signal foot — invite to send tips')
  t.india_signal.foot_cta = TODO('India Signal CTA label (e.g. "Reply and send it →")')
  t.india_signal.foot_cta_url = TODO('mailto: link, not "#"')

  // ── sponsor stays null by default
  t.sponsor = null

  // ── decoder
  if (t.decoder && Array.isArray(t.decoder.terms)) {
    t.decoder.intro = TODO('decoder intro — 1 sentence')
    t.decoder.terms = t.decoder.terms.map(() => ({
      term: TODO('jargon term'),
      plain: TODO('plain-English explanation, 1-2 sentences'),
    }))
  }

  // ── closer
  t.closer.format = TODO('closer format: "dark-joke" | "absurd-true" | "provocation" (rotate)')
  t.closer.format_label = TODO('format label (e.g. "This week: the dark one")')
  t.closer.body_html = TODO_HTML('closer body, ends with <span class="punch">…</span>')

  // ── poll
  t.poll.question = TODO('poll question')
  t.poll.options = ['TODO option 1', 'TODO option 2', 'TODO option 3', 'TODO option 4']

  // ── foot
  t.foot.reply_prompt = TODO('reply prompt — 1 sentence inviting replies')
  t.foot.next_issue = TODO('next-issue teaser — 1 sentence')

  return t
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.number) {
    console.error('Usage: node scripts/new-issue.mjs <number> [--from <slug>] [--date DD.MM.YYYY] [--force]')
    console.error('Example: node scripts/new-issue.mjs 004')
    process.exit(2)
  }

  const issueNumber = Number(args.number)
  if (!Number.isInteger(issueNumber) || issueNumber < 1) {
    console.error(`Issue number must be a positive integer, got: ${args.number}`)
    process.exit(2)
  }

  const slug = pad3(issueNumber)
  const targetPath = path.join(ISSUES_DIR, `${slug}.json`)

  if (await fileExists(targetPath) && !args.force) {
    console.error(`Refusing to overwrite ${targetPath}. Use --force to override.`)
    process.exit(1)
  }

  const fromSlug = args.from ?? (await pickFromSlug())
  const fromPath = path.join(ISSUES_DIR, `${fromSlug}.json`)
  if (!(await fileExists(fromPath))) {
    console.error(`Template not found: ${fromPath}`)
    process.exit(1)
  }

  const template = JSON.parse(await readFile(fromPath, 'utf8'))
  const dateDisplay = args.date ?? nextSaturday()

  const draft = scaffoldEditorialPlaceholders(template)
  draft.issue_number = issueNumber
  draft.slug = slug
  draft.status = 'draft'
  draft.published_at = null
  draft.date_display = dateDisplay
  // streak_caption, hero_eyebrow, read_time_min stay from template

  await writeFile(targetPath, JSON.stringify(draft, null, 2) + '\n', 'utf8')

  // Re-parse to confirm valid JSON.
  JSON.parse(await readFile(targetPath, 'utf8'))

  console.log(`✓ Created ${path.relative(REPO, targetPath)}`)
  console.log(`  templated from ${fromSlug}.json`)
  console.log(`  scheduled for ${dateDisplay} (Saturday)`)
  console.log(``)
  console.log(`Next steps:`)
  console.log(`  1. Open the file in your editor. Every [TODO: ...] and <!-- TODO: ... --> tells you what to write.`)
  console.log(`  2. Editorial spine to fill, in order of importance:`)
  console.log(`       - one_thing (the human-written soul; never auto-draft this)`)
  console.log(`       - hero_headline_html + hero_sub_html + tldr[].body`)
  console.log(`       - so_what.lenses[] (pick primary; write all 4)`)
  console.log(`       - build_notes (one real number + one copyable artifact)`)
  console.log(`       - job_signal.interview (full prep-brief per system/INTERVIEW-RUBRIC.md)`)
  console.log(`       - under_the_hood + the_rep + toolbox + reality_check + india_signal`)
  console.log(`       - decoder (jargon for THIS issue)`)
  console.log(`       - closer + poll`)
  console.log(`  3. Smoke check while drafting: node scripts/smoke.mjs`)
  console.log(`  4. Preview locally: AIB_PREVIEW_FROM_JSON=1 npm run dev → open http://localhost:3000/i/${slug}`)
  console.log(`  5. When ready: insert into Supabase (see system/ops/ for the seed pattern),`)
  console.log(`     then UPDATE issues SET status='published', published_at=now() WHERE slug='${slug}';`)
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
