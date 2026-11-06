'use client'

import { useEffect, useRef, type ComponentProps } from 'react'
import styles from './SunriseReveal.module.css'

/**
 * A section that "wakes up" with a passing sunrise the first time it scrolls into view. Mark descendants with
 * data-sunrise="1" to "6" to set their place in the sequence. The state lives on the DOM node rather than in React, so
 * the server and client markup always match and nothing re-renders.
 */
export function SunriseReveal({ className, children, ...props }: ComponentProps<'section'>) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = ref.current
    if (!section) return
    section.dataset.sunriseState = 'ready'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        section.dataset.sunriseState = 'awake'
        observer.disconnect()
      },
      // Starts once the section's top is well into the screen, however tall the section is on this device.
      { rootMargin: '0px 0px -30% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={`${styles.sunrise} ${className ?? ''}`} {...props}>
      <div className={styles.glow} aria-hidden="true" />
      {children}
    </section>
  )
}
