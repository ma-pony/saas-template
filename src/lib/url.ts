import { env } from '@/config/env'

/** Validate that a URL belongs to the same origin as the app */
export function isSameOriginUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL)
    return parsed.origin === appUrl.origin
  } catch {
    return false
  }
}
