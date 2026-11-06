import { MoonGlyph, SunGlyph } from './Glyphs'
import styles from './Logo.module.css'

/**
 * The ONE SUN ONE MOON primary logo, set in live type to match the brand
 * board: two stacked lines of extended heavy capitals with the fire gradient,
 * the crescent before the first line and the sun after it.
 *
 * When the official vector logo file is supplied, replace the markup below
 * with it (keeping the same wrapper) — every placement on the site uses this
 * component.
 */
export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={[styles.logo, styles[size], className].filter(Boolean).join(' ')}
      role="img"
      aria-label="ONE SUN ONE MOON"
    >
      <span className={styles.row} aria-hidden="true">
        <MoonGlyph className={styles.moon} />
        <span className={styles.word}>ONE SUN</span>
        <SunGlyph className={styles.sun} />
      </span>
      <span className={styles.word} aria-hidden="true">
        ONE MOON
      </span>
    </span>
  )
}

/** The OS / OM icon mark from the brand board. */
export function IconMark({ className }: { className?: string }) {
  return (
    <span className={[styles.mark, className].filter(Boolean).join(' ')} role="img" aria-label="ONE SUN ONE MOON">
      <MoonGlyph className={styles.markMoon} aria-hidden />
      <span className={styles.markLetters} aria-hidden="true">
        <span>OS</span>
        <span>OM</span>
      </span>
      <SunGlyph className={styles.markSun} aria-hidden />
    </span>
  )
}
