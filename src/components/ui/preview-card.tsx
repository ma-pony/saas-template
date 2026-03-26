'use client'

import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const PreviewCard = HoverCardPrimitive.Root

function PreviewCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot='preview-card-trigger' {...props} />
}

function PreviewCardPopup({
  className,
  children,
  align = 'center',
  sideOffset = 4,
  side,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content> & {
  align?: React.ComponentProps<typeof HoverCardPrimitive.Content>['align']
  sideOffset?: number
}) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          'relative z-50 flex w-64 origin-(--radix-hover-card-content-transform-origin) text-balance rounded-lg border bg-popover bg-clip-padding p-4 text-popover-foreground text-sm shadow-lg before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          className
        )}
        data-slot='preview-card-content'
        {...props}
      >
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
}

export {
  PreviewCard,
  PreviewCard as HoverCard,
  PreviewCardTrigger,
  PreviewCardTrigger as HoverCardTrigger,
  PreviewCardPopup,
  PreviewCardPopup as HoverCardContent,
}
