import { db } from '@/database'
import { jobExecutionLogs } from '@/database/schema'
import { env } from '@/config/env'
import { eq } from 'drizzle-orm'
import type { JobDefinition, ExecutionResult, JobContext, JobLogger } from './types'

/**
 * Generates a simple unique ID (nanoid-style using crypto).
 */
const generateId = (): string => {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21)
}

/**
 * Creates a job logger that prefixes messages with the job name and execution ID.
 */
const createLogger = (jobName: string, executionId: string): JobLogger => ({
  info(message, meta) {
    console.info(`[job:${jobName}][${executionId}] ${message}`, meta ?? '')
  },
  warn(message, meta) {
    console.warn(`[job:${jobName}][${executionId}] ${message}`, meta ?? '')
  },
  error(message, error) {
    console.error(`[job:${jobName}][${executionId}] ${message}`, error ?? '')
  },
})

/**
 * JobRunner - Executes a job definition with timeout, error handling, and DB logging.
 */
export class JobRunner {
  // In-memory lock to prevent overlapping executions of the same job
  private runningJobs = new Set<string>()

  /**
   * Execute a job and persist the execution record to `job_execution_logs`.
   */
  async execute(job: JobDefinition): Promise<ExecutionResult> {
    if (this.runningJobs.has(job.name)) {
      console.info(`[job-runner] Skipping "${job.name}" — already running`)
      return { success: true, executionId: '', jobName: job.name, durationMs: 0 }
    }
    this.runningJobs.add(job.name)
    const executionId = generateId()
    const startedAt = new Date()
    const timeoutMs = job.timeoutMs ?? 30_000

    const logger = createLogger(job.name, executionId)

    // Insert running record
    await db.insert(jobExecutionLogs).values({
      id: executionId,
      jobName: job.name,
      status: 'running',
      startedAt,
      createdAt: startedAt,
    })

    const context: JobContext = {
      jobName: job.name,
      executionId,
      startedAt,
      logger,
    }

    const startMs = Date.now()
    let durationMs = 0

    try {
      let timeoutHandle: ReturnType<typeof setTimeout>
      await Promise.race([
        job.handler(context),
        new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(
            () => reject(new Error(`Task timed out after ${timeoutMs}ms`)),
            timeoutMs
          )
        }),
      ]).finally(() => clearTimeout(timeoutHandle!))

      durationMs = Date.now() - startMs

      await db
        .update(jobExecutionLogs)
        .set({
          status: 'success',
          finishedAt: new Date(),
          durationMs,
        })
        .where(eq(jobExecutionLogs.id, executionId))

      logger.info(`Completed successfully in ${durationMs}ms`)

      this.runningJobs.delete(job.name)
      return { success: true, executionId, jobName: job.name, durationMs }
    } catch (err) {
      durationMs = Date.now() - startMs

      const isTimeout = err instanceof Error && err.message.startsWith('Task timed out after')
      const status = isTimeout ? 'timeout' : 'failed'
      const errorMessage = err instanceof Error ? err.message : String(err)
      const truncatedMessage = errorMessage.slice(0, 2000)

      const metadata: Record<string, unknown> = {}
      if (!isTimeout && err instanceof Error && err.stack) {
        metadata.stack = err.stack.slice(0, 3000)
      }

      await db
        .update(jobExecutionLogs)
        .set({
          status,
          finishedAt: new Date(),
          durationMs,
          errorMessage: truncatedMessage,
          metadata,
        })
        .where(eq(jobExecutionLogs.id, executionId))

      logger.error(`Job ${status}: ${truncatedMessage}`, err)

      // Report to Sentry if configured
      if (env.SENTRY_DSN) {
        try {
          const Sentry = await import('@sentry/nextjs')
          Sentry.captureException(err, {
            tags: { job_name: job.name, job_status: status },
            level: isTimeout ? 'warning' : 'error',
          })
        } catch {
          // Sentry import failure should not crash the job runner
        }
      }

      this.runningJobs.delete(job.name)
      return {
        success: false,
        executionId,
        jobName: job.name,
        durationMs,
        error: truncatedMessage,
      }
    }
  }
}

// Singleton instance
let _runner: JobRunner | null = null

export const getJobRunner = (): JobRunner => {
  if (!_runner) {
    _runner = new JobRunner()
  }
  return _runner
}
