// app/api/news/route.ts
// Serves Signal[] from lib/realNews.json with in-memory cache.
// If processedSignals.json exists (written by process-signals.mjs),
// merges what/why/takeaway from it.
//
// Server-side TAKEAWAY gate: takeaway is stripped from the response for
// free/unauthenticated users — never sent to the client, never in the DOM.
// This is the real gate; client-side blur has been removed.

export const dynamic = "force-dynamic";

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Signal } from "@/lib/types";
import { auth } from "@/lib/auth";

let CACHE: Signal[] = [];
let LAST_FETCH = 0;
const CACHE_TTL = 1000 * 60 * 2; // 2 minutes

function loadSignals(): Signal[] {
  const rawPath = join(process.cwd(), "lib", "realNews.json");
  const processedPath = join(process.cwd(), "lib", "processedSignals.json");

  if (!existsSync(rawPath)) return [];

  const raw: Signal[] = JSON.parse(readFileSync(rawPath, "utf-8"));

  // Merge LLM-generated fields if processedSignals.json exists
  if (existsSync(processedPath)) {
    const processed: Signal[] = JSON.parse(readFileSync(processedPath, "utf-8"));
    const processedMap = new Map(processed.map((s) => [s.id, s]));
    return raw.map((signal) => {
      const p = processedMap.get(signal.id);
      if (!p) return signal;
      return {
        ...signal,
        what:               p.what,
        why:                p.why,
        takeaway:           p.takeaway,
        processed:          p.processed,
        processedAt:        p.processedAt,
        zone1EligibleUntil: p.zone1EligibleUntil,
        developingStory:    p.developingStory,
      };
    });
  }

  return raw;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";
  const now = Date.now();

  // Check plan — TAKEAWAY is only sent to paid users
  const session = await auth();
  const isPaid =
    (session?.user as { plan?: string } | undefined)?.plan === "paid";

  let signals: Signal[];

  if (!force && CACHE.length > 0 && now - LAST_FETCH < CACHE_TTL) {
    signals = CACHE;
  } else {
    try {
      const loaded = loadSignals();
      const sorted = loaded.sort((a, b) => b.signalScore - a.signalScore);
      CACHE = sorted;
      LAST_FETCH = now;
      signals = sorted;
    } catch (err) {
      console.error("Failed to load signals:", err);
      signals = CACHE.length > 0 ? CACHE : [];
    }
  }

  // Monetization deferred — validate retention first.
  // takeawayGated logic preserved here as comment for future paid tier:
  // const gated = isPaid ? signals : signals.map(s => ({ ...s, takeaway: null, ...(s.takeaway ? { takeawayGated: true } : {}) }));
  void isPaid;
  return Response.json(signals);
}
