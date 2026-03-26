import { db } from '@/database'
import { jobExecutionLogs } from '@/database/schema'
import { env } from '@/config/env'
import { lt } from 'drizzle-orm'
import type { JobDefinition, JobContext } from '../types'

/**
 * Built-in job: cleanup-logs
 *
 * Deletes job execution log entries older than JOB_LOG_RETENTION_DAYS (default: 30).
 * Runs every day at 02:00 UTC.
 */
const cleanupLogsHandler = async (context: JobContext): Promise<void> => {
  const retentionDays = env.JOB_LOG_RETENTION_DAYS
  context.logger.info(`Cleaning up job logs older than ${retentionDays} days`)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const deleted = await db
    .delete(jobExecutionLogs)
    .where(lt(jobExecutionLogs.startedAt, cutoffDate))
    .returning({ id: jobExecutionLogs.id })

  const deletedCount = deleted.length
  context.logger.info(`Deleted ${deletedCount} expired log entries`, {
    cutoffDate: cutoffDate.toISOString(),
    deletedCount,
    retentionDays,
  })
}

export const cleanupLogsJob: JobDefinition = {
  name: 'cleanup-logs',
  schedule: '0 2 * * *', // Every day at 02:00 UTC
  description: `Deletes job execution logs older than JOB_LOG_RETENTION_DAYS (default: 30 days)`,
  handler: cleanupLogsHandler,
  timeoutMs: 60_000,
}
