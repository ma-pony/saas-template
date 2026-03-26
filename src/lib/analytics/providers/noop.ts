import type { AnalyticsAdapter, AnalyticsScriptConfig } from '../types'

export class NoopAdapter implements AnalyticsAdapter {
  readonly provider = 'none' as const

  getScriptConfig(): AnalyticsScriptConfig | null {
    return null
  }

  getTrackEventScript(): string {
    return ''
  }
}
