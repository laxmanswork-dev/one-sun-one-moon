import { SectionHeading } from '@/components/ui/SectionHeading'
import styles from './Process.module.css'

const steps = [
  {
    title: 'Discover',
    lead: 'Understand the business and its objectives.',
    body: 'We listen first: your customers, your competitors, what has worked, what has not, and what success has to look like.',
  },
  {
    title: 'Define',
    lead: 'Establish strategy, scope and creative direction.',
    body: 'A written plan you can hold us to — the audience, the message, the deliverables, the timeline and how we will measure it.',
  },
  {
    title: 'Create',
    lead: 'Design and develop the solution.',
    body: 'Identity, content, campaigns and code, made in short rounds with your feedback, so there are no surprises at the end.',
  },
  {
    title: 'Launch',
    lead: 'Test, refine and release.',
    body: 'We check every page, device and link before anything goes public, then launch with tracking in place from day one.',
  },
  {
    title: 'Improve',
    lead: 'Measure outcomes and make informed improvements.',
    body: 'We review what the numbers actually say, explain it plainly, and recommend the next step — not just the next invoice.',
  },
]

/** A sun climbing over the horizon: one step further each stage. */
function StageMark({ index }: { index: number }) {
  const cy = 34 - index * 6
  return (
    <svg className={styles.mark} viewBox="0 0 64 40" aria-hidden="true">
      <defs>
        <clipPath id={`above-${index}`}>
          <rect width="64" height="32" />
        </clipPath>
      </defs>
      <circle
        cx="32"
        cy={cy}
        r="10"
        clipPath={`url(#above-${index})`}
        fill={index === 0 ? 'none' : 'currentColor'}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 32h56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Process() {
  return (
    <section className="section" aria-labelledby="process-title">
      <div className="container">
        <SectionHeading
          number="04"
          label="How we work"
          id="process-title"
          title={
            <>
              From first light
              <br />
              to full sun
            </>
          }
          intro="Five clear stages. You always know where the project is, what happens next, and why."
        />
        <ol className={styles.list}>
          {steps.map((step, i) => (
            <li key={step.title} className={`reveal ${styles.step}`}>
              <div className={styles.index}>
                <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
                <StageMark index={i} />
              </div>
              <h3 className={styles.title}>{step.title}</h3>
              <div className={styles.text}>
                <p className={styles.lead}>{step.lead}</p>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
