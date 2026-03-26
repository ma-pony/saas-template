import { type NextRequest, NextResponse } from 'next/server'
import { and, eq, gte, lte, desc, count } from 'drizzle-orm'
import { env } from '@/config/env'

export const dynamic = 'force-dynamic'

type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'timeout'

const VALID_STATUSES: JobStatus[] = ['pending', 'running', 'success', 'failed', 'timeout']

/**
 * GET /api/jobs/logs
 *
 * Paginated query of job execution logs with optional filters.
 *
 * Query Parameters:
 * - jobName?   - Filter by job name slug
 * - status?    - Filter by status (pending|running|success|failed|timeout)
 * - from?      - ISO date string, filter logs with startedAt >= from
 * - to?        - ISO date string, filter logs with startedAt <= to
 * - page?      - Page number (default: 1)
 * - limit?     - Results per page (default: 20, max: 100)
 *
 * Response:
 * { data: JobExecutionLog[], total: number, page: number, totalPages: number }
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const isDevelopment = env.NODE_ENV === 'development'

  // ─── Authentication ────────────────────────────────────────────────────────
  const cronSecret = env.CRON_SECRET

  if (!cronSecret) {
    if (!isDevelopment) {
      return NextResponse.json(
        {
          success: false,
          error: 'CRON_SECRET is not configured. Requests are rejected in production.',
        },
        { status: 401 }
      )
    }
    console.warn(
      '[jobs] WARNING: CRON_SECRET is not set. Allowing unauthenticated request for job logs in development.'
    )
  } else {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token !== cronSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = request.nextUrl

  // ─── Parse params ────────────────────────────────────────────────────────
  const jobName = searchParams.get('jobName') ?? undefined
  const statusParam = searchParams.get('status') ?? undefined
  const fromParam = searchParams.get('from') ?? undefined
  const toParam = searchParams.get('to') ?? undefined
  const pageParam = searchParams.get('page') ?? '1'
  const limitParam = searchParams.get('limit') ?? '20'

  // Validate status
  if (statusParam && !VALID_STATUSES.includes(statusParam as JobStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate and parse dates
  let fromDate: Date | undefined
  let toDate: Date | undefined

  if (fromParam) {
    fromDate = new Date(fromParam)
    if (Number.isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid "from" date format. Use ISO 8601.' },
        { status: 400 }
      )
    }
  }

  if (toParam) {
    toDate = new Date(toParam)
    if (Number.isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid "to" date format. Use ISO 8601.' },
        { status: 400 }
      )
    }
  }

  // Validate and parse pagination
  const page = Number.parseInt(pageParam, 10)
  const limit = Number.parseInt(limitParam, 10)

  if (Number.isNaN(page) || page < 1) {
    return NextResponse.json({ error: '"page" must be a positive integer.' }, { status: 400 })
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: '"limit" must be between 1 and 100.' }, { status: 400 })
  }

  // ─── Build where conditions ───────────────────────────────────────────────
  const { db } = await import('@/database')
  const { jobExecutionLogs } = await import('@/database/schema')

  const conditions = []

  if (jobName) {
    conditions.push(eq(jobExecutionLogs.jobName, jobName))
  }

  if (statusParam) {
    conditions.push(eq(jobExecutionLogs.status, statusParam as JobStatus))
  }

  if (fromDate) {
    conditions.push(gte(jobExecutionLogs.startedAt, fromDate))
  }

  if (toDate) {
    conditions.push(lte(jobExecutionLogs.startedAt, toDate))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // ─── Query ────────────────────────────────────────────────────────────────
  const offset = (page - 1) * limit

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(jobExecutionLogs)
      .where(where)
      .orderBy(desc(jobExecutionLogs.startedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(jobExecutionLogs).where(where),
  ])

  const total = totalResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({ data, total, page, totalPages })
}
