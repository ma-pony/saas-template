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

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const hreflang = generateHreflangMetadata('/')

  return {
    ...generateSEOMetadata({
      title: 'My SaaS App - Turn Ideas Into Products, Fast',
      description:
        'Ship your startup in days, not weeks. A production-ready Next.js boilerplate with auth, payments, and everything you need to launch fast. Free forever, open source.',
    }),
    alternates: {
      ...hreflang,
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}`,
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
