import { createLogger } from '@/lib/logger'
import type { JobSchedulerAdapter } from '../types'
import type { JobRegistry } from '../job-registry'
import { getJobRunner } from '../job-runner'

const log = createLogger({ module: 'jobs', adapter: 'node-cron' })

/**
 * NodeCronAdapter - Uses the `node-cron` package to schedule jobs in-process.
 *
 * This adapter is used in local/self-hosted environments.
 * In Vercel deployments use VercelCronAdapter instead.
 */
export class NodeCronAdapter implements JobSchedulerAdapter {
  readonly provider = 'node-cron' as const

  // Store references to running cron tasks for cleanup
  private tasks: Array<{ stop(): void }> = []

  async start(registry: JobRegistry): Promise<void> {
    // Lazily import node-cron to avoid loading it in edge/serverless environments
    const cron = await import('node-cron')
    const runner = getJobRunner()

    for (const job of registry.getAllJobs()) {
      const task = cron.schedule(job.schedule, async () => {
        try {
          await runner.execute(job)
        } catch (err) {
          log.error('Unhandled error executing job', { job: job.name, error: err })
        }
      })
      this.tasks.push(task)
      log.info('Scheduled job', { job: job.name, schedule: job.schedule })
    }

    log.info('Started jobs', { count: this.tasks.length })
  }

  async stop(): Promise<void> {
    for (const task of this.tasks) {
      task.stop()
    }
    this.tasks = []
    log.info('All cron tasks stopped')
  }
}
