/**
 * Background Jobs / Cron - Core Type Definitions
 *
 * This file defines all interfaces and types for the background job framework.
 * It follows the same adapter pattern used by the payments and email systems.
 */

// ─── Job Definition ───────────────────────────────────────────────────────────

/**
 * Defines a background job with its schedule and handler.
 */
export interface JobDefinition {
  /** Unique slug used for routing and logging (e.g. 'cleanup-logs') */
  name: string
  /** Standard 5-segment cron expression (e.g. '0 2 * * *') */
  schedule: string
  description?: string
  handler: JobHandler
  /** Timeout in milliseconds. Defaults to 30000ms */
  timeoutMs?: number
  /** Number of retry attempts on failure. Defaults to 0 (no retries). */
  retries?: number
  /** Base delay between retries in milliseconds. Defaults to 1000ms. Uses exponential backoff. */
  retryDelayMs?: number
}

/**
 * The function that implements the job's work.
 */
export type JobHandler = (context: JobContext) => Promise<Record<string, unknown> | void>

/**
 * Runtime context passed to every job handler execution.
 */
export interface JobContext {
  jobName: string
  executionId: string
  startedAt: Date
  logger: JobLogger
}

/**
 * Structured logger available inside a job context.
 */
export interface JobLogger {
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, error?: unknown): void
}

// ─── Execution Result ─────────────────────────────────────────────────────────

/**
 * The result returned by JobRunner.execute().
 */
export interface ExecutionResult {
  success: boolean
  executionId: string
  jobName: string
  durationMs: number
  error?: string
  /** Number of retry attempts made before final result */
  attempts: number
}

// ─── Scheduler Adapter ────────────────────────────────────────────────────────

/**
 * Supported cron provider values.
 */
export type CronProvider = 'node-cron' | 'vercel'

/**
 * Interface that all scheduler adapters must implement.
 */
export interface JobSchedulerAdapter {
  readonly provider: CronProvider
  /**
   * Start the scheduler. For node-cron, registers cron tasks.
   * For vercel, this is a no-op (scheduling is controlled by the platform).
   */
  start(registry: import('./job-registry').JobRegistry): Promise<void>
  /**
   * Stop the scheduler. For node-cron, stops all running cron tasks.
   */
  stop(): Promise<void>
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Generic three-stage data pipeline: collect → process → store.
 *
 * @template TInput  Raw data type collected in the first stage
 * @template TOutput Processed data type stored in the final stage
 */
export interface Pipeline<TInput, TOutput> {
  collect(context: JobContext): Promise<TInput[]>
  process(data: TInput[], context: JobContext): Promise<TOutput[]>
  store(data: TOutput[], context: JobContext): Promise<{ stored: number }>
}

/**
 * Result of a completed pipeline run.
 */
export interface PipelineRunResult {
  collected: number
  processed: number
  stored: number
  stageDurations: {
    collect: number
    process: number
    store: number
  }
}
