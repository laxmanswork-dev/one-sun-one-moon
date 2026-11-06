import styles from './DecoFrame.module.css'

// Drawn on a 352 x 550 canvas, the reference artwork's proportions. The photograph sits in the opening at
// x 32-320, y 59-491. The top-left quarter is drawn once and mirrored, so all four corners stay identical.
const WIDTH = 352
const HEIGHT = 550
const SUN = { x: 176, y: 33 }

const polar = (angle: number, radius: number) => {
  const radians = (angle * Math.PI) / 180
  return `${(SUN.x + radius * Math.cos(radians)).toFixed(2)} ${(SUN.y + radius * Math.sin(radians)).toFixed(2)}`
}

// The stepped edge of the corner fan, running from the top border round the photograph's corner to the side border.
const stairs = [
  [112, 2],
  [112, 12],
  [96, 12],
  [96, 22],
  [80, 22],
  [80, 32],
  [64, 32],
  [64, 40],
  [46, 40],
  [46, 47],
  [24, 47],
  [24, 72],
  [18, 72],
  [18, 92],
  [12, 92],
  [12, 112],
  [2, 112],
]
const toPath = (points: number[][], scale = 1) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${2 + (x! - 2) * scale} ${2 + (y! - 2) * scale}`).join('')

const fanRays = stairs.map(([x, y]) => `M2 2L${x} ${y}`).join('')

// Outlined spikes: long on the axes, medium on the diagonals, short between them.
const spikes = Array.from({ length: 16 }, (_, i) => {
  const angle = i * 22.5
  const tip = i === 0 || i === 8 ? 44 : i === 4 || i === 12 ? 22 : i % 2 === 0 ? 21 : 14
  return `M${polar(angle - 11, 7.5)}L${polar(angle, tip)}L${polar(angle + 11, 7.5)}`
}).join('')

const ticks = [128, 142, 156, 170, 184, 198].map((y) => `M7 ${y + 11}L21 ${y}`).join('')
const outerDots = [60, 72, 84, 96, 108, 120].map((x) => [x, 14 + (176 - x) * 0.3367] as const)
const innerDots = [84, 96, 108].map((x) => [x, 19 + (176 - x) * 0.3367] as const)
const triangles = [226, 238, 250, 262]

function Quarter() {
  return (
    <>
      <path d={toPath(stairs)} />
      <path d={toPath(stairs, 0.72)} />
      <path d={fanRays} />
      {/* The double diagonals rising from the side rails towards the sunburst. */}
      <path d="M26 54.5L176 3M29 58.5L176 9" />
      <path d={ticks} />
      {[...outerDots, ...innerDots].map(([x, y]) => (
        <circle key={`${x}-${y}`} className={styles.solid} cx={x} cy={y} r="1.1" />
      ))}
      {triangles.map((y) => (
        <g key={y} className={styles.solid}>
          <path d={`M4 ${y + 5.5}L16 ${y}V${y + 11}Z`} />
          <path d={`M18 ${y + 8.5}L23 ${y + 5.5}V${y + 11.5}Z`} />
        </g>
      ))}
    </>
  )
}

function Sunburst() {
  return (
    <>
      <path d="M132 33L176 11L220 33L176 55Z" />
      <path d={spikes} />
      <circle cx={SUN.x} cy={SUN.y} r="7.5" />
      <circle cx={SUN.x} cy={SUN.y} r="5.5" />
    </>
  )
}

const mirrorX = `translate(${WIDTH} 0) scale(-1 1)`
const mirrorY = `translate(0 ${HEIGHT}) scale(1 -1)`

/** The Art Deco ornamental border drawn around a founder portrait. Purely decorative. */
export function DecoFrame() {
  return (
    <svg className={styles.deco} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
      <rect x="2" y="2" width={WIDTH - 4} height={HEIGHT - 4} />
      {/* Double rails either side of the opening. */}
      <path d="M26 54.5V495.5M29 58.5V491.5M326 54.5V495.5M323 58.5V491.5" />
      {[undefined, mirrorX, mirrorY, `${mirrorX} ${mirrorY}`].map((transform) => (
        <g key={transform ?? 'origin'} transform={transform}>
          <Quarter />
        </g>
      ))}
      <Sunburst />
      <g transform={mirrorY}>
        <Sunburst />
      </g>
    </svg>
  )
}
