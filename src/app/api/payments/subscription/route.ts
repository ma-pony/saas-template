import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/database'
import { subscription } from '@/database/schema'
import { isBillingEnabled } from '@/config/feature-flags'
import { createRateLimiter } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 })

export async function GET(req: Request) {
  if (!isBillingEnabled) {
    return NextResponse.json({ error: 'Billing is not enabled' }, { status: 404 })
  }

  try {
    const rateLimitResult = await rateLimiter(req)
    if (rateLimitResult instanceof NextResponse) return rateLimitResult

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, session.user.id),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.updatedAt)],
    })

    return NextResponse.json({ subscription: userSubscription || null })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
