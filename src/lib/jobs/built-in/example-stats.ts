import { db } from '@/database'
import { session } from '@/database/schema'
import { gt } from 'drizzle-orm'
import type { JobDefinition, JobContext, Pipeline } from '../types'
import { getPipelineRunner } from '../pipeline/pipeline-runner'

// ─── Pipeline Types ────────────────────────────────────────────────────────────

interface RawStats {
  activeSessionCount: number
  measuredAt: Date
}

interface ProcessedStats {
  activeUsers: number
  measuredAt: string // ISO string
  label: string
}

// ─── Pipeline Implementation ───────────────────────────────────────────────────

const exampleStatsPipeline: Pipeline<RawStats, ProcessedStats> = {
  async collect(_context: JobContext): Promise<RawStats[]> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000) // last 24 hours

    const activeSessions = await db
      .select({ id: session.id })
      .from(session)
      .where(gt(session.expiresAt, since))

    return [
      {
        activeSessionCount: activeSessions.length,
        measuredAt: new Date(),
      },
    ]
  },

  async process(data: RawStats[], _context: JobContext): Promise<ProcessedStats[]> {
    return data.map((item) => ({
      activeUsers: item.activeSessionCount,
      measuredAt: item.measuredAt.toISOString(),
      label: `${item.activeSessionCount} active session(s) in the last 24h`,
    }))
  },

  async store(data: ProcessedStats[], context: JobContext): Promise<{ stored: number }> {
    // Template demo: log output instead of persisting to a real stats table
    // Replace this with actual storage logic (e.g. INSERT INTO daily_stats) in your app
    for (const stat of data) {
      context.logger.info('Daily stats snapshot', {
        activeUsers: stat.activeUsers,
        measuredAt: stat.measuredAt,
      })
      console.log('[example-stats]', stat.label)
    }
    return { stored: data.length }
  },
}

// ─── Job Definition ────────────────────────────────────────────────────────────

const exampleStatsHandler = async (context: JobContext): Promise<void> => {
  const runner = getPipelineRunner()
  const result = await runner.run(exampleStatsPipeline, context)

  context.logger.info('Pipeline complete', {
    collected: result.collected,
    processed: result.processed,
    stored: result.stored,
    stageDurations: result.stageDurations,
  })
}

export const exampleStatsJob: JobDefinition = {
  name: 'example-stats',
  schedule: '0 3 * * *', // Every day at 03:00 UTC
  description:
    'Example pipeline job: collects active session counts and logs a daily stats snapshot',
  handler: exampleStatsHandler,
  timeoutMs: 30_000,
}
