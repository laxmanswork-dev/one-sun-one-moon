import { statSync } from 'node:fs'
import path from 'node:path'
import Image from 'next/image'
import { JourneyLauncher } from '@/components/journey/JourneyLauncher'
import { ButtonLink } from '@/components/ui/Button'
import styles from './Hero.module.css'

// Hand-supplied hero backdrop: the video plays over the still, if one is present, which doubles as
// its poster and reduced-motion fallback. The hero falls back to plain Desert Cream if neither exists.
// Phones get their own portrait cut; the browser picks one source when the page loads.
const SUN_IMAGE = '/images/brand/sun.png'
const SUN_VIDEO = '/images/brand/sun.mp4'
const PHONE_VIDEO = '/images/brand/Phone.MP4'
const PHONE_QUERY = '(max-width: 899px)'

function hasPublicFile(src: string) {
  try {
    return statSync(path.join(process.cwd(), 'public', src)).size > 0
  } catch {
    return false
  }
}

export function Hero() {
  const withImage = hasPublicFile(SUN_IMAGE)
  const withVideo = hasPublicFile(SUN_VIDEO)
  const withPhoneVideo = hasPublicFile(PHONE_VIDEO)
  const withBackdrop = withImage || withVideo || withPhoneVideo
  const sectionClass = [styles.hero, withBackdrop && styles.withBackdrop, withPhoneVideo && styles.withPhoneVideo]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClass} aria-labelledby="hero-title">
      {withBackdrop && (
        <div className={styles.backdrop} aria-hidden="true">
          {withImage && <Image src={SUN_IMAGE} alt="" fill preload sizes="100vw" className={styles.backdropImage} />}
          {(withVideo || withPhoneVideo) && (
            <video className={styles.backdropVideo} autoPlay muted loop playsInline preload="auto" tabIndex={-1}>
              {withPhoneVideo && <source src={PHONE_VIDEO} media={PHONE_QUERY} type="video/mp4" />}
              {withVideo && <source src={SUN_VIDEO} type="video/mp4" />}
            </video>
          )}
        </div>
      )}

      <div className={`container ${styles.content}`}>
        {/* The page's main heading stays for search engines and screen readers, but is not shown. */}
        <h1 id="hero-title" className="visually-hidden">
          One world. One vision.
        </h1>
        <div className={styles.ctas}>
          <ButtonLink href="/contact" arrow className={styles.amberCta}>
            Start a project
          </ButtonLink>
          <JourneyLauncher />
        </div>
      </div>

      <div className={styles.scene} aria-hidden="true" />
    </section>
  )
}
