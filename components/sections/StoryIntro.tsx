import { ButtonLink } from '@/components/ui/Button'
import { founders } from '@/lib/founders'
import { FounderFrame } from './FounderFrame'
import styles from './StoryIntro.module.css'
import { SunriseReveal } from './SunriseReveal'

/** "Two minds. One vision." — introduces the two founders and how the agency began. */
export function StoryIntro() {
  return (
    <SunriseReveal className={styles.section} aria-labelledby="story-title">
      <div className={`container ${styles.grid}`}>
        <header className={styles.headline}>
          <p className="eyebrow" data-sunrise="1">
            The people behind the vision
          </p>
          <h2 id="story-title" className={`display fire-text ${styles.title}`} data-sunrise="2">
            Two minds.
            <br />
            One vision.
          </h2>
        </header>

        <div className={styles.frames}>
          {founders.map((founder) => (
            <FounderFrame key={founder.name} role="Co-Founder" {...founder} />
          ))}
        </div>

        <div className={styles.story}>
          <h3 className={`display ${styles.storyTitle}`} data-sunrise="5">
            It started with two.
          </h3>
          <p className={styles.paragraph} data-sunrise="5">
            Two individuals. One shared ambition. ONE SUN ONE MOON was born from the belief that creativity has the
            power to transform how businesses connect with the world. Together, we started this journey to bring ideas
            to life, build meaningful brands and make great creative work accessible to businesses of every scale.
          </p>
          <p className={styles.statement} data-sunrise="6">
            Different perspectives. Shared ambition. One creative journey.
          </p>
          <ButtonLink href="/about" arrow className={styles.cta} data-sunrise="6">
            Get to know us
          </ButtonLink>
        </div>
      </div>
    </SunriseReveal>
  )
}
