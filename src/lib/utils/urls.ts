import { env } from '@/config/env'
import { isProd } from '@/lib/constants'

/**
 * Returns the base URL of the application.
 * - Client-side: auto-detects from `window.location.origin`
 * - Server-side: reads from `NEXT_PUBLIC_APP_URL` env var
 * @returns The base URL string (e.g., 'http://localhost:3000' or 'https://example.com')
 * @throws Error if NEXT_PUBLIC_APP_URL is not configured (server-side only)
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL must be configured for webhooks and callbacks to work correctly'
    )
  }

  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl
  }

  const protocol = isProd ? 'https://' : 'http://'
  return `${protocol}${baseUrl}`
}
