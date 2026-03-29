import { env } from '@/config/env'
import { createLogger } from '@/lib/logger'
import type { JobSchedulerAdapter, CronProvider } from './types'
import { getJobRegistry } from './job-registry'
import { NodeCronAdapter } from './adapters/node-cron'
import { VercelCronAdapter } from './adapters/vercel-cron'

const log = createLogger({ module: 'jobs' })

/**
 * Determines which cron provider to use.
 *
 * Priority:
 * 1. `CRON_PROVIDER` env var if explicitly set
 * 2. Auto-detect: if running on Vercel (`process.env.VERCEL` is set), use 'vercel'
 * 3. Default to 'node-cron'
 */
const detectProvider = (): CronProvider => {
  if (env.CRON_PROVIDER) {
    return env.CRON_PROVIDER
  }
  if (process.env.VERCEL) {
    return 'vercel'
  }
  return 'node-cron'
}

// Adapter singleton
let _adapter: JobSchedulerAdapter | null = null

/**
 * Returns the singleton scheduler adapter based on detected provider.
 */
export const getJobAdapter = (): JobSchedulerAdapter => {
  if (!_adapter) {
    const provider = detectProvider()
    _adapter = provider === 'vercel' ? new VercelCronAdapter() : new NodeCronAdapter()
    log.info('Using cron provider', { provider })
  }
  return _adapter
}

export { getJobRegistry }

/**
 * Starts the scheduler with all registered jobs.
 *
 * For node-cron: registers cron tasks in-process.
 * For vercel: no-op (handled via HTTP).
 *
 * Call this once during server startup. It is safe to call multiple times
 * (the adapter singleton ensures it only initializes once).
 */
let _started = false

export const startScheduler = async (): Promise<void> => {
  if (_started) return
  _started = true

  // Ensure jobs are registered before starting the scheduler
  await import('./index')

  const adapter = getJobAdapter()
  const registry = getJobRegistry()
  await adapter.start(registry)
}
