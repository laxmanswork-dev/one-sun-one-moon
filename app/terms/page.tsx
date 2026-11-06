import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/sections/LegalPage'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'The terms that apply when you use the ONE SUN ONE MOON website.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="22 October 2026">
      <p>
        These terms apply to your use of the ONE SUN ONE MOON website (onesunonemoon.in). By using the website you agree
        to them. They do not cover client projects, which are governed by the written proposal or agreement for each
        project.
      </p>

      <h2>Using this website</h2>
      <p>
        You may browse the website and share links to it. Please do not misuse it — for example by attempting to disrupt
        it, gain unauthorised access, or send automated or unsolicited messages through the enquiry form.
      </p>

      <h2>Enquiries</h2>
      <p>
        Sending an enquiry does not create an agreement for services. Any work we do together will be described in a
        separate proposal or contract. How we handle the information you send is explained in our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        The ONE SUN ONE MOON name, logo, brand identity, text and original artwork on this website belong to ONE SUN ONE
        MOON. Please do not reuse them without our permission.
      </p>
      <p>
        Client names, logos, websites and imagery shown in our work belong to their respective owners and are shown to
        describe the work we did. Links to client websites go to sites we do not control.
      </p>

      <h2>The mini-game</h2>
      <p>
        “Catch the Superstar Shades” is a free, optional game for entertainment only. It has no prizes, and scores have
        no value.
      </p>

      <h2>No guarantees</h2>
      <p>
        We work to keep this website accurate and available, but it is provided “as is”. Information about our services
        is general and may change. Nothing on this website is a promise of particular business results.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, ONE SUN ONE MOON is not liable for any loss arising from your use of this
        website. (To be confirmed: final liability wording.)
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India (to be confirmed: the jurisdiction for disputes and the legal
        entity operating this website).
      </p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. The date at the top shows when they last changed.</p>
    </LegalPage>
  )
}
