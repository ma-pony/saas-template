import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getPaymentAdapter } from '@/lib/payments/service'
import { getAvailablePlans } from '@/config/payments'
import { createRateLimiter } from '@/lib/rate-limit'
import { isBillingEnabled } from '@/config/feature-flags'
import { isSameOriginUrl } from '@/lib/url'

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

export async function POST(req: Request) {
  if (!isBillingEnabled) {
    return NextResponse.json({ error: 'Billing is not enabled' }, { status: 404 })
  }

  const limitResult = await rateLimiter(req)
  if (limitResult instanceof NextResponse) return limitResult

  try {
    const requestHeaders = await headers()
    const session = await auth.api.getSession({
      headers: requestHeaders,
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = checkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { plan, successUrl, cancelUrl } = result.data
    const adapter = getPaymentAdapter()

    // Extract country from geo headers written by middleware
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
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
