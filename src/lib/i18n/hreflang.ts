/**
 * Hreflang Service
 *
 * Generates hreflang metadata for multilingual pages to improve SEO.
 */

import type { Metadata } from 'next'
import { SUPPORTED_LOCALES, LOCALE_TO_LANG_TAG, DEFAULT_LOCALE } from './config'
import { getBaseUrl } from '@/lib/utils'

/**
 * Generates hreflang metadata for a given pathname.
 * Returns an alternates object compatible with Next.js Metadata.
 *
 * @param pathname - The path without locale prefix (e.g. '/pricing')
 * @param baseUrl - The base URL of the site (defaults to NEXT_PUBLIC_APP_URL)
 */
export function generateHreflangMetadata(
  pathname: string,
  baseUrl?: string
): Metadata['alternates'] {
  const appUrl = (baseUrl || getBaseUrl()).replace(/\/$/, '')
  const languages: Record<string, string> = {}

  for (const locale of SUPPORTED_LOCALES) {
    const langTag = LOCALE_TO_LANG_TAG[locale]
    languages[langTag] = `${appUrl}/${locale}${pathname}`
  }

  // x-default points to the default locale version
  languages['x-default'] = `${appUrl}/${DEFAULT_LOCALE}${pathname}`

  return { languages }
}
