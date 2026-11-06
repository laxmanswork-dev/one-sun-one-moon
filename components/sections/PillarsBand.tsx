import { DecoPanel } from './DecoPanel'
import styles from './PillarsBand.module.css'

const phrases = ['Ideas', 'Stories', 'Brands', 'Beyond Borders', 'Creativity Without Limits', 'One Shared Vision']

// Repeated inside each track copy so one copy is always wider than the screen, even on ultrawide monitors.
const items = [...phrases, ...phrases]

/** The brand manifesto as an Art Deco ribbon: fixed gold rails, with phrases and ornamental panels gliding between them. */
export function PillarsBand() {
  return (
    <div className={styles.band}>
      <p className="visually-hidden">{phrases.join('. ')}.</p>
      <div className={styles.track} aria-hidden="true">
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.list}>
            {items.map((phrase, i) => (
              <li key={i} className={styles.item}>
                <span className={styles.phrase}>{phrase}</span>
                <DecoPanel />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
