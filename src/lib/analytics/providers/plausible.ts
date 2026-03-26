import { env } from '@/config/env'
import type { AnalyticsAdapter, AnalyticsScriptConfig } from '../types'

export class PlausibleAdapter implements AnalyticsAdapter {
  readonly provider = 'plausible' as const

  getScriptConfig(): AnalyticsScriptConfig | null {
    if (!env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      return null
    }
    return {
      src: env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? 'https://plausible.io/js/script.js',
      scriptProps: {
        defer: 'true',
        'data-domain': env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      },
    }
  }

  getTrackEventScript(): string {
    return `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`
  }
}
