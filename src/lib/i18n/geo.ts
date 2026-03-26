/**
 * Geo Service
 *
 * Maps ISO 3166-1 country codes to supported locales.
 * Used by middleware for IP-based locale detection.
 */

import { DEFAULT_LOCALE, type SupportedLocale } from './config'

export const COUNTRY_TO_LOCALE: Partial<Record<string, SupportedLocale>> = {
  // Chinese-speaking regions
  CN: 'zh',
  TW: 'zh',
  HK: 'zh',
  MO: 'zh',

  // Spanish-speaking countries
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  PE: 'es',
  VE: 'es',
  CL: 'es',
  EC: 'es',
  GT: 'es',
  CU: 'es',
  BO: 'es',
  DO: 'es',
  HN: 'es',
  PY: 'es',
  SV: 'es',
  NI: 'es',
  CR: 'es',
  PA: 'es',
  UY: 'es',

  // French-speaking countries
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  CA: 'fr',
  LU: 'fr',
  MC: 'fr',
  SN: 'fr',
  CI: 'fr',
  ML: 'fr',
  BF: 'fr',
  NE: 'fr',
  TG: 'fr',
  BJ: 'fr',
  GN: 'fr',
  CD: 'fr',
  MG: 'fr',
  CM: 'fr',
  DZ: 'fr',
  MA: 'fr',
  TN: 'fr',
}

/**
 * Maps a country code to a supported locale.
 * Returns DEFAULT_LOCALE if no mapping is found or countryCode is null.
 * Never throws an exception.
 */
export function countryToLocale(countryCode: string | null): SupportedLocale {
  if (!countryCode) return DEFAULT_LOCALE
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? DEFAULT_LOCALE
}

/**
 * Extracts country code from request headers.
 * Supports Vercel (x-vercel-ip-country) and Cloudflare (cf-ipcountry) deployments.
 * Returns null if no country header is present.
 */
export function getCountryFromRequest(request: Request): string | null {
  return request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? null
}
