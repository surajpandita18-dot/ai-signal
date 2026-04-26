// agents/fetcher.ts
// Single responsibility: pull raw stories from all sources, deduplicate within the batch.
// Returns RawStory[] — does NOT write to DB, does NOT score, does NOT summarize.

import Parser from "rss-parser";
import { randomUUID } from "crypto";

export interface RawStory {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;   // ISO 8601
  rawText: string;       // max 2000 chars
  isDuplicate: boolean;  // true if same story already in batch from higher-authority source
}

// ── Source config ─────────────────────────────────────────────────────────────
// URLs verified working as of Apr 2026.

const RSS_SOURCES: { name: string; url: string; authority: number }[] = [
  { name: "OpenAI Blog",      url: "https://openai.com/news/rss.xml",                                          authority: 10 },
  { name: "Hugging Face Blog",url: "https://huggingface.co/blog/feed.xml",                                     authority: 8  },
  { name: "TechCrunch AI",    url: "https://techcrunch.com/category/artificial-intelligence/feed/",            authority: 7  },
  { name: "The Decoder",      url: "https://the-decoder.com/feed/",                                            authority: 7  },
];

const HN_AUTHORITY  = 6;
const MAX_RAW_TEXT  = 2000;

// ── RSS fetching ──────────────────────────────────────────────────────────────

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
};

async function fetchRSS(
  source: { name: string; url: string; authority: number },
  cutoff: Date
): Promise<{ story: RawStory; authority: number }[]> {
  const parser = new Parser({ timeout: 12000 });
  const feed   = await parser.parseURL(source.url);
  const results: { story: RawStory; authority: number }[] = [];

  for (const item of (feed.items ?? []) as ParsedItem[]) {
    const title = item.title?.trim();
    const url   = item.link?.trim();
    if (!title || !url) continue;

    const dateStr = item.isoDate ?? item.pubDate;
    if (dateStr) {
      const pub = new Date(dateStr);
      if (!isNaN(pub.getTime()) && pub < cutoff) continue;
    }

    const rawText = [item.contentSnippet ?? "", item.summary ?? "", item.content ?? ""]
      .join(" ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_RAW_TEXT);

    results.push({
      story: {
        id: randomUUID(),
        title,
        url,
        source: source.name,
        publishedAt: dateStr ?? new Date().toISOString(),
        rawText,
        isDuplicate: false,
      },
      authority: source.authority,
    });
  }

  return results;
}

// ── HN Algolia API ────────────────────────────────────────────────────────────

interface HNHit {
  objectID: string;
  title: string | null;
  url: string | null;
  created_at: string;
  points: number | null;
  story_text: string | null;
}

interface HNResponse {
  hits: HNHit[];
}

async function fetchHackerNews(
  cutoff: Date
): Promise<{ story: RawStory; authority: number }[]> {
  // Use numericFilters to restrict to stories after cutoff (Algolia Unix timestamp)
  const cutoffTs = Math.floor(cutoff.getTime() / 1000);
  const endpoint = [
    "https://hn.algolia.com/api/v1/search",
    "?tags=story",
    "&query=AI+LLM+machine+learning",
    "&hitsPerPage=30",
    `&numericFilters=created_at_i>${cutoffTs},points>10`,
  ].join("");

  const res = await fetch(endpoint, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HN Algolia ${res.status}`);

  const data   = (await res.json()) as HNResponse;
  const results: { story: RawStory; authority: number }[] = [];

  for (const hit of data.hits) {
    const title = hit.title?.trim();
    if (!title) continue;

    const url = hit.url?.trim() ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;
    const rawText = (hit.story_text ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_RAW_TEXT);

    results.push({
      story: {
        id: randomUUID(),
        title,
        url,
        source: "HackerNews",
        publishedAt: hit.created_at,
        rawText,
        isDuplicate: false,
      },
      authority: HN_AUTHORITY,
    });
  }

  return results;
}

// ── Within-batch deduplication ────────────────────────────────────────────────

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deduplicateBatch(
  candidates: { story: RawStory; authority: number }[]
): RawStory[] {
  // Record best authority per normalized title
  const bestAuthority = new Map<string, number>();
  for (const { story, authority } of candidates) {
    const key  = normalizeTitle(story.title);
    const best = bestAuthority.get(key) ?? -1;
    if (authority > best) bestAuthority.set(key, authority);
  }

  // Mark lower-authority copies as duplicates; keep exactly one per title
  const claimed = new Set<string>();
  return candidates.map(({ story, authority }) => {
    const key = normalizeTitle(story.title);
    if (claimed.has(key)) return { ...story, isDuplicate: true };
    if (bestAuthority.get(key) === authority) {
      claimed.add(key);
      return story;
    }
    return { ...story, isDuplicate: true };
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runFetcher(lookbackHours = 24): Promise<RawStory[]> {
  const cutoff = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
  const all:    { story: RawStory; authority: number }[] = [];
  const errors: string[] = [];

  // Fetch RSS sources in parallel
  const rssResults = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchRSS(source, cutoff))
  );

  for (let i = 0; i < rssResults.length; i++) {
    const result = rssResults[i];
    if (result.status === "fulfilled") {
      all.push(...result.value);
    } else {
      const err = result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push(`${RSS_SOURCES[i].name}: ${err}`);
    }
  }

  // Fetch HackerNews
  try {
    all.push(...(await fetchHackerNews(cutoff)));
  } catch (err) {
    errors.push(`HackerNews: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (errors.length > 0) {
    console.error("[Fetcher] Source errors:", errors);
  }

  return deduplicateBatch(all);
}
