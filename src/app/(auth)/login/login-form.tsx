'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { client } from '@/lib/auth/auth-client'
import { cn, getBaseUrl } from '@/lib/utils'
import { quickValidateEmail } from '@/lib/messaging/email/validation'
import { SocialLoginButtons } from '../components/social-login-buttons'

const validateCallbackUrl = (url: string): boolean => {
  try {
    if (url.startsWith('/')) {
      return true
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    if (url.startsWith(currentOrigin)) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error validating callback URL:', { error, url })
    return false
  }
}

export default function LoginPage({
  githubAvailable,
  googleAvailable,
  facebookAvailable,
  microsoftAvailable,
  isProduction,
}: {
  githubAvailable: boolean
  googleAvailable: boolean
  facebookAvailable: boolean
  microsoftAvailable: boolean
  isProduction: boolean
}) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showValidationError, setShowValidationError] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isSubmittingReset, setIsSubmittingReset] = useState(false)
  const [isResetButtonHovered, setIsResetButtonHovered] = useState(false)
  const [resetStatus, setResetStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [email, setEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [showEmailValidationError, setShowEmailValidationError] = useState(false)

  const validateEmailField = (emailValue: string): string[] => {
    const errors: string[] = []
    if (!emailValue || !emailValue.trim()) {
      errors.push(t('common.error.emailRequired'))
      return errors
    }
    const validation = quickValidateEmail(emailValue.trim().toLowerCase())
    if (!validation.isValid) {
      errors.push(validation.reason || t('common.error.emailInvalid'))
    }
    return errors
  }

  const validatePassword = (passwordValue: string): string[] => {
    const errors: string[] = []
    if (!passwordValue || typeof passwordValue !== 'string') {
      errors.push(t('common.error.passwordRequired'))
      return errors
    }
    if (passwordValue.trim().length === 0) {
      errors.push(t('common.error.passwordEmpty'))
      return errors
    }
    return errors
  }

  useEffect(() => {
    if (!searchParams) {
      return
    }

    const callback = searchParams.get('callbackUrl')
    if (!callback) {
      return
    }

    if (validateCallbackUrl(callback)) {
      setCallbackUrl(callback)
    } else {
      console.warn('Invalid callback URL detected and blocked:', { url: callback })
    }
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && forgotPasswordOpen) {
        handleForgotPassword()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [forgotPasswordEmail, forgotPasswordOpen])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    const errors = validateEmailField(newEmail)
    setEmailErrors(errors)
    setShowEmailValidationError(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    const errors = validatePassword(newPassword)
    setPasswordErrors(errors)
    setShowValidationError(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailRaw = formData.get('email') as string
    const emailVal = emailRaw.trim().toLowerCase()

    const emailValidationErrors = validateEmailField(emailVal)
    setEmailErrors(emailValidationErrors)
    setShowEmailValidationError(emailValidationErrors.length > 0)

    const passwordValidationErrors = validatePassword(password)
    setPasswordErrors(passwordValidationErrors)
    setShowValidationError(passwordValidationErrors.length > 0)

    if (emailValidationErrors.length > 0 || passwordValidationErrors.length > 0) {
      setIsLoading(false)
      return
    }

    try {
      const safeCallbackUrl = validateCallbackUrl(callbackUrl) ? callbackUrl : '/dashboard'

      const result = await client.signIn.email(
        {
          email: emailVal,
          password,
          callbackURL: safeCallbackUrl,
        },
        {
          onError: (ctx) => {
            console.error('Login error:', ctx.error)
            const errorMessage: string[] = [t('common.error.invalidCredentials')]

            if (ctx.error.code?.includes('EMAIL_NOT_VERIFIED')) {
              return
            }
            if (
              ctx.error.code?.includes('BAD_REQUEST') ||
              ctx.error.message?.includes('Email and password sign in is not enabled')
            ) {
              errorMessage.push(t('common.error.emailSignInDisabled'))
            } else if (
              ctx.error.code?.includes('INVALID_CREDENTIALS') ||
              ctx.error.message?.includes('invalid password')
            ) {
              errorMessage.push(t('common.error.invalidEmailOrPassword'))
            } else if (
              ctx.error.code?.includes('USER_NOT_FOUND') ||
              ctx.error.message?.includes('not found')
            ) {
              errorMessage.push(t('common.error.noAccountFound'))
            } else if (ctx.error.code?.includes('MISSING_CREDENTIALS')) {
              errorMessage.push(t('common.error.enterEmailAndPassword'))
            } else if (ctx.error.code?.includes('EMAIL_PASSWORD_DISABLED')) {
              errorMessage.push(t('common.error.emailPasswordDisabled'))
            } else if (ctx.error.code?.includes('FAILED_TO_CREATE_SESSION')) {
              errorMessage.push(t('common.error.failedToCreateSession'))
            } else if (ctx.error.code?.includes('too many attempts')) {
              errorMessage.push(t('common.error.tooManyAttempts'))
            } else if (ctx.error.code?.includes('account locked')) {
              errorMessage.push(t('common.error.accountLocked'))
            } else if (ctx.error.code?.includes('network')) {
              errorMessage.push(t('common.error.networkError'))
            } else if (ctx.error.message?.includes('rate limit')) {
              errorMessage.push(t('common.error.rateLimitExceeded'))
            }

            setPasswordErrors(errorMessage)
            setShowValidationError(true)
          },
        }
      )

      if (!result || result.error) {
        setIsLoading(false)
        return
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string; code?: string }
      if (errObj.message?.includes('not verified') || errObj.code?.includes('EMAIL_NOT_VERIFIED')) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('verificationEmail', emailVal)
        }
        router.push('/verify')
        return
      }

      console.error('Uncaught login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setResetStatus({
        type: 'error',
        message: t('auth.login.resetPassword.resetStatus.emailRequired'),
      })
      return
    }

    const emailValidation = quickValidateEmail(forgotPasswordEmail.trim().toLowerCase())
    if (!emailValidation.isValid) {
      setResetStatus({
        type: 'error',
        message: t('auth.login.resetPassword.resetStatus.emailInvalid'),
      })
      return
    }

    try {
      setIsSubmittingReset(true)
      setResetStatus({ type: null, message: '' })

      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          redirectTo: `${getBaseUrl()}/reset-password`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMsg = errorData.message || t('common.error.networkError')

        if (
          errorMsg.includes('Invalid body parameters') ||
          errorMsg.includes('invalid email')
        ) {
          errorMsg = t('auth.login.resetPassword.resetStatus.emailInvalid')
        } else if (errorMsg.includes('Email is required')) {
          errorMsg = t('auth.login.resetPassword.resetStatus.emailRequired')
        } else if (
          errorMsg.includes('user not found') ||
          errorMsg.includes('User not found')
        ) {
          errorMsg = t('auth.login.resetPassword.resetStatus.noAccountFound')
        }

        throw new Error(errorMsg)
      }

      setResetStatus({
        type: 'success',
        message: t('auth.login.resetPassword.resetStatus.success'),
      })

      setTimeout(() => {
        setForgotPasswordOpen(false)
        setResetStatus({ type: null, message: '' })
      }, 2000)
    } catch (error) {
      console.error('Error requesting password reset:', { error })
      setResetStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('common.error.networkError'),
      })
    } finally {
      setIsSubmittingReset(false)
    }
  }

  const hasSocial = githubAvailable || googleAvailable
  const showDivider = hasSocial

  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className='font-medium text-[32px] text-black tracking-tight'>{t('auth.login.title')}</h1>
        <p className='font-[380] text-[16px] text-muted-foreground'>{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className={`mt-8 space-y-8`}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='email'>{t('common.label.email')}</Label>
            </div>
            <Input
              id='email'
              name='email'
              placeholder={t('common.placeholder.email')}
              required
              autoCapitalize='none'
              size={'lg'}
              autoComplete='email'
              autoCorrect='off'
              value={email}
              onChange={handleEmailChange}
              className={cn(
                'transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                showEmailValidationError &&
                  emailErrors.length > 0 &&
                  'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
              )}
            />
            {showEmailValidationError && emailErrors.length > 0 && (
              <div className='mt-1 space-y-1 text-red-400 text-xs'>
                {emailErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>{t('common.label.password')}</Label>
              <button
                type='button'
                onClick={() => setForgotPasswordOpen(true)}
                className='font-medium text-muted-foreground text-xs transition hover:text-foreground'
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>
            <div className='relative'>
              <Input
                id='password'
                name='password'
                required
                type={showPassword ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='current-password'
                autoCorrect='off'
                placeholder={t('common.placeholder.password')}
                value={password}
                size={'lg'}
                onChange={handlePasswordChange}
                className={cn(
                  'pr-10 transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                  showValidationError &&
                    passwordErrors.length > 0 &&
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
            {showValidationError && passwordErrors.length > 0 && (
              <div className='mt-1 space-y-1 text-red-400 text-xs'>
                {passwordErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type='submit'
          size='lg'
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className='group inline-flex w-full items-center justify-center gap-2 rounded-[10px] py-[6px] pr-[10px] pl-[12px] text-[15px] text-white shadow-[inset_0_2px_4px_0_#9B77FF] transition-all'
          disabled={isLoading}
        >
          <span className='flex items-center gap-1'>
            {isLoading ? t('common.button.signingIn') : t('common.button.signIn')}
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

      {/* Divider - show when we have multiple auth methods */}
      {showDivider && (
        <div className='relative my-6 font-light'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-200' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white px-4 font-[340] text-muted-foreground'>{t('common.label.orContinueWith')}</span>
          </div>
        </div>
      )}

      {hasSocial && (
        <div>
          <SocialLoginButtons
            googleAvailable={googleAvailable}
            githubAvailable={githubAvailable}
            facebookAvailable={facebookAvailable}
            microsoftAvailable={microsoftAvailable}
            isProduction={isProduction}
            callbackURL={callbackUrl}
          />
        </div>
      )}

      <div className='pt-6 text-center text-[14px] font-light'>
        <span className='font-normal'>{t('auth.login.noAccount')} </span>
        <Link
          href={`/register?callbackUrl=${callbackUrl}`}
          className='font-medium text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'
        >
          {t('auth.login.signUpLink')}
        </Link>
      </div>

      <div className='absolute inset-x-0 bottom-0 px-8 pb-8 text-center text-[13px] font-[340] leading-relaxed text-muted-foreground sm:px-8 md:px-[44px]'>
        {t('auth.login.agreeTerms')}{' '}
        <Link
          href='/terms'
          target='_blank'
          rel='noopener noreferrer'
          className='text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'
        >
          {t('auth.login.termsLink')}
        </Link>{' '}
        {t('auth.login.andText')}{' '}
        <Link
          href='/privacy'
          target='_blank'
          rel='noopener noreferrer'
          className='text-(--brand-accent-hex) underline-offset-4 transition hover:text-(--brand-accent-hover-hex) hover:underline'
        >
          {t('auth.login.privacyLink')}
        </Link>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold tracking-tight text-black'>
              {t('auth.login.resetPassword.title')}
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              {t('auth.login.resetPassword.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='reset-email'>{t('common.label.email')}</Label>
              </div>
              <Input
                id='reset-email'
                value={forgotPasswordEmail}
                onChange={(event) => setForgotPasswordEmail(event.target.value)}
                placeholder={t('common.placeholder.email')}
                size={'lg'}
                type='email'
                className={cn(
                  'transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                  resetStatus.type === 'error' &&
                    'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
                )}
              />
              {resetStatus.type === 'error' && (
                <div className='mt-1 space-y-1 text-xs text-red-400'>
                  <p>{resetStatus.message}</p>
                </div>
              )}
            </div>
            {resetStatus.type === 'success' && (
              <div className='mt-1 space-y-1 text-xs text-[#4CAF50]'>
                <p>{resetStatus.message}</p>
              </div>
            )}
          </DialogPanel>
          <DialogFooter>
            <Button
              type='button'
              onClick={handleForgotPassword}
              onMouseEnter={() => setIsResetButtonHovered(true)}
              onMouseLeave={() => setIsResetButtonHovered(false)}
              className='group inline-flex items-center justify-center gap-2 rounded-[10px] border border-blue-400 bg-blue-400 px-4 py-2 text-[15px] text-white shadow-[inset_0_2px_4px_0_#9B77FF] transition-all'
              disabled={isSubmittingReset}
            >
              <span className='flex items-center gap-1'>
                {isSubmittingReset ? t('common.button.sending') : t('common.button.sendResetLink')}
                <span className='inline-flex transition-transform duration-200 group-hover:translate-x-0.5'>
                  {isResetButtonHovered ? (
                    <ArrowRight className='h-4 w-4' aria-hidden='true' />
                  ) : (
                    <ChevronRight className='h-4 w-4' aria-hidden='true' />
                  )}
                </span>
              </span>
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  )
}
