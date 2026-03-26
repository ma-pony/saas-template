import Script from 'next/script'
import { getAnalyticsAdapter } from '@/lib/analytics/service'

export function AnalyticsScript() {
  const adapter = getAnalyticsAdapter()
  const config = adapter.getScriptConfig()

  if (!config) return null

  const trackEventScript = adapter.getTrackEventScript()

  return (
    <>
      <Script src={config.src} strategy='afterInteractive' {...config.scriptProps} />
      {trackEventScript && (
        <Script
          id={`analytics-init-${adapter.provider}`}
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{ __html: trackEventScript }}
        />
      )}
    </>
  )
}
