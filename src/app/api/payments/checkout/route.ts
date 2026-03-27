import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getPaymentAdapter } from '@/lib/payments/service'
import { getAvailablePlans } from '@/config/payments'
import { createRateLimiter } from '@/lib/rate-limit'
import { env } from '@/config/env'
import { isBillingEnabled } from '@/config/feature-flags'

// Rate limit: 10 checkout requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

/** Validate that a URL belongs to the same origin as the app */
function isSameOriginUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL)
    return parsed.origin === appUrl.origin
  } catch {
    return false
  }
}

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
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
