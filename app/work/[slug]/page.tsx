import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { Arrow, ButtonLink } from '@/components/ui/Button'
import { pageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { services } from '@/lib/services'
import { getProject, projects } from '@/lib/work'
import styles from './case-study.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return pageMetadata({
    title: `${project.name} — ${project.industry} case study`,
    description: project.summary,
    path: `/work/${project.slug}`,
    image: { url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt },
  })
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]!
  const serviceLinks = services.filter((s) => project.services.includes(s.slug))

  return (
    <article>
      <header className={`container ${styles.header}`}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/work">Work</Link>
            </li>
            <li aria-current="page">{project.name}</li>
          </ol>
        </nav>
        <p className={styles.meta}>
          {project.industry}
          {project.location && <> · {project.location}</>} · {project.year}
        </p>
        <h1 className={`display fire-text ${styles.title}`}>{project.name}</h1>
        <p className={styles.summary}>{project.summary}</p>
        <div className={styles.headerActions}>
          <span className={styles.status} data-status={project.status}>
            {project.status}
          </span>
          {project.liveUrl && (
            <a className={styles.visit} href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              Visit {new URL(project.liveUrl).hostname.replace(/^www\./, '')} <Arrow />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </header>

      <div className={`container ${styles.cover}`}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          sizes="(min-width: 1368px) 1320px, 100vw"
          priority
        />
      </div>

      <div className={`container ${styles.body}`}>
        <aside className={styles.facts} aria-label="Project facts">
          <dl>
            <div>
              <dt>Client</dt>
              <dd>{project.name}</dd>
            </div>
            <div>
              <dt>Industry</dt>
              <dd>{project.industry}</dd>
            </div>
            {project.location && (
              <div>
                <dt>Location</dt>
                <dd>{project.location}</dd>
              </div>
            )}
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>
                <ul>
                  {serviceLinks.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services#${s.slug}`}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>

        <div className={styles.story}>
          <section aria-labelledby="objective">
            <h2 id="objective" className={styles.h2}>
              The objective
            </h2>
            <p className={styles.lead}>{project.objective}</p>
          </section>

          <section aria-labelledby="approach">
            <h2 id="approach" className={styles.h2}>
              Our approach
            </h2>
            <ol className={styles.approach}>
              {project.approach.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="deliverables">
            <h2 id="deliverables" className={styles.h2}>
              Deliverables
            </h2>
            <ul className={styles.deliverables}>
              {project.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="results">
            <h2 id="results" className={styles.h2}>
              Results
            </h2>
            {project.results.length ? (
              <ul className={styles.deliverables}>
                {project.results.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.note}>
                {project.status === 'Live'
                  ? 'The project is live. We publish performance figures only when they are measured and approved by the client, so none are shown here yet.'
                  : 'This project has not launched publicly yet, so there are no results to report.'}
              </p>
            )}
          </section>
        </div>
      </div>

      {project.gallery.length > 0 && (
        <section className={`container ${styles.gallery}`} aria-label={`${project.name} gallery`}>
          {project.gallery.map((img) => (
            <figure key={img.src} className={img.height > img.width ? styles.portrait : styles.landscape}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 960px) 50vw, 100vw"
              />
            </figure>
          ))}
        </section>
      )}

      <nav className={`${styles.next} on-dark`} aria-label="Next project">
        <div className="container">
          <p className="eyebrow">Next project</p>
          <Link href={`/work/${next.slug}`} className={`display ${styles.nextLink}`}>
            {next.name} <Arrow />
          </Link>
          <ButtonLink href="/contact" variant="light" arrow className={styles.nextCta}>
            Start a project like this
          </ButtonLink>
        </div>
      </nav>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: project.name, path: `/work/${project.slug}` },
        ])}
      />
    </article>
  )
}
