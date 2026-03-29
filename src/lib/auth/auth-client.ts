import { emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { getBaseUrl } from '../utils'
import { createLogger } from '@/lib/logger'

const log = createLogger({ module: 'auth' })

/**
 * Auth Client
 *
 * Core authentication client with email OTP and organization support.
 *
 * For billing operations, see the payment hooks in '@/lib/payments/hooks'.
 * @see lib/payments/ for payment adapter configuration
 */
export const client = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [emailOTPClient(), organizationClient()],
  fetchOptions: {
    onError(ctx) {
      log.debug('Auth client error', {
        message: ctx.error?.message,
        code: ctx.error?.code,
        status: ctx.error?.status,
      })
    },
  },
})

export const { signIn, signUp, signOut, useSession } = client
