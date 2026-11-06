import { absoluteUrl, getPublicContact, site } from '../site'
import { services } from '../services'

/**
 * Organization + WebSite structured data. Deliberately no LocalBusiness,
 * address, ratings or reviews: none of those are verified yet.
 */
export function organizationJsonLd() {
  const contact = getPublicContact()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: site.name,
        url: absoluteUrl('/'),
        logo: absoluteUrl('/icons/icon-512.png'),
        slogan: site.tagline,
        description: site.description,
        knowsAbout: services.map((s) => s.title),
        ...(contact.email && { email: contact.email }),
        ...(contact.socials.length && { sameAs: contact.socials.map((s) => s.href) }),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: site.name,
        url: absoluteUrl('/'),
        inLanguage: 'en-IN',
        publisher: { '@id': absoluteUrl('/#organization') },
      },
    ],
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
