'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const isIndeterminate = checked === 'indeterminate'
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      className={cn(
        'relative inline-flex size-4.5 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background bg-clip-padding shadow-xs outline-none ring-ring transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[3px] data-[state=unchecked]:not-disabled:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 disabled:opacity-64 sm:size-4 dark:data-[state=unchecked]:bg-input/32 dark:bg-clip-border dark:aria-invalid:ring-destructive/24 dark:not-disabled:data-[state=unchecked]:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)] disabled:shadow-none data-[state=checked]:shadow-none aria-invalid:shadow-none',
        className
      )}
      data-slot='checkbox'
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className='-inset-px absolute flex items-center justify-center rounded-[4px] text-primary-foreground data-[state=unchecked]:hidden data-[state=checked]:bg-primary data-[state=indeterminate]:text-foreground data-[state=indeterminate]:bg-primary'
        data-slot='checkbox-indicator'
      >
        {isIndeterminate ? (
          <svg
            className='size-3.5 sm:size-3'
            fill='none'
            height='24'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='3'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M5.252 12h13.496' />
          </svg>
        ) : (
          <svg
            className='size-3.5 sm:size-3'
            fill='none'
            height='24'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='3'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M5.252 12.7 10.2 18.63 18.748 5.37' />
          </svg>
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
