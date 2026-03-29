/**
 * Payment Hooks
 *
 * Client-side hooks for interacting with the payment system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SubscriptionData, CheckoutResult, PortalResult } from './types'
import type { PlanName } from '@/config/payments'
import type { ApiErrorBody } from '@/lib/errors'

async function throwIfError(res: Response): Promise<void> {
  if (res.ok) return
  const body: ApiErrorBody | null = await res.json().catch(() => null)
  throw new Error(body?.message || `Request failed (${res.status})`)
}

export function useSubscription() {
  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/payments/subscription')
      await throwIfError(res)
      const data = await res.json()
      return data.subscription as SubscriptionData | null
    },
  })

  return { subscription, isLoading, error: error as Error | null, refresh: refetch }
}

interface CheckoutOptions {
  plan: PlanName
  successUrl?: string
  cancelUrl?: string
}

export function useCheckout() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (options: CheckoutOptions) => {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })
      await throwIfError(res)
      const data: CheckoutResult = await res.json()
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  return {
    checkout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function usePortal() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (returnUrl?: string) => {
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl }),
      })
      await throwIfError(res)
      const data: PortalResult = await res.json()
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  return {
    openPortal: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
