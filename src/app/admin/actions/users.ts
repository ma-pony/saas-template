import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { count, ilike, or, eq } from 'drizzle-orm'

export interface GetUsersParams {
  page: number
  pageSize?: number
  query?: string
}

export interface GetUsersResult {
  users: Array<{
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
  }>
  total: number
  pageCount: number
}

export async function getUsers({
  page,
  pageSize = 20,
  query,
}: GetUsersParams): Promise<GetUsersResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const [dbUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id))
  if (!dbUser || dbUser.role !== 'admin') throw new Error('Forbidden')

  const offset = (page - 1) * pageSize

  const whereClause = query
    ? or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`))
    : undefined

  const [usersData, countData] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(user).where(whereClause),
  ])

  const total = countData[0]?.count ?? 0
  const pageCount = Math.ceil(total / pageSize)

  return {
    users: usersData,
    total,
    pageCount,
  }
}
