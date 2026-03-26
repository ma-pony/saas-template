import { Users, UserPlus, CreditCard, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardPanel } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminStats } from '../actions/stats'

interface StatsCardsProps {
  stats: AdminStats
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: '总用户数',
      value: stats.totalUsers.toLocaleString(),
      description: '注册用户总量',
      icon: Users,
    },
    {
      title: '本月新增',
      value: stats.newUsersThisMonth.toLocaleString(),
      description: '本月新注册用户',
      icon: UserPlus,
    },
    {
      title: '活跃订阅',
      value: stats.activeSubscriptions.toLocaleString(),
      description: '当前活跃订阅数',
      icon: CreditCard,
    },
    {
      title: '总收入',
      value: stats.totalRevenue,
      description: '累计成功付款',
      icon: DollarSign,
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardDescription>{card.title}</CardDescription>
              <card.icon className='size-4 text-muted-foreground' />
            </div>
            <CardTitle className='text-2xl'>{card.value}</CardTitle>
          </CardHeader>
          <CardPanel>
            <p className='text-xs text-muted-foreground'>{card.description}</p>
          </CardPanel>
        </Card>
      ))}
    </div>
  )
}

export const StatsCardsSkeleton = () => {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-8 w-16 mt-1' />
          </CardHeader>
          <CardPanel>
            <Skeleton className='h-3 w-32' />
          </CardPanel>
        </Card>
      ))}
    </div>
  )
}
