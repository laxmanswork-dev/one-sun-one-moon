'use client'

import { useCallback, useRef, useState } from 'react'
import { useScrollScene } from '@/lib/hooks/useScrollScene'
import { Words } from './Words'
import styles from './MoonChapter.module.css'

/** Scroll progress at which each beat appears: headline, paragraph. */
const BEATS = [0.06, 0.26]

/** Chapter II — the Moon: distinction, presence, memorability. */
export function MoonChapter({ cinematic }: { cinematic: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [beat, setBeat] = useState(0)
  const [onScreen, setOnScreen] = useState(false)

  const onProgress = useCallback((p: number) => {
    const reached = BEATS.filter((t) => p >= t).length
    setBeat((b) => (reached > b ? reached : b))
  }, [])
  useScrollScene(sectionRef, onProgress, setOnScreen)

  const shown = (n: number) => (!cinematic || beat >= n ? true : undefined)

  return (
    <section
      ref={sectionRef}
      id="moon"
      className={styles.chapter}
      data-cinematic={cinematic || undefined}
      data-idle={!onScreen || undefined}
      aria-labelledby="moon-title"
    >
      <div className={styles.stage}>
        <div className={styles.sky} aria-hidden="true" />
        <div className={styles.moonWrap} aria-hidden="true">
          <div className={styles.halo} />
          <div className={styles.moon} />
        </div>
        <div className={styles.sweep} aria-hidden="true" />
        <div className={`${styles.cloud} ${styles.cloudHigh}`} aria-hidden="true" />
        <div className={`${styles.cloud} ${styles.cloudLow}`} aria-hidden="true" />
        <svg className={styles.ridges} viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path
            fill="#121a2b"
            d="M0 170 90 138l70 18 96-56 84 40 60-22 110 66 92-48 120 54 80-30 110 42 96-64 102 50 74-24 120 44 96-30 100 34v172H0z"
          />
          <path
            fill="#0a0f1a"
            d="M0 220 120 186l90 26 120-44 110 48 140-38 100 30 130-46 120 50 90-18 140 36 110-30 120 26 110-14v168H0z"
          />
        </svg>
        <div className={styles.scrim} aria-hidden="true" />

        <div className={`container ${styles.copy}`}>
          <p className={styles.kicker} data-shown={shown(1)}>
            Chapter II · The Moon
          </p>
          <h2 id="moon-title" className={`display ${styles.title}`} data-shown={shown(1)}>
            <Words text="Make your brand" className={styles.word} />{' '}
            <span className={styles.silver}>
              <Words text="impossible to ignore." className={styles.word} start={3} />
            </span>
          </h2>
          <p className={styles.body} data-shown={shown(2)}>
            Even in the darkest night, the moon commands attention without making a sound. Your brand should do the
            same. We build a distinctive presence that cuts through the darkness, earns attention, and stays in
            people&rsquo;s minds long after the moment has passed.
          </p>
        </div>
      </div>
    </section>
  )
}
