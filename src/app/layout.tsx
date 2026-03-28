import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'

import '@/app/_styles/globals.css'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config'
import { getBrandConfig } from '@/config/branding'

const bricolageGrotesque = localFont({
  src: '../../public/fonts/BricolageGrotesque-Variable.woff2',
  variable: '--font-bricolage-grotesque',
  weight: '200 800',
})

const brand = getBrandConfig()

export const metadata: Metadata = {
  ...generateSEOMetadata({
    // TODO: Replace with your product title and description
    title: `${brand.name} - Launch Your SaaS Fast`,
    description: brand.geo?.aiDescription ||
      'A production-ready Next.js boilerplate with auth, payments, and everything you need to launch your SaaS fast.',
    isRootLayout: true,
  }),
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
  themeColor: brand.theme?.primaryColor || '#701ffc',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE
  // Validate locale from cookie to prevent injection
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE

  return (
    <html lang={locale}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
