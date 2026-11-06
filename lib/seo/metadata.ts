import type { Metadata } from 'next'
import { site } from '../site'

interface PageMeta {
  title: string
  description: string
  path: string
  image?: { url: string; width: number; height: number; alt: string }
  noIndex?: boolean
}

/** Per-page metadata with canonical URL and matching Open Graph / Twitter tags. */
export function pageMetadata({ title, description, path, image, noIndex }: PageMeta): Metadata {
  const images = image ? [image] : undefined
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', ...(images && { images }) },
    twitter: { card: 'summary_large_image', title, description, ...(images && { images: images.map((i) => i.url) }) },
    ...(noIndex && { robots: { index: false, follow: true } }),
  }
}

export const defaultTitle = `${site.name} — Digital Marketing & Creative Agency`
