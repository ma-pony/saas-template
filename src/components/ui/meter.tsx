'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const MeterContext = React.createContext<{
  value: number
  min: number
  max: number
}>({
  value: 0,
  min: 0,
  max: 100,
})

function Meter({
  className,
  children,
  value = 0,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<'div'> & {
  value?: number
  min?: number
  max?: number
}) {
  return (
    <MeterContext.Provider value={{ value, min, max }}>
      <div
        className={cn('flex w-full flex-col gap-2', className)}
        role='meter'
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        data-slot='meter'
        {...props}
      >
        {children ?? (
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        )}
      </div>
    </MeterContext.Provider>
  )
}

function MeterLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('font-medium text-sm', className)} data-slot='meter-label' {...props} />
  )
}

function MeterTrack({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('block h-2 w-full overflow-hidden rounded-full bg-input', className)}
      data-slot='meter-track'
      {...props}
    />
  )
}

function MeterIndicator({ className, ...props }: React.ComponentProps<'div'>) {
  const { value, min, max } = React.useContext(MeterContext)
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <div
      className={cn('h-full bg-primary transition-all duration-500', className)}
      data-slot='meter-indicator'
      style={{ width: `${percentage}%` }}
      {...props}
    />
  )
}

function MeterValue({ className, children, ...props }: React.ComponentProps<'span'>) {
  const { value, min, max } = React.useContext(MeterContext)
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <span className={cn('text-sm tabular-nums', className)} data-slot='meter-value' {...props}>
      {children ?? `${Math.round(percentage)}%`}
    </span>
  )
}

export { Meter, MeterLabel, MeterTrack, MeterIndicator, MeterValue }
