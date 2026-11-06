import Image from 'next/image'
import type { CSSProperties } from 'react'
import { FilmReel } from './FilmReel'
import styles from './FilmStrip.module.css'

/** The Idea frame: a warm glow on the rising sun in the image, and two small marks of thought drifting beside it. */
function IdeaLayer() {
  return (
    <>
      <div className={styles.bulbGlow} />
      <svg className={styles.layer} viewBox="0 0 300 170">
        <g className={styles.floatOne}>
          <path d="M42 84c1-5 9-6 10-1 1 4-5 5-5 10" />
          <circle cx="47" cy="98" r="0.9" />
        </g>
        <g className={styles.floatTwo}>
          <path d="M254 76c1-6 11-7 12-1 1 5-6 6-6 12" />
          <circle cx="260" cy="92" r="1" />
        </g>
      </svg>
    </>
  )
}

/** The Script frame: one line, taken from the page in the image, being typed on a slip of paper. */
function ScriptLayer() {
  return (
    <div className={styles.slip}>
      <span className={styles.typed}>Two minds. One shared vision.</span>
    </div>
  )
}

/** The Shoot frame: a viewfinder with its record light, and the set's lamps breathing. */
function ShootLayer() {
  return (
    <>
      <div className={styles.flicker} />
      <div className={styles.flash} />
      <svg className={styles.layer} viewBox="0 0 300 170">
        <path className={styles.viewfinder} d="M10 26V10H26M274 10H290V26M290 144V160H274M26 160H10V144" />
      </svg>
      <span className={styles.rec}>
        <span className={styles.recDot} />
        Rec
      </span>
    </>
  )
}

/** The Cut frame: an edit timeline running under a fixed playhead, which marks a splice as each cut goes by. */
function CutLayer() {
  return (
    <div className={styles.timeline}>
      <div className={styles.clips} />
      <div className={styles.playhead} />
    </div>
  )
}

/** The Release frame: the lamp in the image throws its beam across to the big screen, and the screen flickers. */
function ReleaseLayer() {
  return (
    <>
      <div className={styles.beam} />
      <div className={styles.screen} />
    </>
  )
}

const STAGES = [
  {
    label: 'Idea',
    tagline: 'Where it begins',
    photo: '/images/services/01 · Idea (2).png',
    alt: 'A large sun rising behind layered red desert ridges',
    Layer: IdeaLayer,
  },
  {
    label: 'Script',
    tagline: 'Giving ideas form',
    photo: '/images/services/02 · Script.png',
    alt: 'An open screenplay in a ring binder, headed The Brand Story',
    focus: '50% 2%',
    Layer: ScriptLayer,
  },
  {
    label: 'Shoot',
    tagline: 'Bringing it to life',
    photo: '/images/services/03 · Shoot (2).png',
    alt: 'A film crew in silhouette, shooting in the hills at sunset',
    moving: true,
    Layer: ShootLayer,
  },
  {
    label: 'Cut',
    tagline: 'Perfecting the story',
    photo: '/images/services/04 · Cut (2).png',
    alt: 'An editor in headphones working on a film timeline across two monitors',
    aboveTimeline: true,
    Layer: CutLayer,
  },
  {
    label: 'Release',
    tagline: 'Ready for the world',
    photo: '/images/services/05 · Release.png',
    alt: 'An audience seated outdoors at sunset, watching a film on a large screen',
    Layer: ReleaseLayer,
  },
]

/** One copy of the five frames. The strip loops two copies, and only the first is exposed to assistive technology. */
function FilmCopy({ decorative = false }: { decorative?: boolean }) {
  return (
    <ol className={`${styles.copy} ${decorative ? styles.repeat : ''}`} aria-hidden={decorative || undefined}>
      {STAGES.map(({ label, tagline, photo, alt, focus = '50% 12%', moving, aboveTimeline, Layer }, i) => (
        <li key={label} className={styles.frame}>
          <div className={styles.perforations} aria-hidden="true" />
          <div className={styles.picture} style={{ '--d': `${0.7 + i * 0.2}s` } as CSSProperties}>
            <Image
              className={moving ? styles.pushIn : undefined}
              src={photo}
              alt={decorative ? '' : alt}
              fill
              sizes="(min-width: 1000px) 28vw, (min-width: 720px) 280px, 78vw"
              style={{ objectFit: 'cover', objectPosition: focus }}
            />
            <div className={styles.layers} aria-hidden="true">
              <Layer />
            </div>
            <div className={`${styles.title} ${aboveTimeline ? styles.aboveTimeline : ''}`}>
              <div className={styles.titleText}>
                <span className={styles.heading}>
                  <span className={styles.number}>{String(i + 1).padStart(2, '0')} ·</span> {label}
                </span>
                <span className={styles.tagline}>{tagline}</span>
              </div>
            </div>
          </div>
          <div className={styles.perforations} aria-hidden="true" />
        </li>
      ))}
    </ol>
  )
}

/** Chapter II: the five stages of making a film, as one continuous strip of film running through a projector. */
export function FilmStrip() {
  return (
    <FilmReel>
      <div className={styles.strip}>
        <div className={styles.track}>
          <FilmCopy />
          <FilmCopy decorative />
        </div>
        <div className={styles.gate} aria-hidden="true" />
      </div>
    </FilmReel>
  )
}
