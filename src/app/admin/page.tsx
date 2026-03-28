import { getTranslations } from 'next-intl/server'
import { getAdminStats } from './actions/stats'
import { StatsCards } from './components/stats-cards'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const t = await getTranslations('admin')
  const stats = await getAdminStats()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('overview.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('overview.subtitle')}</p>
      </div>
      <StatsCards stats={stats} />
    </div>
  )
}
