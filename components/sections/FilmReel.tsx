'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './FilmStrip.module.css'

/**
 * Holds the moving film strip. Everything stops while the strip is off screen, and visitors can stop it themselves.
 * The off-screen state lives on the DOM node, so scrolling never re-renders the frames.
 */
export function FilmReel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const reel = ref.current
    if (!reel) return
    const observer = new IntersectionObserver(([entry]) => {
      reel.toggleAttribute('data-offscreen', !entry?.isIntersecting)
    })
    observer.observe(reel)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.reel} data-paused={paused ? '' : undefined}>
      {children}
      <div className={`container ${styles.controls}`}>
        <button type="button" className={styles.toggle} onClick={() => setPaused(!paused)}>
          {paused ? 'Play reel' : 'Pause reel'}
        </button>
      </div>
    </div>
  )
}
