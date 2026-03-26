import type { JobSchedulerAdapter } from '../types'
import type { JobRegistry } from '../job-registry'

/**
 * VercelCronAdapter - No-op adapter for Vercel Cron Jobs.
 *
 * In Vercel mode, scheduling is controlled by `vercel.json` crons config.
 * This adapter's start/stop are no-ops; job execution happens via HTTP POST
 * to `/api/jobs/[jobName]` triggered by the Vercel platform.
 */
export class VercelCronAdapter implements JobSchedulerAdapter {
  readonly provider = 'vercel' as const

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async start(_registry: JobRegistry): Promise<void> {
    // No-op: Vercel manages scheduling via vercel.json crons
    console.info('[vercel-cron] Adapter ready. Scheduling is managed by Vercel platform.')
  }

  async stop(): Promise<void> {
    // No-op: nothing to stop
  }

  /**
   * Returns the names of all HTTP-triggered job routes.
   * Used by the `/api/jobs/[jobName]` endpoint to validate requests.
   */
  getJobNames(registry: JobRegistry): string[] {
    return registry.getAllJobs().map((j) => j.name)
  }
}
