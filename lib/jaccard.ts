// lib/jaccard.ts

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","need",
  "this","that","these","those","it","its","as","by","from","into","about",
  "how","what","when","where","who","which","why","not","no","new","ai"
]);

export function tokenize(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
  );
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Returns novelty score 0.0–1.0.
 * 1.0 = completely unique, 0.05 = near-duplicate.
 * Pass the titles of all signals seen in the last 72hr as `existingTitles`.
 */
export function computeNovelty(
  candidateTitle: string,
  existingTitles: string[]
): number {
  if (existingTitles.length === 0) return 1.0;

  const candidateTokens = tokenize(candidateTitle);
  let maxSimilarity = 0;

  for (const existing of existingTitles) {
    const sim = jaccardSimilarity(candidateTokens, tokenize(existing));
    if (sim > maxSimilarity) maxSimilarity = sim;
  }

  if (maxSimilarity < 0.25) return 1.0;
  if (maxSimilarity < 0.5)  return 0.7;
  if (maxSimilarity < 0.75) return 0.3;
  return 0.05;
}

/**
 * Returns true if 3+ existing titles have Jaccard > 0.5 with target.
 * Used for developingStory detection.
 */
export function isDevelopingStory(
  targetTitle: string,
  recentTitles: string[],
  threshold = 0.5,
  minCount = 3
): boolean {
  const targetTokens = tokenize(targetTitle);
  const matches = recentTitles.filter(
    (t) => jaccardSimilarity(targetTokens, tokenize(t)) > threshold
  );
  return matches.length >= minCount;
}
