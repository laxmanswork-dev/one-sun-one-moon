import type { CSSProperties, ReactNode } from 'react'
import { FilmStrip } from './FilmStrip'
import { InView } from './InView'
import styles from './OurServices.module.css'
import { BeyondArch, ConstructionSheet, OrbitLine, PosterFrame, PosterMoon, PosterSun, Trajectory } from './ServiceArt'

const d = (delay: number) => ({ '--d': `${delay}s` }) as CSSProperties

/** One heading line that slides up from behind a mask. */
function Line({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <span className={styles.line}>
      <span className={styles.lineInner} style={d(delay)}>
        {children}
      </span>
    </span>
  )
}

function ChapterLabel({ numeral, category, delay = 0 }: { numeral: string; category: string; delay?: number }) {
  return (
    <p className={`eyebrow ${styles.label} ${styles.rise}`} style={d(delay)}>
      <span className={styles.numeral}>{numeral}</span>
      {category}
    </p>
  )
}

/** Five disciplines told as five chapters, each with its own composition and reveal. */
export function OurServices() {
  return (
    <section className={styles.section} aria-labelledby="our-services-title">
      <InView className={`container ${styles.intro}`}>
        <div className={styles.introHead}>
          <p className={`eyebrow ${styles.rise}`}>What we bring to the table</p>
          <h2 id="our-services-title" className={`display ${styles.introTitle}`}>
            <Line delay={0.15}>
              <span className="fire-text">Five disciplines.</span>
            </Line>
            <Line delay={0.3}>
              <span className="fire-text">One creative force.</span>
            </Line>
          </h2>
        </div>
        <p className={`${styles.introCopy} ${styles.rise}`} style={d(0.6)}>
          From the first spark of an idea to the moment it reaches the world, we bring strategy, creativity and
          execution together to move brands forward.
        </p>
        <OrbitLine />
      </InView>

      {/* I: a large editorial opening */}
      <article className={styles.brand}>
        <InView className={`container ${styles.brandGrid}`}>
          <div className={styles.brandText}>
            <ChapterLabel numeral="I" category="Branding & Identity" />
            <h3 className={`display ${styles.brandTitle}`}>
              <Line delay={0.15}>Give your</Line>
              <Line delay={0.3}>brand</Line>
              <Line delay={0.45}>a soul.</Line>
            </h3>
            <p className={`${styles.copy} ${styles.rise}`} style={d(0.8)}>
              We build distinctive brand identities that give businesses a recognisable voice, personality and presence.
            </p>
          </div>
          <ConstructionSheet />
        </InView>
      </article>

      {/* II: a cinematic, full-width film strip */}
      <article className={styles.film}>
        <InView>
          <div className={`container ${styles.filmHead}`}>
            <div>
              <ChapterLabel numeral="II" category="Creative Content Production" />
              <h3 className={`display ${styles.filmTitle}`}>
                <Line delay={0.15}>Make every frame matter.</Line>
              </h3>
            </div>
            <p className={`${styles.copy} ${styles.rise}`} style={d(0.4)}>
              From photography and video to visual storytelling, we create content that captures attention and makes
              people remember.
            </p>
          </div>
          <FilmStrip />
        </InView>
      </article>

      {/* III: type alone, then the journey from moon to sun, each playing as it scrolls into view */}
      <article className={styles.momentum}>
        <div className="container">
          <InView className={styles.momentumHead}>
            <ChapterLabel numeral="III" category="Digital Marketing" />
            <h3 className={`display ${styles.momentumTitle}`}>
              <Line delay={0.15}>Turn attention</Line>
              <span className={styles.momentumLine}>
                <span className={styles.titleOutline} style={d(0.55)} aria-hidden="true">
                  into momentum.
                </span>
                <span className={styles.titleScan} style={d(0.55)} aria-hidden="true" />
                <span className={styles.titleWipe} style={d(0.9)}>
                  into momentum.
                </span>
              </span>
            </h3>
          </InView>
          <InView className={styles.momentumFoot}>
            <Trajectory />
            <p className={`${styles.copy} ${styles.rise}`} style={d(0.7)}>
              We help brands reach the right audience, build meaningful connections and grow their digital presence
              through focused marketing.
            </p>
          </InView>
        </div>
      </article>

      {/* IV: a poster, in which the two O's of LOOK are one sun and one moon */}
      <article className={styles.campaign}>
        <InView className={`container ${styles.campaignGrid}`}>
          <div className={styles.campaignText}>
            <ChapterLabel numeral="IV" category="Advertising & Campaigns" delay={0.9} />
            <p className={`${styles.copy} ${styles.rise}`} style={d(1.05)}>
              We develop distinctive advertising concepts and campaigns that capture attention, communicate clearly and
              make brands stand out.
            </p>
          </div>
          <div className={styles.poster}>
            <PosterFrame />
            <h3 className={`display ${styles.posterTitle}`} aria-label="Make the world look twice.">
              <span className={`${styles.posterSmall} ${styles.rise}`} style={d(0.5)} aria-hidden="true">
                Make the world
              </span>
              <span className={styles.posterLook} aria-hidden="true">
                <span className={styles.rise} style={d(0.6)}>
                  L
                </span>
                <span className={styles.drop} style={d(0.85)}>
                  <PosterSun />
                </span>
                <span className={styles.drop} style={d(1.05)}>
                  <PosterMoon />
                </span>
                <span className={styles.rise} style={d(0.6)}>
                  K
                </span>
              </span>
              <span className={`${styles.posterTwice} ${styles.rise}`} style={d(1.3)} aria-hidden="true">
                Twice.
              </span>
            </h3>
          </div>
        </InView>
      </article>

      {/* V: an architectural close */}
      <article className={styles.strategy}>
        <InView className={`container ${styles.strategyGrid}`}>
          <BeyondArch />
          <div className={styles.strategyText}>
            <ChapterLabel numeral="V" category="Strategy & Consulting" />
            <h3 className={`display ${styles.strategyTitle}`}>
              <Line delay={0.15}>Think beyond</Line>
              <Line delay={0.3}>the obvious.</Line>
            </h3>
            <p className={`${styles.copy} ${styles.rise}`} style={d(0.7)}>
              We turn business challenges into clear opportunities through thoughtful strategy, creative direction and
              practical guidance.
            </p>
          </div>
        </InView>
      </article>
    </section>
  )
}
