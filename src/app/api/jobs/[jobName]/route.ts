import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'

export const dynamic = 'force-dynamic'

/**
 * Shared handler for GET and POST /api/jobs/[jobName]
 *
 * Triggers a registered background job by name.
 * Used by Vercel Cron Jobs (GET) and any external scheduler (POST).
 *
 * Authentication:
 * - Production: requires `Authorization: Bearer <CRON_SECRET>` header
 * - Development: if CRON_SECRET is not configured, allows unauthenticated access with a warning
 */
const handleJobRequest = async (
  request: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
): Promise<NextResponse> => {
  const { jobName } = await params
  const isDevelopment = env.NODE_ENV === 'development'

  // ─── Authentication ──────────────────────────────────────────────────────
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
      `[jobs] WARNING: CRON_SECRET is not set. Allowing unauthenticated request for job "${jobName}" in development.`
    )
  } else {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token !== cronSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ─── Job Lookup ───────────────────────────────────────────────────────────
  const { getJobRegistry } = await import('@/lib/jobs/job-registry')
  await import('@/lib/jobs/index')
  const registry = getJobRegistry()
  const job = registry.findJob(jobName)

  if (!job) {
    return NextResponse.json(
      { success: false, error: `Job "${jobName}" not found` },
      { status: 404 }
    )
  }

  // ─── Execution ────────────────────────────────────────────────────────────
  const { getJobRunner } = await import('@/lib/jobs/job-runner')
  const runner = getJobRunner()
  const result = await runner.execute(job)

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}

export const GET = handleJobRequest
export const POST = handleJobRequest
