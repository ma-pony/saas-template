import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'

import { getPaymentAdapter } from '@/lib/payments/service'
import { db } from '@/database'
import { customer, subscription, payment } from '@/database/schema'
import type { WebhookEvent } from '@/lib/payments/types'
import { createLogger } from '@/lib/logger'

const log = createLogger({ module: 'webhook' })

/**
 * Map provider-specific event type names to canonical WebhookEventType.
 * Stripe uses `customer.subscription.created` while our types use `subscription.created`.
 */
const STRIPE_EVENT_MAP: Record<string, WebhookEvent['type']> = {
  'customer.subscription.created': 'subscription.created',
  'customer.subscription.updated': 'subscription.updated',
  'customer.subscription.deleted': 'subscription.canceled',
  'invoice.payment_succeeded': 'payment.succeeded',
  'invoice.payment_failed': 'payment.failed',
  'checkout.session.completed': 'checkout.completed',
}

const LEMONSQUEEZY_EVENT_MAP: Record<string, WebhookEvent['type']> = {
  subscription_created: 'subscription.created',
  subscription_updated: 'subscription.updated',
  subscription_cancelled: 'subscription.canceled',
  subscription_expired: 'subscription.canceled',
  order_created: 'payment.succeeded',
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const headerList = await headers()

    const adapter = getPaymentAdapter()
    const provider = adapter.provider

    // 1. Verify signature based on active provider
    let signature = ''

    switch (provider) {
      case 'stripe':
        signature = headerList.get('stripe-signature') || ''
        break
      case 'polar':
        signature = headerList.get('polar-webhook-signature') || ''
        break
      case 'lemonsqueezy':
        signature = headerList.get('x-signature') || ''
        break
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = await adapter.validateWebhook(rawBody, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Parse event
    let event: WebhookEvent

    try {
      const parsedBody = JSON.parse(rawBody)

      let rawType: string | undefined

      if (provider === 'stripe') {
        rawType = parsedBody.type
      } else if (provider === 'polar') {
        rawType = parsedBody.type
      } else if (provider === 'lemonsqueezy') {
        rawType = parsedBody.meta?.event_name
      }

      if (!rawType) {
        return NextResponse.json({ processed: true })
      }

      // Map provider-specific event types to canonical types
      let type: WebhookEvent['type']
      if (provider === 'stripe' && STRIPE_EVENT_MAP[rawType]) {
        type = STRIPE_EVENT_MAP[rawType]
      } else if (provider === 'lemonsqueezy' && LEMONSQUEEZY_EVENT_MAP[rawType]) {
        type = LEMONSQUEEZY_EVENT_MAP[rawType]
      } else {
        type = rawType as WebhookEvent['type']
      }

      event = {
        type,
        provider,
        data:
          provider === 'lemonsqueezy'
            ? parsedBody
            : parsedBody.data?.object || parsedBody.data || parsedBody,
        rawEvent: parsedBody,
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // 3. Process event via adapter
    const result = await adapter.processWebhook(event)

    if (result.error) {
      // Log but return 200 to prevent provider from retrying indefinitely
      log.error('Webhook processing error', { error: result.error })
      return NextResponse.json({ received: true, error: result.error })
    }

    // 4. Update database in a transaction for atomicity
    if (result.processed) {
      await db.transaction(async (tx) => {
        // Handle customer updates
        if (result.customer) {
          const existingCustomer = await tx.query.customer.findFirst({
            where: and(
              eq(customer.provider, result.customer.provider),
              eq(customer.providerCustomerId, result.customer.providerCustomerId)
            ),
          })

          if (existingCustomer) {
            await tx
              .update(customer)
              .set({
                email: result.customer.email,
                updatedAt: new Date(),
              })
              .where(eq(customer.id, existingCustomer.id))
          } else if (result.customer.userId) {
            await tx.insert(customer).values({
              id: result.customer.id,
              userId: result.customer.userId,
              provider: result.customer.provider,
              providerCustomerId: result.customer.providerCustomerId,
              email: result.customer.email,
            })
          }
        }

        // Handle subscription updates
        if (result.subscription) {
          const existingSub = await tx.query.subscription.findFirst({
            where: and(
              eq(subscription.provider, result.subscription.provider),
              eq(
                subscription.providerSubscriptionId,
                result.subscription.providerSubscriptionId
              )
            ),
          })

          let dbCustomerId = result.subscription.customerId
          if (!dbCustomerId && existingSub) {
            dbCustomerId = existingSub.customerId || undefined
          }

          if (!dbCustomerId && result.customer?.providerCustomerId) {
            const linkedCustomer = await tx.query.customer.findFirst({
              where: and(
                eq(customer.provider, result.customer.provider),
                eq(customer.providerCustomerId, result.customer.providerCustomerId)
              ),
            })
            dbCustomerId = linkedCustomer?.id
          }

          if (existingSub) {
            await tx
              .update(subscription)
              .set({
                status: result.subscription.status,
                plan: result.subscription.plan,
                interval: result.subscription.interval,
                amount: result.subscription.amount ? result.subscription.amount.toString() : null,
                currency: result.subscription.currency,
                currentPeriodStart: result.subscription.currentPeriodStart,
                currentPeriodEnd: result.subscription.currentPeriodEnd,
                cancelAtPeriodEnd: result.subscription.cancelAtPeriodEnd,
                canceledAt: result.subscription.canceledAt,
                trialStart: result.subscription.trialStart,
                trialEnd: result.subscription.trialEnd,
                updatedAt: new Date(),
              })
              .where(eq(subscription.id, existingSub.id))
          } else if (result.subscription.userId) {
            await tx.insert(subscription).values({
              id: result.subscription.id,
              userId: result.subscription.userId,
              customerId: dbCustomerId,
              provider: result.subscription.provider,
              providerSubscriptionId: result.subscription.providerSubscriptionId,
              status: result.subscription.status,
              plan: result.subscription.plan,
              interval: result.subscription.interval,
              amount: result.subscription.amount ? result.subscription.amount.toString() : null,
              currency: result.subscription.currency,
              currentPeriodStart: result.subscription.currentPeriodStart,
              currentPeriodEnd: result.subscription.currentPeriodEnd,
              cancelAtPeriodEnd: result.subscription.cancelAtPeriodEnd,
              canceledAt: result.subscription.canceledAt,
              trialStart: result.subscription.trialStart,
              trialEnd: result.subscription.trialEnd,
            })
          }
        }

        // Handle payment updates
        if (result.payment) {
          const existingPayment = await tx.query.payment.findFirst({
            where: and(
              eq(payment.provider, result.payment.provider),
              eq(payment.providerPaymentId, result.payment.providerPaymentId)
            ),
          })

          const dbCustomerId = result.payment.customerId
          const dbSubscriptionId = result.payment.subscriptionId

          if (existingPayment) {
            await tx
              .update(payment)
              .set({
                status: result.payment.status,
                updatedAt: new Date(),
              })
              .where(eq(payment.id, existingPayment.id))
          } else if (result.payment.userId) {
            await tx.insert(payment).values({
              id: result.payment.id,
              userId: result.payment.userId,
              customerId: dbCustomerId,
              subscriptionId: dbSubscriptionId,
              provider: result.payment.provider,
              providerPaymentId: result.payment.providerPaymentId,
              type: result.payment.type,
              status: result.payment.status,
              amount: result.payment.amount.toString(),
              currency: result.payment.currency,
              description: result.payment.description,
            })
          }
        }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error('Webhook handler error', { error })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
