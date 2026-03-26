import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import '@/app/_styles/globals.css'
import { QueryProvider } from '@/app/_providers/query-provider'
import { ToastProvider } from '@/components/ui/toast'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/config'
import { CookieConsentBanner } from '@/components/consent/cookie-consent-banner'
import { AnalyticsScript } from '@/components/analytics/analytics-script'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'

const geistSans = GeistSans
const geistMono = GeistMono

const bricolageGrotesque = localFont({
  src: '../../../public/fonts/BricolageGrotesque-Variable.woff2',
  variable: '--font-bricolage-grotesque',
  weight: '200 800',
})

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: 'My SaaS App - Turn Ideas Into Products, Fast',
    description:
      'Ship your startup in days, not weeks. A production-ready Next.js boilerplate with auth, payments, and everything you need to launch fast. Free forever, open source.',
    isRootLayout: true,
  }),
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale as SupportedLocale}>
      <head>
        <AnalyticsScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AnalyticsProvider>
              <ToastProvider>
                {children}
                <CookieConsentBanner locale={locale as SupportedLocale} />
              </ToastProvider>
              <div className="h-screen w-full fixed top-0 left-0 -z-10  bg-[url('/grain.jpg')] opacity-5" />
            </AnalyticsProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
