import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { services } from '@/lib/services'
import { getPublicContact, legalNav, nav, site } from '@/lib/site'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  const contact = getPublicContact()
  const year = new Date().getFullYear()

  return (
    <footer className={`${styles.footer} on-dark`}>
      <div className={`container ${styles.cta}`}>
        <p className="eyebrow">{site.promise}</p>
        <p className={`display ${styles.ctaTitle}`}>
          The story <span className={styles.ctaAccent}>is ours.</span>
          <br />
          Let&rsquo;s write yours.
        </p>
        <ButtonLink href="/contact" variant="light" arrow>
          Start a project
        </ButtonLink>
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <Link href="/" aria-label="ONE SUN ONE MOON — home" className={styles.logoLink}>
            <Logo size="md" />
          </Link>
          <p className={styles.statement}>
            A digital marketing and creative agency. We turn ideas into stories, and stories into real business growth.
          </p>
          <p className={styles.pillars}>{site.pillars.join(' · ')}</p>
        </div>

        <nav aria-label="Footer" className={styles.col}>
          <h2 className={styles.colTitle}>Explore</h2>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.colTitle}>Services</h2>
          <ul>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`}>{s.short}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h2 className={styles.colTitle}>Contact</h2>
          <ul>
            <li>
              <Link href="/contact">Project enquiry form</Link>
            </li>
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {contact.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer me">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {year} {site.legalName}. All rights reserved.
        </p>
        <ul className={styles.legal}>
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
