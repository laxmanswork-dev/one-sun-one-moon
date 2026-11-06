'use client'

import { useEffect, useRef, type ComponentProps } from 'react'

/**
 * Marks itself data-inview="ready" once hydrated and "in" the first time it scrolls into view. Styles key off that
 * attribute to play a reveal once. The state lives on the DOM node, so server and client markup always match.
 */
export function InView({ children, ...props }: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.dataset.inview = 'ready'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.dataset.inview = 'in'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -25% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} data-inview-root="" {...props}>
      {children}
    </div>
  )
}
