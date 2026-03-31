import { db } from '@/database'
import { jobExecutionLogs } from '@/database/schema'
import { captureError } from '@/lib/errors'
import { createLogger as createAppLogger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import type { JobDefinition, ExecutionResult, JobContext, JobLogger } from './types'

const log = createAppLogger({ module: 'jobs' })

/**
 * Generates a simple unique ID (nanoid-style using crypto).
 */
const generateId = (): string => {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21)
}

/**
 * Creates a job-scoped logger backed by the unified logger.
 */
const createJobLogger = (jobName: string, executionId: string): JobLogger => {
  const scoped = log.child({ job: jobName, executionId })
  return {
    info: (message, meta) => scoped.info(message, meta),
    warn: (message, meta) => scoped.warn(message, meta),
    error: (message, error) => {
      const meta: Record<string, unknown> = {}
      if (error instanceof Error) {
        meta.error = error.message
      } else if (error !== undefined) {
        meta.error = error
      }
      scoped.error(message, meta)
    },
  }
}

/**
 * JobRunner - Executes a job definition with timeout, error handling, and DB logging.
 */
export class JobRunner {
  // In-memory lock to prevent overlapping executions of the same job
  private runningJobs = new Set<string>()

  /**
   * Execute a job handler once with timeout.
   */
  private async executeOnce(
    job: JobDefinition,
    context: JobContext,
    timeoutMs: number
  ): Promise<Record<string, unknown> | void> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined
    return Promise.race([
      job.handler(context),
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error(`Task timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      }),
    ]).finally(() => clearTimeout(timeoutHandle))
  }

  /**
   * Execute a job and persist the execution record to `job_execution_logs`.
   * Supports automatic retries with exponential backoff when `job.retries` > 0.
   */
  async execute(job: JobDefinition): Promise<ExecutionResult> {
    if (this.runningJobs.has(job.name)) {
      log.info('Skipping job — already running', { job: job.name })
      return { success: true, skipped: true, executionId: '', jobName: job.name, durationMs: 0, attempts: 0 }
    }
    this.runningJobs.add(job.name)
    const executionId = generateId()
    const startedAt = new Date()
    const timeoutMs = job.timeoutMs ?? 30_000
    const maxRetries = job.retries ?? 0
    const baseDelay = job.retryDelayMs ?? 1_000

    const logger = createJobLogger(job.name, executionId)

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
    let attempt = 0
    let lastError: unknown

    try {
      while (attempt <= maxRetries) {
        try {
          if (attempt > 0) {
            const delay = Math.min(baseDelay * 2 ** (attempt - 1), 30_000)
            logger.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms`)
            await new Promise((r) => setTimeout(r, delay))
          }

          const handlerResult = await this.executeOnce(job, context, timeoutMs)

          durationMs = Date.now() - startMs

          const successMetadata: Record<string, unknown> = {}
          if (attempt > 0) successMetadata.retries = attempt
          if (handlerResult) Object.assign(successMetadata, handlerResult)

          await db
            .update(jobExecutionLogs)
            .set({
              status: 'success',
              finishedAt: new Date(),
              durationMs,
              metadata: Object.keys(successMetadata).length > 0 ? successMetadata : undefined,
            })
            .where(eq(jobExecutionLogs.id, executionId))

          logger.info(
            `Completed successfully in ${durationMs}ms${attempt > 0 ? ` (after ${attempt} ${attempt === 1 ? 'retry' : 'retries'})` : ''}`
          )

          return { success: true, executionId, jobName: job.name, durationMs, attempts: attempt + 1 }
        } catch (err) {
          lastError = err
          const isTimeout =
            err instanceof Error && err.message.startsWith('Task timed out after')

          // Don't retry timeouts — they're unlikely to resolve with a retry
          if (isTimeout || attempt >= maxRetries) {
            throw err
          }

          attempt++
        }
      }

      // Unreachable — the loop always executes at least once and either returns or throws
      throw lastError ?? new Error(`Job "${job.name}" failed unexpectedly`)
    } catch (err) {
      durationMs = Date.now() - startMs

      const isTimeout = err instanceof Error && err.message.startsWith('Task timed out after')
      const status = isTimeout ? 'timeout' : 'failed'
      const errorMessage = err instanceof Error ? err.message : String(err)
      const truncatedMessage = errorMessage.slice(0, 2000)

      const metadata: Record<string, unknown> = {}
      if (attempt > 0) metadata.retries = attempt
      if (!isTimeout && err instanceof Error && err.stack) {
        metadata.stack = err.stack.slice(0, 3000)
      }

      try {
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
      } catch (dbError) {
        logger.error('Failed to update job execution log', dbError)
      }

      logger.error(
        `Job ${status}: ${truncatedMessage}${attempt > 0 ? ` (after ${attempt} ${attempt === 1 ? 'retry' : 'retries'})` : ''}`,
        err
      )

      captureError(err instanceof Error ? err : new Error(String(err)), {
        tags: { job_name: job.name, job_status: status, retries: String(attempt) },
        level: isTimeout ? 'warning' : 'error',
      })

      return {
        success: false,
        executionId,
        jobName: job.name,
        durationMs,
        error: truncatedMessage,
        attempts: attempt + 1,
      }
    } finally {
      this.runningJobs.delete(job.name)
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
