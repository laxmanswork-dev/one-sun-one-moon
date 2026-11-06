import Link from 'next/link'
import { ServiceGlyph } from '@/components/art/ServiceGlyph'
import { Arrow, ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { services } from '@/lib/services'
import styles from './ServicesGrid.module.css'

export function ServicesGrid({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="services-title">
      <div className="container">
        {withHeading && (
          <SectionHeading
            number="01"
            label="What we do"
            id="services-title"
            title={
              <>
                Six crafts.
                <br />
                One story.
              </>
            }
            intro="Every service works on its own, and works better together — so your brand looks, sounds and performs like one thing everywhere."
          />
        )}
        <ul className={styles.grid}>
          {services.map((s) => (
            <li key={s.slug} className={`reveal ${styles.card}`}>
              <div className={styles.cardTop}>
                <span className={styles.number}>{s.number}</span>
                <ServiceGlyph glyph={s.glyph} className={styles.glyph} />
              </div>
              <h3 className={styles.title}>
                <Link href={`/services#${s.slug}`} className={styles.link}>
                  {s.title}
                </Link>
              </h3>
              <p className={styles.summary}>{s.summary}</p>
              <span className={styles.more} aria-hidden="true">
                Explore <Arrow />
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <ButtonLink href="/contact" arrow>
            Discuss your project
          </ButtonLink>
          <ButtonLink href="/services" variant="secondary">
            All services in detail
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
