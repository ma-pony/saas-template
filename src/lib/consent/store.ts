'use client'

import { create } from 'zustand'

const CONSENT_COOKIE_NAME = 'consent_preferences'

export interface ConsentCategories {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'partial'

export interface ConsentStore {
  status: ConsentStatus
  categories: ConsentCategories
  setConsent(categories: Partial<Omit<ConsentCategories, 'necessary'>>): void
  acceptAll(): void
  rejectAll(): void
  loadFromCookie(): void
}

function readConsentCookie(): Partial<ConsentCategories & { updatedAt: string }> | null {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`))
    if (!match) return null
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

function writeConsentCookie(categories: ConsentCategories): void {
  if (typeof document === 'undefined') return
  try {
    const value = encodeURIComponent(
      JSON.stringify({ ...categories, updatedAt: new Date().toISOString() })
    )
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; max-age=31536000; path=/; SameSite=Lax`
  } catch {
    // Silently fail - cookie write errors should not affect page rendering
  }
}

export const useConsentStore = create<ConsentStore>((set, get) => ({
  status: 'pending',
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
  },

  setConsent(updates) {
    const currentCategories = get().categories
    const newCategories: ConsentCategories = {
      necessary: true,
      analytics: updates.analytics ?? currentCategories.analytics,
      marketing: updates.marketing ?? currentCategories.marketing,
    }

    const status: ConsentStatus =
      newCategories.analytics && newCategories.marketing
        ? 'accepted'
        : !newCategories.analytics && !newCategories.marketing
          ? 'rejected'
          : 'partial'

    writeConsentCookie(newCategories)
    set({ categories: newCategories, status })
  },

  acceptAll() {
    const categories: ConsentCategories = { necessary: true, analytics: true, marketing: true }
    writeConsentCookie(categories)
    set({ categories, status: 'accepted' })
  },

  rejectAll() {
    const categories: ConsentCategories = { necessary: true, analytics: false, marketing: false }
    writeConsentCookie(categories)
    set({ categories, status: 'rejected' })
  },

  loadFromCookie() {
    const saved = readConsentCookie()
    if (!saved) return

    const categories: ConsentCategories = {
      necessary: true,
      analytics: Boolean(saved.analytics),
      marketing: Boolean(saved.marketing),
    }

    const status: ConsentStatus =
      categories.analytics && categories.marketing
        ? 'accepted'
        : !categories.analytics && !categories.marketing
          ? 'rejected'
          : 'partial'

    set({ categories, status })
  },
}))
