import { getAdminStats } from './actions/stats'
import { StatsCards } from './components/stats-cards'

export default async function AdminOverviewPage() {
  const stats = await getAdminStats()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>数据概览</h1>
        <p className='text-muted-foreground text-sm'>查看平台关键运营指标</p>
      </div>
      <StatsCards stats={stats} />
    </div>
  )
}
