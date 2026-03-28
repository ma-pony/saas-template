// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,

    // Adjust trace sample rate in production via SENTRY_TRACES_SAMPLE_RATE
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Disable sending PII by default for privacy compliance
    sendDefaultPii: false,
  })
}
