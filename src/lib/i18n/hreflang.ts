/**
 * Hreflang Service
 *
 * Generates hreflang metadata for multilingual pages to improve SEO.
 */

import type { Metadata } from 'next'
import { SUPPORTED_LOCALES, LOCALE_TO_LANG_TAG } from './config'

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
  const appUrl = (baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  )
  const languages: Record<string, string> = {}

  for (const locale of SUPPORTED_LOCALES) {
    const langTag = LOCALE_TO_LANG_TAG[locale]
    languages[langTag] = `${appUrl}/${locale}${pathname}`
  }

  // x-default points to the English version
  languages['x-default'] = `${appUrl}/en${pathname}`

  return { languages }
}
