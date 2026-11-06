import type { ReactNode } from 'react'
import { MoonGlyph, SunGlyph } from '@/components/brand/Glyphs'
import styles from './PageIntro.module.css'

/** Opening block for inner pages: chapter label, display H1, intro. */
export function PageIntro({
  label,
  title,
  intro,
  children,
}: {
  label: string
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className={styles.intro} aria-labelledby="page-title">
      <div className="container">
        <p className={styles.label}>
          <MoonGlyph className={styles.moon} />
          {label}
          <SunGlyph className={styles.sun} />
        </p>
        <h1 id="page-title" className={`display fire-text ${styles.title}`}>
          {title}
        </h1>
        {intro && <div className={styles.lede}>{intro}</div>}
        {children}
      </div>
      <div className={styles.horizon} aria-hidden="true" />
    </section>
  )
}
