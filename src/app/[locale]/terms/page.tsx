import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import Navbar from '@/app/(site)/navbar'
import Footer from '@/app/(site)/footer'
import { GridLayout } from '@/app/(site)/grid-layout'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const hreflang = generateHreflangMetadata('/terms')

  return {
    ...generateSEOMetadata({
      title: 'Terms of Service',
      description: 'Terms of Service for [Your Company] platform',
    }),
    alternates: {
      ...hreflang,
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/terms`,
    },
  }
}

export default async function TermsPage() {
  return (
    <GridLayout>
      <Navbar />
      <main className='min-h-screen pt-14'>
        <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6'>
          <h1 className='mb-4 text-4xl font-semibold tracking-tight'>Terms of Service</h1>
          <p className='mb-12 text-sm text-muted-foreground'>Last updated: 17 jan 2026</p>

          <div className='prose prose-sm max-w-none space-y-8 text-muted-foreground'>
            <p>
              welcome to [Your Company]. by accessing or using our platform, you agree to these
              terms. if you don't agree, please don't use our platform.
            </p>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>1. using our platform</h2>
              <p>
                you must use our platform only for lawful purposes. you're responsible for how you
                use the platform, including any projects, code, or data you upload or share.
              </p>
            </section>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>2. accounts</h2>
              <p>
                you're responsible for keeping your account secure. if you suspect unauthorized
                access, contact us immediately at{' '}
                <a
                  href='mailto:support@your-domain.com'
                  className='text-(--brand-accent-hex) underline-offset-4 hover:text-(--brand-accent-hover-hex) hover:underline'
                >
                  support@your-domain.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>
                3. intellectual property
              </h2>
              <p>
                all code, templates, and assets provided through [Your Company] are owned by us or
                licensed to us. you retain rights to your own projects built using our tools, but
                not to the underlying boilerplate.
              </p>
            </section>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>4. restrictions</h2>
              <p>
                don't attempt to hack, decompile, or resell our products or services. we reserve the
                right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>5. liability</h2>
              <p>
                our platform is provided "as is." we don't guarantee uninterrupted service or that
                our platform will be error-free. we're not liable for any damages, data loss, or
                downtime.
              </p>
            </section>

            <section>
              <h2 className='mb-4 text-xl font-semibold text-foreground'>6. updates to terms</h2>
              <p>
                we may update these terms anytime. continued use means you accept the latest
                version.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </GridLayout>
  )
}
