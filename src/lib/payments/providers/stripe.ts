/**
 * Stripe Payment Adapter
 *
 * Implements the PaymentAdapter interface for Stripe integration.
 * Handles checkout sessions, customers, subscriptions, and webhooks.
 */

import Stripe from 'stripe'
import type {
  PaymentAdapter,
  CheckoutOptions,
  CheckoutResult,
  CustomerData,
  SubscriptionData,
  PortalResult,
  WebhookEvent,
  WebhookResult,
} from '../types'
import type { PaymentProvider, PlanName } from '@/config/payments'
import { getPriceConfig, paymentConfig, getRegionalPaymentMethods } from '@/config/payments'
import { env } from '@/config/env'

export class StripeAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'stripe'
  private stripe: Stripe

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for Stripe adapter')
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY)
  }

  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const { plan, successUrl, cancelUrl, trialDays, userId, email, country } = options

    // Get price configuration for this plan
    const prices = getPriceConfig(plan, 'stripe')
    if (prices.length === 0) {
      throw new Error(`No Stripe prices configured for plan: ${plan}`)
    }

    // Use the first price (monthly) or find monthly price
    const price = prices.find((p: any) => p.interval === 'month') || prices[0]

    if (!price.productId) {
      throw new Error(`No product ID configured for plan ${plan}`)
    }

    // Create or get customer
    const customer = await this.createCustomer(userId, email)

    // Build payment method types: start with card, add regional methods
    const basePaymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card']
    const regionalMethods = getRegionalPaymentMethods(country)

    // Map regional method strings to Stripe's supported payment method types
    const stripePaymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
      ...basePaymentMethods,
    ]

    for (const method of regionalMethods) {
      try {
        stripePaymentMethods.push(method as Stripe.Checkout.SessionCreateParams.PaymentMethodType)
      } catch {
        // Skip unsupported methods silently
      }
    }

    // Build checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.providerCustomerId,
      payment_method_types: stripePaymentMethods,
      line_items: [
        {
          price: price.productId,
          quantity: 1,
        },
      ],
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      success_url: successUrl || paymentConfig.providers.successUrl,
      cancel_url: cancelUrl || paymentConfig.providers.cancelUrl,
      metadata: {
        userId,
        plan,
        provider: 'stripe',
        ...(country && { country }),
      },
      allow_promotion_codes: true,
    }

    // Add trial period if specified
    if (trialDays && trialDays > 0 && price.type === 'recurring') {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          userId,
          plan,
          provider: 'stripe',
        },
      }
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams)

    if (!session.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return {
      url: session.url,
      sessionId: session.id,
    }
  }

  async createCustomer(userId: string, email?: string): Promise<CustomerData> {
    // Check if customer already exists (you would typically query your database here)
    // For now, create a new customer or use existing one based on email

    let customer: Stripe.Customer

    if (email) {
      // Try to find existing customer by email + userId metadata match
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 10,
      })

      // Only reuse a customer if it belongs to the same userId
      const matchingCustomer = existingCustomers.data.find(
        (c) => c.metadata?.userId === userId,
      )

      if (matchingCustomer) {
        customer = matchingCustomer
      } else {
        // Create new customer
        customer = await this.stripe.customers.create({
          email,
          metadata: {
            userId,
            provider: 'stripe',
          },
        })
      }
    } else {
      // Create customer without email
      customer = await this.stripe.customers.create({
        metadata: {
          userId,
          provider: 'stripe',
        },
      })
    }

    return {
      id: `stripe_${customer.id}`,
      providerCustomerId: customer.id,
      email: customer.email || undefined,
      userId,
      provider: 'stripe',
    }
  }

  async getSubscription(providerSubscriptionId: string): Promise<SubscriptionData | null> {
    try {
      const subscription = (await this.stripe.subscriptions.retrieve(providerSubscriptionId, {
        expand: ['items.data.price'],
      })) as Stripe.Subscription & { items: { data: Array<{ price: Stripe.Price }> } }

      const price = subscription.items.data[0]?.price
      const plan = this.mapPriceToPlan(price?.id)

      return {
        id: `stripe_${subscription.id}`,
        providerSubscriptionId: subscription.id,
        userId: (subscription as any).metadata?.userId || '',
        customerId:
          typeof subscription.customer === 'string' ? `stripe_${subscription.customer}` : undefined,
        status: this.mapStripeStatus(subscription.status),
        plan,
        provider: 'stripe',
        interval:
          price?.recurring?.interval === 'month'
            ? 'month'
            : price?.recurring?.interval === 'year'
              ? 'year'
              : null,
        amount: price?.unit_amount ? price.unit_amount / 100 : null, // Convert cents to dollars
        currency: price?.currency || null,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }
    } catch (error) {
      console.error('Failed to get Stripe subscription:', error)
      return null
    }
  }

  async cancelSubscription(
    providerSubscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<void> {
    if (cancelAtPeriodEnd) {
      await this.stripe.subscriptions.update(providerSubscriptionId, {
        cancel_at_period_end: true,
      })
    } else {
      await this.stripe.subscriptions.cancel(providerSubscriptionId)
    }
  }

  async createPortal(customerId: string, returnUrl?: string): Promise<PortalResult> {
    // Remove the 'stripe_' prefix to get the actual Stripe customer ID
    const stripeCustomerId = customerId.replace('stripe_', '')

    const session = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || paymentConfig.providers.portalReturnUrl,
    })

    return {
      url: session.url,
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      const stripeEvent = event.rawEvent as Stripe.Event

      switch (stripeEvent.type) {
        case 'customer.created':
        case 'customer.updated': {
          const customer = stripeEvent.data.object as Stripe.Customer
          return {
            processed: true,
            customer: {
              id: `stripe_${customer.id}`,
              providerCustomerId: customer.id,
              email: customer.email || undefined,
              userId: customer.metadata.userId || '',
              provider: 'stripe',
            },
          }
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = stripeEvent.data.object as Stripe.Subscription
          const price = (subscription as any).items?.data?.[0]?.price
          const plan = this.mapPriceToPlan(price?.id)

          return {
            processed: true,
            subscription: {
              id: `stripe_${subscription.id}`,
              providerSubscriptionId: subscription.id,
              userId: (subscription as any).metadata?.userId || '',
              customerId:
                typeof subscription.customer === 'string'
                  ? `stripe_${subscription.customer}`
                  : undefined,
              status: this.mapStripeStatus(subscription.status),
              plan,
              provider: 'stripe',
              interval:
                price?.recurring?.interval === 'month'
                  ? 'month'
                  : price?.recurring?.interval === 'year'
                    ? 'year'
                    : null,
              amount: price?.unit_amount ? price.unit_amount / 100 : null,
              currency: price?.currency || null,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000)
                : null,
              trialStart: subscription.trial_start
                ? new Date(subscription.trial_start * 1000)
                : null,
              trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            },
          }
        }

        case 'invoice.payment_succeeded': {
          const invoice = stripeEvent.data.object as Stripe.Invoice
          const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : undefined
          // Resolve userId: check subscription metadata first, then look up customer metadata
          let invoiceUserId = ''
          if (subscriptionId) {
            try {
              const sub = await this.stripe.subscriptions.retrieve(subscriptionId)
              invoiceUserId = sub.metadata?.userId || ''
            } catch {
              // Subscription lookup failed, fall back to customer metadata
            }
          }
          if (!invoiceUserId && typeof invoice.customer === 'string') {
            try {
              const cust = await this.stripe.customers.retrieve(invoice.customer)
              if (cust && !cust.deleted) {
                invoiceUserId = cust.metadata?.userId || ''
              }
            } catch {
              // Customer lookup failed
            }
          }
          if (subscriptionId) {
            return {
              processed: true,
              payment: {
                id: `stripe_${invoice.id}`,
                providerPaymentId: invoice.id,
                userId: invoiceUserId,
                customerId:
                  typeof invoice.customer === 'string' ? `stripe_${invoice.customer}` : undefined,
                subscriptionId: `stripe_${subscriptionId}`,
                type: 'subscription',
                status: 'succeeded',
                amount: invoice.amount_paid / 100,
                currency: invoice.currency,
                description: `Payment for ${invoice.period_end ? new Date(invoice.period_end * 1000).toLocaleDateString() : 'subscription'}`,
                provider: 'stripe',
              },
            }
          }
          break
        }

        case 'invoice.payment_failed': {
          const failedInvoice = stripeEvent.data.object as Stripe.Invoice
          const failedSubId = typeof (failedInvoice as any).subscription === 'string' ? (failedInvoice as any).subscription : undefined
          if (failedSubId) {
            // Update subscription status to past_due
            return {
              processed: true,
              subscription: {
                id: `stripe_${failedSubId}`,
                providerSubscriptionId: failedSubId,
                userId: '',
                status: 'past_due',
                plan: 'free',
                provider: 'stripe',
                interval: null,
                amount: null,
                currency: null,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
                canceledAt: null,
                trialStart: null,
                trialEnd: null,
              },
              payment: {
                id: `stripe_${failedInvoice.id}`,
                providerPaymentId: failedInvoice.id,
                userId: '',
                customerId:
                  typeof failedInvoice.customer === 'string' ? `stripe_${failedInvoice.customer}` : undefined,
                subscriptionId: `stripe_${failedSubId}`,
                type: 'subscription',
                status: 'failed',
                amount: failedInvoice.amount_due / 100,
                currency: failedInvoice.currency,
                description: 'Payment failed',
                provider: 'stripe',
              },
            }
          }
          break
        }

        case 'checkout.session.completed': {
          const session = stripeEvent.data.object as Stripe.Checkout.Session
          if (session.mode === 'subscription' && session.subscription) {
            // This will be handled by the subscription events
            return { processed: true }
          }
          break
        }
      }

      return { processed: true }
    } catch (error) {
      console.error('Stripe webhook processing error:', error)
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async validateWebhook(rawBody: string, signature: string): Promise<boolean> {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is required for webhook validation')
      return false
    }

    try {
      this.stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
      return true
    } catch (error) {
      console.error('Stripe webhook signature validation failed:', error)
      return false
    }
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionData['status'] {
    switch (status) {
      case 'active':
      case 'trialing':
        return status
      case 'canceled':
        return 'canceled'
      case 'past_due':
        return 'past_due'
      case 'incomplete':
      case 'incomplete_expired':
        return 'incomplete'
      case 'paused':
        return 'paused'
      default:
        return 'incomplete'
    }
  }

  private mapPriceToPlan(priceId?: string): PlanName {
    // This is a simplified mapping - in production you'd query your database
    // or maintain a mapping of price IDs to plans
    if (!priceId) return 'free'

    // Check against configured prices
    for (const [planName, plan] of Object.entries(paymentConfig.plans)) {
      const stripePrices = (plan.prices as any).stripe
      if (stripePrices?.some((price: any) => price.productId === priceId)) {
        return planName as PlanName
      }
    }

    return 'free' // fallback
  }
}
