'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * Tracks how far a tall, pinned section has been scrolled through: 0 when its
 * top meets the top of the viewport, 1 when its bottom meets the bottom.
 *
 * The value is written to the element as the CSS custom property `--p` (so
 * styles can follow the scroll without React re-rendering) and passed to
 * `onProgress`. Work happens at most once per frame, and only while the
 * section is on screen; `onVisible` reports when it enters or leaves.
 */
export function useScrollScene(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  onVisible?: (visible: boolean) => void,
) {
  const progressRef = useRef(onProgress)
  const visibleRef = useRef(onVisible)
  useEffect(() => {
    progressRef.current = onProgress
    visibleRef.current = onVisible
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    let onScreen = false

    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : rect.top <= 0 ? 1 : 0
      el.style.setProperty('--p', p.toFixed(4))
      progressRef.current(p)
    }
    const schedule = () => {
      if (onScreen && !frame) frame = requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting)
      visibleRef.current?.(onScreen)
      if (onScreen) schedule()
    })

    observer.observe(el)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [ref])
}
