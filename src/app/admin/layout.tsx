import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config'
import { AdminSidebar } from './components/admin-sidebar'
import { AdminMobileNav } from './components/admin-mobile-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE

  const messages = (await import(`@/messages/${locale}.json`)).default

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))

  if (!dbUser || dbUser.role !== 'admin') {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className='flex min-h-screen'>
        <AdminSidebar user={dbUser} />
        <div className='flex flex-1 flex-col'>
          <header className='flex h-14 items-center border-b px-4 lg:hidden'>
            <AdminMobileNav user={dbUser} />
          </header>
          <main className='flex-1 p-6'>{children}</main>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
