// Service factory
export { getAnalyticsAdapter, getActiveAnalyticsProvider, isAnalyticsConfigured } from './service'

// Events and tracking
export { AnalyticsEvents, trackEvent } from './events'
export type { AnalyticsEventName } from './events'

// React Hook
export { useAnalytics } from './hooks'
export type { UseAnalyticsReturn } from './hooks'

// Types
export type {
  AnalyticsProvider,
  AnalyticsAdapter,
  AnalyticsEventProperties,
  AnalyticsScriptConfig,
} from './types'
