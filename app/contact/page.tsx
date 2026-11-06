import type { Metadata } from 'next'
import { ContactForm } from '@/components/forms/ContactForm'
import { PageIntro } from '@/components/sections/PageIntro'
import { JsonLd } from '@/components/seo/JsonLd'
import { getMailConfig } from '@/lib/mail/send-enquiry'
import { pageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { getPublicContact } from '@/lib/site'
import styles from './contact.module.css'

export const metadata: Metadata = pageMetadata({
  title: 'Contact — Start a Project',
  description:
    'Tell ONE SUN ONE MOON about your brand, website, social media or campaign project. Share your goals and we will reply with next steps.',
  path: '/contact',
})

const nextSteps = [
  'We read your enquiry and reply by email, usually with a few questions.',
  'A short call to understand your business, goals and timeline.',
  'A clear written proposal: scope, deliverables, timeline and cost.',
]

export default function ContactPage() {
  const contact = getPublicContact()
  const deliveryReady = getMailConfig() !== null

  return (
    <>
      <PageIntro
        label="Start a project"
        title={
          <>
            Let&rsquo;s write
            <br />
            your story
          </>
        }
        intro="Tell us what you are building and where you want it to go. The more you share, the more useful our first reply will be."
      />

      <section className="section" aria-label="Enquiry">
        <div className={`container ${styles.grid}`}>
          <aside className={styles.aside}>
            <h2 className={styles.h2}>What happens next</h2>
            <ol className={styles.steps}>
              {nextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            {(contact.email || contact.whatsapp || contact.socials.length > 0) && (
              <>
                <h2 className={styles.h2}>Prefer to talk directly?</h2>
                <ul className={styles.channels}>
                  {contact.email && (
                    <li>
                      <span>Email</span>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </li>
                  )}
                  {contact.whatsapp && (
                    <li>
                      <span>WhatsApp</span>
                      <a href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
                        Message us on WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                  {contact.socials.map((s) => (
                    <li key={s.label}>
                      <span>{s.label}</span>
                      <a href={s.href} target="_blank" rel="noopener noreferrer me">
                        Follow us<span className="visually-hidden"> on {s.label} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Project enquiry</h2>
            {!deliveryReady && (
              <p className={styles.notice} role="note">
                Our online enquiry inbox is still being connected. If a message cannot be delivered, the form will tell
                you — it will never show a confirmation for a message that was not sent.
                {contact.email && (
                  <>
                    {' '}
                    You can always email <a href={`mailto:${contact.email}`}>{contact.email}</a>.
                  </>
                )}
              </p>
            )}
            <ContactForm fallbackEmail={contact.email} />
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
    </>
  )
}
