import Link from 'next/link'
import styles from './JourneyLauncher.module.css'

/** The hero's “DON'T CLICK THIS ↗” secondary CTA — opens the Sun → Moon → game brand journey. */
export function JourneyLauncher({ className }: { className?: string }) {
  return (
    <Link href="/journey" className={[styles.button, className].filter(Boolean).join(' ')}>
      <span>Don&rsquo;t click this</span>
      <span className={styles.arrow} aria-hidden="true">
        ↗
      </span>
      <span className="visually-hidden"> — opens the ONE SUN ONE MOON brand journey, with a secret game</span>
    </Link>
  )
}
