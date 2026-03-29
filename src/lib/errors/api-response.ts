import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'
import { AppError } from './app-error'
import { captureError } from './report'

const log = createLogger({ module: 'api' })

export interface ApiErrorBody {
  message: string
  code: string
  statusCode: number
}

/**
 * Produce a standardized error NextResponse.
 * Reports non-operational and 5xx errors to Sentry automatically.
 */
export function apiError(
  error: unknown,
  fallbackMessage = 'Internal server error'
): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    if (!error.isOperational || error.statusCode >= 500) {
      captureError(error)
    }
    return NextResponse.json(
      { message: error.message, code: error.code, statusCode: error.statusCode },
      { status: error.statusCode }
    )
  }

  // Unknown error — always report
  const err = error instanceof Error ? error : new Error(String(error))
  captureError(err)
  log.error('Unhandled error', { error: err.message, stack: err.stack })
  return NextResponse.json(
    { message: fallbackMessage, code: 'INTERNAL_ERROR', statusCode: 500 },
    { status: 500 }
  )
}

/**
 * Wrap an async route handler with standardized error catching.
 * Usage: export const POST = withApiErrors(async (req) => { ... })
 */
export function withApiErrors<
  T extends (...args: any[]) => Promise<NextResponse>,
>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (err) {
      return apiError(err)
    }
  }) as T
}
