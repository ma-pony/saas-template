import { getTranslations } from 'next-intl/server'
import { getUsers } from '../actions/users'
import { UsersTable } from '../components/users-table'

export const dynamic = 'force-dynamic'

interface UsersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const t = await getTranslations('admin.users')
  const { page: pageParam, q: query } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const { users, total, pageCount } = await getUsers({ page, pageSize: 20, query })

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('totalUsers', { total })}</p>
      </div>
      <UsersTable users={users} total={total} page={page} pageCount={pageCount} query={query} />
    </div>
  )
}
