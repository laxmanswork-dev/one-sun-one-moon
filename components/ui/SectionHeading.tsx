import type { ReactNode } from 'react'
import styles from './SectionHeading.module.css'

/** The brand board's numbered chapter label ("01 — Logo System") plus a display heading. */
export function SectionHeading({
  number,
  label,
  title,
  intro,
  id,
  as: Tag = 'h2',
  tone = 'light',
  align = 'start',
}: {
  number?: string
  label: string
  title: ReactNode
  intro?: ReactNode
  id?: string
  as?: 'h1' | 'h2'
  tone?: 'light' | 'dark'
  align?: 'start' | 'center'
}) {
  return (
    <header className={[styles.heading, styles[tone], styles[align]].join(' ')}>
      <p className={styles.label}>
        {number && <span className={styles.number}>{number}</span>}
        <span>{label}</span>
      </p>
      <Tag id={id} className={`display ${styles.title}`}>
        {title}
      </Tag>
      {intro && <div className={styles.intro}>{intro}</div>}
    </header>
  )
}
