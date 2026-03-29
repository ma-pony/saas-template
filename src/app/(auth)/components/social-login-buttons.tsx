'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { GitHubIcon, GoogleIcon, MicrosoftIcon, FacebookIcon } from './icons'
import { Button } from '@/components/ui/button'
import { client } from '@/lib/auth/auth-client'
import { localePath } from './use-locale-path'

interface SocialLoginButtonsProps {
  githubAvailable: boolean
  googleAvailable: boolean
  microsoftAvailable: boolean
  facebookAvailable: boolean
  callbackURL?: string
  isProduction?: boolean
  children?: ReactNode
}

export function SocialLoginButtons({
  githubAvailable,
  googleAvailable,
  microsoftAvailable,
  facebookAvailable,
  callbackURL = localePath('/dashboard'),
  children,
}: SocialLoginButtonsProps) {
  const t = useTranslations()
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render on the client side to avoid hydration errors
  if (!mounted) return null

  const handleSocialError = (err: unknown, provider: string) => {
    const errMsg = err instanceof Error ? err.message : ''
    if (errMsg.includes('account exists')) {
      console.error(`[social-auth] ${t('common.error.accountExists')}`)
    } else if (errMsg.includes('cancelled')) {
      console.error(`[social-auth] ${t('common.error.signInCancelled', { provider })}`)
    } else if (errMsg.includes('network')) {
      console.error(`[social-auth] ${t('common.error.networkError')}`)
    } else if (errMsg.includes('rate limit')) {
      console.error(`[social-auth] ${t('common.error.rateLimitExceeded')}`)
    } else {
      console.error(`[social-auth] ${t('common.error.socialSignInFailed', { provider })}`, err)
    }
  }

  async function signInWithGithub() {
    if (!githubAvailable) return
    setIsGithubLoading(true)
    try {
      await client.signIn.social({ provider: 'github', callbackURL })
    } catch (err: unknown) {
      handleSocialError(err, 'GitHub')
    } finally {
      setIsGithubLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (!googleAvailable) return
    setIsGoogleLoading(true)
    try {
      await client.signIn.social({ provider: 'google', callbackURL })
    } catch (err: unknown) {
      handleSocialError(err, 'Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  async function signInWithMicrosoft() {
    if (!microsoftAvailable) return
    setIsMicrosoftLoading(true)
    try {
      await client.signIn.social({ provider: 'microsoft', callbackURL })
    } catch (err: unknown) {
      handleSocialError(err, 'Microsoft')
    } finally {
      setIsMicrosoftLoading(false)
    }
  }

  async function signInWithFacebook() {
    if (!facebookAvailable) return
    setIsFacebookLoading(true)
    try {
      await client.signIn.social({ provider: 'facebook', callbackURL })
    } catch (err: unknown) {
      handleSocialError(err, 'Facebook')
    } finally {
      setIsFacebookLoading(false)
    }
  }

  const connectingText = t('common.button.connecting')

  const githubButton = (
    <Button
      variant='outline'
      size='lg'
      className='w-full hover:bg-gray-50'
      disabled={!githubAvailable || isGithubLoading}
      onClick={signInWithGithub}
    >
      <GitHubIcon className='h-[18px]! w-[18px]! mr-1' />
      {isGithubLoading ? connectingText : 'GitHub'}
    </Button>
  )

  const googleButton = (
    <Button
      variant='outline'
      size='lg'
      className='w-full hover:bg-gray-50'
      disabled={!googleAvailable || isGoogleLoading}
      onClick={signInWithGoogle}
    >
      <GoogleIcon className='h-[18px]! w-[18px]! mr-1' />
      {isGoogleLoading ? connectingText : 'Google'}
    </Button>
  )

  const microsoftButton = (
    <Button
      variant='outline'
      size='lg'
      className='w-full rounded-[10px] shadow-sm hover:bg-gray-50'
      disabled={!microsoftAvailable || isMicrosoftLoading}
      onClick={signInWithMicrosoft}
    >
      <MicrosoftIcon className='h-[18px]! w-[18px]! mr-1' />
      {isMicrosoftLoading ? connectingText : 'Microsoft'}
    </Button>
  )

  const facebookButton = (
    <Button
      variant='outline'
      size='lg'
      className='w-full  hover:bg-gray-50'
      disabled={!facebookAvailable || isFacebookLoading}
      onClick={signInWithFacebook}
    >
      <FacebookIcon className='h-[18px]! w-[18px]! mr-1' />
      {isFacebookLoading ? connectingText : 'Facebook'}
    </Button>
  )

  const hasAnyOAuthProvider = githubAvailable || googleAvailable || microsoftAvailable || facebookAvailable

  if (!hasAnyOAuthProvider && !children) {
    return null
  }

  return (
    <div className={`grid gap-3 font-light`}>
      {googleAvailable && googleButton}
      {githubAvailable && githubButton}
      {microsoftAvailable && microsoftButton}
      {facebookAvailable && facebookButton}
      {children}
    </div>
  )
}
