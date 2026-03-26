import { env } from '@/config/env'
import type { AnalyticsAdapter, AnalyticsProvider } from './types'
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
      console.warn(`[Analytics] Unknown provider: "${provider}". Falling back to NoopAdapter.`)
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
