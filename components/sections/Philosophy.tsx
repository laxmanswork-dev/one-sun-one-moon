import { MoonGlyph, SunGlyph } from '@/components/brand/Glyphs'
import { SectionHeading } from '@/components/ui/SectionHeading'
import styles from './Philosophy.module.css'

export function Philosophy() {
  return (
    <section className={`section ${styles.section} on-dark`} aria-labelledby="philosophy-title">
      <div className={styles.sky} aria-hidden="true">
        <span className={styles.orbSun} />
        <span className={styles.orbMoon} />
      </div>
      <div className="container">
        <SectionHeading
          number="03"
          label="Our philosophy"
          id="philosophy-title"
          tone="dark"
          align="center"
          title={
            <>
              Different perspectives.
              <br />
              <span className={styles.gold}>A brighter tomorrow.</span>
            </>
          }
          intro="Every brand needs two kinds of light. We bring both — strategy, creativity, technology and careful execution, working as one so a business can say clearly who it is, and grow."
        />

        <div className={styles.pair}>
          <article className={`reveal ${styles.side}`}>
            <SunGlyph className={styles.sunGlyph} />
            <h3 className={styles.sideTitle}>The Sun</h3>
            <p className={styles.sideKicker}>Energy · Visibility · Ambition</p>
            <p>
              The sun is about being seen. Clear positioning, bold creative and campaigns with a purpose — the work that
              puts a business in front of the right people and gives them a reason to act.
            </p>
          </article>
          <div className={styles.divider} aria-hidden="true">
            <span />
          </div>
          <article className={`reveal ${styles.side}`}>
            <MoonGlyph className={styles.moonGlyph} />
            <h3 className={styles.sideTitle}>The Moon</h3>
            <p className={styles.sideKicker}>Perspective · Imagination · Balance</p>
            <p>
              The moon is about seeing differently. Stepping back to understand customers, finding the idea nobody else
              in the category has used, and balancing ambition with what a business can sustain.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
