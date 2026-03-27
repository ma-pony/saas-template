'use client'

import { useState } from 'react'
import { ArrowRight, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface RequestResetFormProps {
  email: string
  onEmailChange: (email: string) => void
  onSubmit: (email: string) => Promise<void>
  isSubmitting: boolean
  statusType: 'success' | 'error' | null
  statusMessage: string
  className?: string
}

export function RequestResetForm({
  email,
  onEmailChange,
  onSubmit,
  isSubmitting,
  statusType,
  statusMessage,
  className,
}: RequestResetFormProps) {
  const t = useTranslations()
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email)
  }

  return (
    <form onSubmit={handleSubmit} className={cn(`space-y-8`, className)}>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='reset-email'>{t('common.label.email')}</Label>
          </div>
          <Input
            id='reset-email'
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t('common.placeholder.email')}
            size='lg'
            type='email'
            disabled={isSubmitting}
            required
            className='transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100'
          />
          <p className='text-muted-foreground text-sm'>
            {t('auth.resetPassword.helperText')}
          </p>
        </div>

        {/* Status message display */}
        {statusType && statusMessage && (
          <div
            className={cn('text-xs', statusType === 'success' ? 'text-[#4CAF50]' : 'text-red-400')}
          >
            <p>{statusMessage}</p>
          </div>
        )}
      </div>

      <Button
        type='submit'
        disabled={isSubmitting}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        className='group inline-flex w-full items-center justify-center gap-2 rounded-[10px] py-[6px] pr-[10px] pl-[12px] text-[15px] text-white shadow-[inset_0_2px_4px_0_#9B77FF] transition-all'
      >
        <span className='flex items-center gap-1'>
          {isSubmitting ? t('common.button.sending') : t('common.button.sendResetLink')}
          <span className='inline-flex transition-transform duration-200 group-hover:translate-x-0.5'>
            {isButtonHovered ? (
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            ) : (
              <ChevronRight className='h-4 w-4' aria-hidden='true' />
            )}
          </span>
        </span>
      </Button>
    </form>
  )
}

interface SetNewPasswordFormProps {
  token: string | null
  onSubmit: (password: string) => Promise<void>
  isSubmitting: boolean
  statusType: 'success' | 'error' | null
  statusMessage: string
  className?: string
}

export function SetNewPasswordForm({
  token,
  onSubmit,
  isSubmitting,
  statusType,
  statusMessage,
  className,
}: SetNewPasswordFormProps) {
  const t = useTranslations()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      setValidationMessage(t('common.error.passwordMinLength'))
      return
    }

    if (password.length > 100) {
      setValidationMessage(t('auth.resetPassword.passwordMaxLength'))
      return
    }

    if (!/[A-Z]/.test(password)) {
      setValidationMessage(t('auth.resetPassword.passwordUppercase'))
      return
    }

    if (!/[a-z]/.test(password)) {
      setValidationMessage(t('auth.resetPassword.passwordLowercase'))
      return
    }

    if (!/[0-9]/.test(password)) {
      setValidationMessage(t('auth.resetPassword.passwordNumber'))
      return
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setValidationMessage(t('auth.resetPassword.passwordSpecialChar'))
      return
    }

    if (password !== confirmPassword) {
      setValidationMessage(t('auth.resetPassword.passwordsDoNotMatch'))
      return
    }

    setValidationMessage('')
    onSubmit(password)
  }

  return (
    <form onSubmit={handleSubmit} className={cn(`space-y-8`, className)}>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>{t('auth.resetPassword.newPassword')}</Label>
          </div>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoCapitalize='none'
              autoComplete='new-password'
              autoCorrect='off'
              disabled={isSubmitting || !token}
              value={password}
              size='lg'
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.resetPassword.enterNewPassword')}
              className={cn(
                'pr-10 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                validationMessage &&
                  'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
              )}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 transition hover:text-gray-700'
              aria-label={showPassword ? t('common.label.hidePassword') : t('common.label.showPassword')}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='confirmPassword'>{t('auth.resetPassword.confirmPassword')}</Label>
          </div>
          <div className='relative'>
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              autoCapitalize='none'
              autoComplete='new-password'
              autoCorrect='off'
              disabled={isSubmitting || !token}
              value={confirmPassword}
              size='lg'
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.resetPassword.confirmNewPassword')}
              className={cn(
                'pr-10 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                validationMessage &&
                  'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
              )}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 transition hover:text-gray-700'
              aria-label={showConfirmPassword ? t('common.label.hidePassword') : t('common.label.showPassword')}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {validationMessage && (
          <div className='mt-1 space-y-1 text-red-400 text-xs'>
            <p>{validationMessage}</p>
          </div>
        )}

        {statusType && statusMessage && (
          <div
            className={cn(
              'mt-1 space-y-1 text-xs',
              statusType === 'success' ? 'text-[#4CAF50]' : 'text-red-400'
            )}
          >
            <p>{statusMessage}</p>
          </div>
        )}
      </div>

      <Button
        disabled={isSubmitting || !token}
        type='submit'
        size='lg'
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        className='group inline-flex w-full items-center justify-center gap-2 rounded-[10px] py-[6px] pr-[10px] pl-[12px] text-[15px] text-white shadow-[inset_0_2px_4px_0_#9B77FF] transition-all'
      >
        <span className='flex items-center gap-1'>
          {isSubmitting ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submitButton')}
          <span className='inline-flex transition-transform duration-200 group-hover:translate-x-0.5'>
            {isButtonHovered ? (
              <ArrowRight className='h-4 w-4' aria-hidden='true' />
            ) : (
              <ChevronRight className='h-4 w-4' aria-hidden='true' />
            )}
          </span>
        </span>
      </Button>
    </form>
  )
}
