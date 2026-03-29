import { env } from '@/config/env'
import { createLogger } from '@/lib/logger'
import type { AnalyticsAdapter, AnalyticsProvider } from './types'

const log = createLogger({ module: 'analytics' })
import { GoogleAnalyticsAdapter } from './providers/google'
import { NoopAdapter } from './providers/noop'
import { PlausibleAdapter } from './providers/plausible'
import { UmamiAdapter } from './providers/umami'

let adapterInstance: AnalyticsAdapter | null = null

export function getAnalyticsAdapter(): AnalyticsAdapter {
  if (adapterInstance) return adapterInstance

  const provider = env.NEXT_PUBLIC_ANALYTICS_PROVIDER

  switch (provider) {
    case 'plausible':
      adapterInstance = new PlausibleAdapter()
      break
    case 'umami':
      adapterInstance = new UmamiAdapter()
      break
    case 'google':
      adapterInstance = new GoogleAnalyticsAdapter()
      break
    case 'none':
      adapterInstance = new NoopAdapter()
      break
    default:
      log.warn('Unknown provider, falling back to NoopAdapter', { provider })
      adapterInstance = new NoopAdapter()
      break
  }

  return adapterInstance
}

export function getActiveAnalyticsProvider(): AnalyticsProvider {
  return getAnalyticsAdapter().provider
}

export function isAnalyticsConfigured(): boolean {
  return getActiveAnalyticsProvider() !== 'none'
}
