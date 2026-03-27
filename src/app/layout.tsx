import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'

import '@/app/_styles/globals.css'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

const geistSans = GeistSans
const geistMono = GeistMono

const bricolageGrotesque = localFont({
  src: '../../public/fonts/BricolageGrotesque-Variable.woff2',
  variable: '--font-bricolage-grotesque',
  weight: '200 800',
})

export const metadata: Metadata = {
  ...generateSEOMetadata({
    // TODO: Replace with your product title and description
    title: 'My SaaS App - Launch Your SaaS Fast',
    description:
      'A production-ready Next.js boilerplate with auth, payments, and everything you need to launch your SaaS fast.',
    isRootLayout: true,
  }),
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
  themeColor: '#701ffc',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
