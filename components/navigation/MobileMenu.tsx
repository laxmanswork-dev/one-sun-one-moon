'use client'

import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoonGlyph, SunGlyph } from '@/components/brand/Glyphs'
import { ButtonLink } from '@/components/ui/Button'
import { useModal } from '@/lib/hooks/useModal'
import { site } from '@/lib/site'
import { NavLinks, type NavItem } from './NavLinks'
import styles from './MobileMenu.module.css'

export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useModal(open, panelRef, close)

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <span className={styles.bars} aria-hidden="true" />
        <span className="visually-hidden">Open menu</span>
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-menu"
            ref={panelRef}
            className={`${styles.panel} on-dark`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
          >
            <div className={styles.top}>
              <p className={styles.kicker}>
                <MoonGlyph className={styles.glyph} />
                {site.promise}
                <SunGlyph className={styles.glyph} />
              </p>
              <button type="button" className={styles.close} onClick={close}>
                <span aria-hidden="true">×</span>
                <span className="visually-hidden">Close menu</span>
              </button>
            </div>
            <nav aria-label="Mobile">
              <NavLinks items={items} className={styles.links} linkClassName={styles.link} onNavigate={close} />
            </nav>
            <div className={styles.footer}>
              <ButtonLink href="/contact" variant="light" arrow onClick={close}>
                Start a project
              </ButtonLink>
              <p className={styles.pillars}>{site.pillars.join(' · ')}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
