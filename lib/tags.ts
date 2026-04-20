// lib/tags.ts

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: "LLM",       keywords: ["model","llm","gpt","claude","gemini","llama","mistral","weights released","fine-tuning","fine tuning","context window","embedding","transformer"] },
  { tag: "Agents",    keywords: ["agent","autonomous","tool use","function calling","orchestration","pipeline","multi-agent","workflow","mcp"] },
  { tag: "Infra",     keywords: ["sdk","api","latency","pricing","rate limit","self-hosted","open source","framework","inference","deployment","serving","quantization","vllm","triton"] },
  { tag: "Research",  keywords: ["benchmark","reasoning","eval","paper","arxiv","dataset","safety","alignment","rlhf","reward model","multimodal"] },
  { tag: "Funding",   keywords: ["raises","funding","series","billion","million","acquires","acquisition","shuts down","pivot","enterprise"] },
  { tag: "Product",   keywords: ["launch","release","introduces","ships","announces","available","beta","preview","generally available"] },
  { tag: "Pricing",   keywords: ["pricing","price cut","free tier","cost","tokens per dollar","rate limit","cheaper","affordable"] },
  { tag: "Vision",    keywords: ["image","video","vision","multimodal","ocr","screenshot","diagram","chart"] },
  { tag: "Voice",     keywords: ["audio","speech","tts","stt","voice","transcription","whisper"] },
];

/**
 * Returns 2–3 tags for a given title.
 * Priority: more keyword matches wins; ties broken by rule order.
 */
export function generateTags(title: string, max = 3): string[] {
  const normalized = title.toLowerCase();

  const scored = TAG_RULES.map(({ tag, keywords }) => ({
    tag,
    score: keywords.filter((kw) => normalized.includes(kw)).length,
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map(({ tag }) => tag);
}
