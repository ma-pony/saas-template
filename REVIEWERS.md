---

## Deep Review Report

> Automated multi-perspective code review results. This section summarizes
> what was checked, what was found, and what remains for human review.

**Date:** 2026-03-31 | **Rounds:** 1/3 | **Gate:** FAIL (advisory)

### Review Agents

| Agent | Findings | Status |
|-------|----------|--------|
| Correctness | 6 | completed |
| Architecture & Idioms | 12 | completed |
| Security | 7 | completed |
| Production Readiness | 8 | completed |
| Test Quality | 10 | completed |
| CodeRabbit (external) | - | skipped (not installed) |
| Copilot (external) | - | skipped (not installed) |

### Findings Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 7 | 3 | 4 |
| Important | 27 | 9 | 18 |
| Minor | 9 | 2 | 7 |

### What was fixed automatically

- **Secret leakage risk**: Removed `'use client'` from server-only `resend.ts` email provider that imports API keys
- **Data correctness**: Fixed LemonSqueezy `trialStart` writing `new Date()` instead of `null`, fixed missing `subscription_expired` event mapping causing silently dropped events
- **Memory safety**: Removed unbounded `DELETE ... RETURNING` in cleanup-logs job, added `setInterval.unref()` to rate limiter
- **Interface contract**: Changed LemonSqueezy `validateWebhook` from `throw` to `return false` to match adapter interface
- **Dead code cleanup**: Removed 4 unused payment types, 3 phantom env vars, unused `isFalsy` export, unused `getJobNames` method
- **Security hardening**: Added `.min(32)` validation to `CRON_SECRET`, fixed stale provider comments in schema

### What still needs human attention

- The entire codebase has **zero test files**. No test runner is configured. All financial logic (payments, webhooks), auth guards, rate limiting, and job execution have 0% coverage. Is this acceptable for a production-intended SaaS template?
- The admin panel at `/admin` is protected only by a React layout component, not middleware. Is the current defense-in-depth sufficient given it exposes all user data?
- LemonSqueezy `createPortal()` does O(N) paginated customer scan — will this scale for real stores?
- Polar `createCustomer()` generates placeholder IDs that will fail on portal lookup. Is Polar portal support intended?
- Stripe checkout has a race condition that can create duplicate customers. Should deduplication be DB-authoritative?
- The rate limiter uses a shared `'unknown'` bucket for all requests without IP headers. Is this intentional?
- OTP values are logged at `info` level in non-production environments. Could this leak to centralized log systems in staging?
- No `Content-Security-Policy` header is configured anywhere in the application.

### Recommendation

18 Important and 4 Critical findings could not be auto-fixed. Human review and manual fixes are recommended before distributing as a production template. See [review-findings.md](review-findings.md) for details. The most impactful areas to address: (1) add a test framework and coverage for financial/auth logic, (2) fix the Polar/LemonSqueezy adapter correctness issues, (3) add admin route protection at the middleware layer.
