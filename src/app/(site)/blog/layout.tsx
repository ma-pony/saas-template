import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import Navbar from '../navbar'
import Footer from '../footer'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config'

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE
  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main className='min-h-screen pt-14'>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
