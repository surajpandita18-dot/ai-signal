// scripts/fetch-news.mjs
// Fetches RSS feeds, scores every article using the 5-dimension formula,
// deduplicates by link, sorts by score, writes lib/realNews.json.

import Parser from "rss-parser";
import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const parser = new Parser({ timeout: 6000 });

const FEED_SOURCES = [
  { name: "OpenAI",             url: "https://openai.com/news/rss.xml",                                          category: "official" },
  { name: "Anthropic",          url: "https://www.anthropic.com/news/rss.xml",                                   category: "official" },
  { name: "Google DeepMind",    url: "https://deepmind.google/blog/rss.xml",                                     category: "official" },
  { name: "Meta AI",            url: "https://ai.meta.com/blog/rss/",                                            category: "official" },
  { name: "Hugging Face",       url: "https://huggingface.co/blog/feed.xml",                                     category: "research" },
  { name: "Google Research",    url: "https://research.google/blog/rss/",                                        category: "research" },
  { name: "arXiv AI",           url: "http://export.arxiv.org/rss/cs.AI",                                        category: "research" },
  { name: "arXiv ML",           url: "http://export.arxiv.org/rss/cs.LG",                                        category: "research" },
  { name: "arXiv NLP",          url: "http://export.arxiv.org/rss/cs.CL",                                        category: "research" },
  { name: "VentureBeat AI",     url: "https://venturebeat.com/ai/feed/",                                         category: "media" },
  { name: "TechCrunch AI",      url: "https://techcrunch.com/category/artificial-intelligence/feed/",            category: "media" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",    category: "media" },
  { name: "The Verge AI",       url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",        category: "media" },
  { name: "Latent Space",       url: "https://www.latent.space/feed",                                            category: "substack" },
  { name: "Ben Evans",          url: "https://www.ben-evans.com/benedictevans?format=rss",                       category: "substack" },
  { name: "Hacker News (AI)",   url: "https://hnrss.org/newest?q=AI",                                           category: "community" },
];

// ── Inline scoring (mirrors lib/scoring.ts — keep in sync) ───────

const AUTHORITY_MAP = {
  "openai": 1.0, "anthropic": 1.0, "google deepmind": 1.0, "meta ai": 1.0, "mistral": 1.0,
  "arxiv ai": 0.90, "arxiv ml": 0.90, "arxiv nlp": 0.90,
  "hugging face": 0.85, "google research": 0.85,
  "mit tech review ai": 0.75, "the verge ai": 0.75,
  "hacker news (ai)": 0.70,
  "venturebeat ai": 0.65, "techcrunch ai": 0.65, "replicate": 0.65, "langchain": 0.65,
  "latent space": 0.60, "ben evans": 0.60,
};

function getAuthority(source) {
  return AUTHORITY_MAP[source.toLowerCase()] ?? 0.30;
}

function getRecency(dateStr) {
  const published = new Date(dateStr).getTime();
  if (isNaN(published)) return 0.05;
  const ageHours = (Date.now() - published) / (1000 * 60 * 60);
  if (ageHours < 6)   return 1.0;
  if (ageHours < 24)  return 0.85;
  if (ageHours < 48)  return 0.65;
  if (ageHours < 72)  return 0.40;
  if (ageHours < 168) return 0.20;
  return 0.05;
}

const MODEL_KW   = ["model","context window","benchmark","reasoning","multimodal","fine-tuning","weights released","eval","fine tuning"];
const INFRA_KW   = ["sdk","api","latency","pricing","rate limit","self-hosted","open source","framework","inference"];
const FUNDING_KW = ["raises","acquires","series","billion","million","shuts down","pivots","enterprise deal"];
const AGENT_KW   = ["agent","autonomous","tool use","function calling","orchestration","pipeline","workflow"];

function kwScore(title, keywords) {
  const t = title.toLowerCase();
  const n = keywords.filter((kw) => t.includes(kw)).length;
  return n >= 2 ? 0.9 : n === 1 ? 0.6 : 0.0;
}

function getBuilderRelevance(title) {
  return Math.max(
    kwScore(title, MODEL_KW),
    kwScore(title, INFRA_KW),
    Math.min(kwScore(title, FUNDING_KW), 0.8),
    Math.min(kwScore(title, AGENT_KW), 0.85)
  );
}

const OBS_KW  = ["built-in","native support","no longer need","replaces","deprecated","sunset","free tier","open sourced"];
const CAP_KW  = ["10x","100x","state of the art","beats","surpasses","new record","outperforms","best in class"];
const MKTD_KW = ["acquires","shuts down","pivots away from","drops support","price cut","free for","launches competing"];

function getCompetitiveThreat(title, authority) {
  const t = title.toLowerCase();
  let raw = 0;
  raw += OBS_KW.filter((kw) => t.includes(kw)).length * 0.3;
  raw += CAP_KW.filter((kw) => t.includes(kw)).length * 0.25;
  raw += MKTD_KW.filter((kw) => t.includes(kw)).length * 0.2;
  raw = Math.min(raw, 1.0);
  if (authority < 0.7 && raw > 0) raw *= 0.7;
  return raw;
}

const STOP = new Set(["a","an","the","and","or","but","in","on","at","to","for","of","with","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","this","that","these","those","it","its","as","by","from","into","about","how","what","when","where","who","which","why","not","no","new","ai"]);

function tokenize(title) {
  return new Set(
    title.toLowerCase()
      .replace(/-/g, " ")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t))
  );
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1;
  const inter = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

function novelty(title, existingTitles) {
  if (existingTitles.length === 0) return 1.0;
  const tokens = tokenize(title);
  const max = existingTitles.reduce((m, t) => Math.max(m, jaccard(tokens, tokenize(t))), 0);
  if (max < 0.25) return 1.0;
  if (max < 0.5)  return 0.7;
  if (max < 0.75) return 0.3;
  return 0.05;
}

function computeScore(title, source, date, recentTitles) {
  const authority = getAuthority(source);
  const d1 = getBuilderRelevance(title);
  const d2 = novelty(title, recentTitles);
  const d3 = getCompetitiveThreat(title, authority);
  const d4 = authority;
  const d5 = getRecency(date);
  const raw = 0.30 * d1 + 0.25 * d2 + 0.20 * d3 + 0.15 * d4 + 0.10 * d5;
  return Math.round(Math.min(raw * 5, 5.0) * 100) / 100;
}

const TAG_RULES = [
  { tag: "LLM",      kws: ["model","llm","gpt","claude","gemini","llama","weights","fine-tuning","context window","embedding","transformer"] },
  { tag: "Agents",   kws: ["agent","autonomous","tool use","function calling","orchestration","multi-agent","mcp"] },
  { tag: "Infra",    kws: ["sdk","api","latency","inference","self-hosted","open source","framework","deployment"] },
  { tag: "Research", kws: ["benchmark","reasoning","eval","paper","arxiv","safety","alignment","multimodal"] },
  { tag: "Funding",  kws: ["raises","funding","series","billion","million","acquires","enterprise"] },
  { tag: "Product",  kws: ["launch","release","introduces","ships","announces","available","beta"] },
  { tag: "Pricing",  kws: ["pricing","price cut","free tier","cost","cheaper"] },
  { tag: "Vision",   kws: ["image","video","vision","multimodal","ocr","screenshot","diagram","chart"] },
  { tag: "Voice",    kws: ["audio","speech","tts","stt","voice","transcription","whisper"] },
];

function generateTags(title, max = 3) {
  const t = title.toLowerCase();
  return TAG_RULES
    .map(({ tag, kws }) => ({ tag, score: kws.filter((kw) => t.includes(kw)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ tag }) => tag);
}

function makeId(link) {
  return createHash("sha256").update(link).digest("hex").slice(0, 32);
}

function getImpactLevel(score) {
  return score >= 4.0 ? "high" : score >= 3.0 ? "medium" : "low";
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching RSS feeds...");

  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return (parsed.items || []).slice(0, 10).map((item) => ({
          _source: feed.name,
          _category: feed.category,
          title: item.title || "",
          link: item.link || "",
          date: item.pubDate || item.isoDate || "",
          summary: item.contentSnippet || item.content || "",
        }));
      } catch (err) {
        console.warn(`Failed: ${feed.name} — ${err.message}`);
        return [];
      }
    })
  );

  const raw = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  // Deduplicate by link
  const seen = new Map();
  for (const item of raw) {
    if (item.link && !seen.has(item.link)) seen.set(item.link, item);
  }
  const unique = [...seen.values()];

  // Collect titles from the last 72hr for novelty computation (per spec)
  const now72 = Date.now() - 72 * 60 * 60 * 1000;
  const recentItems = unique.filter((i) => {
    const t = new Date(i.date).getTime();
    return !isNaN(t) && t >= now72;
  });
  const recentTitlesPool = recentItems.map((i) => i.title);

  // Score everything
  const scored = unique.map((item) => {
    const recentTitles = recentTitlesPool.filter((t) => t !== item.title);
    const score = computeScore(item.title, item._source, item.date, recentTitles);
    return {
      id:                 makeId(item.link),
      title:              item.title,
      source:             item._source,
      sourceType:         "rss",
      sourceCategory:     item._category,
      link:               item.link,
      date:               item.date,
      signalScore:        score,
      impactLevel:        getImpactLevel(score),
      tags:               generateTags(item.title),
      what:               null,
      why:                null,
      takeaway:           null,
      processed:          false,
      processedAt:        null,
      zone1EligibleUntil: null,
      developingStory:    false,
      saveCount:          0,
      dismissCount:       0,
      clickCount:         0,
      saveRate:           0,
      summary:            item.summary,
    };
  });

  const sorted = scored.sort((a, b) => b.signalScore - a.signalScore);

  const outPath = join(__dirname, "../lib/realNews.json");
  writeFileSync(outPath, JSON.stringify(sorted, null, 2), "utf-8");
  console.log(`Wrote ${sorted.length} signals → lib/realNews.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
