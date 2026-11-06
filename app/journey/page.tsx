import type { Metadata } from 'next'
import { BrandJourney } from '@/components/journey/BrandJourney'
import { getBookingRules } from '@/lib/booking/config'
import { getMailConfig } from '@/lib/mail/send-enquiry'
import { pageMetadata } from '@/lib/seo/metadata'
import { getPublicContact } from '@/lib/site'

// Reached from the hero's “DON'T CLICK THIS”. An experience, not a landing page: kept out of search.
export const metadata: Metadata = pageMetadata({
  title: 'The Journey — Sun, Moon and a Secret',
  description:
    'Your brand deserves to be seen. Make it impossible to ignore. A short cinematic journey through the ONE SUN ONE MOON world — with a secret game at the end.',
  path: '/journey',
  noIndex: true,
})

export default function JourneyPage() {
  const rules = getBookingRules()
  // Live bookings go to the scheduling provider; requests and preferred days go by email.
  const deliveryReady = rules.mode === 'live' || getMailConfig() !== null

  return (
    <BrandJourney
      booking={{
        mode: rules.mode,
        timeZone: rules.timeZone,
        deliveryReady,
        fallbackEmail: getPublicContact().email,
      }}
    />
  )
}
