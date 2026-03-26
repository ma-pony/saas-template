'use client'

import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// Tooltip content components
const BetterAuthContent = () => <span>Better Auth</span>
const TailwindCSSContent = () => <span>Tailwind CSS</span>
const TypeScriptContent = () => <span>TypeScript</span>
const TanStackContent = () => <span>TanStack</span>
const VercelContent = () => <span>Vercel AI SDK</span>
const BunContent = () => <span>Bun</span>
const RadixUIContent = () => <span>Radix UI</span>

export default function Hero() {
  return (
    <main
      id='hero'
      className='flex min-h-screen flex-col bg-[#F4F4F5] items-center justify-start pt-40 pb-24'
    >
      <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mx-auto max-w-3xl text-balance text-center font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:max-w-4xl md:text-6xl lg:leading-[1.1]'>
            A production-ready{' '}
            <img
              src='/nextjs_logo.svg'
              alt='Next.js'
              className='inline-block h-[0.9em] w-[0.9em] align-middle mx-1'
            />{' '}
            Next.js boilerplate for your SaaS
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-balance text-center text-muted-foreground md:max-w-2xl md:text-lg'>
            Launch your SaaS faster with a fully-featured boilerplate. Auth, payments, email, SEO,
            and more — all pre-configured so you can focus on building your product.
          </p>
          <div className='mx-auto mt-10 flex items-center justify-center gap-4'>
            {/* TODO: Replace with your primary CTA (e.g., link to sign up or pricing) */}
            <Button className='h-12! px-8 text-base font-semibold text-white'>Get Started</Button>
            <Button variant='outline' className='font-semibold h-12! px-8 text-base'>
              Try demo
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
              BUILT WITH THE BEST TOOLS
            </h2>
            <div className='flex items-center justify-center gap-1 sm:gap-5 md:gap-6 flex-wrap'>
              {/* Vercel AI SDK */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/vercel.svg'
                    alt='Vercel AI SDK'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100 brightness-0'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <VercelContent />
                </TooltipContent>
              </Tooltip>

              {/* Tailwind CSS */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/tailwindcss.svg'
                    alt='Tailwind CSS'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <TailwindCSSContent />
                </TooltipContent>
              </Tooltip>

              {/* TypeScript */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/typescript.svg'
                    alt='TypeScript'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <TypeScriptContent />
                </TooltipContent>
              </Tooltip>

              {/* Better Auth */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/better-auth.svg'
                    alt='Better Auth'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <BetterAuthContent />
                </TooltipContent>
              </Tooltip>

              {/* TanStack */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/tanstack.svg'
                    alt='TanStack'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <TanStackContent />
                </TooltipContent>
              </Tooltip>

              {/* Radix UI */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/radix-ui.svg'
                    alt='Radix UI'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <RadixUIContent />
                </TooltipContent>
              </Tooltip>

              {/* Bun */}
              <Tooltip>
                <TooltipTrigger className='flex items-center justify-center h-12 w-12 cursor-pointer'>
                  <img
                    src='/stack-icons/bun.svg'
                    alt='Bun'
                    className='h-12 w-12 opacity-70 transition-opacity duration-200 hover:opacity-100'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <BunContent />
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </main>
  )
}
