'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function ScrollArea({
  className,
  children,
  scrollFade = false,
  scrollbarGutter = false,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  scrollFade?: boolean
  scrollbarGutter?: boolean
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn('size-full min-h-0 overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          'h-full w-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          scrollbarGutter && 'pe-2.5'
        )}
        data-slot='scroll-area-viewport'
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation='vertical' />
      <ScrollBar orientation='horizontal' />
      <ScrollAreaPrimitive.Corner data-slot='scroll-area-corner' />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        'm-1 flex opacity-0 transition-opacity delay-300 data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5 data-[orientation=horizontal]:flex-col data-[state=visible]:opacity-100 data-[state=visible]:delay-0 data-[state=visible]:duration-100',
        className
      )}
      data-slot='scroll-area-scrollbar'
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className='relative flex-1 rounded-full bg-foreground/20'
        data-slot='scroll-area-thumb'
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
