import type { Metadata, Viewport } from 'next'
import { Archivo, Libre_Baskerville, Sora } from 'next/font/google'
import { SiteFooter } from '@/components/navigation/SiteFooter'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { JsonLd } from '@/components/seo/JsonLd'
import { defaultTitle } from '@/lib/seo/metadata'
import { organizationJsonLd } from '@/lib/seo/structured-data'
import { site } from '@/lib/site'
import './globals.css'

// Display: Archivo's width axis gives both the extended logo cut and the
// condensed headline cut from one self-hosted variable file.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-baskerville',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: '/',
    title: defaultTitle,
    description: site.description,
  },
  twitter: { card: 'summary_large_image', title: defaultTitle, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${sora.variable} ${baskerville.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  )
}
