import Image from 'next/image'
import type { Founder } from '@/lib/founders'
import { DecoFrame } from './DecoFrame'
import styles from './FounderFrame.module.css'

type FounderFrameProps = Founder & {
  role: string
  sizes?: string
}

/** A fixed-ratio portrait in the Art Deco border, with a caption. Photographs fill and crop to it, so both always match. */
export function FounderFrame({ name, role, photo, sizes }: FounderFrameProps) {
  const focus = `${photo.focusX}% ${photo.focusY}%`
  const zoom = Math.max(photo.zoom, 1)

  return (
    <figure className={styles.figure}>
      <div className={styles.frame} data-sunrise="3">
        <div className={styles.object}>
          <div className={styles.image}>
            {photo.src ? (
              <Image
                className={styles.photo}
                src={photo.src}
                alt={photo.alt || name}
                fill
                // A zoomed photo is drawn larger than its frame, so it needs a file that much larger to stay sharp.
                sizes={sizes ?? `(min-width: 1024px) ${24 * zoom}vw, ${45 * zoom}vw`}
                style={{
                  objectPosition: focus,
                  transform: `scale(${zoom})`,
                  transformOrigin: focus,
                }}
              />
            ) : (
              <div className={styles.placeholder} aria-hidden="true" />
            )}
            <div className={styles.darkness} aria-hidden="true" />
            <div className={styles.light} aria-hidden="true" />
          </div>
          <DecoFrame />
        </div>
      </div>
      <figcaption className={styles.caption} data-sunrise="4">
        <span className={`eyebrow ${styles.name}`}>{name}</span>
        <span className={`eyebrow ${styles.role}`}>{role}</span>
      </figcaption>
    </figure>
  )
}
