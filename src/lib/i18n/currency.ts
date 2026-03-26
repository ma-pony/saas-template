/**
 * Currency Service
 *
 * Determines the appropriate currency for a given locale/country,
 * and formats monetary amounts using Intl.NumberFormat.
 */

import { type SupportedLocale, LOCALE_TO_LANG_TAG } from './config'

export type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP'

/**
 * EU member countries (for EUR currency detection).
 */
export const EU_COUNTRIES = new Set([
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
])

/**
 * Returns the appropriate currency code for a given locale and optional country code.
 * Priority: explicit CN country code > locale-based > EU country > GB > USD default
 */
export function getCurrencyForLocale(locale: SupportedLocale, countryCode?: string): CurrencyCode {
  if (countryCode === 'CN') return 'CNY'
  if (locale === 'zh') return 'CNY'
  if (countryCode && EU_COUNTRIES.has(countryCode)) return 'EUR'
  if (countryCode === 'GB') return 'GBP'
  return 'USD'
}

/**
 * Formats a monetary amount (in the smallest currency unit, e.g. cents) as a
 * localized currency string using Intl.NumberFormat.
 *
 * @param amount - Amount in smallest unit (e.g. cents for USD)
 * @param currency - ISO 4217 currency code
 * @param locale - The application locale for number formatting
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: SupportedLocale
): string {
  return new Intl.NumberFormat(LOCALE_TO_LANG_TAG[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100)
}
