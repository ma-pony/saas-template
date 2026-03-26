export type AnalyticsProvider = 'plausible' | 'umami' | 'google' | 'none'

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined
}

export interface AnalyticsScriptConfig {
  /** Script tag configuration rendered in <head> */
  src: string
  scriptProps: Record<string, string>
}

export interface AnalyticsAdapter {
  readonly provider: AnalyticsProvider
  /** Get script injection config (used server-side) */
  getScriptConfig(): AnalyticsScriptConfig | null
  /** Build client-side event tracking inline script (injected to window) */
  getTrackEventScript(): string
}
