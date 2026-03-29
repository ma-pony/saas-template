import { getTranslations } from 'next-intl/server'
import { isProd } from '@/lib/constants'
import { VerifyContent } from '@/app/(auth)/verify/verify-content'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'
import type { LocaleParams } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<LocaleParams> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth.verify' })
  const brand = getBrandConfig()
  return generateSEOMetadata({
    title: `${t('title')} | ${brand.name}`,
  })
}

export default function VerifyPage() {
  return <VerifyContent isProduction={isProd} />
}
