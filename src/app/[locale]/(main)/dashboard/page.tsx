import Link from 'next/link'
import { CreditCard, Settings, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl'>
      <h1 className='text-3xl font-bold tracking-tight mb-2'>{t('header.title')}</h1>
      <p className='text-muted-foreground mb-8'>{t('header.welcome')}</p>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Billing Demo Card */}
        <Link
          href='/dashboard/billing'
          className='group rounded-lg border p-6 hover:border-primary hover:bg-muted/50 transition-colors'
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 rounded-lg bg-primary/10 text-primary'>
              <CreditCard className='h-5 w-5' />
            </div>
            <h2 className='text-lg font-semibold group-hover:text-primary transition-colors'>
              {t('billing.title')}
            </h2>
          </div>
          <p className='text-sm text-muted-foreground'>{t('billing.description')}</p>
        </Link>

        {/* Profile Card (placeholder) */}
        <div className='rounded-lg border p-6 opacity-60'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 rounded-lg bg-muted'>
              <User className='h-5 w-5' />
            </div>
            <h2 className='text-lg font-semibold'>{t('profile.title')}</h2>
          </div>
          <p className='text-sm text-muted-foreground'>{t('profile.description')}</p>
        </div>

        {/* Settings Card (placeholder) */}
        <div className='rounded-lg border p-6 opacity-60'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 rounded-lg bg-muted'>
              <Settings className='h-5 w-5' />
            </div>
            <h2 className='text-lg font-semibold'>{t('settings.title')}</h2>
          </div>
          <p className='text-sm text-muted-foreground'>{t('settings.description')}</p>
        </div>
      </div>
    </div>
  )
}
