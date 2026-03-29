import { getTranslations } from 'next-intl/server'
import { getOAuthProviderStatus } from '@/app/(auth)/components/oauth-provider-checker'
import LoginForm from '@/app/(auth)/login/login-form'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'
import type { LocaleParams } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.login' })
  const brand = getBrandConfig()
  return generateSEOMetadata({
    title: `${t('title')} | ${brand.name}`,
  })
}

export default async function LoginPage() {
  const { githubAvailable, googleAvailable, facebookAvailable, microsoftAvailable, isProduction } =
    await getOAuthProviderStatus()
  return (
    <LoginForm
      githubAvailable={githubAvailable}
      googleAvailable={googleAvailable}
      facebookAvailable={facebookAvailable}
      microsoftAvailable={microsoftAvailable}
      isProduction={isProduction}
    />
  )
}
