export interface RateLimitConfig {
  /** Time window in milliseconds, default 60_000 (1 minute) */
  windowMs: number
  /** Maximum number of requests per window, default 60 */
  max: number
  /** Custom key generator function, defaults to IP-based */
  keyGenerator?: (request: Request) => string
  /** Error message when rate limit is exceeded */
  message?: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp (seconds)
}

export interface RateLimitResult {
  success: boolean
  info: RateLimitInfo
}
