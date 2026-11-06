import type { Metadata } from 'next'
import Link from 'next/link'
import { ServiceGlyph } from '@/components/art/ServiceGlyph'
import { Process } from '@/components/sections/Process'
import { PageIntro } from '@/components/sections/PageIntro'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink, TextLink } from '@/components/ui/Button'
import { pageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { services } from '@/lib/services'
import { projects } from '@/lib/work'
import styles from './services.module.css'

export const metadata: Metadata = pageMetadata({
  title: 'Services — Brand, Websites, Social, Ads & Campaigns',
  description:
    'Brand strategy and identity, website design and development, social media marketing, performance advertising, creative campaigns and digital growth strategy.',
  path: '/services',
})

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        label="Services"
        title={
          <>
            What we
            <br />
            make happen
          </>
        }
        intro="Six services that cover the whole journey — from what your brand stands for, to how it looks, to how people find it and choose it."
      >
        <nav className={styles.jump} aria-label="Services on this page">
          <ul>
            {services.map((s) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`}>
                  <span>{s.number}</span> {s.short}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      <div className="container">
        {services.map((s) => {
          const related = projects.filter((p) => p.services.includes(s.slug))
          return (
            <section key={s.slug} id={s.slug} className={styles.service} aria-labelledby={`${s.slug}-title`}>
              <div className={styles.aside}>
                <span className={styles.number}>{s.number}</span>
                <ServiceGlyph glyph={s.glyph} className={styles.glyph} />
              </div>
              <div className={styles.main}>
                <h2 id={`${s.slug}-title`} className={`display ${styles.title}`}>
                  {s.title}
                </h2>
                <p className={styles.summary}>{s.summary}</p>
                <p className={styles.value}>{s.value}</p>
                <div className={styles.cols}>
                  <div>
                    <h3 className={styles.subhead}>What&rsquo;s included</h3>
                    <ul className={styles.includes}>
                      {s.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {related.length > 0 && (
                    <div>
                      <h3 className={styles.subhead}>See it in our work</h3>
                      <ul className={styles.related}>
                        {related.map((p) => (
                          <li key={p.slug}>
                            <Link href={`/work/${p.slug}`}>{p.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <TextLink href={`/contact?service=${encodeURIComponent(s.title)}`}>
                  Enquire about {s.short.toLowerCase()}
                </TextLink>
              </div>
            </section>
          )
        })}
      </div>

      <Process />

      <section className={`section ${styles.close}`} aria-labelledby="services-cta">
        <div className="container">
          <h2 id="services-cta" className={`display ${styles.closeTitle}`}>
            Not sure where to start?
          </h2>
          <p className="lede">
            Tell us about your business and where you want it to be. We will recommend the services that matter most —
            and tell you honestly if you don&rsquo;t need some of them yet.
          </p>
          <ButtonLink href="/contact" arrow className={styles.closeButton}>
            Start the conversation
          </ButtonLink>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
    </>
  )
}
