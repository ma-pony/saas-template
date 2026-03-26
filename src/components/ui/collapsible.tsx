'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot='collapsible' {...props} />
}

function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn('cursor-pointer', className)}
      data-slot='collapsible-trigger'
      {...props}
    />
  )
}

function CollapsiblePanel({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn(
        'overflow-hidden transition-all data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
        className
      )}
      data-slot='collapsible-panel'
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel, CollapsiblePanel as CollapsibleContent }
