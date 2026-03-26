'use client'

import type * as React from 'react'

import { cn } from '@/lib/utils'

function Form({ className, ...props }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('flex w-full flex-col gap-4', className)} data-slot='form' {...props} />
  )
}

export { Form }
