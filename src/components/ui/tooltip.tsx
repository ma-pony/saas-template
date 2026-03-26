'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Compatibility placeholder - no equivalent in Radix
const TooltipCreateHandle = {} as never

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />
}

function TooltipPopup({
  className,
  align = 'center',
  sideOffset = 4,
  side = 'top',
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>['align']
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>['side']
  sideOffset?: number
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        align={align}
        className={cn(
          'relative z-50 max-w-xs text-balance rounded-md border bg-popover bg-clip-padding px-2 py-1 text-popover-foreground text-xs shadow-black/5 shadow-md before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          className
        )}
        data-slot='tooltip-popup'
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export {
  TooltipCreateHandle,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipPopup as TooltipContent,
}
