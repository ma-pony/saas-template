'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import type * as React from 'react'

import { cn } from '@/lib/utils'

type TabsVariant = 'default' | 'underline'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-2 data-[orientation=vertical]:flex-row', className)}
      data-slot='tabs'
      {...props}
    />
  )
}

function TabsList({
  variant = 'default',
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        'relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-muted-foreground',
        'data-[orientation=vertical]:flex-col',
        variant === 'default'
          ? 'rounded-lg bg-muted p-0.5 text-muted-foreground/72'
          : 'data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-1',
        className
      )}
      data-slot='tabs-list'
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTab({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "[&_svg]:-mx-0.5 flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium text-base outline-none transition-[color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        'hover:text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm dark:data-[state=active]:bg-accent',
        'h-9 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-8',
        'data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start',
        className
      )}
      data-slot='tabs-trigger'
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('flex-1 outline-none', className)}
      data-slot='tabs-content'
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsTab as TabsTrigger, TabsPanel, TabsPanel as TabsContent }
