/**
 * Site-wide configuration — the single source for brand copy, navigation and
 * public business details.
 *
 * RULE: never guess business details. Contact channels come from environment
 * variables (see .env.example) and render nothing until they are set.
 */

const clean = (value: string | undefined) => {
  const v = value?.trim()
  return v ? v : null
}

export const site = {
  name: 'ONE SUN ONE MOON',
  legalName: 'ONE SUN ONE MOON',
  url: (clean(process.env.SITE_URL) ?? 'https://onesunonemoon.in').replace(/\/+$/, ''),
  locale: 'en_IN',
  // From the approved brand board.
  tagline: 'Ideas with cinematic impact.',
  motto: 'The story is ours',
  pillars: ['Ideas', 'Stories', 'Brands', 'Beyond Borders'] as const,
  promise: 'Marketing for a brighter tomorrow',
  description:
    'ONE SUN ONE MOON is a digital marketing and creative agency. We turn ideas into stories and stories into business growth — brand identity, websites, social media, performance marketing and campaigns.',
  themeColor: '#F4EBDD',
} as const

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
] as const

export const legalNav = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
] as const

/** Public contact channels — each is null until configured. */
export function getPublicContact() {
  const whatsapp = clean(process.env.PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, '') || null
  return {
    email: clean(process.env.PUBLIC_CONTACT_EMAIL),
    whatsapp: whatsapp
      ? {
          number: whatsapp,
          href: `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi ONE SUN ONE MOON, I'd like to talk about a project.")}`,
        }
      : null,
    socials: [
      { label: 'Instagram', href: clean(process.env.PUBLIC_INSTAGRAM_URL) },
      { label: 'LinkedIn', href: clean(process.env.PUBLIC_LINKEDIN_URL) },
    ].filter((s): s is { label: string; href: string } => Boolean(s.href)),
  }
}

export const absoluteUrl = (path = '/') => new URL(path, site.url + '/').toString()
