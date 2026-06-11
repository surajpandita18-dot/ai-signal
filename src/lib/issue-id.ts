/**
 * Issue identifier helpers.
 *
 * Slugs are zero-padded to a 3-digit minimum: 1 → "001", 247 → "247",
 * 1000 → "1000". The masthead reads "№ 001", URLs read "/i/001".
 */

export function slugFromNumber(n: number): string {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`slugFromNumber: expected positive integer, got ${n}`)
  }
  return String(n).padStart(3, '0')
}

export function numberFromSlug(slug: string): number {
  if (typeof slug !== 'string' || !/^\d+$/.test(slug)) {
    throw new Error(`numberFromSlug: expected digit string, got ${JSON.stringify(slug)}`)
  }
  const n = Number.parseInt(slug, 10)
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`numberFromSlug: parsed non-positive issue number from ${slug}`)
  }
  return n
}
