import { getTranslations } from 'next-intl/server'
import { getOAuthProviderStatus } from '@/app/(auth)/components/oauth-provider-checker'
import RegisterForm from '@/app/(auth)/register/register-form'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.register' })
  const brand = getBrandConfig()
  return generateSEOMetadata({
    title: `${t('title')} | ${brand.name}`,
  })
}

export default async function RegisterPage() {
  const { githubAvailable, googleAvailable, facebookAvailable, microsoftAvailable, isProduction } =
    await getOAuthProviderStatus()

  return (
    <RegisterForm
      githubAvailable={githubAvailable}
      googleAvailable={googleAvailable}
      facebookAvailable={facebookAvailable}
      microsoftAvailable={microsoftAvailable}
      isProduction={isProduction}
    />
  )
}
