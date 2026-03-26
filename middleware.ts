import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from '@/lib/i18n/config'
import { countryToLocale, getCountryFromRequest } from '@/lib/i18n/geo'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 31536000 // 1 year in seconds

/**
 * Detect locale from Accept-Language header.
 * Returns the first supported locale found, or DEFAULT_LOCALE.
 */
function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, q] = lang.trim().split(';q=')
      return { locale: locale.trim().split('-')[0].toLowerCase(), q: q ? Number.parseFloat(q) : 1.0 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { locale } of languages) {
    const supported = SUPPORTED_LOCALES.find((l) => l === locale)
    if (supported) return supported
  }

  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Read locale from cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value as SupportedLocale | undefined
  const isValidCookieLocale =
    cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)

  // If the pathname already has a valid locale, just set the cookie and pass through
  if (pathnameHasLocale) {
    const existingLocale = pathname.split('/')[1] as SupportedLocale
    const response = NextResponse.next()

    // Update cookie if different from current locale in path
    if (!isValidCookieLocale || cookieLocale !== existingLocale) {
      response.cookies.set(LOCALE_COOKIE, existingLocale, {
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
        path: '/',
      })
    }

    return response
  }

  // Determine target locale
  let targetLocale: SupportedLocale

  if (isValidCookieLocale) {
    // Priority 1: Cookie preference
    targetLocale = cookieLocale as SupportedLocale
  } else {
    // Priority 2: Platform geo headers (Vercel / Cloudflare)
    const countryCode = getCountryFromRequest(request)
    const geoLocale = countryToLocale(countryCode)

    if (geoLocale !== DEFAULT_LOCALE) {
      targetLocale = geoLocale
    } else {
      // Priority 3: Accept-Language header
      const acceptLanguage = request.headers.get('Accept-Language')
      targetLocale = detectLocaleFromAcceptLanguage(acceptLanguage)
    }
  }

  // Redirect to locale-prefixed path
  const redirectUrl = new URL(`/${targetLocale}${pathname}`, request.url)
  redirectUrl.search = request.nextUrl.search

  const response = NextResponse.redirect(redirectUrl)

  // Set locale cookie
  response.cookies.set(LOCALE_COOKIE, targetLocale, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|monitoring|admin|.*\\..*).*)'],
}
