'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const log = createLogger({ module: 'auth' })
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { SetNewPasswordForm } from '@/app/(auth)/reset-password/reset-password-form'

function ResetPasswordContent() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({
    type: null,
    text: '',
  })

  useEffect(() => {
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: t('auth.resetPassword.invalidToken'),
      })
    }
  }, [token, t])

  const handleResetPassword = async (password: string) => {
    try {
      setIsSubmitting(true)
      setStatusMessage({ type: null, text: '' })

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('auth.resetPassword.failed'))
      }

      setStatusMessage({
        type: 'success',
        text: t('auth.resetPassword.success'),
      })

      setTimeout(() => {
        router.push('/login?resetSuccess=true')
      }, 1500)
    } catch (error) {
      log.error('Error resetting password', { error })
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('auth.resetPassword.failed'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className='font-medium text-[32px] text-black tracking-tight'>{t('auth.resetPassword.heading')}</h1>
        <p className='font-[380] text-[16px] text-muted-foreground'>
          {t('auth.resetPassword.subtitle')}
        </p>
      </div>

      <div className='mt-8'>
        <SetNewPasswordForm
          token={token}
          onSubmit={handleResetPassword}
          isSubmitting={isSubmitting}
          statusType={statusMessage.type}
          statusMessage={statusMessage.text}
        />
      </div>

      <div className='pt-6 text-center font-light text-[14px]'>
        <Link href='/login' className='font-medium text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'>
          {t('auth.resetPassword.backToLogin')}
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations()
  return (
    <Suspense
      fallback={<div className='flex h-screen items-center justify-center'>{t('common.label.loading')}</div>}
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
