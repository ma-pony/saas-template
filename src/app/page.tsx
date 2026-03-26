import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import Navbar from './(site)/navbar'
import Hero from './(site)/hero'
import Features from './(site)/features'
import Pricing from './(site)/pricing'
import Testimonials from './(site)/testimonials'
import FAQ, { FAQ_ITEMS } from './(site)/faq'
import CTA from './(site)/cta'
import Footer from './(site)/footer'
import { GridLayout, SectionDivider } from './(site)/grid-layout'
import { getSoftwareApplicationSchema, getWebsiteSchema } from '@/lib/seo'
import FaqSchema from '@/components/geo/faq-schema'

export const metadata: Metadata = generateSEOMetadata({
  // TODO: Replace with your product title and description
  title: 'My SaaS App - Launch Your SaaS Fast',
  description:
    'A production-ready Next.js SaaS boilerplate with auth, payments, and everything you need to launch fast.',
  canonical: '/',
})

export default function Page() {
  const softwareApplicationSchema = getSoftwareApplicationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <GridLayout>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <FaqSchema faqs={FAQ_ITEMS} />
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
