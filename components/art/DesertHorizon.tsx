import styles from './DesertHorizon.module.css'

/**
 * Original vector artwork of the brand board's cinematic desert horizon:
 * a low sun disk, layered mesas, a road running to the vanishing point and
 * golden-hour haze. Decorative only.
 */
export function DesertHorizon({ className }: { className?: string }) {
  return (
    <svg
      className={[styles.scene, className].filter(Boolean).join(' ')}
      viewBox="0 0 1600 560"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="dh-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4EBDD" stopOpacity="0" />
          <stop offset="0.62" stopColor="#F1C98E" stopOpacity="0.55" />
          <stop offset="1" stopColor="#E9A866" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="dh-sun" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset="0.45" stopColor="#F6C25A" />
          <stop offset="1" stopColor="#E7A52E" />
        </radialGradient>
        <radialGradient id="dh-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F6C25A" stopOpacity="0.6" />
          <stop offset="1" stopColor="#F6C25A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dh-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9A276" />
          <stop offset="1" stopColor="#E2B488" />
        </linearGradient>
        <linearGradient id="dh-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B94A24" />
          <stop offset="1" stopColor="#9A3A1E" />
        </linearGradient>
        <linearGradient id="dh-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8E241B" />
          <stop offset="1" stopColor="#5A1A13" />
        </linearGradient>
        <linearGradient id="dh-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D79A62" />
          <stop offset="0.35" stopColor="#B8703F" />
          <stop offset="1" stopColor="#3B1F18" />
        </linearGradient>
        <linearGradient id="dh-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B3A28" stopOpacity="0.6" />
          <stop offset="1" stopColor="#261714" />
        </linearGradient>
      </defs>

      <rect width="1600" height="560" fill="url(#dh-haze)" />

      {/* Sun on the horizon */}
      <g className={styles.sun}>
        <circle cx="1130" cy="368" r="230" fill="url(#dh-glow)" />
        <circle cx="1130" cy="368" r="104" fill="url(#dh-sun)" />
      </g>

      {/* Far range */}
      <path
        fill="url(#dh-far)"
        opacity="0.75"
        d="M0 392V352l52-6 24-22h58l18 20 70 4 20-14h64l26 22 92 2 30-18h48l20 16 120 6 24-10 160 4 30-20h70l26 22 108 2 22-14h60l30 18 120 4 34-22h72l24 20 90 6v40z"
      />

      {/* Left mesas */}
      <path
        className={styles.mesaLeft}
        fill="url(#dh-mid)"
        d="M0 400V196l22-4 6-18h70l8 20 18 4 10 52 42 4 6-16h88l10 22 16 4 12 70 52 6 8-12h44l12 22 60 6 14 40z"
      />
      <path fill="url(#dh-near)" d="M0 410V262l30-2 8-14h48l10 18 20 4 16 76 46 6 10 22 70 8 12 30z" />

      {/* Right mesas */}
      <path
        className={styles.mesaRight}
        fill="url(#dh-mid)"
        d="M1600 400V178l-26-4-8-22h-80l-8 22-20 4-12 60-46 6-8-14h-74l-10 20-18 4-14 66-60 10-12 32-70 8-12 30z"
      />
      <path fill="url(#dh-near)" d="M1600 412V250l-34-2-10-16h-54l-10 20-22 4-18 70-56 8-12 24-80 8-14 30z" />

      {/* Desert floor and road to the vanishing point */}
      <path fill="url(#dh-ground)" d="M0 392h1600v168H0z" />
      <path fill="url(#dh-road)" d="M792 392h16l300 168H492z" />
      <path
        className={styles.lane}
        d="M800 396V560"
        stroke="#E7A52E"
        strokeWidth="3"
        strokeDasharray="4 8 6 12 10 16 16 22 22 30"
        opacity="0.8"
      />

      {/* Scrub */}
      <g fill="#3B1F18" opacity="0.7">
        <ellipse cx="230" cy="470" rx="26" ry="7" />
        <ellipse cx="410" cy="438" rx="16" ry="4" />
        <ellipse cx="1290" cy="452" rx="22" ry="6" />
        <ellipse cx="1480" cy="500" rx="34" ry="9" />
        <ellipse cx="1040" cy="420" rx="12" ry="3" />
      </g>
    </svg>
  )
}
