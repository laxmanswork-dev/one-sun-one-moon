import type { ServiceGlyph as Glyph } from '@/lib/services'

/** Original line-art marks for each service, drawn in the sun-and-moon language. */
export function ServiceGlyph({ glyph, className }: { glyph: Glyph; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph === 'identity' && (
        <>
          <circle cx="32" cy="32" r="20" />
          <path d="M32 12a20 20 0 0 1 0 40 14 14 0 0 0 0-40z" fill="currentColor" stroke="none" />
          <path d="M32 4v4M32 56v4M4 32h4M56 32h4" />
        </>
      )}
      {glyph === 'web' && (
        <>
          <rect x="6" y="12" width="52" height="38" rx="4" />
          <path d="M6 20h52M12 16h2M17 16h2" />
          <path d="M14 42c4-8 9-12 14-12s10 4 14 12" />
          <circle cx="44" cy="30" r="4" fill="currentColor" stroke="none" />
          <path d="M24 56h16M32 50v6" />
        </>
      )}
      {glyph === 'social' && (
        <>
          <rect x="16" y="6" width="32" height="52" rx="6" />
          <path d="M28 52h8" />
          <circle cx="32" cy="28" r="8" />
          <path d="M22 44c3-3 6-4 10-4s7 1 10 4" />
          <path d="M44 4l4-2M50 10l4-1M48 6l6-4" />
        </>
      )}
      {glyph === 'performance' && (
        <>
          <path d="M6 54h52" />
          <path d="M10 46l12-12 10 8 20-22" />
          <path d="M44 20h8v8" />
          <circle cx="52" cy="10" r="5" fill="currentColor" stroke="none" />
        </>
      )}
      {glyph === 'content' && (
        <>
          <rect x="6" y="18" width="52" height="36" rx="3" />
          <path d="M6 18l8-10h8l-8 10M22 18l8-10h8l-8 10M38 18l8-10h8l-8 10" />
          <path d="M20 46c3-10 8-15 12-15s9 5 12 15" />
          <path d="M14 46h36" />
        </>
      )}
      {glyph === 'growth' && (
        <>
          <path d="M6 50c8-4 14-4 20 0s12 4 18 0 10-4 14-2" />
          <circle cx="20" cy="22" r="8" />
          <path d="M44 10a10 10 0 1 0 8 16 8 8 0 1 1-8-16z" fill="currentColor" stroke="none" />
          <path d="M20 8v3M20 33v3M6 22h3M31 22h3" />
        </>
      )}
    </svg>
  )
}
