import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getPaymentAdapter } from '@/lib/payments/service'
import { db } from '@/database'
import { customer } from '@/database/schema'
import { isBillingEnabled } from '@/config/feature-flags'
import { isSameOriginUrl } from '@/lib/url'
import { createRateLimiter } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

const portalSchema = z.object({
  returnUrl: z.string().optional().refine((v) => !v || isSameOriginUrl(v), {
    message: 'returnUrl must be on the same origin',
  }),
})

export async function POST(req: Request) {
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

    const body = await req.json().catch(() => ({}))
    const result = portalSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { returnUrl } = result.data
    const adapter = getPaymentAdapter()

    // Find customer for this user
    const userCustomer = await db.query.customer.findFirst({
      where: eq(customer.userId, session.user.id),
    })

    if (!userCustomer) {
      return NextResponse.json({ error: 'No customer found' }, { status: 404 })
    }

    // Ensure customer matches active provider
    if (userCustomer.provider !== adapter.provider) {
      return NextResponse.json(
        {
          error: `Customer provider (${userCustomer.provider}) does not match active provider (${adapter.provider})`,
        },
        { status: 400 }
      )
    }

    const portalSession = await adapter.createPortal(userCustomer.providerCustomerId, returnUrl)

    return NextResponse.json(portalSession)
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
