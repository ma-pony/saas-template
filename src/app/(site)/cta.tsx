'use client'

import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function CTA() {
  const t = useTranslations('site.cta')
  const tButton = useTranslations('common.button')

  return (
    <section className='py-24 px-4 sm:px-6 bg-[#F4F4F5]'>
      <div className='mx-auto max-w-4xl'>
        {/* Section label */}
        <h2
          className='text-center text-sm font-medium text-muted-foreground mb-8'
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          {t('sectionLabel')}
        </h2>

        {/* Main heading */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl font-semibold tracking-tight mb-4'>{t('title')}</h2>
          <p className='text-lg text-muted-foreground'>{t('subtitle')}</p>
        </div>

        {/* Buttons */}
        <div className='mx-auto mt-10 flex items-center justify-center gap-4'>
          <Button className='text-white font-semibold h-12! px-8 text-base'>
            {tButton('getStarted')}
          </Button>
          <Button variant='outline' className='font-semibold h-12! px-8 text-base'>
            {tButton('tryDemo')}
            <ArrowUpRight className='h-8 w-8' />
          </Button>
        </div>
      </div>
    </section>
  )
}
