import { env } from '@/config/env'

interface CaptureOptions {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level?: 'error' | 'warning' | 'info'
}

/**
 * Report an error to Sentry when SENTRY_DSN is configured.
 * Silent no-op otherwise — safe to call everywhere.
 */
export async function captureError(error: Error, options: CaptureOptions = {}): Promise<void> {
  if (!env.SENTRY_DSN) return

  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, {
      tags: options.tags,
      extra: options.extra,
      level: options.level ?? 'error',
    })
  } catch {
    // Sentry unavailable — never crash the caller
  }
}

/**
 * Fire-and-forget variant for contexts where you cannot await (error boundaries, etc.).
 */
export function captureErrorSync(error: Error, options: CaptureOptions = {}): void {
  captureError(error, options).catch(() => {})
}
