import type { SVGProps } from 'react'

type GlyphProps = SVGProps<SVGSVGElement> & { title?: string }

/** The brand's crescent moon. Decorative unless a title is given. */
export function MoonGlyph({ title, ...props }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...props}>
      {title && <title>{title}</title>}
      <path d="M19.5 3.5A13 13 0 1 0 28.5 24 11 11 0 1 1 19.5 3.5z" fill="currentColor" />
    </svg>
  )
}

/** The brand's rayed sun. Decorative unless a title is given. */
export function SunGlyph({ title, ...props }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...props}>
      {title && <title>{title}</title>}
      <circle cx="16" cy="16" r="6.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M16 2.5v4M16 25.5v4M2.5 16h4M25.5 16h4M6.4 6.4l2.8 2.8M22.8 22.8l2.8 2.8M6.4 25.6l2.8-2.8M22.8 9.2l2.8-2.8" />
      </g>
    </svg>
  )
}
