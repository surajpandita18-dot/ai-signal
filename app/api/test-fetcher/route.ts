// app/api/test-fetcher/route.ts
// Manual trigger for testing the Fetcher agent.
// GET /api/test-fetcher              → runs with default 24h lookback
// GET /api/test-fetcher?lookback=72  → runs with 72h lookback (useful for testing)

export const dynamic = "force-dynamic";

import { runFetcher } from "@/agents/fetcher";
import type { RawStory } from "@/agents/fetcher";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const lookbackHours = Math.min(
    parseInt(searchParams.get("lookback") ?? "24", 10) || 24,
    168 // cap at 7 days
  );

  const start = Date.now();
  let stories: RawStory[];

  try {
    stories = await runFetcher(lookbackHours);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ data: null, error: msg }, { status: 500 });
  }

  const unique  = stories.filter((s) => !s.isDuplicate);
  const dupes   = stories.filter((s) => s.isDuplicate);

  const bySource = unique.reduce<Record<string, number>>((acc, s) => {
    acc[s.source] = (acc[s.source] ?? 0) + 1;
    return acc;
  }, {});

  return Response.json({
    data: {
      durationMs: Date.now() - start,
      lookbackHours,
      totalFetched: stories.length,
      uniqueCount: unique.length,
      duplicateCount: dupes.length,
      bySource,
      // First 10 unique stories — title, source, date, url
      stories: unique.slice(0, 10).map((s) => ({
        title: s.title,
        source: s.source,
        publishedAt: s.publishedAt,
        url: s.url,
        rawTextLength: s.rawText.length,
      })),
    },
    error: null,
  });
}
