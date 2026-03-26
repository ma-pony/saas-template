'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AnalyticsEvents, trackEvent } from '@/lib/analytics/events'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent(AnalyticsEvents.PAGE_VIEW, { path: pathname })
  }, [pathname])

  return <>{children}</>
}
