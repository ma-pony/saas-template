import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/database'
import { subscription } from '@/database/schema'
import { isBillingEnabled } from '@/config/feature-flags'
import { createRateLimiter } from '@/lib/rate-limit'
import { withApiErrors, BillingDisabledError, UnauthorizedError } from '@/lib/errors'

export const dynamic = 'force-dynamic'

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 })

export const GET = withApiErrors(async (req: Request) => {
  if (!isBillingEnabled) throw new BillingDisabledError()

  const limitResult = await rateLimiter(req)
  if (limitResult instanceof NextResponse) return limitResult

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new UnauthorizedError()

  const userSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.userId, session.user.id),
    orderBy: (subscriptions, { desc }) => [desc(subscriptions.updatedAt)],
  })

  return NextResponse.json({ subscription: userSubscription || null })
})
