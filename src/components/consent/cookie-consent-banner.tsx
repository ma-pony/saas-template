'use client'

import { useEffect, useState } from 'react'
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

  const t = {
    en: {
      title: 'We use cookies',
      description:
        "We use cookies to improve your experience. By clicking 'Accept All', you consent to our use of cookies.",
      acceptAll: 'Accept All',
      necessaryOnly: 'Necessary Only',
      customize: 'Customize',
      preferences: {
        title: 'Cookie Preferences',
        necessary: {
          title: 'Necessary',
          description: 'Required for the site to function properly.',
        },
        analytics: { title: 'Analytics', description: 'Help us understand how you use our site.' },
        marketing: {
          title: 'Marketing',
          description: 'Used to show you relevant ads and content.',
        },
        save: 'Save Preferences',
      },
    },
    fr: {
      title: 'Nous utilisons des cookies',
      description:
        "Nous utilisons des cookies pour améliorer votre expérience. En cliquant sur 'Tout accepter', vous consentez à notre utilisation des cookies.",
      acceptAll: 'Tout accepter',
      necessaryOnly: 'Nécessaires seulement',
      customize: 'Personnaliser',
      preferences: {
        title: 'Préférences des cookies',
        necessary: {
          title: 'Nécessaires',
          description: 'Requis pour le bon fonctionnement du site.',
        },
        analytics: {
          title: 'Analytiques',
          description: 'Nous aident à comprendre comment vous utilisez notre site.',
        },
        marketing: {
          title: 'Marketing',
          description: 'Utilisés pour vous montrer des publicités et du contenu pertinents.',
        },
        save: 'Enregistrer les préférences',
      },
    },
    zh: {
      title: '我们使用 Cookie',
      description: '我们使用 Cookie 来改善您的体验。点击「全部接受」即表示您同意我们使用 Cookie。',
      acceptAll: '全部接受',
      necessaryOnly: '仅必要',
      customize: '自定义设置',
      preferences: {
        title: 'Cookie 偏好设置',
        necessary: { title: '必要', description: '网站正常运行所必需。' },
        analytics: { title: '分析', description: '帮助我们了解您如何使用我们的网站。' },
        marketing: { title: '营销', description: '用于向您展示相关广告和内容。' },
        save: '保存偏好',
      },
    },
    es: {
      title: 'Usamos cookies',
      description:
        "Usamos cookies para mejorar tu experiencia. Al hacer clic en 'Aceptar todo', consientes el uso de cookies.",
      acceptAll: 'Aceptar todo',
      necessaryOnly: 'Solo necesarias',
      customize: 'Personalizar',
      preferences: {
        title: 'Preferencias de cookies',
        necessary: {
          title: 'Necesarias',
          description: 'Requeridas para el funcionamiento correcto del sitio.',
        },
        analytics: {
          title: 'Analíticas',
          description: 'Nos ayudan a entender cómo usas nuestro sitio.',
        },
        marketing: {
          title: 'Marketing',
          description: 'Usadas para mostrarte anuncios y contenido relevante.',
        },
        save: 'Guardar preferencias',
      },
    },
  }

  const text = t[locale] || t.en

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
            {text.title}
          </h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>{text.description}</p>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <button
              type='button'
              onClick={handleAcceptAll}
              className='flex-1 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90 transition-opacity'
            >
              {text.acceptAll}
            </button>
            <button
              type='button'
              onClick={handleNecessaryOnly}
              className='flex-1 rounded-md border border-[#E4E4E7] px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors'
            >
              {text.necessaryOnly}
            </button>
            <button
              type='button'
              onClick={() => setShowCustomize(true)}
              className='flex-1 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              {text.customize}
            </button>
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <h3 className='font-semibold text-sm text-foreground'>{text.preferences.title}</h3>

          {/* Necessary */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium text-foreground'>
                {text.preferences.necessary.title}
              </p>
              <p className='text-xs text-muted-foreground'>
                {text.preferences.necessary.description}
              </p>
            </div>
            <div className='mt-0.5 h-4 w-7 rounded-full bg-foreground opacity-50 cursor-not-allowed' />
          </div>

          {/* Analytics */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-medium text-foreground'>
                {text.preferences.analytics.title}
              </p>
              <p className='text-xs text-muted-foreground'>
                {text.preferences.analytics.description}
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
                {text.preferences.marketing.title}
              </p>
              <p className='text-xs text-muted-foreground'>
                {text.preferences.marketing.description}
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
            {text.preferences.save}
          </button>
        </div>
      )}
    </div>
  )
}
