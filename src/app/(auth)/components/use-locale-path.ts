import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config'

/**
 * Get locale prefix from NEXT_LOCALE cookie (client-side).
 * Returns a validated locale string.
 */
export function getLocaleFromCookie(): string {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const cookie = document.cookie.split('; ').find((c) => c.startsWith('NEXT_LOCALE='))
  const raw = cookie?.split('=')[1] || DEFAULT_LOCALE
  return (SUPPORTED_LOCALES as readonly string[]).includes(raw) ? raw : DEFAULT_LOCALE
}

/**
 * Prefix a path with the current locale.
 * e.g. '/dashboard' → '/en/dashboard'
 */
export function localePath(path: string): string {
  const locale = getLocaleFromCookie()
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${clean}`
}
