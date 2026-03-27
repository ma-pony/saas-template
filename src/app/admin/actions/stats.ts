import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user, subscription, payment } from '@/database/schema'
import { count, sum, gte, eq } from 'drizzle-orm'

export interface AdminStats {
  totalUsers: number
  newUsersThisMonth: number
  activeSubscriptions: number
  totalRevenue: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const [dbUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id))
  if (!dbUser || dbUser.role !== 'admin') throw new Error('Forbidden')

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalUsersResult, newUsersResult, activeSubsResult, revenueResult] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(user).where(gte(user.createdAt, firstDayOfMonth)),
    db.select({ count: count() }).from(subscription).where(eq(subscription.status, 'active')),
    db
      .select({ total: sum(payment.amount) })
      .from(payment)
      .where(eq(payment.status, 'succeeded')),
  ])

  const totalRevenue = revenueResult[0]?.total
  const formattedRevenue = totalRevenue
    ? `$${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00'

  return {
    totalUsers: totalUsersResult[0]?.count ?? 0,
    newUsersThisMonth: newUsersResult[0]?.count ?? 0,
    activeSubscriptions: activeSubsResult[0]?.count ?? 0,
    totalRevenue: formattedRevenue,
  }
}
