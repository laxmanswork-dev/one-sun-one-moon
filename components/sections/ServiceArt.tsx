import type { CSSProperties, ReactNode } from 'react'
import styles from './OurServices.module.css'

// Original vector artwork for the five service chapters: one family, sharing double borders, Sun Gold lines and Burnt
// Sienna accents, with its own corner in each piece (steps, registration marks, chevrons, fans and arches).
// Lines marked with styles.draw are drawn on when a chapter is revealed; pathLength={1} lets one dash rule draw every
// line, whatever its real length.

const d = (delay: number) => ({ '--d': `${delay}s` }) as CSSProperties

const n = (value: number) => +value.toFixed(2)

/** A crescent: the outer circle minus an inner one offset by (ox, oy), which is the way it opens. */
function crescent(cx: number, cy: number, outer: number, inner: number, ox: number, oy: number) {
  const dist = Math.hypot(ox, oy)
  const a = (dist * dist + outer * outer - inner * inner) / (2 * dist)
  const h = Math.sqrt(outer * outer - a * a)
  const [ux, uy] = [ox / dist, oy / dist]
  const [px, py] = [cx + ux * a, cy + uy * a]
  const tip1 = `${n(px - uy * h)} ${n(py + ux * h)}`
  const tip2 = `${n(px + uy * h)} ${n(py - ux * h)}`
  return `M${tip1}A${outer} ${outer} 0 1 1 ${tip2}A${inner} ${inner} 0 ${a > dist ? 1 : 0} 0 ${tip1}Z`
}

/** Radial ticks round a point, long and short in turn. */
function ticks(cx: number, cy: number, count: number, from: number, long: number, short: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count
    const [c, s] = [Math.cos(angle), Math.sin(angle)]
    const to = i % 2 ? short : long
    return `M${n(cx + from * c)} ${n(cy + from * s)}L${n(cx + to * c)} ${n(cy + to * s)}`
  }).join('')
}

const diamond = (x: number, y: number, r: number) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`

/** Draws its children in the top-left corner, then mirrors them into the other three. */
function Corners({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform={`translate(${width} 0) scale(-1 1)`}>{children}</g>
      <g transform={`translate(0 ${height}) scale(1 -1)`}>{children}</g>
      <g transform={`translate(${width} ${height}) scale(-1 -1)`}>{children}</g>
    </>
  )
}

/** The long orbit joining the sun to the moon, under the section introduction. */
export function OrbitLine() {
  return (
    <svg className={styles.orbit} viewBox="0 0 1320 120" aria-hidden="true">
      <g className={styles.draw} style={d(0.5)}>
        <path pathLength={1} d="M52 92C330 12 990 12 1268 92" />
        <path pathLength={1} className={styles.fineLine} d="M52 104C330 40 990 40 1268 104" />
      </g>
      <g className={styles.rise} style={d(0.4)}>
        <circle className={styles.goldFill} cx="30" cy="98" r="15" />
        <circle cx="30" cy="98" r="22" />
      </g>
      <path className={`${styles.rise} ${styles.siennaFill}`} style={d(1.5)} d={crescent(1290, 98, 20, 16.5, -6, -2)} />
      <g className={`${styles.rise} ${styles.fineLine}`} style={d(1.1)}>
        <path d="M660 22V52M330 40V58M990 40V58" />
      </g>
    </svg>
  )
}

const SHEET_STEPS =
  'M60 24H540V36H552V48H564V60H576V540H564V552H552V564H540V576H60V564H48V552H36V540H24V60H36V48H48V36H60Z'

/** Chapter I: a brand mark on its construction sheet, where every guide explains a part of the mark. */
export function ConstructionSheet() {
  return (
    <svg className={styles.sheet} viewBox="9 9 582 582" aria-hidden="true">
      <g className={styles.draw} style={d(0.3)}>
        <rect pathLength={1} x="10" y="10" width="580" height="580" />
        <path pathLength={1} className={styles.fineLine} d={SHEET_STEPS} />
      </g>
      <g className={`${styles.rise} ${styles.accent}`} style={d(1.1)}>
        <Corners width={600} height={600}>
          <path d="M10 10L60 24M10 10L48 36M10 10L36 48M10 10L24 60" />
        </Corners>
        <path
          className={styles.siennaFill}
          d={`${diamond(300, 17, 5)}${diamond(300, 583, 5)}${diamond(17, 300, 5)}${diamond(583, 300, 5)}`}
        />
      </g>
      <g className={`${styles.draw} ${styles.fineLine}`} style={d(0.6)}>
        <path pathLength={1} d="M24 300H576" />
        <path pathLength={1} d="M300 24V576" />
        <path pathLength={1} d="M60 60L540 540" />
        <path pathLength={1} d="M540 60L60 540" />
        <path pathLength={1} d="M180 24V576" />
        <path pathLength={1} d="M420 24V576" />
        <path pathLength={1} d="M24 180H576" />
        <path pathLength={1} d="M24 420H576" />
        <circle pathLength={1} cx="300" cy="300" r="240" />
        <circle pathLength={1} cx="300" cy="300" r="180" />
      </g>
      <path className={`${styles.rise} ${styles.accent}`} style={d(1.2)} d={ticks(300, 300, 48, 128, 142, 134)} />
      {/* The sun sits inside the moon's disc, the two circles touching at exactly one point on the diagonal. */}
      <g className={`${styles.rise} ${styles.mark}`} style={d(1.3)}>
        <circle className={styles.bloodFill} cx="300" cy="300" r="120" />
        <circle className={styles.goldFill} cx="319.8" cy="280.2" r="92" />
      </g>
      <g className={`${styles.rise} ${styles.sheetText}`} style={d(1.7)}>
        <text x="72" y="58">
          Sheet Nº 1
        </text>
        <text x="528" y="58" textAnchor="end">
          The mark
        </text>
        <text x="72" y="552">
          2x
        </text>
        <text x="528" y="552" textAnchor="end">
          x
        </text>
      </g>
    </svg>
  )
}

// Each chevron's half-height grows by 4, with a clear 42 between one tip and the back of the next.
const CHEVRONS = [
  [116, 12],
  [174, 16],
  [236, 20],
  [302, 24],
  [372, 28],
  [446, 32],
  [524, 36],
] as const
const AXIS_START = 78
const STEP = 0.26
const JOURNEY_START = 1.2
const JOURNEY_END = JOURNEY_START + STEP * CHEVRONS.length

const timed = (delay: number, duration: number) => ({ '--d': `${delay}s`, '--dur': `${duration}s` }) as CSSProperties

/**
 * Chapter III: from the moon to the sun along one axis. Each stage takes the same time over a longer distance, so the
 * line gathers speed as it travels, and the sun lights only when it arrives. The moon and sun sit the same distance
 * inside the frame.
 */
export function Trajectory() {
  return (
    <svg className={styles.trajectory} viewBox="5 5 630 140" aria-hidden="true">
      <g className={`${styles.draw} ${styles.trajectoryFrame}`} style={d(0.7)}>
        <rect pathLength={1} x="6" y="6" width="628" height="138" />
        <rect pathLength={1} x="14" y="14" width="612" height="122" />
      </g>
      <g className={styles.rise} style={d(1.6)}>
        <Corners width={640} height={150}>
          <path className={styles.siennaFill} d="M14 14H26L14 26Z" />
          <path className={styles.trajectoryFrame} d="M14 34L34 14" />
        </Corners>
      </g>
      {CHEVRONS.map(([x, h], i) => {
        const start = JOURNEY_START + i * STEP
        const previous = i === 0 ? AXIS_START : CHEVRONS[i - 1]![0]
        // The arms close on the tip at the moment the axis reaches it.
        const arms = timed(start + STEP * 0.4, STEP * 0.6)
        return (
          <g key={x} className={`${styles.draw} ${styles.chevron} ${i === CHEVRONS.length - 1 ? styles.axis : ''}`}>
            <path pathLength={1} style={timed(start, STEP)} d={`M${previous} 75H${x}`} />
            <path pathLength={1} style={arms} d={`M${x - h} ${75 - h}L${x} 75`} />
            <path pathLength={1} style={arms} d={`M${x - h} ${75 + h}L${x} 75`} />
          </g>
        )
      })}
      <path className={`${styles.rise} ${styles.siennaFill}`} style={d(0.3)} d={crescent(56, 75, 20, 16.5, 6, 0)} />
      {/* The sun waits as a fine ring, then lights from within and sends out its rays. */}
      <g className={styles.draw} style={d(0.9)}>
        <circle pathLength={1} cx="580" cy="75" r="13" />
      </g>
      <circle className={`${styles.goldFill} ${styles.sunGlow}`} style={d(JOURNEY_END + 1)} cx="580" cy="75" r="13" />
      <circle
        className={`${styles.goldFill} ${styles.sunLight}`}
        style={d(JOURNEY_END - 0.1)}
        cx="580"
        cy="75"
        r="13.6"
      />
      <path className={styles.sunRays} style={d(JOURNEY_END + 0.25)} d={ticks(580, 75, 16, 18, 24, 21)} />
    </svg>
  )
}

const POSTER_STEPS =
  'M38 16H362V22H370V30H378V38H384V462H378V470H370V478H362V484H38V478H30V470H22V462H16V38H22V30H30V22H38Z'

/** Chapter IV: the poster's double border, stepped at its corners and marked at the centre of each side. */
export function PosterFrame() {
  return (
    <svg className={styles.posterFrame} viewBox="0 0 400 500" aria-hidden="true">
      <rect x="8" y="8" width="384" height="484" />
      <path d={POSTER_STEPS} />
      <Corners width={400} height={500}>
        <path d="M8 8L38 16M8 8L30 22M8 8L22 30M8 8L16 38" />
      </Corners>
      <path
        className={styles.goldFill}
        d={`${diamond(200, 12, 3)}${diamond(200, 488, 3)}${diamond(12, 250, 3)}${diamond(388, 250, 3)}`}
      />
    </svg>
  )
}

/** Chapter IV: the sun that takes the place of the first O in LOOK. */
export function PosterSun() {
  return (
    <svg className={styles.posterO} viewBox="0 0 100 100" aria-hidden="true">
      <circle className={styles.goldFill} cx="50" cy="50" r="34" />
      <path className={styles.goldRay} d={ticks(50, 50, 16, 39, 49, 44)} />
    </svg>
  )
}

/**
 * Chapter IV: the moon that takes the place of the second O in LOOK. An open crescent reads as a C, so its horns meet in
 * a fine line round the dark of the moon: the outer edge is a true circle, with the inner one offset up the same
 * diagonal as the brand mark.
 */
export function PosterMoon() {
  return (
    <svg className={`${styles.posterO} ${styles.posterMoon}`} viewBox="0 0 100 100" aria-hidden="true">
      <path
        style={{ fill: 'var(--cream)', fillRule: 'evenodd' }}
        d="M5 50A45 45 0 1 1 95 50A45 45 0 1 1 5 50ZM24 43.5A32.5 32.5 0 1 0 89 43.5A32.5 32.5 0 1 0 24 43.5Z"
      />
    </svg>
  )
}

/**
 * Chapter V: nested arches at even 60-unit steps, the expected limits of a problem, with one line rising from the moon
 * past all of them to the sun. Everything is centred on x = 300.
 */
export function BeyondArch() {
  const jambs = [60, 120, 180, 240, 360, 420, 480, 540]
  return (
    <svg className={styles.arch} viewBox="11 11 578 678" aria-hidden="true">
      <g className={styles.draw} style={d(0.1)}>
        <rect pathLength={1} x="12" y="12" width="576" height="676" />
        <path
          pathLength={1}
          className={styles.fineLine}
          d="M54 24H546A30 30 0 0 0 576 54V646A30 30 0 0 0 546 676H54A30 30 0 0 0 24 646V54A30 30 0 0 0 54 24Z"
        />
      </g>
      <path
        className={`${styles.rise} ${styles.accent}`}
        style={d(1.2)}
        d="M24 84A60 60 0 0 0 84 24M24 114A90 90 0 0 0 114 24M576 84A60 60 0 0 1 516 24M576 114A90 90 0 0 1 486 24"
      />
      <g className={styles.draw} style={d(0.2)}>
        <path pathLength={1} d="M60 630V360A240 240 0 0 1 540 360V630" />
      </g>
      <g className={`${styles.draw} ${styles.fineLine}`} style={d(0.5)}>
        <path pathLength={1} d="M120 630V360A180 180 0 0 1 480 360V630" />
        <path pathLength={1} d="M180 630V360A120 120 0 0 1 420 360V630" />
        <path pathLength={1} d="M240 630V360A60 60 0 0 1 360 360V630" />
      </g>
      {/* The stepped foundation closes on the frame, where its curved corners begin. A capital marks every jamb where the
          arches spring. */}
      <g className={styles.draw} style={d(0.8)}>
        <path pathLength={1} d="M48 630H552V638H48Z" />
        <path pathLength={1} d="M36 638H564V646H36Z" />
        <path pathLength={1} d="M24 646H576" />
      </g>
      <path
        className={`${styles.rise} ${styles.siennaFill}`}
        style={d(1)}
        d={[120, 180, 240, 300, 360, 420, 480].map((x) => diamond(x, 661, 4)).join('')}
      />
      <path
        className={`${styles.rise} ${styles.fineLine}`}
        style={d(1)}
        d={jambs.map((x) => `M${x - 8} 360H${x + 8}`).join('')}
      />
      <g className={`${styles.draw} ${styles.axis}`} style={d(1.1)}>
        <path pathLength={1} d="M300 586V102" />
      </g>
      <path className={`${styles.rise} ${styles.siennaFill}`} style={d(1.4)} d={diamond(300, 120, 7)} />
      <g className={styles.rise} style={d(1.9)}>
        <circle className={styles.goldFill} cx="300" cy="70" r="16" />
        <circle className={styles.fineLine} cx="300" cy="70" r="21" />
        <path className={styles.fineLine} d={ticks(300, 70, 16, 25, 32, 28)} />
      </g>
      <path className={`${styles.rise} ${styles.siennaFill}`} style={d(1.5)} d={crescent(300, 592, 20, 16.5, 0, -6)} />
    </svg>
  )
}
