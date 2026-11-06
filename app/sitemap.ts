import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { projects } from '@/lib/work'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/work', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
    ...projects.map((p) => ({ path: `/work/${p.slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  ]
  return pages.map(({ path, priority, changeFrequency }) => ({ url: absoluteUrl(path), priority, changeFrequency }))
}
