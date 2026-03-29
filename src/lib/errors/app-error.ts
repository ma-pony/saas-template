export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'BILLING_DISABLED'
  | 'PAYMENT_PROVIDER_ERROR'
  | 'INTERNAL_ERROR'

const HTTP_STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  BILLING_DISABLED: 422,
  PAYMENT_PROVIDER_ERROR: 502,
  INTERNAL_ERROR: 500,
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  /** true = expected/safe (e.g. validation); false = unexpected (report to Sentry) */
  readonly isOperational: boolean

  constructor(code: ErrorCode, message: string, isOperational = true) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = HTTP_STATUS[code]
    this.isOperational = isOperational
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super('BAD_REQUEST', message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message)
  }
}

export class BillingDisabledError extends AppError {
  constructor(message = 'Billing is not enabled') {
    super('BILLING_DISABLED', message)
  }
}

export class PaymentProviderError extends AppError {
  readonly provider: string
  constructor(provider: string, message: string) {
    super('PAYMENT_PROVIDER_ERROR', message)
    this.provider = provider
  }
}
