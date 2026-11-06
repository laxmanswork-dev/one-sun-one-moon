import type { ReactNode } from 'react'
import { PageIntro } from './PageIntro'
import styles from './LegalPage.module.css'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageIntro label="Legal" title={title} intro={<p>Last updated: {updated}</p>} />
      <div className="section">
        <div className="container">
          <p className={styles.review} role="note">
            <strong>Draft — pending legal review.</strong> This page describes how this website actually works today. It
            has not yet been reviewed by a lawyer, and details marked “to be confirmed” still need to be completed by
            ONE SUN ONE MOON.
          </p>
          <div className="prose">{children}</div>
        </div>
      </div>
    </>
  )
}
