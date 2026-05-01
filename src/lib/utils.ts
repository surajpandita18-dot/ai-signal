export function isWithin24h(publishedAt: string): boolean {
  return Date.now() < new Date(publishedAt).getTime() + 24 * 60 * 60 * 1000
}
