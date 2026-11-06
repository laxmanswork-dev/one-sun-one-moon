import type { Metadata } from 'next'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { PageIntro } from '@/components/sections/PageIntro'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { pageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { projects } from '@/lib/work'
import styles from './work.module.css'

export const metadata: Metadata = pageMetadata({
  title: 'Work — Selected Projects & Case Studies',
  description:
    'Selected work by ONE SUN ONE MOON: websites, brand worlds and campaigns for Garden Cafe, Shivdev Holidays, CALIOON and Vainav’s Cafeteria.',
  path: '/work',
})

export default function WorkPage() {
  return (
    <>
      <PageIntro
        label="Selected work"
        title={
          <>
            Stories we
            <br />
            have told
          </>
        }
        intro="Each project starts with a business goal and ends with something people can see, use and remember. Here is what we made, and why."
      />
      <section className="section" aria-label="Projects">
        <div className={`container ${styles.grid}`}>
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} headingLevel="h2" priority={i < 2} />
          ))}
        </div>
      </section>
      <section className={`section ${styles.next}`} aria-labelledby="work-next">
        <div className="container">
          <h2 id="work-next" className={`display ${styles.nextTitle}`}>
            Your story could be next.
          </h2>
          <ButtonLink href="/contact" arrow>
            Start a project
          </ButtonLink>
        </div>
      </section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ])}
      />
    </>
  )
}
