// app/api/test-pipeline/route.ts
// Manual trigger for testing Fetcher → Scorer → Writer pipeline end-to-end.
// GET /api/test-pipeline              → 24h lookback
// GET /api/test-pipeline?lookback=72  → 72h lookback

export const dynamic = "force-dynamic";

import { runFetcher } from "@/agents/fetcher";
import { runScorer } from "@/agents/scorer";
import { runWriter } from "@/agents/writer";
import type { ScoredStory } from "@/agents/scorer";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const lookbackHours = Math.min(
    parseInt(searchParams.get("lookback") ?? "24", 10) || 24,
    168
  );

  const start = Date.now();
  let scored: ScoredStory[];

  try {
    const stories = await runFetcher(lookbackHours);
    scored = await runScorer(stories);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ data: null, error: `[Fetcher/Scorer] ${msg}` }, { status: 500 });
  }

  const tierCounts = scored.reduce<Record<string, number>>(
    (acc, s) => { acc[s.tier] = (acc[s.tier] ?? 0) + 1; return acc; },
    { critical: 0, monitor: 0, tool: 0, ignore: 0 }
  );

  let writerResult: Awaited<ReturnType<typeof runWriter>>;
  try {
    writerResult = await runWriter(scored);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ data: null, error: `[Writer] ${msg}` }, { status: 500 });
  }

  const { brief, usage } = writerResult;

  return Response.json({
    data: {
      durationMs: Date.now() - start,
      lookbackHours,
      pipeline: {
        totalFetched: scored.length,
        tierCounts,
      },
      writerUsage: usage,
      brief,
    },
    error: null,
  });
}
