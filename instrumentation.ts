import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')

    // Start background job scheduler (node-cron mode only; vercel mode is a no-op)
    const { startScheduler } = await import('./src/lib/jobs/job-service')
    await startScheduler()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
