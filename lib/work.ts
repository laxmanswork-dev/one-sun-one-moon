/**
 * Selected work.
 *
 * RULE: every statement here must be verifiable from the project itself — its
 * live site, its source, or the client's own materials. No invented metrics,
 * quotes or results. `results` stays empty until real, client-approved
 * numbers exist.
 *
 * Sources checked (2026-10-22):
 * - Garden Cafe: live site gardencafekanyakumari.com + project source/README.
 * - Shivdev Holidays: live site shivdevholidays.com + QR travel poster artwork.
 * - CALIOON: brand imagery + website concept source ("a Greek-inspired growth collective…").
 * - Vainav's Cafeteria: project source/README (site in development; domain not yet live).
 */

export type ProjectStatus = 'Live' | 'In development' | 'Brand concept'

export interface ProjectImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface Project {
  slug: string
  name: string
  industry: string
  location?: string
  year: string
  status: ProjectStatus
  summary: string
  objective: string
  approach: string[]
  deliverables: string[]
  services: string[]
  results: string[]
  liveUrl?: string
  cover: ProjectImage
  gallery: ProjectImage[]
  /** Card tint behind the cover image. */
  tone: 'cream' | 'espresso' | 'sienna'
}

export const projects: Project[] = [
  {
    slug: 'garden-cafe',
    name: 'Garden Cafe',
    industry: 'Open-air cafe',
    location: 'Kanniyakumari, Tamil Nadu',
    year: '2026',
    status: 'Live',
    summary:
      'A calm, editorial website for an open-air cafe — built around its real photography, its menu and getting people through the gate.',
    objective:
      'Give an open-air cafe a website that feels like the place itself — green, unhurried and warm after sunset — and make the three things visitors want obvious: see the menu, find the cafe, and message it.',
    approach: [
      'Editorial, quiet-luxury art direction: generous whitespace, a classic serif paired with a clean sans, and nothing that competes with the photography.',
      "Only the cafe's own photography and video — no stock imagery — so the site sets honest expectations of the space.",
      'A dedicated menu page, WhatsApp messages that open pre-filled from the site, and Google Maps directions to the exact address.',
      'Handcrafted React build with self-hosted fonts, responsive images, per-page metadata and structured data, deployed on Cloudflare.',
    ],
    deliverables: [
      'Website design',
      'Front-end development',
      'Menu page',
      'WhatsApp & Maps integration',
      'Technical SEO',
      'Deployment',
    ],
    services: ['website-design-development'],
    results: [],
    liveUrl: 'https://gardencafekanyakumari.com',
    cover: {
      src: '/images/work/garden-cafe/site-desktop.webp',
      alt: 'Garden Cafe website homepage: a handwritten “Garden” headline over a photo of the cafe’s greenery, with a row of menu photos below',
      width: 1440,
      height: 900,
    },
    gallery: [
      {
        src: '/images/work/garden-cafe/after-sunset.webp',
        alt: 'Garden Cafe after sunset, with festoon lights strung across the open-air seating and a lit tree',
        width: 1338,
        height: 1176,
      },
      {
        src: '/images/work/garden-cafe/site-mobile.webp',
        alt: 'The Garden Cafe homepage on a mobile phone',
        width: 780,
        height: 1688,
      },
      {
        src: '/images/work/garden-cafe/open-air.webp',
        alt: 'Daytime view of Garden Cafe’s open-air seating under a large araucaria tree',
        width: 1600,
        height: 922,
      },
    ],
    tone: 'cream',
  },
  {
    slug: 'shivdev-holidays',
    name: 'Shivdev Holidays',
    industry: 'Cab & travel planning',
    location: 'Kanyakumari, Tamil Nadu',
    year: '2026',
    status: 'Live',
    summary: 'A travel website and QR print poster that move travellers from “where should we go?” to a booked cab.',
    objective:
      'Help travellers discover destinations and plan trips from Kanyakumari across Tamil Nadu and South India — then make calling, messaging or booking a cab one tap away, online and offline.',
    approach: [
      'A road-trip hero with the promise up front: “Dream. Explore. Discover. Your Journey Begins Here.”',
      'Destination search and a plan-your-trip flow, with Call Now and WhatsApp always within reach.',
      'Pre-rendered pages with their own metadata, so search engines and link previews see every route.',
      'A QR travel poster that carries the brand into the physical world and sends people straight to the website.',
    ],
    deliverables: [
      'Website design',
      'Front-end development',
      'Destination & trip-planning pages',
      'Technical SEO',
      'QR print poster',
    ],
    services: ['website-design-development', 'creative-content-campaigns'],
    results: [],
    liveUrl: 'https://www.shivdevholidays.com',
    cover: {
      src: '/images/work/shivdev-holidays/site-desktop.webp',
      alt: 'Shivdev Holidays website homepage: a white car on a coastal road with the headline “Dream. Explore. Discover. Your Journey Begins Here.”',
      width: 1440,
      height: 900,
    },
    gallery: [
      {
        src: '/images/work/shivdev-holidays/qr-poster.webp',
        alt: 'Shivdev Holidays QR poster with the tagline “Travel · Explore · Experience” and a scan-to-visit QR code',
        width: 1024,
        height: 1536,
      },
      {
        src: '/images/work/shivdev-holidays/site-mobile.webp',
        alt: 'The Shivdev Holidays homepage on a mobile phone',
        width: 780,
        height: 1688,
      },
    ],
    tone: 'sienna',
  },
  {
    slug: 'calioon',
    name: 'CALIOON',
    industry: 'Growth collective',
    year: '2026',
    status: 'Brand concept',
    summary:
      'A Greek-inspired brand world — marble, bronze and a halo of gold light — for a collective that combines branding, performance marketing and AI automation.',
    objective:
      'Create a brand world with the gravity of a museum for a growth collective, so that it feels considered, confident and unmistakable from the first frame.',
    approach: [
      'A visual language drawn from classical architecture: carved columns, winged forms, relief friezes and a single glowing halo.',
      'A restrained palette of matte navy, black marble and gold, with film-grain texture and slow, deliberate motion.',
      'A full website concept in the same language — hero, philosophy, domains of work and a closing call to action.',
    ],
    deliverables: ['Brand world & art direction', 'Key visuals', 'Website concept & front-end prototype'],
    services: ['brand-strategy-identity', 'creative-content-campaigns'],
    results: [],
    cover: {
      src: '/images/work/calioon/pillar-wall.webp',
      alt: 'CALIOON key visual: a dark marble column with golden wings in front of a glowing gold ring, flanked by CALIOON nameplates',
      width: 1408,
      height: 768,
    },
    gallery: [
      {
        src: '/images/work/calioon/pillar.webp',
        alt: 'CALIOON winged marble pillar inside a gold ring patterned with a Greek key border',
        width: 1200,
        height: 655,
      },
    ],
    tone: 'espresso',
  },
  {
    slug: 'vainavs-cafeteria',
    name: "Vainav's Cafeteria",
    industry: 'Cafe',
    location: 'Kanyakumari, Tamil Nadu',
    year: '2026',
    status: 'In development',
    summary:
      '“Tradition meets modern taste” — a warm, menu-led website for a Kanyakumari cafeteria, currently in development.',
    objective:
      "Bring Vainav's Cafeteria's mix of comforting brews and global bites online with a site that is as warm as its counter — and that makes the menu, opening hours and location easy to find.",
    approach: [
      'A design system built on the brand’s own palette — espresso, cream, amber and brass — and its vintage badge logo.',
      'A menu-led structure with signature dishes, categories and a gallery, plus WhatsApp and Google Maps links to the real listing.',
      'Production foundations first: routing, SEO, structured data and motion infrastructure, with pages built section by section.',
    ],
    deliverables: ['Website design system', 'Site architecture', 'Menu & signature-dish presentation'],
    services: ['website-design-development'],
    results: [],
    cover: {
      src: '/images/work/vainavs-cafeteria/royal-falooda.webp',
      alt: "A layered royal falooda on a rustic wooden table, tagged with a Vainav's Cafe kraft label",
      width: 1407,
      height: 768,
    },
    gallery: [
      {
        src: '/images/work/vainavs-cafeteria/logo.webp',
        alt: "Vainav's Cafetaria badge logo with a coffee cup, croissant and crossed forks",
        width: 900,
        height: 600,
      },
    ],
    tone: 'cream',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
