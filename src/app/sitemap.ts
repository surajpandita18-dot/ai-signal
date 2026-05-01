import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://aisignal.so'

  const static_routes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/archive`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  try {
    const supabase = await createServerSupabaseClient()
    const { data: issues } = await supabase
      .from('issues')
      .select('issue_number, published_at')
      .eq('status', 'published')
      .order('issue_number', { ascending: false })

    const signal_routes: MetadataRoute.Sitemap = (issues ?? []).map((issue) => ({
      url: `${base}/signal/${issue.issue_number}`,
      lastModified: issue.published_at ?? undefined,
      changeFrequency: 'never' as const,
      priority: 0.8,
    }))

    return [...static_routes, ...signal_routes]
  } catch {
    return static_routes
  }
}
