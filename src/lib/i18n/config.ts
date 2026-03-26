/**
 * i18n Configuration
 *
 * Defines supported locales, default locale, and locale-to-language-tag mappings.
 */

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'zh'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'

/**
 * Maps locale codes to IETF BCP 47 language tags (used for hreflang).
 */
export const LOCALE_TO_LANG_TAG: Record<SupportedLocale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  zh: 'zh-Hans',
}
