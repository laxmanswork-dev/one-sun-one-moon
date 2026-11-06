import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/sections/LegalPage'
import { pageMetadata } from '@/lib/seo/metadata'
import { getPublicContact } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How the ONE SUN ONE MOON website handles the personal information you share through our enquiry form.',
  path: '/privacy',
})

export default function PrivacyPage() {
  const { email } = getPublicContact()
  return (
    <LegalPage title="Privacy Policy" updated="22 October 2026">
      <p>
        This policy explains what personal information the ONE SUN ONE MOON website (onesunonemoon.in) collects, why,
        and what we do with it. We collect as little as possible.
      </p>

      <h2>What we collect</h2>
      <h3>When you send an enquiry</h3>
      <p>
        Our <Link href="/contact">enquiry form</Link> asks for your name, email address, the service you are interested
        in and a description of your project. You can also choose to give a phone number, your company or brand name and
        a budget range. We use this only to reply to your enquiry and discuss your project.
      </p>
      <h3>Technical information</h3>
      <p>
        Like any website, our hosting provider receives standard technical information when you visit, such as your IP
        address, browser type and the pages requested. When you submit the form, your IP address is also held briefly in
        server memory to limit repeated submissions (spam protection); it is not stored with your enquiry.
      </p>
      <h3>What we do not collect</h3>
      <ul>
        <li>We do not use analytics, advertising or tracking cookies on this website.</li>
        <li>We do not sell or rent personal information.</li>
        <li>
          The “Don’t click this” mini-game collects no personal information. Your best score is saved only in your own
          browser’s local storage and is never sent to us.
        </li>
      </ul>

      <h2>Who processes your information</h2>
      <ul>
        <li>
          <strong>Website hosting</strong> — the provider that serves this website and processes the technical
          information above (to be confirmed: hosting provider and region).
        </li>
        <li>
          <strong>Email delivery</strong> — enquiries are delivered to our inbox through an email delivery service
          (Resend, Inc.), which processes the contents of the form for that purpose.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        We keep enquiries for as long as needed to respond and, if we work together, for the duration of the project and
        our legal record-keeping obligations (to be confirmed: retention period). You can ask us to delete your enquiry
        at any time.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask to see, correct or delete the personal information you have sent us, or withdraw your consent to us
        using it. Depending on where you live, laws such as India’s Digital Personal Data Protection Act, 2023 may give
        you further rights.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy question or request,{' '}
        {email ? (
          <>
            email <a href={`mailto:${email}`}>{email}</a> or use our <Link href="/contact">enquiry form</Link>
          </>
        ) : (
          <>
            please use our <Link href="/contact">enquiry form</Link>
          </>
        )}
        . (To be confirmed: the legal entity name and registered address responsible for this website.)
      </p>

      <h2>Changes</h2>
      <p>If we change how we handle personal information, we will update this page and the date at the top.</p>
    </LegalPage>
  )
}
