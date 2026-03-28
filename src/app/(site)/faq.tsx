'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const faqKeys = [
  'freeVersion',
  'proVersion',
  'loseAccess',
  'oneTimePayment',
  'commercial',
  'bugs',
  'upgrade',
  'updates',
  'support',
] as const

export default function FAQ() {
  const t = useTranslations('site.faq')

  const faqs = faqKeys.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }))

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
          {t('sectionLabel')}
        </h2>
        <div className='grid md:grid-cols-2 gap-12 md:gap-16'>
          {/* Left Section */}
          <div>
            <h2 className='text-4xl font-semibold tracking-tight mb-4'>{t('title')}</h2>
            <p className='text-lg text-muted-foreground'>
              {t('contactUs')}{' '}
              {/* TODO: Replace with your support email address */}
              <Link
                href='mailto:support@example.com'
                className='underline underline-offset-4 hover:text-foreground transition-colors'
              >
                {t('contactLink')}
              </Link>
              .
            </p>
          </div>

          {/* Right Section */}
          <div>
            <Accordion type='single' collapsible className='space-y-0'>
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={String(index)}
                  className='border-b border-[#E4E4E7] last:border-b-0'
                >
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
