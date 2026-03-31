# Deep Review Findings

**Date:** 2026-03-31
**Branch:** main
**Rounds:** 1
**Gate Outcome:** FAIL (advisory — manual invocation)
**Invocation:** manual

## Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 7 | 3 | 4 |
| Important | 27 | 9 | 18 |
| Minor | 9 | 2 | 7 |
| **Total** | **43** | **14** | **29** |

**Agents completed:** 5/5 (+ 0 external tools)
**External tools:** CodeRabbit (not installed), Copilot (not installed)

---

## Fixed Findings

### FINDING-1 ✅
- **Severity:** Critical
- **File:** `src/lib/messaging/email/providers/resend.ts:1`
- **Category:** correctness / production-readiness
- **Source:** correctness-agent (also reported by: production-agent)
- **Resolution:** fixed (round 1)

**What was wrong:** `'use client'` directive on a server-only email provider module. Could leak `RESEND_API_KEY` to client bundle.

**How it was resolved:** Removed `'use client'` directive.

### FINDING-2 ✅
- **Severity:** Critical
- **File:** `src/lib/jobs/built-in/cleanup-logs.ts:20-23`
- **Category:** production-readiness
- **Source:** production-agent
- **Resolution:** fixed (round 1)

**What was wrong:** Unbounded `DELETE ... RETURNING` materializes every deleted row ID in memory. Could OOM after months of operation.

**How it was resolved:** Replaced with count query + delete without `.returning()`.

### FINDING-3 ✅
- **Severity:** Important
- **File:** `src/lib/payments/providers/lemonsqueezy.ts:298-301`
- **Category:** correctness
- **Source:** correctness-agent
- **Resolution:** fixed (round 1)

**What was wrong:** `validateWebhook()` throws `Error` when secret is missing, violating the `Promise<boolean>` contract. Causes 500 instead of 400 for webhooks.

**How it was resolved:** Changed to `log.error()` + `return false`.

### FINDING-4 ✅
- **Severity:** Important
- **File:** `src/lib/payments/providers/lemonsqueezy.ts:179`
- **Category:** correctness
- **Source:** correctness-agent
- **Resolution:** fixed (round 1)

**What was wrong:** `trialStart` set to `new Date()` (current wall-clock) instead of actual trial start date, corrupting billing audit data.

**How it was resolved:** Set to `null` with explanatory comment.

### FINDING-5 ✅
- **Severity:** Important
- **File:** `src/lib/payments/types.ts:194-215`
- **Category:** architecture (dead code)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**How it was resolved:** Removed 4 unused interfaces (`PaymentServiceConfig`, `CreateCustomerResult`, `CreateSubscriptionResult`, `CreatePaymentResult`).

### FINDING-6 ✅
- **Severity:** Important
- **File:** `src/config/env.ts:55,60-61,170,173-174`
- **Category:** architecture (dead code)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**How it was resolved:** Removed `STRIPE_PRICE_ID`, `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID` from schema and runtimeEnv.

### FINDING-7 ✅
- **Severity:** Important
- **File:** `src/config/env.ts:219-221`
- **Category:** architecture (dead code)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**How it was resolved:** Removed unused `isFalsy` export.

### FINDING-8 ✅
- **Severity:** Important
- **File:** `src/lib/jobs/adapters/vercel-cron.ts:29-33`
- **Category:** architecture (dead code)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**How it was resolved:** Removed unused `getJobNames` method.

### FINDING-9 ✅
- **Severity:** Important
- **File:** `src/config/env.ts:88`
- **Category:** security
- **Source:** security-agent
- **Resolution:** fixed (round 1)

**What was wrong:** `CRON_SECRET` had no minimum length validation — a single-character secret is schema-valid.

**How it was resolved:** Added `.min(32)` constraint.

### FINDING-10 ✅
- **Severity:** Important
- **File:** `src/lib/rate-limit/limiter.ts:16-23`
- **Category:** production-readiness
- **Source:** production-agent
- **Resolution:** fixed (round 1)

**What was wrong:** `setInterval` not `.unref()`'d — prevents Node.js process from exiting naturally.

**How it was resolved:** Added `handle.unref()`.

### FINDING-11 ✅
- **Severity:** Important
- **File:** `src/app/api/webhooks/payments/route.ts:26-31`
- **Category:** architecture (state machine completeness)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**What was wrong:** `LEMONSQUEEZY_EVENT_MAP` missing `subscription_expired` mapping — expired subscriptions silently dropped.

**How it was resolved:** Added `subscription_expired: 'subscription.canceled'`.

### FINDING-12 ✅
- **Severity:** Minor
- **File:** `src/database/schema.ts:95,118,157`
- **Category:** architecture (comment accuracy)
- **Source:** architecture-agent
- **Resolution:** fixed (round 1)

**How it was resolved:** Updated stale provider comments from `'dodo', 'creem', 'autumn'` to `'lemonsqueezy'`.

---

## Remaining Findings

### Critical

#### FINDING-13 — LemonSqueezy createPortal O(N) customer scan
- **Severity:** Critical
- **Confidence:** 92
- **File:** `src/lib/payments/providers/lemonsqueezy.ts:209-223`
- **Category:** production-readiness
- **Source:** production-agent (also reported by: architecture-agent)

Paginated full-customer-list scan with no page cap. Exhausts request timeout on stores with thousands of customers. Should use direct customer lookup by ID.

#### FINDING-14 — Zero test coverage: payments service
- **Severity:** Critical
- **Confidence:** 100
- **File:** `src/lib/payments/service.ts`
- **Category:** test-quality
- **Source:** test-agent

No tests for payment adapter selection, singleton caching, provider switching.

#### FINDING-15 — Zero test coverage: webhook handler
- **Severity:** Critical
- **Confidence:** 100
- **File:** `src/app/api/webhooks/payments/route.ts`
- **Category:** test-quality
- **Source:** test-agent

No tests for signature validation, event mapping, DB upsert logic, error-swallowing behavior.

#### FINDING-16 — Zero test coverage: rate limiter
- **Severity:** Critical
- **Confidence:** 100
- **File:** `src/lib/rate-limit/limiter.ts`
- **Category:** test-quality
- **Source:** test-agent

No tests for boundary behavior, key generation, window expiry.

#### FINDING-17 — Zero test coverage: job runner
- **Severity:** Critical
- **Confidence:** 100
- **File:** `src/lib/jobs/job-runner.ts`
- **Category:** test-quality
- **Source:** test-agent

No tests for retry loop, timeout handling, concurrency lock, exponential backoff.

### Important

#### FINDING-18 — Admin routes not protected by middleware
- **File:** `src/middleware.ts:99`
- **Category:** security
- **Source:** security-agent

Admin routes explicitly excluded from middleware. Only protected by layout component — fragile defense-in-depth.

#### FINDING-19 — Rate limiter shared 'unknown' bucket
- **File:** `src/lib/rate-limit/limiter.ts:37`
- **Category:** security
- **Source:** security-agent

All requests without IP headers share one rate-limit bucket, allowing one client to consume the budget for all anonymous users.

#### FINDING-20 — OTP logged at info level in non-production
- **File:** `src/lib/auth/auth.ts:174-179`
- **Category:** security (secret handling)
- **Source:** security-agent

Raw OTP value logged at `info` level when `NODE_ENV !== 'production'`. Staging/CI logs may ship to centralized aggregators.

#### FINDING-21 — Polar hand-rolled webhook HMAC
- **File:** `src/lib/payments/providers/polar.ts:267-313`
- **Category:** security
- **Source:** security-agent

Custom HMAC-SHA256 implementation with auto-detection format. Should use `@standard-webhooks/webhooks` package.

#### FINDING-22 — Polar createCustomer placeholder ID
- **File:** `src/lib/payments/providers/polar.ts:89-93`
- **Category:** correctness
- **Source:** correctness-agent

Generates fake `polar_${userId}_${Date.now()}` customer ID. Portal requests will always fail for Polar customers.

#### FINDING-23 — Stripe duplicate customer race condition
- **File:** `src/lib/payments/providers/stripe.ts:127-149`
- **Category:** production-readiness
- **Source:** production-agent

Concurrent checkout requests race between list and create, producing duplicate Stripe customers.

#### FINDING-24 — Job runner in-memory lock ineffective in serverless
- **File:** `src/lib/jobs/job-runner.ts:68-73`
- **Category:** production-readiness
- **Source:** production-agent

Per-process `Set<string>` provides no mutual exclusion across Vercel cold starts.

#### FINDING-25 — Webhook 500 for all unhandled errors
- **File:** `src/app/api/webhooks/payments/route.ts:256-259`
- **Category:** production-readiness
- **Source:** production-agent

Top-level catch returns 500 for all errors, causing unbounded provider retries for non-transient failures.

#### FINDING-26 — Stripe one-time invoice payments silently ignored
- **File:** `src/lib/payments/providers/stripe.ts:320-339`
- **Category:** correctness
- **Source:** correctness-agent

`invoice.payment_succeeded` only persists records for subscription invoices. One-time invoice payments produce no DB record.

#### FINDING-27 — Job runner Promise.race timeout doesn't cancel handler
- **File:** `src/lib/jobs/job-runner.ts:53-62`
- **Category:** production-readiness
- **Source:** production-agent

Timed-out job handler continues executing in background. Lock released but work still running.

#### FINDING-28 — LemonSqueezy reads process.env directly
- **File:** `src/lib/payments/providers/lemonsqueezy.ts:47-51`
- **Category:** architecture (convention)
- **Source:** architecture-agent

Bypasses t3-env validation. Stripe and Polar use `env.*` consistently.

#### FINDING-29 — Analytics trackEvent bypasses adapter pattern
- **File:** `src/lib/analytics/events.ts:27-47`
- **Category:** architecture
- **Source:** architecture-agent

Client-side tracking probes `window.plausible`/`window.umami`/`window.gtag` directly instead of going through the adapter.

#### FINDING-30–35 — Zero test coverage (6 more critical areas)
- **Source:** test-agent
- Error handling (`src/lib/errors/api-response.ts`)
- Email validation (`src/lib/messaging/email/validation.ts`)
- Email mailer fallback (`src/lib/messaging/email/mailer.ts`)
- Logger level filtering (`src/lib/logger/logger.ts`)
- Checkout open-redirect validation (`src/app/api/payments/checkout/route.ts`)
- Auth guards (`src/lib/errors/guards.ts`)

### Minor

#### FINDING-36 — No Content-Security-Policy header
- **File:** `next.config.ts:18-24`
- **Source:** security-agent

#### FINDING-37 — Open redirect risk in login form
- **File:** `src/app/(auth)/login/login-form.tsx:279-280`
- **Source:** security-agent

#### FINDING-38 — Unused async validateEmail export
- **File:** `src/lib/messaging/email/validation.ts:91-190`
- **Source:** architecture-agent

#### FINDING-39 — showDivider alias redundant
- **File:** `src/app/(auth)/login/login-form.tsx:313`
- **Source:** architecture-agent

#### FINDING-40 — Hover state via useState instead of CSS
- **File:** `src/app/(auth)/login/login-form.tsx:71,78`
- **Source:** architecture-agent

#### FINDING-41 — Job skip returns misleading attempts:0
- **File:** `src/lib/jobs/job-runner.ts:68-71`
- **Source:** correctness-agent

#### FINDING-42 — Email validation disposable field semantics inverted
- **File:** `src/lib/messaging/email/validation.ts:122`
- **Source:** test-agent
