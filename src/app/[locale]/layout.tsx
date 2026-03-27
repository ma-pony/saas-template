import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { QueryProvider } from '@/app/_providers/query-provider'
import { ToastProvider } from '@/components/ui/toast'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/config'
import { CookieConsentBanner } from '@/components/consent/cookie-consent-banner'
import { AnalyticsScript } from '@/components/analytics/analytics-script'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const alternateLocales = SUPPORTED_LOCALES.filter((l) => l !== locale)

  return {
    ...generateSEOMetadata({
      title: 'My SaaS App - Turn Ideas Into Products, Fast',
      description:
        'Ship your startup in days, not weeks. A production-ready Next.js boilerplate with auth, payments, and everything you need to launch fast. Free forever, open source.',
      isRootLayout: true,
    }),
    alternates: {
      languages: Object.fromEntries(
        alternateLocales.map((l) => [l, `/${l}`]),
      ),
    },
  }
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
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <AnalyticsProvider>
          <AnalyticsScript />
          <ToastProvider>
            {children}
            <CookieConsentBanner locale={locale as SupportedLocale} />
          </ToastProvider>
          <div className="h-screen w-full fixed top-0 left-0 -z-10  bg-[url('/grain.jpg')] opacity-5" />
        </AnalyticsProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  )
}
