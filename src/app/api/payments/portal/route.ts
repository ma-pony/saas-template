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
import {
  withApiErrors,
  BillingDisabledError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from '@/lib/errors'

export const dynamic = 'force-dynamic'

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

const portalSchema = z.object({
  returnUrl: z.string().optional().refine((v) => !v || isSameOriginUrl(v), {
    message: 'returnUrl must be on the same origin',
  }),
})

export const POST = withApiErrors(async (req: Request) => {
  if (!isBillingEnabled) throw new BillingDisabledError()

  const limitResult = await rateLimiter(req)
  if (limitResult instanceof NextResponse) return limitResult

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new UnauthorizedError()

  const body = await req.json().catch(() => ({}))
  const result = portalSchema.safeParse(body)
  if (!result.success) throw new BadRequestError('Invalid request body')

  const { returnUrl } = result.data
  const adapter = getPaymentAdapter()

  const userCustomer = await db.query.customer.findFirst({
    where: eq(customer.userId, session.user.id),
  })
  if (!userCustomer) throw new NotFoundError('No customer found')

  if (userCustomer.provider !== adapter.provider) {
    throw new BadRequestError(
      `Customer provider (${userCustomer.provider}) does not match active provider (${adapter.provider})`
    )
  }

  const portalSession = await adapter.createPortal(userCustomer.providerCustomerId, returnUrl)
  return NextResponse.json(portalSession)
})
