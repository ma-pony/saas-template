import type { JobSchedulerAdapter } from '../types'
import type { JobRegistry } from '../job-registry'
import { getJobRunner } from '../job-runner'

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
          console.error(`[node-cron] Unhandled error executing job "${job.name}":`, err)
        }
      })
      this.tasks.push(task)
      console.info(`[node-cron] Scheduled job "${job.name}" with expression: ${job.schedule}`)
    }

    console.info(`[node-cron] Started ${this.tasks.length} job(s)`)
  }

  async stop(): Promise<void> {
    for (const task of this.tasks) {
      task.stop()
    }
    this.tasks = []
    console.info('[node-cron] All cron tasks stopped')
  }
}
