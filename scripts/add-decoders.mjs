// One-shot helper: patches content/issues/{001,002,003}.json with their
// `decoder` field. Run with `node scripts/add-decoders.mjs`. Idempotent —
// re-running just overwrites the decoder block, never duplicates.
import { readFile, writeFile } from 'node:fs/promises'

const decoders = {
  '001': {
    intro:
      "Section 03 leans into jargon (RAG, evals, citation layer). Here's each in one line — same standard the issue holds itself to.",
    terms: [
      {
        term: 'RAG',
        plain:
          'Look-it-up-before-you-answer. The AI checks a notes file before responding, so its reply cites something instead of guessing from memory.',
      },
      {
        term: 'Evals',
        plain:
          "Test cases for AI. You write down what 'right answer' looks like, then run the AI against your list and count passes.",
      },
      {
        term: 'Citation layer',
        plain:
          "A small add-on that shows which note the AI used. When a reader asks 'where did this come from?', the system answers honestly.",
      },
      {
        term: 'Retrieved chunk',
        plain:
          'A specific paragraph the AI pulled from the notes file before answering. The unit of evidence.',
      },
      {
        term: 'BFSI',
        plain:
          "Banking, Financial Services, Insurance — short-hand for India's regulated finance industry.",
      },
      {
        term: 'Compliance',
        plain:
          "Following the rules a regulator wrote down. Different from doing the right thing in spirit; this is the paperwork version.",
      },
    ],
  },
  '002': {
    intro:
      "Section 02 + the Build Notes use a lot of hardware vocabulary. Here are the loaded ones, in plain English.",
    terms: [
      {
        term: 'Quantization',
        plain:
          'Squishing a big model into fewer bits per number so it runs on cheaper hardware. Small accuracy cost, big size + speed win.',
      },
      {
        term: 'Mixed-precision',
        plain:
          'Run the careful parts of the model at high precision and the rough parts at low. The compromise that usually beats both extremes.',
      },
      {
        term: 'RLHF',
        plain:
          "Reinforcement Learning from Human Feedback. The AI learns 'don't say this, do say that' from people grading its answers — like a parent reviewing report cards.",
      },
      {
        term: 'Vendor lock-in',
        plain:
          "When switching providers costs more than staying. NVIDIA's bet is that Indian AI work needs NVIDIA's chips by default for the next decade.",
      },
      {
        term: 'GCC',
        plain:
          "Global Capability Centre. A foreign company's India office — usually staffed by Indian engineers, working on the company's main products, not just back-office support.",
      },
      {
        term: 'Sovereignty stack',
        plain:
          'Building the parts that decide things on your own soil. Means India makes the models, owns the training data, and controls the off-switch.',
      },
    ],
  },
  '003': {
    intro:
      "Claude 4.8's announcement is full of context-window vocabulary. Here it is, decoded.",
    terms: [
      {
        term: 'Context window',
        plain:
          "How much the AI can hold in its head at once for a single conversation. Bigger window = more notes it can read before answering. Claude 4.8's is large enough for a small book.",
      },
      {
        term: 'Attention',
        plain:
          'How the AI decides which words in your message matter most. Like which sentence in a long email actually carries the request.',
      },
      {
        term: 'LoRA',
        plain:
          'Low-Rank Adaptation. Cheap way to fine-tune a big model — you only update a small slice, so it costs a fraction of full retraining and ships in hours, not weeks.',
      },
      {
        term: 'PEFT',
        plain:
          "Parameter-Efficient Fine-Tuning. The family of techniques (LoRA is one) for adapting a big model without burning the GPU farm.",
      },
      {
        term: 'Catastrophic forgetting',
        plain:
          "When teaching an AI a new skill makes it lose an old one. Like editing one chapter of a textbook and accidentally rewriting the previous ones.",
      },
      {
        term: 'Hinglish',
        plain:
          'Mix of Hindi + English in one sentence. Most Indian internet users write this way; most frontier models still split or break on it.',
      },
      {
        term: 'IndicBench',
        plain:
          "A standardized test set for Indian-language AI. The benchmark community's way of asking whether a model actually works in Hindi, Tamil, Bengali, and friends.",
      },
    ],
  },
}

for (const slug of Object.keys(decoders)) {
  const path = `/Users/surajpandita/ai_signal/content/issues/${slug}.json`
  const c = JSON.parse(await readFile(path, 'utf8'))
  c.decoder = decoders[slug]
  await writeFile(path, JSON.stringify(c, null, 2) + '\n')
  console.log(`patched ${slug}.json — ${decoders[slug].terms.length} terms`)
}
