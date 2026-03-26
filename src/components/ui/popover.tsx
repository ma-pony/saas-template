'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Compatibility placeholder - no equivalent in Radix
const PopoverCreateHandle = {} as never

const Popover = PopoverPrimitive.Root

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />
}

function PopoverPopup({
  children,
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  alignOffset = 0,
  tooltipStyle = false,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  tooltipStyle?: boolean
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        className={cn(
          'relative z-50 max-h-[var(--radix-popover-content-available-height)] w-72 overflow-y-auto rounded-lg border bg-popover bg-clip-padding p-4 text-popover-foreground shadow-lg outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          tooltipStyle &&
            'w-fit max-w-xs p-2 text-balance rounded-md text-xs shadow-black/5 shadow-md before:rounded-[calc(var(--radius-md)-1px)]',
          className
        )}
        data-slot='popover-popup'
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverClose(props: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot='popover-close' {...props} />
}

function PopoverTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('font-semibold text-lg leading-none', className)}
      data-slot='popover-title'
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='popover-description'
      {...props}
    />
  )
}

export {
  PopoverCreateHandle,
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverPopup as PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
}
