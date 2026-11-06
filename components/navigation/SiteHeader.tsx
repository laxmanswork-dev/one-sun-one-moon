import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { nav } from '@/lib/site'
import { MobileMenu } from './MobileMenu'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="ONE SUN ONE MOON — home">
          <Logo size="sm" />
        </Link>

        <div className={styles.actions}>
          <MobileMenu items={nav} />
        </div>
      </div>
    </header>
  )
}
