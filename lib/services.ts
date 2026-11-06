export type ServiceGlyph = 'identity' | 'web' | 'social' | 'performance' | 'content' | 'growth'

export interface Service {
  slug: string
  number: string
  title: string
  short: string
  summary: string
  value: string
  includes: string[]
  glyph: ServiceGlyph
}

export const services: Service[] = [
  {
    slug: 'brand-strategy-identity',
    number: '01',
    title: 'Brand Strategy & Identity',
    short: 'Brand Identity',
    summary:
      'A clear position, a name people remember, and a visual identity that holds together everywhere it appears.',
    value:
      'When a business knows exactly what it stands for, every decision after that — the website, the menu board, the next campaign — gets easier and more consistent.',
    includes: [
      'Positioning & messaging',
      'Logo & identity system',
      'Colour, type & graphic language',
      'Brand guidelines',
      'Print & signage applications',
    ],
    glyph: 'identity',
  },
  {
    slug: 'website-design-development',
    number: '02',
    title: 'Website Design & Development',
    short: 'Websites',
    summary:
      'Fast, handcrafted websites that look like your brand and make the next step — call, book, order, enquire — obvious.',
    value:
      'Your website is often the first place a customer meets you. We design it around what they need to do, then build it to load quickly, read well on a phone and be found in search.',
    includes: [
      'UX & content structure',
      'Visual design & prototyping',
      'Responsive front-end development',
      'Technical SEO & structured data',
      'Hosting, launch & handover',
    ],
    glyph: 'web',
  },
  {
    slug: 'social-media-marketing',
    number: '03',
    title: 'Social Media Marketing',
    short: 'Social Media',
    summary:
      'A consistent, recognisable presence — planned content, a defined voice and visuals that stop the scroll for the right reasons.',
    value:
      'Social is where people check whether a business is real, active and worth their time. A planned calendar and a consistent look turn occasional posts into a brand people follow.',
    includes: [
      'Channel strategy',
      'Content calendars',
      'Post & reel design',
      'Copywriting & captions',
      'Community guidelines',
    ],
    glyph: 'social',
  },
  {
    slug: 'performance-marketing-advertising',
    number: '04',
    title: 'Performance Marketing & Advertising',
    short: 'Performance Ads',
    summary: 'Paid campaigns built around a measurable goal, with honest reporting on what is and is not working.',
    value:
      'Advertising should be accountable. We agree the outcome that matters first — enquiries, bookings, footfall — then set up tracking so budget decisions are based on evidence.',
    includes: [
      'Campaign planning & targeting',
      'Search & social advertising',
      'Ad creative & landing pages',
      'Conversion tracking setup',
      'Plain-language reporting',
    ],
    glyph: 'performance',
  },
  {
    slug: 'creative-content-campaigns',
    number: '05',
    title: 'Creative Content & Campaigns',
    short: 'Campaigns',
    summary:
      'Cinematic ideas, carried through photography direction, design and copy into campaigns that feel like one story.',
    value:
      'A strong idea, told well, is remembered long after the offer ends. We develop the concept and make sure every poster, post and page tells the same story.',
    includes: [
      'Campaign concepts',
      'Art direction',
      'Posters, print & QR collateral',
      'Launch & seasonal campaigns',
      'Copywriting',
    ],
    glyph: 'content',
  },
  {
    slug: 'digital-growth-strategy',
    number: '06',
    title: 'Digital Growth Strategy',
    short: 'Growth Strategy',
    summary: 'A practical roadmap that connects brand, website, search, social and ads into one plan you can act on.',
    value:
      'Most businesses do not need more channels — they need the right ones, in the right order. We look at where you are, agree where you want to be, and plan the steps in between.',
    includes: [
      'Digital audit',
      'Audience & competitor review',
      'Channel & content priorities',
      'Measurement plan',
      'Quarterly roadmap',
    ],
    glyph: 'growth',
  },
]

export const serviceOptions = services.map((s) => s.title)
