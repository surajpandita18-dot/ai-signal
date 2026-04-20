// lib/summaryCache.ts
// 48hr JSON file cache for LLM-generated summaries.
// Cache key: sha256(link).slice(0, 32)
// Cache file: lib/.summaryCache.json

import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const CACHE_PATH = join(process.cwd(), "lib", ".summaryCache.json");
const TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

interface CacheEntry {
  what: string | null;
  why: string | null;
  takeaway: string | null;
  cachedAt: string; // ISO timestamp
}

type CacheStore = Record<string, CacheEntry>;

function readCache(): CacheStore {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeCache(store: CacheStore): void {
  writeFileSync(CACHE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function makeCacheKey(link: string): string {
  return createHash("sha256").update(link).digest("hex").slice(0, 32);
}

export function getCached(link: string): CacheEntry | null {
  const store = readCache();
  const key = makeCacheKey(link);
  const entry = store[key];
  if (!entry) return null;
  const age = Date.now() - new Date(entry.cachedAt).getTime();
  return age < TTL_MS ? entry : null;
}

export function setCached(link: string, entry: Omit<CacheEntry, "cachedAt">): void {
  const store = readCache();
  const key = makeCacheKey(link);
  store[key] = { ...entry, cachedAt: new Date().toISOString() };
  writeCache(store);
}

export function purgeStaleCacheEntries(): number {
  const store = readCache();
  const now = Date.now();
  let purged = 0;
  for (const key of Object.keys(store)) {
    const age = now - new Date(store[key].cachedAt).getTime();
    if (age > TTL_MS) {
      delete store[key];
      purged++;
    }
  }
  writeCache(store);
  return purged;
}
