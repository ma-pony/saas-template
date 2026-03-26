'use client'

import type * as React from 'react'

import { cn } from '@/lib/utils'

function Fieldset({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn('flex w-full max-w-64 flex-col gap-6', className)}
      data-slot='fieldset'
      {...props}
    />
  )
}

function FieldsetLegend({ className, ...props }: React.ComponentProps<'legend'>) {
  return (
    <legend className={cn('font-semibold', className)} data-slot='fieldset-legend' {...props} />
  )
}

export { Fieldset, FieldsetLegend }
