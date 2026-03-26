'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion'
import Link from 'next/link'

export const FAQ_ITEMS = [
  {
    question: "What's included?",
    answer:
      'Everything you need to build: a full Next.js boilerplate with auth, payments, UI, SEO, and transactional emails. Ready to customize for your product.',
  },
  {
    question: 'What payment providers are supported?',
    answer:
      'Stripe, Polar, and LemonSqueezy are all pre-configured. Switch providers by changing a single environment variable.',
  },
  {
    question: 'Can I use it for commercial products?',
    answer: 'Yes — use this boilerplate to build and sell your own SaaS products.',
  },
  {
    question: 'What if I find a bug or issue?',
    answer: 'Open an issue on GitHub or reach out by email — we aim to fix bugs quickly.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Clone the repository, set your environment variables, and run bun dev. Full setup instructions are in the README.',
  },
  {
    question: 'What database does it use?',
    answer:
      'PostgreSQL via Drizzle ORM. The schema is fully customizable and migrations are managed with Drizzle Kit.',
  },
  {
    question: 'Is internationalization (i18n) supported?',
    answer:
      'Yes — next-intl is pre-configured with English, French, and Spanish. Adding new locales is straightforward.',
  },
  {
    question: 'What authentication methods are available?',
    answer:
      'Better-Auth provides email/password, magic links (OTP), and social OAuth (Google, GitHub, Microsoft, Facebook). Enable only what you need via env vars.',
  },
]

export default function FAQ() {
  const faqs = FAQ_ITEMS

  return (
    <section
      id='faq'
      aria-labelledby='faq-heading'
      className='py-24 border-t border-b border-[#E4E4E7] bg-[#F4F4F5]'
    >
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <h2
          id='faq-heading'
          className='text-center text-sm font-medium text-muted-foreground mb-8'
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          FAQ
        </h2>
        <div className='grid md:grid-cols-2 gap-12 md:gap-16'>
          {/* Left Section */}
          <div>
            <h2 className='text-4xl font-semibold tracking-tight mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-lg text-muted-foreground'>
              Have another question? {/* TODO: Replace with your support email address */}
              <Link
                href='mailto:support@example.com'
                className='underline underline-offset-4 hover:text-foreground transition-colors'
              >
                Contact us by email
              </Link>
              .
            </p>
          </div>

          {/* Right Section */}
          <div>
            <Accordion className='space-y-0'>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} className='border-b border-[#E4E4E7] last:border-b-0'>
                  <AccordionTrigger className='text-left py-4 text-base font-medium hover:no-underline'>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionPanel className='text-muted-foreground text-sm pb-4'>
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
