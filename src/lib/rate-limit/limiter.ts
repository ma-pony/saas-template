import { NextResponse } from 'next/server'
import type { RateLimitConfig, RateLimitResult } from './types'

interface WindowEntry {
  count: number
  resetAt: number
}

// Global in-memory store (process-level).
//
// ⚠️  SERVERLESS LIMITATION:
// This store is per-process. In serverless deployments (Vercel, AWS Lambda) each
// function invocation gets its own Map — rate limits are NOT enforced across instances.
// This is only effective for single-process deployments (VPS, Docker, long-lived Node).
//
// For production serverless rate limiting, replace with one of:
//   1. `@upstash/ratelimit` + Upstash Redis (recommended for Vercel)
//   2. Vercel WAF / Cloudflare rate limiting rules (infrastructure-level)
//   3. Any Redis-backed sliding window implementation
//
// To swap: replace `store.get/set/delete` calls below with your Redis adapter.
const store = new Map<string, WindowEntry>()

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const handle = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
  // Allow Node.js process to exit naturally (e.g., during tests or hot-reload)
  if (handle.unref) handle.unref()
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req) => {
    // Prefer platform-set headers first; proxy-provided headers are only reliable
    // when the app is known to be behind a trusted reverse proxy.
    const realIp =
      req.headers.get('x-vercel-forwarded-for') ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    return realIp || 'unknown'
  },
  message: 'Too many requests, please try again later.',
}

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  return async (request: Request): Promise<RateLimitResult | NextResponse> => {
    const key = cfg.keyGenerator(request)
    const now = Date.now()

    let entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + cfg.windowMs }
      store.set(key, entry)
    }

    entry.count += 1
    const remaining = Math.max(0, cfg.max - entry.count)
    const reset = Math.ceil(entry.resetAt / 1000)

    const info = { limit: cfg.max, remaining, reset }

    if (entry.count > cfg.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return NextResponse.json(
        { error: cfg.message, retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(cfg.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

    return { success: true, info }
  }
}
