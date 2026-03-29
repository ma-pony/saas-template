import Navbar from '@/app/(site)/navbar'
import Hero from '@/app/(site)/hero'
import Features from '@/app/(site)/features'
import Pricing from '@/app/(site)/pricing'
import Testimonials from '@/app/(site)/testimonials'
import FAQ from '@/app/(site)/faq'
import CTA from '@/app/(site)/cta'
import Footer from '@/app/(site)/footer'
import { GridLayout, SectionDivider } from '@/app/(site)/grid-layout'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getTranslations } from 'next-intl/server'
import { getBaseUrl } from '@/lib/utils'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site.hero' })
  const hreflang = generateHreflangMetadata('/')

  return {
    ...generateSEOMetadata({
      title: t('title'),
      description: t('description'),
    }),
    alternates: {
      ...hreflang,
      canonical: `${getBaseUrl()}/${locale}`,
    },
  }
}

export default function Page() {
  return (
    <GridLayout>
      <Navbar />
      <Hero />
      <SectionDivider />
      <Features />
      <SectionDivider />
      <Pricing />
      <SectionDivider />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </GridLayout>
  )
}
