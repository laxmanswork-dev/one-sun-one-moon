import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { ButtonLink } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { projects } from '@/lib/work'
import styles from './SelectedWork.module.css'

export function SelectedWork() {
  const [first, ...rest] = projects
  return (
    <section className="section" aria-labelledby="work-title">
      <div className="container">
        <div className={styles.head}>
          <SectionHeading
            number="02"
            label="Selected work"
            id="work-title"
            title={
              <>
                Stories we
                <br />
                have told
              </>
            }
            intro="Real projects for real businesses — what each one needed, and what we made."
          />
        </div>
        {first && <ProjectCard project={first} featured />}
        <div className={styles.grid}>
          {rest.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        <div className={styles.footer}>
          <ButtonLink href="/work" variant="secondary" arrow>
            View all work
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
