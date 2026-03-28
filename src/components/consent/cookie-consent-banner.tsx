'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useConsentStore } from '@/lib/consent/store'
import { EU_COUNTRIES } from '@/lib/i18n/currency'
import type { SupportedLocale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils/css'

interface CookieConsentBannerProps {
  locale: SupportedLocale
  countryCode?: string
}

/**
 * GDPR-compliant Cookie Consent Banner.
 * Displayed only for EU users who haven't yet made a consent decision.
 */
export function CookieConsentBanner({ locale, countryCode }: CookieConsentBannerProps) {
  const t = useTranslations('consent.banner')
  const { status, setConsent, acceptAll, rejectAll, loadFromCookie } = useConsentStore()
  const [isVisible, setIsVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)

  // EU locale detection: fr is often EU, also check countryCode
  const isEUUser = (countryCode && EU_COUNTRIES.has(countryCode)) || locale === 'fr'

  useEffect(() => {
    loadFromCookie()
  }, [loadFromCookie])

  useEffect(() => {
    // Only show banner for EU users who haven't made a decision
    if (isEUUser && status === 'pending') {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isEUUser, status])

  if (!isVisible) return null

  const handleAcceptAll = () => {
    acceptAll()
    setIsVisible(false)
  }

  const handleNecessaryOnly = () => {
    rejectAll()
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    setConsent({ analytics: analyticsEnabled, marketing: marketingEnabled })
    setIsVisible(false)
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-[#E4E4E7] shadow-lg',
        'sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-lg sm:border'
      )}
      role='dialog'
      aria-modal='true'
      aria-labelledby='consent-banner-title'
    >
      {!showCustomize ? (
        <div className='space-y-3'>
          <h3 id='consent-banner-title' className='font-semibold text-sm text-foreground'>
            {t('title')}
          </h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>{t('description')}</p>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <button
              type='button'
              onClick={handleAcceptAll}
              className='flex-1 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90 transition-opacity'
            >
              {t('acceptAll')}
            </button>
            <button
              type='button'
              onClick={handleNecessaryOnly}
              className='flex-1 rounded-md border border-[#E4E4E7] px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors'
            >
              {t('necessaryOnly')}
            </button>
            <button
              type='button'
              onClick={() => setShowCustomize(true)}
              className='flex-1 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              {t('customize')}
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <h3 className='font-semibold text-sm text-foreground'>{t('preferences.title')}</h3>

          {/* Necessary */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium text-foreground'>
                {t('preferences.necessary.title')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('preferences.necessary.description')}
              </p>
            </div>
            <div className='mt-0.5 h-4 w-7 rounded-full bg-foreground opacity-50 cursor-not-allowed' />
          </div>

          {/* Analytics */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium text-foreground'>
                {t('preferences.analytics.title')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('preferences.analytics.description')}
              </p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={analyticsEnabled}
              onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
              className={cn(
                'mt-0.5 h-4 w-7 rounded-full transition-colors',
                analyticsEnabled ? 'bg-foreground' : 'bg-muted'
              )}
            />
          </div>

          {/* Marketing */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium text-foreground'>
                {t('preferences.marketing.title')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('preferences.marketing.description')}
              </p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={marketingEnabled}
              onClick={() => setMarketingEnabled(!marketingEnabled)}
              className={cn(
                'mt-0.5 h-4 w-7 rounded-full transition-colors',
                marketingEnabled ? 'bg-foreground' : 'bg-muted'
              )}
            />
          </div>

          <button
            type='button'
            onClick={handleSavePreferences}
            className='w-full rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90 transition-opacity'
          >
            {t('preferences.save')}
          </button>
        </div>
      )}
    </div>
  )
}
