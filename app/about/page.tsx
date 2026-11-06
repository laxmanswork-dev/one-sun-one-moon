import type { Metadata } from 'next'
import Image from 'next/image'
import { Philosophy } from '@/components/sections/Philosophy'
import { PageIntro } from '@/components/sections/PageIntro'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { pageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import styles from './about.module.css'

export const metadata: Metadata = pageMetadata({
  title: 'About — Ideas. Stories. Brands. Beyond Borders.',
  description:
    'ONE SUN ONE MOON is a digital marketing and creative agency that turns ideas into stories, and stories into business growth. Meet the thinking behind the name.',
  path: '/about',
})

const motifs = [
  {
    src: '/images/brand/motif-sun-disk.webp',
    title: 'Sun disk',
    text: 'A symbol of ambition, growth and global vision.',
    w: 152,
    h: 146,
  },
  {
    src: '/images/brand/motif-crescent-moon.webp',
    title: 'Crescent moon',
    text: 'Represents intuition, balance and new perspectives.',
    w: 154,
    h: 146,
  },
  {
    src: '/images/brand/motif-desert-horizon.webp',
    title: 'Desert horizon',
    text: 'Wide spaces, bigger ideas. A symbol of limitless possibilities.',
    w: 155,
    h: 146,
  },
  {
    src: '/images/brand/motif-film-texture.webp',
    title: 'Film texture',
    text: 'Subtle grain, dust and vintage tones for a cinematic, authentic feel.',
    w: 161,
    h: 146,
  },
]

const principles = [
  {
    title: 'Honest numbers',
    text: 'We report what was measured, explain it plainly, and never dress up a result. If something is not working, you hear it from us first.',
  },
  {
    title: 'Story before style',
    text: 'Every visual decision follows the story the business needs to tell. Beautiful work that says the wrong thing is still the wrong work.',
  },
  {
    title: 'Built to last',
    text: 'Websites that load fast and stay maintainable, identities with clear rules, campaigns you can run again. You own what we make.',
  },
  {
    title: 'Beyond borders',
    text: 'We design for people, not just markets — brands that read clearly across languages, cultures, screens and streets.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageIntro
        label="About us"
        title={
          <>
            One sun.
            <br />
            One moon.
          </>
        }
        intro="We are a marketing agency that turns ideas into stories, and stories into real business growth. One Sun One Moon creates brands that travel across cultures, connect with people and leave a lasting impact."
      />

      <section className="section" aria-labelledby="name-title">
        <div className={`container ${styles.split}`}>
          <div>
            <SectionHeading number="01" label="The name" id="name-title" title="Why the sun and the moon?" />
          </div>
          <div className={styles.copy}>
            <p className="lede">
              Everyone on earth shares one sun and one moon. Different cities, different languages, different businesses
              — the same two lights.
            </p>
            <p>
              That is the idea behind everything we make. A great brand is understood wherever it travels, because it is
              built on something human: a clear promise, told as a story people want to hear.
            </p>
            <p>
              The sun gives our work its energy — visibility, ambition, the push to be seen. The moon gives it
              perspective — imagination, reflection and balance. We need both, every time.
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.identity}`} aria-labelledby="identity-title">
        <div className="container">
          <SectionHeading
            number="02"
            label="Brand identity · 2026"
            id="identity-title"
            title="Ideas with cinematic impact"
            intro="Our own identity follows the same rules we bring to clients: a clear logo system, a warm desert palette, bold display type and a graphic language drawn from golden-hour film."
          />
          <figure className={styles.board}>
            <Image
              src="/images/brand/brand-guidelines.webp"
              alt="The ONE SUN ONE MOON brand identity board: logo system, colour palette, typography, graphic language and brand applications"
              width={1536}
              height={1024}
              sizes="(min-width: 1368px) 1320px, 100vw"
            />
            <figcaption>The ONE SUN ONE MOON brand identity board.</figcaption>
          </figure>

          <h3 className={styles.subhead}>Graphic language</h3>
          <ul className={styles.motifs}>
            {motifs.map((m) => (
              <li key={m.title}>
                <Image src={m.src} alt="" width={m.w} height={m.h} />
                <p className={styles.motifTitle}>{m.title}</p>
                <p className={styles.motifText}>{m.text}</p>
              </li>
            ))}
          </ul>

          <h3 className={styles.subhead}>Colour palette</h3>
          <ul className={styles.palette}>
            {[
              ['Desert Cream', '#F4EBDD', 'Warm neutral for backgrounds, balance and clarity.'],
              ['Sun Gold', '#E7A52E', 'Symbolises ambition, energy and new opportunities.'],
              ['Burnt Sienna', '#B94A24', 'Conveys strength, passion and bold storytelling.'],
              ['Blood Orange', '#8E241B', 'Adds intensity, drama and cinematic depth.'],
              ['Espresso', '#261714', 'Grounds the brand with sophistication and authority.'],
            ].map(([name, hex, text]) => (
              <li key={name}>
                <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
                <p className={styles.motifTitle}>{name}</p>
                <p className={styles.hex}>{hex}</p>
                <p className={styles.motifText}>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Philosophy />

      <section className="section" aria-labelledby="principles-title">
        <div className="container">
          <SectionHeading number="04" label="How we work" id="principles-title" title="What you can expect from us" />
          <ul className={styles.principles}>
            {principles.map((p, i) => (
              <li key={p.title} className="reveal">
                <span className={styles.principleNumber}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <ButtonLink href="/contact" arrow>
              Start a project
            </ButtonLink>
            <ButtonLink href="/work" variant="secondary">
              See our work
            </ButtonLink>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
    </>
  )
}
