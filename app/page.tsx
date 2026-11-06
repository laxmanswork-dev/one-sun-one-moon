import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { OurServices } from '@/components/sections/OurServices'
import { PillarsBand } from '@/components/sections/PillarsBand'
import { StoryIntro } from '@/components/sections/StoryIntro'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  // The homepage tab carries the hero headline.
  title: { absolute: `One World. One Vision. | ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <PillarsBand />
      <StoryIntro />
      <OurServices />
    </>
  )
}
