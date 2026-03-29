import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import { getBrandConfig } from '@/config/branding'
import { getBaseUrl } from '@/lib/utils'
import Navbar from '@/app/(site)/navbar'
import Footer from '@/app/(site)/footer'
import { GridLayout } from '@/app/(site)/grid-layout'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  const hreflang = generateHreflangMetadata('/terms')

  return {
    ...generateSEOMetadata({
      title: t('title'),
      description: `${t('title')} - ${getBrandConfig().name}`,
    }),
    alternates: {
      ...hreflang,
      canonical: `${getBaseUrl()}/${locale}/terms`,
    },
  }
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  const brand = getBrandConfig()
  const brandParams = { companyName: brand.name, supportEmail: brand.supportEmail || '' }

  const sectionKeys = ['usage', 'accounts', 'ip', 'restrictions', 'liability', 'updates'] as const

  return (
    <GridLayout>
      <Navbar />
      <main className='min-h-screen pt-14'>
        <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6'>
          <h1 className='mb-4 text-4xl font-semibold tracking-tight'>{t('title')}</h1>
          <p className='mb-12 text-sm text-muted-foreground'>{t('lastUpdated')}</p>

          <div className='prose prose-sm max-w-none space-y-8 text-muted-foreground'>
            <p>{t('intro', brandParams)}</p>

            {sectionKeys.map((key) => (
              <section key={key}>
                <h2 className='mb-4 text-xl font-semibold text-foreground'>
                  {t(`sections.${key}.title`)}
                </h2>
                <p>
                  {t(`sections.${key}.content`, brandParams)}
                  {key === 'accounts' && brand.supportEmail && (
                    <>
                      {' '}
                      <a
                        href={`mailto:${brand.supportEmail}`}
                        className='text-(--brand-accent-hex) underline-offset-4 hover:text-(--brand-accent-hover-hex) hover:underline'
                      >
                        {brand.supportEmail}
                      </a>
                      .
                    </>
                  )}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </GridLayout>
  )
}
