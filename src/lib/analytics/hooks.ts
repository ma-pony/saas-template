import { AnalyticsEvents, trackEvent } from './events'
import type { AnalyticsEventName } from './events'
import type { AnalyticsEventProperties } from './types'

export interface UseAnalyticsReturn {
  trackEvent: (name: AnalyticsEventName, properties?: AnalyticsEventProperties) => void
  trackSignup: (provider: string) => void
  trackLogin: (provider: string) => void
  trackSubscriptionStarted: (plan: string, provider: string) => void
  trackSubscriptionCancelled: () => void
}

export function useAnalytics(): UseAnalyticsReturn {
  return {
    trackEvent,
    trackSignup: (provider: string) => trackEvent(AnalyticsEvents.SIGNUP, { provider }),
    trackLogin: (provider: string) => trackEvent(AnalyticsEvents.LOGIN, { provider }),
    trackSubscriptionStarted: (plan: string, provider: string) =>
      trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, { plan, provider }),
    trackSubscriptionCancelled: () => trackEvent(AnalyticsEvents.SUBSCRIPTION_CANCELLED),
  }
}
