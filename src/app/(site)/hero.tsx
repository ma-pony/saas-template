'use client'

import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('site.hero')
  const tc = useTranslations('common.button')

  return (
    <main
      id='hero'
      className='flex min-h-screen flex-col bg-[#F4F4F5] items-center justify-start pt-40 pb-24'
    >
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mx-auto max-w-3xl text-balance text-center font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:max-w-4xl md:text-6xl lg:leading-[1.1]'>
            {t('title')}
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-balance text-center text-muted-foreground md:max-w-2xl md:text-lg'>
            {t('description')}
          </p>
          <div className='mx-auto mt-10 flex items-center justify-center gap-4'>
            {/* TODO: Replace with your primary CTA (e.g., link to sign up or pricing) */}
            <Button className='h-12! px-8 text-base font-semibold text-white'>{tc('getStarted')}</Button>
            <Button variant='outline' className='font-semibold h-12! px-8 text-base'>
              {tc('tryDemo')}
              <ArrowUpRight className='h-8 w-8' />
            </Button>
          </div>
        </div>

        {/* Built With Section */}
        <TooltipProvider>
          <div className='mt-24 w-full'>
            <h2
              className='text-center text-sm font-medium text-muted-foreground mb-8'
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {t('builtWithBest')}
            </h2>
            <div className='flex items-center justify-center gap-1 sm:gap-5 md:gap-6 flex-wrap'>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/vercel.svg' alt='Vercel AI SDK' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100 brightness-0' />
                </TooltipTrigger>
                <TooltipContent><span>Vercel AI SDK</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/tailwindcss.svg' alt='Tailwind CSS' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>Tailwind CSS</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/typescript.svg' alt='TypeScript' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>TypeScript</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/better-auth.svg' alt='Better Auth' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>Better Auth</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/tanstack.svg' alt='TanStack' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>TanStack</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/radix-ui.svg' alt='Radix UI' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>Radix UI</span></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img src='/stack-icons/bun.svg' alt='Bun' className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100' />
                </TooltipTrigger>
                <TooltipContent><span>Bun</span></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </main>
  )
}
