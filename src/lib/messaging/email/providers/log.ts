/**
 * Log Email Provider (Fallback)
 *
 * Development/fallback provider that logs emails instead of sending them.
 * Used when no other provider is configured.
 *
 * This provider:
 * - Never actually sends emails
 * - Logs email details to console
 * - Always returns success
 * - Useful for development and testing
 *
 * To use this provider explicitly:
 * Set EMAIL_PROVIDER=log in your .env
 *
 * Note: This provider is automatically used when no other
 * provider is configured.
 */

import { createLogger } from '@/lib/logger'

import type {
  EmailOptions,
  EmailProvider,
  ProcessedEmailData,
  SendEmailResult,
  BatchSendEmailResult,
} from '../types'

const log = createLogger({ module: 'email', provider: 'log' })

async function send(data: ProcessedEmailData): Promise<SendEmailResult> {
  const { to, subject, senderEmail: from, html, text, attachments } = data
  log.info('Email logged (no real provider)', {
    to,
    subject,
    from,
    hasHtml: !!html,
    hasText: !!text,
    attachments: attachments?.length || 0,
  })

  return {
    success: true,
    message: 'Email logged (no provider configured)',
    data: { id: `mock-${Date.now()}` },
  }
}

async function sendBatch(emails: EmailOptions[]): Promise<BatchSendEmailResult> {
  log.info('Batch email logged (no real provider)', {
    count: emails.length,
    subjects: emails.map((e) => e.subject),
  })

  const results: SendEmailResult[] = emails.map((_, index) => ({
    success: true,
    message: 'Email logged (no provider configured)',
    data: { id: `mock-batch-${Date.now()}-${index}` },
  }))

  return {
    success: true,
    message: 'Batch email logged (no provider configured)',
    results,
    data: { count: emails.length },
  }
}

/**
 * Create the log (fallback) email provider.
 * Always returns a valid provider.
 */
export function createLogProvider(): EmailProvider {
  return {
    name: 'log',
    send,
    sendBatch,
  }
}
