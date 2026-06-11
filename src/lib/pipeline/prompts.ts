/**
 * Anthropic prompt templates for AI, Basically.
 *
 * One exported function per generatable section. Each returns the full
 * system+user prompt as a single string the orchestrator passes to the
 * Anthropic SDK (we use claude-sonnet-4-6 for v1; the orchestrator decides
 * which model to call).
 *
 * Every prompt follows the same shape so the orchestrator can rely on it:
 *   1. Voice constitution (calm, anti-slop, no FOMO).
 *   2. Hard editorial rules relevant to this section.
 *   3. Exact JSON output schema, keyed by the IssueContent nested type.
 *   4. ONE passing example.
 *   5. ONE failing example + the failure reason.
 *
 * Prompts ARE NOT generated for:
 *   - one_thing (always human-written — CLAUDE.md hard editorial rule)
 *   - sponsor (sold separately)
 *   - hero/tldr/poll/foot/streak (templated or editor-written)
 */

import type { GenerationInput, GenerationContext } from './types'
import type { Lens } from '../content-model'

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared blocks                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

/** Voice constitution — pasted into every prompt. */
const VOICE = `VOICE CONSTITUTION (non-negotiable)
- Calm confidence. Never fear, urgency, or FOMO. No "you don't want to miss this".
- Anti-slop: no recycled LinkedIn takes, no hype, no emoji except the three allowed marks below.
- Sound like one smart, honest friend explaining things — not a thread bro, not a corporate blog.
- English. No Hinglish (only Suraj writes Hinglish, and only by hand).
- Exclamation marks are banned. All-caps is banned. Em-dashes are fine; semicolons are fine.
- Allowed marks: ↑ (up) ⚡ (hot) ↳ (so do this) — and ONLY in the slots the schema names.`

/** Hard editorial rules that apply across most sections. */
const EDITORIAL = `HARD EDITORIAL RULES
- Every stat must carry a named source + a year. "estimates suggest" / "many believe" = cut.
- Jargon → 4-word plain-English gloss on first use. Build Notes is the only "Nerd Lane".
- No take, Rep, or tip that would fit the last 4 issues unchanged. If it could be recycled, rewrite.
- The reader must be able to do something with this section *this week* — name the verb.
- Don't leave non-technical readers in the cold. If a section is technical, tell them they can skip.`

/** Standard JSON-only output rules pasted into every prompt. */
const OUTPUT_RULES = `OUTPUT RULES
- Output ONE valid JSON object. No prose before or after. No markdown fence.
- Every string field must be present. Use "" only where the schema explicitly says optional.
- Strings whose names end in _html may contain only: <em>, <strong>, <b>, <br>, <code>, <span class="punch">.
- No <script>, no <a>, no images, no inline styles.`

/** Format the source pack the same way for every prompt. */
function formatSources(input: GenerationInput): string {
  const list = input.sources
    .map((s, i) => {
      const attribution = s.source_newsletter
        ? ` (via ${s.source_newsletter})`
        : ''
      return `[#${i + 1}] ${s.title}${attribution}\nURL: ${s.url}\n${s.body.trim()}`
    })
    .join('\n\n---\n\n')
  const note = input.editor_note
    ? `\n\nEDITOR NOTE (framing — follow this):\n${input.editor_note.trim()}`
    : ''
  return `SOURCE MATERIAL:\n\n${list}${note}`
}

function lensLabel(role: Lens): string {
  switch (role) {
    case 'builder':
      return 'Builder'
    case 'product_biz':
      return 'Product / Biz'
    case 'secure_pro':
      return 'Secure Pro'
    case 'switcher':
      return 'Switcher'
  }
}

function lensCaption(role: Lens): string {
  switch (role) {
    case 'builder':
      return 'You ship the thing'
    case 'product_biz':
      return 'You decide what gets shipped'
    case 'secure_pro':
      return 'You keep the thing safe'
    case 'switcher':
      return 'You’re moving into AI'
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  02 So What                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export function soWhatPrompt(
  input: GenerationInput,
  ctx: GenerationContext,
): string {
  const primary = ctx.primary_lens
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 02: "So What For Me?"
Four lens takes on this week's central story, one per reader role. Exactly one lens is the PRIMARY for this issue: ${lensLabel(primary)} (role="${primary}"). The other three are secondary.

Each take must:
- Say what THIS specific role does on Monday morning because of this story.
- Name one concrete action ("ship", "audit", "ask", "test", "draft").
- Carry a "so what" framing AND a concrete artifact (file to write, meeting to have, message to send).
- Not be recyclable across other issues — must reference this week's actual story.

OUTPUT JSON SCHEMA (must match exactly — key by key from IssueContent SoWhat type):
{
  "rotation_note": {
    "primary": "string — one sentence naming the primary lens this week and why",
    "next": "string — one short sentence: which lens leads next issue",
    "aside": "string — optional editorial aside; <= 14 words"
  },
  "lenses": [
    {
      "role": "builder" | "product_biz" | "secure_pro" | "switcher",
      "label": "Builder" | "Product / Biz" | "Secure Pro" | "Switcher",
      "caption": "short phrase like 'You ship the thing'",
      "body_html": "2 sentences. Plain text + allowed inline tags only.",
      "action": "starts with '→ Do: ' then one verb-first sentence.",
      "is_primary": true | false
    }
  ]
}

Constraints:
- Exactly 4 lenses, one per role, no duplicates.
- Exactly ONE has is_primary: true — and it must be role="${primary}".
- "label" + "caption" must match the role exactly (Builder/Product / Biz/Secure Pro/Switcher).

PASSING EXAMPLE (different story; copy the shape, not the content):
{
  "rotation_note": {
    "primary": "Builder leads because the rule change directly shifts the audit-log surface.",
    "next": "Product / Biz leads next.",
    "aside": "Pick your lens. Read yours twice."
  },
  "lenses": [
    {"role":"builder","label":"Builder","caption":"You ship the thing","body_html":"RBI now expects an audit trail on every model output. Your retrieval log is half the work — finish it.","action":"→ Do: add a why_field to every API response this sprint.","is_primary":true},
    {"role":"product_biz","label":"Product / Biz","caption":"You decide what gets shipped","body_html":"The compliance overhead just moved from “limplied” to “named”. Plan a 2-week buffer.","action":"→ Do: ask eng for the audit-log status in tomorrow’s standup.","is_primary":false},
    {"role":"secure_pro","label":"Secure Pro","caption":"You keep the thing safe","body_html":"Logging requirements expanded; redaction policy didn’t. You own the gap.","action":"→ Do: draft a 1-pager on log retention by Friday.","is_primary":false},
    {"role":"switcher","label":"Switcher","caption":"You’re moving into AI","body_html":"Pick one team that ships AI to users. Ask how they explain decisions.","action":"→ Do: read one bank’s model-card this week.","is_primary":false}
  ]
}

FAILING EXAMPLE + WHY (do NOT do this):
{
  "rotation_note": {"primary": "Everyone should care!", "next": "TBD", "aside": "Huge news this week."},
  "lenses": [{"role":"builder","label":"Builder","caption":"You build","body_html":"This is huge — don’t miss it!","action":"→ Do: stay updated","is_primary":true}, ...]
}
WHY IT FAILS: hype language ("huge", "don’t miss it"), exclamation mark, vague action ("stay updated"), generic caption, only one lens shown. Hits FOMO and zero specificity.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Build Notes (dark band, paper deconstruction)                             */
/* ────────────────────────────────────────────────────────────────────────── */

export function buildNotesPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Build Notes (the dark band, unnumbered)
This is the "Nerd Lane". Pick ONE paper, repo, or technical write-up from the sources. Deconstruct it for shipping engineers. Non-technical readers were told to skip — write for the people who stayed.

REQUIRED BY CLAUDE.md (HARD): one real number + one copyable code artifact, every issue.

OUTPUT JSON SCHEMA (BuildNotes type):
{
  "title": "string — 6–10 word headline naming the paper's claim",
  "paper_ref": "string — formatted like 'Authors et al., 2026 — venue (arXiv:XXXX.XXXXX)'",
  "paper_link": "string — full URL to the paper",
  "eval_link": "string — full URL to the eval/dataset/repo",
  "skim_html": "1–2 sentences. What the paper claims, plainly.",
  "struggle_html": "1 sentence. What didn’t click on first read.",
  "finding_html": "1–2 sentences. The breakthrough as you understood it.",
  "fix_html": "1–2 sentences. The concrete fix the paper proposes.",
  "metric_html": "the real number with comparison — e.g. 'F1 ↑ 0.71 → 0.83 on MMLU-Pro'",
  "ship_this_week_html": "one verb-first sentence the reader can do in <= 1 day",
  "code": {
    "lang": "python" | "typescript" | "bash" | "json",
    "body": "string — a real, copyable snippet (10–20 lines). No imaginary APIs."
  },
  "diagram_svg": ""
}

Hard constraints:
- "metric_html" MUST contain a digit and a delta or comparison. "improves performance" alone = reject.
- "code.body" must compile/run as-is for the named language. No "..." or "TODO" placeholders. No imaginary library names.
- "ship_this_week_html" must start with a verb (Run / Replace / Add / Try / Swap).
- "diagram_svg" is left empty here; the editor draws it.

PASSING EXAMPLE (shape only — do not echo this paper):
{
  "title": "Tiny-LLM routing beats one big model on cost",
  "paper_ref": "Chen et al., 2026 — NeurIPS (arXiv:2603.14210)",
  "paper_link": "https://arxiv.org/abs/2603.14210",
  "eval_link": "https://github.com/chen-lab/route-bench",
  "skim_html": "A router picks between a 1B and a 70B model per query. The router itself is a fine-tuned 110M classifier.",
  "struggle_html": "I assumed the router latency would dominate — it doesn’t.",
  "finding_html": "On their bench the cheap path absorbs 62% of queries with no quality loss.",
  "fix_html": "Train the router on outputs from the 70B, then deploy with a confidence threshold of 0.86.",
  "metric_html": "cost ↓ 41% with quality flat (router α=0.86, RouteBench v0.3)",
  "ship_this_week_html": "Try the router on one read-heavy endpoint and measure 24h cost.",
  "code": {
    "lang": "python",
    "body": "from route_bench import Router\\n\\nrouter = Router.load(\\\"chen-lab/router-110m\\\")\\nout = router.route(\\n    query=\\\"summarize this contract clause\\\",\\n    small=\\\"meta-llama/Llama-3.2-1B-Instruct\\\",\\n    large=\\\"meta-llama/Llama-3.1-70B-Instruct\\\",\\n    threshold=0.86,\\n)\\nprint(out.choice, out.confidence)"
  },
  "diagram_svg": ""
}

FAILING EXAMPLE + WHY:
{
  "title": "A new transformer trick!",
  "metric_html": "performance is much better",
  "code": {"lang":"python","body":"# TODO add code here"},
  "ship_this_week_html": "consider trying this approach"
}
WHY IT FAILS: title has an exclamation; metric has no number; code is a TODO; "consider trying" isn’t a verb-first action. Violates the one-number + one-artifact rule.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  03 Job Signal                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

export function jobSignalPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 03: "Job Signal"
Where the money + roles are moving. Source from the input pack only — no inventing job counts.

OUTPUT JSON SCHEMA (JobSignal):
{
  "rows": [ { "what_html": "string — one line, role + signal", "trend": "up" | "hot" } ],
  "spotlight": {
    "header": "string — 4–6 word headline",
    "stat": "string — the number itself, no units fluff (e.g. '₹ 38L–1.2Cr')",
    "stat_sub": "string — what the stat measures",
    "source": "string — 'Source name, Month YYYY'",
    "sodo_html": "starts with '↳ So do this: ' then a copyable search string or action"
  },
  "upskill": {
    "title": "string — the skill ladder name",
    "intro_html": "1 sentence — who this ladder is for",
    "rungs": [ { "label": "Rung 1" | "Rung 2" | "Rung 3", "body_html": "concrete this-week action" } ],
    "note_html": "1 short sentence — caveat or pacing tip"
  },
  "interview": {
    "q_label": "Interview prompt",
    "q": "string — the actual question, asked plainly",
    "steps": [ { "n": 1 | 2 | 3 | 4, "body_html": "one-sentence step the candidate would say" } ],
    "tip_html": "string — 'Copy-tip: ...' for what to memorise"
  }
}

Constraints:
- rows: 3–5 entries. Use "hot" only when the source explicitly names a surge.
- upskill.rungs: exactly 3.
- interview.steps: exactly 4, with n in [1,2,3,4].
- Every number in spotlight.stat must trace to a named source string. No "industry estimates".

PASSING EXAMPLE (shape only):
{
  "rows": [
    {"what_html":"<b>ML platform engineers</b> — reqs up at series-B fintechs","trend":"up"},
    {"what_html":"<b>AI security analysts</b> — RBI cohort hiring in Mumbai","trend":"hot"}
  ],
  "spotlight": {
    "header":"India AI salaries this month",
    "stat":"₹ 38L–1.2Cr",
    "stat_sub":"Senior ML eng, 5–7 yrs, B2B SaaS",
    "source":"Tracxn India Salary Pulse, May 2026",
    "sodo_html":"↳ So do this: search LinkedIn for <code>\\\"AI platform engineer\\\" Bengaluru</code> and filter to last 7 days."
  },
  "upskill": {
    "title":"From data eng → ML platform",
    "intro_html":"For data engineers eyeing the ML platform track.",
    "rungs":[
      {"label":"Rung 1","body_html":"Ship one feature-store table and document its lineage."},
      {"label":"Rung 2","body_html":"Add online serving for that feature and measure P99."},
      {"label":"Rung 3","body_html":"Wire a model that consumes it and own the on-call rota."}
    ],
    "note_html":"Two months minimum. Don’t skip the on-call — that’s the resume signal."
  },
  "interview": {
    "q_label":"Interview prompt",
    "q":"Walk me through a feature you shipped where serving latency mattered.",
    "steps":[
      {"n":1,"body_html":"Name the feature and the SLA: P99 < 80ms."},
      {"n":2,"body_html":"State the trade: pre-compute vs on-demand, and why you picked one."},
      {"n":3,"body_html":"Cite one metric you watched in the first week."},
      {"n":4,"body_html":"Close with the regression you almost shipped and how you caught it."}
    ],
    "tip_html":"Copy-tip: memorise the P99 number. Interviewers test specificity."
  }
}

FAILING EXAMPLE + WHY:
{
  "spotlight": {"stat":"a lot more than last year","source":"industry reports"},
  "interview": {"steps":[{"n":1,"body_html":"Talk about your experience"}]}
}
WHY IT FAILS: stat carries no number; source is unnamed; interview has 1 step (need 4) and "talk about your experience" is generic.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  04 Under the Hood                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export function underTheHoodPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 04: "Under the Hood"
Explain ONE AI concept the week's story leans on. Plain English. Use a desi everyday-life analogy (dabba/chai/local train style). Three short steps after the analogy.

OUTPUT JSON SCHEMA (UnderTheHood):
{
  "question_html": "string — the question, phrased like a friend would ask. <em> allowed.",
  "diagram_svg": "",
  "steps": [
    { "n": "01" | "02" | "03", "title": "string — 3–5 words", "body_html": "1–2 sentences" }
  ],
  "source": { "text": "string — 'Citation name, year'", "link": "string — URL" }
}

Constraints:
- Exactly 3 steps with n in ["01","02","03"].
- Step "01" carries the analogy. Step "02" and "03" map the analogy back to the AI concept.
- Glosss any jargon on first use with 4 words max in parens. ("inference" → "running the model").
- "source" must point to a real linkable artifact (paper, doc, blog).
- "diagram_svg" stays empty here; the editor draws it.

PASSING EXAMPLE (shape only):
{
  "question_html": "<em>What’s actually inside</em> a context window?",
  "diagram_svg": "",
  "steps": [
    {"n":"01","title":"The dabba analogy","body_html":"A tiffin only holds so many compartments. The model’s context window is the same — a fixed number of slots for words."},
    {"n":"02","title":"What fills the slots","body_html":"Your prompt, the model’s prior replies, and any docs you paste all share the same slots. When it overflows, the oldest stuff falls out."},
    {"n":"03","title":"Why this matters","body_html":"If your chatbot “forgets” after a long thread, the slots ran out — not a bug, just physics. Summarise older turns to stretch the dabba."}
  ],
  "source": {"text":"Anthropic context-window docs, 2026","link":"https://docs.anthropic.com/en/docs/build-with-claude/context-windows"}
}

FAILING EXAMPLE + WHY:
{
  "steps":[{"n":"1","title":"Intro","body_html":"Context windows are very important in modern LLMs."}],
  "source":{"text":"various sources","link":""}
}
WHY IT FAILS: wrong n format ("1" vs "01"), only 1 step, no analogy, "very important" is empty hype, source is unnamed and link is empty.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  05 The Rep                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export function theRepPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 05: "The 15-Min Rep"
ONE thing the reader does this week. Two tiers: Lite (~15 min) and Full (~60 min). Both must be doable from a phone or laptop with no special setup. End with a "reader_win" — a real quote from a previous reader (pull from source pack if present; otherwise invent a plausible plain-text placeholder and the editor will swap).

OUTPUT JSON SCHEMA (TheRep):
{
  "type": "audit" | "build" | "compare" | "break",
  "lite_html": "1–2 sentences — what the 15-min version is + the verb to start.",
  "full_html": "2–3 sentences — what the 60-min version adds + the artifact they end with.",
  "done": "string — one short line ‘How you’ll know you’re done’.",
  "reader_win": { "quote": "string", "by": "string — First name + role", "link": "string — URL or ''" }
}

Constraints:
- "type" must fit the source: "audit" inspects an existing system, "build" makes something new, "compare" puts two things side-by-side, "break" tries to break a thing.
- "lite_html" must start with a verb.
- "done" must name an observable artifact ("a screenshot", "a one-pager", "a 3-row CSV").

PASSING EXAMPLE (shape only):
{
  "type": "audit",
  "lite_html": "Open your team’s top customer-facing AI feature and trace one output back to the model + prompt + retrieved context.",
  "full_html": "Do it for three outputs. Note where the trace breaks. Write a 1-pager on the weakest link — model, prompt, retrieval, or eval. Share with two teammates.",
  "done": "A 1-pager with three trace tables and one named weakest link.",
  "reader_win": {"quote":"Did the lite version on a Friday — found out our prompt template hadn’t shipped to prod.","by":"Priya, ML PM","link":""}
}

FAILING EXAMPLE + WHY:
{
  "type": "audit",
  "lite_html": "Reflect on your AI strategy",
  "done": "feel more confident"
}
WHY IT FAILS: lite_html isn’t a verb-first concrete action; "feel more confident" isn’t observable; missing tiers and reader_win.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  06 Toolbox                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export function toolboxPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 06: "Toolbox"
ONE small productivity trick that works for any job. Not an AI tool launch, not a paid product pitch. Something a reader can try in 60 seconds.

OUTPUT JSON SCHEMA (Toolbox — nullable):
{
  "tool_html": "string — the trick named in 1 sentence",
  "try_html": "string — the exact thing to type, click, or paste, in 1 sentence"
}

OR, if the source pack has nothing worth a Toolbox slot this week, output exactly:
null

Constraints:
- "try_html" must contain a concrete artifact: an exact prompt, a keyboard shortcut, a URL, or a file path. No "experiment with prompts".

PASSING EXAMPLE:
{
  "tool_html": "Paste a draft email into any chatbot and ask: <em>where would a tired reader stop reading?</em>",
  "try_html": "Use this exact prompt: <code>highlight the first sentence where you’d stop reading. Don’t edit — just mark it.</code>"
}

FAILING EXAMPLE + WHY:
{
  "tool_html":"AI can make you more productive",
  "try_html":"Try using ChatGPT more often"
}
WHY IT FAILS: pure slop. No artifact. Not actionable.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  07 Reality Check                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export function realityCheckPrompt(
  input: GenerationInput,
  ctx: GenerationContext,
): string {
  // Rotate the harm tag across issues. Each issue picks one, surfaces it explicitly.
  const harms = ['environment', 'labor', 'bias', 'privacy', 'power']
  const harm = harms[ctx.issue_number % harms.length]

  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 07: "Reality Check"
The honest bit. Name a real cost or harm the week’s story carries. Don’t moralize — cite.
THIS WEEK’S HARM TAG: ${harm} (rotates per issue — use this one).

OUTPUT JSON SCHEMA (RealityCheck):
{
  "harm_tag": "${harm}",
  "h3": "string — 6–10 word headline naming the harm",
  "body_html": "2–3 sentences — the harm, sourced.",
  "honest_html": "1 sentence — the part where you concede what’s genuinely useful about the thing too.",
  "source": "string — 'Author, Outlet, Month YYYY' — must be linkable"
}

Constraints:
- Tone: calm, not sermon. Honest_html is what proves you’re not just doom-posting.
- One named source minimum, with a year.
- harm_tag must be exactly "${harm}".

PASSING EXAMPLE (different harm; same shape):
{
  "harm_tag": "labor",
  "h3": "The annotation work isn’t cheap or invisible anymore",
  "body_html": "The new RBI rules require human review of every high-risk decision. The cost of that review is roughly ₹ 22–38/decision at current vendor rates.",
  "honest_html": "It’s also the part that finally makes the system auditable — a tradeoff most people would actually take.",
  "source": "Karen Hao, MIT Tech Review, May 2026"
}

FAILING EXAMPLE + WHY:
{
  "harm_tag":"bias",
  "h3":"AI bias is bad",
  "body_html":"Many systems are biased.",
  "honest_html":"",
  "source":"various"
}
WHY IT FAILS: no specifics, no citation, "honest_html" empty (= doom-posting), generic headline.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  08 India Signal                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export function indiaSignalPrompt(
  input: GenerationInput,
  _ctx: GenerationContext,
): string {
  return `${VOICE}

${EDITORIAL}

YOUR JOB — Section 08: "India Signal"
Three India-only signals this week. Rotate across geography (Bengaluru/Mumbai/Delhi/Hyd/Chennai/Pune) AND sector (fintech/health/transport/edu/gov). Each card is a concrete, recent thing — a launch, a data drop, a regulatory move, an open-source release.

OUTPUT JSON SCHEMA (IndiaSignal):
{
  "cards": [
    {
      "cat": "string — 'Sector · City' (e.g. 'Transport · Bengaluru')",
      "status": "string — short status badge: 'shipped' | 'open-source' | 'data drop' | 'rule change' | 'pilot'",
      "status_hot": true | false,
      "h4": "string — 6–10 word headline",
      "body": "string — 1 sentence, what it is, with a number where possible",
      "why_you": "string — 'Why you care: ...' 1 sentence"
    }
  ],
  "foot": "string — one closing line tying the three together (<= 20 words)",
  "foot_cta": "string — 'Browse the India tracker' or similar",
  "foot_cta_url": "string — URL"
}

Constraints:
- Exactly 3 cards, no two sharing a city OR sector.
- Mark status_hot: true only when the source explicitly names urgency / volume.
- foot_cta_url must be a real URL (use the editor’s site if no source URL fits — /Users/surajpandita/ai_signal uses NEXT_PUBLIC_SITE_URL + '/about' as a default).

PASSING EXAMPLE (shape only):
{
  "cards": [
    {"cat":"Transport · Bengaluru","status":"shipped","status_hot":false,"h4":"BMTC trials voice-AI ticket booking on 40 routes","body":"40 routes, Kannada + English, 18,000 daily attempts in first week.","why_you":"Why you care: this is the cheapest deployment template for any city transport stack."},
    {"cat":"Health · Hyderabad","status":"open-source","status_hot":true,"h4":"AIIMS-H releases 2.4M anonymised radiology reads","body":"2.4M chest X-ray reads with linked findings, CC-BY 4.0.","why_you":"Why you care: largest India-origin medical imaging set on the open web."},
    {"cat":"Fintech · Mumbai","status":"rule change","status_hot":false,"h4":"RBI confirms audit-log expectations for AI underwriting","body":"Final rules dropped — 12-month grace period.","why_you":"Why you care: every fintech that scores you with AI now owes a log."}
  ],
  "foot":"Three places. Three sectors. One pattern: India’s AI signal is getting concrete.",
  "foot_cta":"Browse the India tracker",
  "foot_cta_url":"https://aibasically.co/india"
}

FAILING EXAMPLE + WHY:
{
  "cards":[{"cat":"AI · India","status":"news","h4":"AI is growing in India","body":"Many startups are using AI","why_you":"It’s big"}]
}
WHY IT FAILS: only 1 card; cat is generic; body has no number; why_you is empty; no source-grounded urgency.

${formatSources(input)}

${OUTPUT_RULES}`
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Closer                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export function closerPrompt(
  input: GenerationInput,
  ctx: GenerationContext,
): string {
  // Rotate format per issue.
  const formats: Array<'dark-joke' | 'absurd-true' | 'provocation'> = [
    'dark-joke',
    'absurd-true',
    'provocation',
  ]
  const formatLabels = {
    'dark-joke': 'This week: the dark one',
    'absurd-true': 'This week: absurd but true',
    'provocation': 'This week: a provocation',
  }
  const format = formats[ctx.issue_number % formats.length]
  const label = formatLabels[format]

  return `${VOICE}

${EDITORIAL}

YOUR JOB — Closer ("One Last Thing")
ONE sentence at the end of the issue. Lands with a punch. Rotating format.
THIS WEEK’S FORMAT: ${format}.

OUTPUT JSON SCHEMA (Closer):
{
  "format": "${format}",
  "format_label": "${label}",
  "body_html": "string — ONE sentence. Use <span class=\\"punch\\">...</span> exactly once to mark the kicker."
}

Format guidance:
- dark-joke: dry, wry, never cruel. The punch is the twist.
- absurd-true: must be fact-checked to the same standard as Reality Check (named source in spirit, even if not shown).
- provocation: one sharp question or short claim that makes the reader pause.

Constraints:
- ONE sentence. <= 32 words.
- <span class="punch"> wraps the final 2–6 words.
- No exclamation marks.

PASSING EXAMPLE (format: dark-joke):
{
  "format": "dark-joke",
  "format_label": "This week: the dark one",
  "body_html": "The model that finally passed the bar exam still can’t find the conference room, <span class=\\"punch\\">which is honestly the most lawyer thing about it</span>."
}

FAILING EXAMPLE + WHY:
{
  "format":"dark-joke",
  "format_label":"This week: a joke!",
  "body_html":"AI is so funny these days!!"
}
WHY IT FAILS: exclamation marks, no <span class="punch">, vague, not a real joke, label rewritten.

${formatSources(input)}

${OUTPUT_RULES}`
}
