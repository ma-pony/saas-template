/**
 * Unified structured logger.
 *
 * Features:
 * - Log levels: debug < info < warn < error
 * - Structured metadata (key-value pairs appended to every message)
 * - Scoped child loggers via `logger.child({ module: 'auth' })`
 * - LOG_LEVEL env var for runtime filtering (default: 'info', 'debug' in dev)
 * - Consistent `[LEVEL] message { key: value }` output format
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LEVEL_LABEL: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
}

function resolveMinLevel(): LogLevel {
  // Read at call time so runtime changes work (no t3-env caching issue)
  const raw = process.env.LOG_LEVEL?.toLowerCase()
  if (raw && raw in LEVEL_ORDER) return raw as LogLevel
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[resolveMinLevel()]
}

function formatMeta(meta: Record<string, unknown>): string {
  const entries = Object.entries(meta)
  if (entries.length === 0) return ''

  const parts: string[] = []
  for (const [key, value] of entries) {
    if (value instanceof Error) {
      parts.push(`${key}=${value.message}`)
    } else if (typeof value === 'object' && value !== null) {
      try {
        parts.push(`${key}=${JSON.stringify(value)}`)
      } catch {
        parts.push(`${key}=[Object]`)
      }
    } else {
      parts.push(`${key}=${String(value)}`)
    }
  }
  return parts.join(' ')
}

function formatMessage(
  level: LogLevel,
  scope: Record<string, unknown>,
  message: string,
  meta?: Record<string, unknown>
): string {
  const parts = [`[${LEVEL_LABEL[level]}]`]

  // Add scope prefix as [key:value] tags
  for (const [key, value] of Object.entries(scope)) {
    parts.push(`[${key}:${value}]`)
  }

  parts.push(message)

  if (meta && Object.keys(meta).length > 0) {
    parts.push(formatMeta(meta))
  }

  return parts.join(' ')
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, meta?: Record<string, unknown>): void
  child(scope: Record<string, string>): Logger
}

function createLoggerImpl(scope: Record<string, unknown>): Logger {
  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    if (!shouldLog(level)) return

    const formatted = formatMessage(level, scope, message, meta)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    child: (childScope) => createLoggerImpl({ ...scope, ...childScope }),
  }
}

/**
 * Create a scoped logger.
 * Usage: `const log = createLogger({ module: 'auth' })`
 */
export function createLogger(scope: Record<string, string> = {}): Logger {
  return createLoggerImpl(scope)
}

/** Root logger — use `logger.child({ module: '...' })` for scoped logging. */
export const logger = createLogger()
