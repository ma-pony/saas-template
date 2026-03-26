import { env } from '@/config/env'
import type { AnalyticsAdapter, AnalyticsScriptConfig } from '../types'

export class UmamiAdapter implements AnalyticsAdapter {
  readonly provider = 'umami' as const

  getScriptConfig(): AnalyticsScriptConfig | null {
    if (!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
      return null
    }
    return {
      src: env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? 'https://cloud.umami.is/script.js',
      scriptProps: {
        defer: 'true',
        'data-website-id': env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      },
    }
  }

  getTrackEventScript(): string {
    // Umami script auto-initializes window.umami, no inline script needed
    return ''
  }
}
