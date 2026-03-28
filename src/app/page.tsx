import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'
import Navbar from './(site)/navbar'
import Hero from './(site)/hero'
import Features from './(site)/features'
import Pricing from './(site)/pricing'
import Testimonials from './(site)/testimonials'
import FAQ from './(site)/faq'
import CTA from './(site)/cta'
import Footer from './(site)/footer'
import { GridLayout, SectionDivider } from './(site)/grid-layout'

const brand = getBrandConfig()

export const metadata: Metadata = generateSEOMetadata({
  // TODO: Replace with your product title and description
  title: `${brand.name} - Launch Your SaaS Fast`,
  description: brand.geo?.aiDescription ||
    'A production-ready Next.js SaaS boilerplate with auth, payments, and everything you need to launch fast.',
  canonical: '/',
})

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
