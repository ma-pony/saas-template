'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'
import { useVerification } from './use-verification'

interface VerifyContentProps {
  isProduction: boolean
}

function VerificationForm({ isProduction }: { isProduction: boolean }) {
  const t = useTranslations()
  const {
    otp,
    email,
    isLoading,
    isVerified,
    isInvalidOtp,
    errorMessage,
    isOtpComplete,
    verifyCode,
    resendCode,
    handleOtpChange,
  } = useVerification({ isProduction })

  const [countdown, setCountdown] = useState(0)
  const [isResendDisabled, setIsResendDisabled] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0 && isResendDisabled) {
      setIsResendDisabled(false)
    }
  }, [countdown, isResendDisabled])

  const router = useRouter()

  const handleResend = () => {
    resendCode()
    setIsResendDisabled(true)
    setCountdown(30)
  }

  const otpSlotClass = (isInvalid: boolean) =>
    cn(
      'h-12 w-12 rounded-[10px] border bg-white text-center font-medium text-lg shadow-sm transition-all duration-200',
      'border-gray-300 hover:border-gray-400',
      'focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100',
      isInvalid && 'border-red-500 focus:border-red-500 focus:ring-red-100'
    )

  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className='font-medium text-[32px] text-black tracking-tight'>
          {isVerified ? t('auth.verify.titleVerified') : t('auth.verify.title')}
        </h1>
        <p className='font-[380] text-[16px] text-muted-foreground'>
          {isVerified
            ? t('auth.verify.subtitleVerified')
            : t('auth.verify.subtitle', { email: email || t('common.label.email').toLowerCase() })}
        </p>
      </div>

      {!isVerified && (
        <div className='mt-8 space-y-8'>
          <div className='space-y-6'>
            <p className='text-center text-muted-foreground text-sm'>
              {t('auth.verify.enterCode')}
            </p>

            <div className='flex justify-center'>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
                className={cn('gap-2', isInvalidOtp && 'border-red-500')}
              >
                <InputOTPGroup className='gap-2 [&>div]:rounded-[10px]'>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className={otpSlotClass(isInvalidOtp)}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className='mt-1 space-y-1 text-center text-red-400 text-xs'>
                <p>{errorMessage}</p>
              </div>
            )}
          </div>

          <Button
            onClick={verifyCode}
            className='flex w-full items-center justify-center gap-2 rounded-[10px] py-[6px] pr-[10px] pl-[12px] text-[15px] font-medium text-white shadow-[inset_0_2px_4px_0_#9B77FF] transition-all'
            disabled={!isOtpComplete || isLoading}
          >
            {isLoading ? t('common.button.verifying') : t('common.button.verifyEmail')}
          </Button>

          <div className='text-center'>
            <p className='text-muted-foreground text-sm'>
              {t('auth.verify.didntReceive')}{' '}
              {countdown > 0 ? (
                <span>
                  {t('auth.verify.resendIn')} <span className='font-medium text-foreground'>{t('auth.verify.seconds', { count: countdown })}</span>
                </span>
              ) : (
                <button
                  className='font-medium text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'
                  onClick={handleResend}
                  disabled={isLoading || isResendDisabled}
                >
                  {t('common.button.resend')}
                </button>
              )}
            </p>
          </div>

          <div className='text-center font-light text-[14px]'>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('verificationEmail')
                  sessionStorage.removeItem('inviteRedirectUrl')
                  sessionStorage.removeItem('isInviteFlow')
                }
                router.push('/register')
              }}
              className='font-medium text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'
            >
              {t('common.button.backToSignup')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function VerificationFormFallback() {
  return (
    <div className='text-center'>
      <div className='animate-pulse'>
        <div className='mx-auto mb-4 h-8 w-48 rounded bg-gray-200' />
        <div className='mx-auto h-4 w-64 rounded bg-gray-200' />
      </div>
    </div>
  )
}

export function VerifyContent({ isProduction }: VerifyContentProps) {
  return (
    <Suspense fallback={<VerificationFormFallback />}>
      <VerificationForm isProduction={isProduction} />
    </Suspense>
  )
}
