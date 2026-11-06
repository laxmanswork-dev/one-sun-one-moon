'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useScrollScene } from '@/lib/hooks/useScrollScene'
import { Words } from './Words'
import styles from './SunChapter.module.css'

// The brand's own dusk footage: the sun going down on the right, the moon already up on the left.
// The still is the same frame, used as the poster and as the whole scene when motion is reduced.
const STILL = '/images/brand/hb.png'
const VIDEO = '/images/brand/hb.mp4'

/** Scroll progress at which each beat appears: paragraph, cue. The headline opens the scene. */
const BEATS = [0.16, 0.55]

/** Chapter I — the Sun: a brand moving from obscurity to visibility. */
export function SunChapter({ cinematic, motion }: { cinematic: boolean; motion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // 0 nothing, 1 headline, 2 paragraph, 3 scroll cue. Only ever moves forward, so a
  // beat never replays when the visitor scrolls back up.
  const [beat, setBeat] = useState(0)
  const [onScreen, setOnScreen] = useState(true)

  // The headline rises on arrival, so the first screen is never empty.
  useEffect(() => {
    const timer = window.setTimeout(() => setBeat((b) => Math.max(b, 1)), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const onProgress = useCallback((p: number) => {
    const reached = 1 + BEATS.filter((t) => p >= t).length
    setBeat((b) => (reached > b ? reached : b))
  }, [])
  useScrollScene(sectionRef, onProgress, setOnScreen)

  // The footage only plays while the chapter is on screen.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (onScreen) video.play().catch(() => {})
    else video.pause()
  }, [onScreen, motion])

  const shown = (n: number) => (!cinematic || beat >= n ? true : undefined)

  return (
    <section
      ref={sectionRef}
      id="sun"
      className={styles.chapter}
      data-cinematic={cinematic || undefined}
      data-idle={!onScreen || undefined}
      aria-labelledby="sun-title"
    >
      <div className={styles.stage}>
        <div className={styles.media} aria-hidden="true">
          <Image src={STILL} alt="" fill preload sizes="100vw" className={styles.still} />
          {motion && (
            <video
              ref={videoRef}
              className={styles.video}
              poster={STILL}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              tabIndex={-1}
            >
              <source src={VIDEO} type="video/mp4" />
            </video>
          )}
        </div>
        {/* Obscurity lifts as the visitor scrolls: the veil thins, the clouds part, the light grows. */}
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.glow} aria-hidden="true" />
        <div className={`${styles.clouds} ${styles.cloudsLeft}`} aria-hidden="true">
          <div className={styles.cloudBank} />
        </div>
        <div className={`${styles.clouds} ${styles.cloudsRight}`} aria-hidden="true">
          <div className={styles.cloudBank} />
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.dusk} aria-hidden="true" />

        <div className={`container ${styles.copy}`}>
          <p className={styles.kicker} data-shown={shown(1)}>
            Chapter I · The Sun
          </p>
          <h1 id="sun-title" className={`display ${styles.title}`} data-shown={shown(1)}>
            <Words text="Your brand deserves to be" className={styles.word} />{' '}
            <span className={styles.seen}>
              <Words text="seen." className={styles.word} start={5} />
            </span>
          </h1>
          <p className={styles.body} data-shown={shown(2)}>
            Clouds can hide the sun, but never its power to shine. When your brand gets lost in the noise, we bring its
            true potential into the light — with bold ideas, sharp strategy, and creative that refuses to go unnoticed.
          </p>
        </div>

        <a href="#moon" className={styles.cue} data-shown={shown(3)}>
          Continue into the night <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}
