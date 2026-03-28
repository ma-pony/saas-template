import { emailOTPClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { getBaseUrl } from '../utils'

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
    onError(error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Auth error:', error)
      }
    },
  },
})

export const { signIn, signUp, signOut, useSession } = client
