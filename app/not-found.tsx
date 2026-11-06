import type { Metadata } from 'next'
import { DesertHorizon } from '@/components/art/DesertHorizon'
import { ButtonLink } from '@/components/ui/Button'
import styles from './status-page.module.css'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="nf-title">
      <div className={`container ${styles.content}`}>
        <p className="eyebrow">Error 404 · Lost in the desert</p>
        <h1 id="nf-title" className={`display fire-text ${styles.title}`}>
          This road
          <br />
          leads nowhere
        </h1>
        <p className="lede">
          The page you were looking for has moved, or never existed. Let&rsquo;s get you back on the map.
        </p>
        <div className={styles.actions}>
          <ButtonLink href="/" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            See our work
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </div>
      <div className={styles.scene}>
        <DesertHorizon />
      </div>
    </section>
  )
}
