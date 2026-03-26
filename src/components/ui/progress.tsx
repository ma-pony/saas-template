'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn('flex w-full flex-col gap-2', className)}
      data-slot='progress'
      value={value}
      {...props}
    >
      {children ? (
        children
      ) : (
        <ProgressTrack>
          <ProgressIndicator value={value} />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  )
}

function ProgressLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('font-medium text-sm', className)} data-slot='progress-label' {...props} />
  )
}

function ProgressTrack({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('block h-1.5 w-full overflow-hidden rounded-full bg-input', className)}
      data-slot='progress-track'
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Indicator> & { value?: number | null }) {
  return (
    <ProgressPrimitive.Indicator
      className={cn('h-full bg-primary transition-all duration-500', className)}
      data-slot='progress-indicator'
      style={{ width: `${value ?? 0}%` }}
      {...props}
    />
  )
}

function ProgressValue({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('text-sm tabular-nums', className)} data-slot='progress-value' {...props}>
      {children}
    </span>
  )
}

export { Progress, ProgressLabel, ProgressTrack, ProgressIndicator, ProgressValue }
