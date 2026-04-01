/**
 * i18n Configuration
 *
 * Defines supported locales, default locale, and locale-to-language-tag mappings.
 */

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'zh'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'

/**
 * Shared params type for all pages under `[locale]` route.
 * Use as: `{ params: Promise<LocaleParams> }` or extend with additional fields:
 * `{ params: Promise<LocaleParams & { slug: string }> }`
 */
export type LocaleParams = { locale: string }

/**
 * Maps locale codes to IETF BCP 47 language tags (used for hreflang).
 */
export const LOCALE_TO_LANG_TAG: Record<SupportedLocale, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  zh: 'zh-Hans',
}

/**
 * Display names for each locale in its own language.
 * Used in the LanguageSwitcher so users can always identify their language.
 */
export const LOCALE_DISPLAY_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
}
