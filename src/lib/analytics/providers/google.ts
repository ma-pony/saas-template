import { env } from '@/config/env'
import type { AnalyticsAdapter, AnalyticsScriptConfig } from '../types'

export class GoogleAnalyticsAdapter implements AnalyticsAdapter {
  readonly provider = 'google' as const

  getScriptConfig(): AnalyticsScriptConfig | null {
    const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!measurementId) return null

    return {
      src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      scriptProps: { async: 'true' },
    }
  }

  getTrackEventScript(): string {
    const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!measurementId) return ''

    const anonymizeIp = env.NEXT_PUBLIC_ANALYTICS_ANONYMIZE_IP === 'true'

    return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}'${anonymizeIp ? ", { 'anonymize_ip': true }" : ''});`
  }
}
