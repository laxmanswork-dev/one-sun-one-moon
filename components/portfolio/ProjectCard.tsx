import Image from 'next/image'
import Link from 'next/link'
import { Arrow } from '@/components/ui/Button'
import type { Project } from '@/lib/work'
import styles from './ProjectCard.module.css'

export function ProjectCard({
  project,
  priority = false,
  featured = false,
  headingLevel: Heading = 'h3',
}: {
  project: Project
  priority?: boolean
  featured?: boolean
  headingLevel?: 'h2' | 'h3'
}) {
  return (
    <article className={[styles.card, featured && styles.featured, 'reveal'].filter(Boolean).join(' ')}>
      <div className={`${styles.media} ${styles[project.tone]}`}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          sizes={
            featured ? '(min-width: 960px) 66vw, 100vw' : '(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw'
          }
          priority={priority}
        />
        <span className={styles.status} data-status={project.status}>
          {project.status}
        </span>
      </div>
      <div className={styles.body}>
        <p className={styles.meta}>
          {project.industry}
          {project.location && <> · {project.location}</>}
        </p>
        <Heading className={styles.title}>
          <Link href={`/work/${project.slug}`} className={styles.link}>
            {project.name}
          </Link>
        </Heading>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={styles.tags} aria-label="Deliverables">
          {project.deliverables.slice(0, 3).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <span className={styles.more} aria-hidden="true">
          Read the case study <Arrow />
        </span>
      </div>
    </article>
  )
}
