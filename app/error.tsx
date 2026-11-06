'use client'

import Link from 'next/link'
import { buttonClass } from '@/components/ui/Button'
import styles from './status-page.module.css'

// Error details stay in the console/server logs — never on the page.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className={styles.page} aria-labelledby="err-title">
      <div className={`container ${styles.content}`}>
        <p className="eyebrow">Something went wrong</p>
        <h1 id="err-title" className={`display fire-text ${styles.title}`}>
          A cloud
          <br />
          over the sun
        </h1>
        <p className="lede">
          This page could not be displayed. Please try again — if it keeps happening, come back a little later.
        </p>
        <div className={styles.actions}>
          <button type="button" className={buttonClass('primary')} onClick={reset}>
            Try again
          </button>
          <Link href="/" className={buttonClass('secondary')}>
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
