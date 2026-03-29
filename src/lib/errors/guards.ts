import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { UnauthorizedError, ForbiddenError } from './app-error'

/**
 * Assert the caller has a valid session.
 * Throws UnauthorizedError if not authenticated.
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new UnauthorizedError()
  return session
}

/**
 * Assert the caller is an authenticated admin.
 * Throws UnauthorizedError or ForbiddenError.
 */
export async function requireAdmin() {
  const session = await requireSession()
  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
  if (!dbUser || dbUser.role !== 'admin') throw new ForbiddenError()
  return session
}
