'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbCount = React.useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value.length : 1
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue.length : 1
    }
    return 1
  }, [value, defaultValue])

  return (
    <SliderPrimitive.Root
      className={cn(
        'flex touch-none select-none disabled:pointer-events-none disabled:opacity-64 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-44 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:flex-col',
        className
      )}
      data-slot='slider-control'
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className='relative grow select-none rounded-full bg-input data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1'
        data-slot='slider-track'
      >
        <SliderPrimitive.Range
          className='absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          data-slot='slider-indicator'
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <SliderPrimitive.Thumb
          className='block size-5 shrink-0 select-none rounded-full border border-input bg-white bg-clip-padding shadow-xs outline-none transition-shadow before:absolute before:inset-0 before:rounded-full before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-[3px] focus-visible:ring-ring/24 sm:size-4 dark:border-background dark:bg-clip-border dark:focus-visible:ring-ring/48 focus-visible:shadow-none'
          data-slot='slider-thumb'
          key={index}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

function SliderValue({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('flex justify-end text-sm', className)} data-slot='slider-value' {...props}>
      {children}
    </span>
  )
}

export { Slider, SliderValue }
