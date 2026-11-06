'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { BookingMode } from '@/lib/booking/availability'
import { MoonChapter } from './MoonChapter'
import { ProjectBooking } from './ProjectBooking'
import { SunChapter } from './SunChapter'
import styles from './BrandJourney.module.css'

const loadGame = () => import('@/components/game/SuperstarGame')
// The game is its own chunk, fetched once the visitor reaches the Moon chapter's end.
const SuperstarGame = dynamic(loadGame, { ssr: false })

// Pinned, scroll-driven scenes need motion allowed and enough height to hold a chapter on one screen;
// otherwise every chapter is laid out as a plain, fully visible page.
const CINEMATIC_QUERY = '(prefers-reduced-motion: no-preference) and (min-height: 560px)'
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export interface JourneyBookingProps {
  mode: BookingMode
  timeZone: string
  /** False when submissions would fail for lack of configuration; the form says so up front. */
  deliveryReady: boolean
  fallbackEmail: string | null
}

/** Sun → Moon → secret game → project enquiry: the “DON'T CLICK THIS” brand journey. */
export function BrandJourney({ booking }: { booking: JourneyBookingProps }) {
  const cinematic = useMedia(CINEMATIC_QUERY)
  const motion = useMedia(MOTION_QUERY)

  const [gameUnlocked, setGameUnlocked] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [finished, setFinished] = useState(false)

  const gateRef = useRef<HTMLElement>(null)
  const enquiryRef = useRef<HTMLElement>(null)
  const enquiryTitleRef = useRef<HTMLHeadingElement>(null)

  // The game becomes available only once the visitor reaches the end of the Moon chapter.
  useEffect(() => {
    const gate = gateRef.current
    if (!gate || gameUnlocked) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setGameUnlocked(true)
        void loadGame()
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(gate)
    return () => observer.disconnect()
  }, [gameUnlocked])

  const closeGame = useCallback(() => setGameOpen(false), [])
  const markFinished = useCallback(() => setFinished(true), [])

  // The enquiry is always on the page; after the game, “continue” brings it into view and focuses its heading.
  const motionRef = useRef(motion)
  useEffect(() => {
    motionRef.current = motion
  }, [motion])
  const showEnquiry = useCallback(() => {
    enquiryRef.current?.scrollIntoView({ behavior: motionRef.current ? 'smooth' : 'auto', block: 'start' })
    enquiryTitleRef.current?.focus({ preventScroll: true })
  }, [])
  const continueToEnquiry = useCallback(() => {
    setGameOpen(false)
    // Wait for the game to close and hand focus back before moving it to the enquiry.
    requestAnimationFrame(showEnquiry)
  }, [showEnquiry])

  const step = gameUnlocked ? 3 : 1

  return (
    <div className={`${styles.journey} on-dark`} data-cinematic={cinematic || undefined}>
      <nav className={styles.bar} aria-label="Brand journey">
        <ol className={styles.steps}>
          <li aria-current={step === 1 ? 'step' : undefined}>
            <a href="#sun">
              <span className={styles.stepNumber}>I</span>
              <span className={styles.stepName}>Sun</span>
            </a>
          </li>
          <li>
            <a href="#moon">
              <span className={styles.stepNumber}>II</span>
              <span className={styles.stepName}>Moon</span>
            </a>
          </li>
          <li aria-current={step === 3 ? 'step' : undefined}>
            {gameUnlocked ? (
              <a href="#secret-game">
                <span className={styles.stepNumber}>III</span>
                <span className={styles.stepName}>Game</span>
              </a>
            ) : (
              <span className={styles.locked}>
                <span className={styles.stepNumber}>III</span>
                <span className={styles.stepName}>Game</span>
                <span className="visually-hidden"> (locked until the end of the Moon chapter)</span>
              </span>
            )}
          </li>
          <li>
            <a href="#next-chapter">
              <span className={styles.stepNumber}>IV</span>
              <span className={styles.stepName}>Your chapter</span>
            </a>
          </li>
        </ol>
        <Link href="/" className={styles.exit}>
          <span>Exit</span>
          <span aria-hidden="true">×</span>
          <span className="visually-hidden"> the journey and return to the main website</span>
        </Link>
      </nav>

      <SunChapter cinematic={cinematic} motion={motion} />
      <MoonChapter cinematic={cinematic} />

      <section ref={gateRef} id="secret-game" className={styles.gate} aria-labelledby="gate-title">
        <div className={`container ${styles.gateInner}`} data-shown={gameUnlocked || undefined}>
          <p className={styles.kicker}>Chapter III · The secret</p>
          <h2 id="gate-title" className={`display ${styles.gateTitle}`}>
            You&rsquo;ve seen the vision.
            <span className={styles.gateAccent}> Now test your instincts.</span>
          </h2>
          {finished ? (
            <div className={styles.gateActions}>
              <button type="button" className={styles.enter} onClick={showEnquiry}>
                Continue to your next chapter{' '}
                <span className={styles.enterArrow} aria-hidden="true">
                  ↓
                </span>
              </button>
              <button type="button" className={styles.replay} onClick={() => setGameOpen(true)}>
                Play again
              </button>
            </div>
          ) : (
            <div className={styles.gateActions}>
              <button
                type="button"
                className={styles.enter}
                onClick={() => setGameOpen(true)}
                onPointerEnter={() => void loadGame()}
                aria-haspopup="dialog"
                disabled={!gameUnlocked}
              >
                Enter the secret game{' '}
                <span className={styles.enterArrow} aria-hidden="true">
                  →
                </span>
                <span className="visually-hidden"> — Catch the Superstar Shades</span>
              </button>
              <p className={styles.gateNote}>45 seconds. Mouse, touch or keyboard.</p>
            </div>
          )}
        </div>
      </section>

      <section ref={enquiryRef} id="next-chapter" className={styles.enquiry} aria-labelledby="enquiry-title">
        <div className={styles.dawn} aria-hidden="true" />
        <div className={`container reveal ${styles.enquiryInner}`}>
          <p className={styles.enquiryKicker}>Chapter IV · Your story</p>
          <h2 id="enquiry-title" ref={enquiryTitleRef} tabIndex={-1} className={`display ${styles.enquiryTitle}`}>
            Let&rsquo;s turn your vision into <span className="fire-text">something real.</span>
          </h2>
          <p className={styles.enquiryLede}>
            You&rsquo;ve experienced our world. Now let&rsquo;s talk about yours. Tell us what you&rsquo;re building,
            and let&rsquo;s find the right time to make it happen.
          </p>
          <ProjectBooking {...booking} />
        </div>
      </section>

      {gameOpen &&
        createPortal(
          <SuperstarGame
            onClose={closeGame}
            onFinish={markFinished}
            onContinue={continueToEnquiry}
            continueLabel="Continue to your next chapter"
            closeLabel="Back to the journey"
          />,
          document.body,
        )}
    </div>
  )
}
