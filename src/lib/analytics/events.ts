import type { AnalyticsEventProperties } from './types'

export const AnalyticsEvents = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAGE_VIEW: 'page_view',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

/**
 * Unified event tracking function (client-side).
 * Routes to the available global analytics object.
 * Fails silently if no analytics provider is loaded.
 */
export function trackEvent(name: AnalyticsEventName, properties?: AnalyticsEventProperties): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', name, properties)
  }

  if (typeof window === 'undefined') return

  try {
    // Plausible
    if (typeof (window as any).plausible === 'function') {
      ;(window as any).plausible(name, { props: properties })
      return
    }

    // Umami
    if (typeof (window as any).umami?.track === 'function') {
      ;(window as any).umami.track(name, properties)
      return
    }

    // Google Analytics (gtag)
    if (typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', name, properties)
      return
    }
  } catch {
    // Silent failure — analytics is non-critical
  }
}
