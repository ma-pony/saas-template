import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getPaymentAdapter } from '@/lib/payments/service'
import { getAvailablePlans } from '@/config/payments'
import { createRateLimiter } from '@/lib/rate-limit'
import { isBillingEnabled } from '@/config/feature-flags'
import { isSameOriginUrl } from '@/lib/url'
import {
  withApiErrors,
  BillingDisabledError,
  UnauthorizedError,
  BadRequestError,
} from '@/lib/errors'

export const dynamic = 'force-dynamic'

// Rate limit: 10 checkout requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

const checkoutSchema = z.object({
  plan: z.enum(getAvailablePlans() as [string, ...string[]]),
  successUrl: z.string().optional().refine((v) => !v || isSameOriginUrl(v), {
    message: 'successUrl must be on the same origin',
  }),
  cancelUrl: z.string().optional().refine((v) => !v || isSameOriginUrl(v), {
    message: 'cancelUrl must be on the same origin',
  }),
})

export const POST = withApiErrors(async (req: Request) => {
  if (!isBillingEnabled) throw new BillingDisabledError()

  const limitResult = await rateLimiter(req)
  if (limitResult instanceof NextResponse) return limitResult

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) throw new UnauthorizedError()

  const body = await req.json()
  const result = checkoutSchema.safeParse(body)
  if (!result.success) throw new BadRequestError('Invalid request body')

  const { plan, successUrl, cancelUrl } = result.data
  const adapter = getPaymentAdapter()

  const country =
    requestHeaders.get('x-vercel-ip-country') ?? requestHeaders.get('cf-ipcountry') ?? undefined

  const checkoutSession = await adapter.createCheckout({
    plan: plan as any,
    userId: session.user.id,
    email: session.user.email,
    successUrl,
    cancelUrl,
    country,
  })

  return NextResponse.json(checkoutSession)
})
