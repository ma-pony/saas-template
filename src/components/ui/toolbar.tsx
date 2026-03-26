'use client'

import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Toolbar({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Root>) {
  return (
    <ToolbarPrimitive.Root
      className={cn(
        'relative flex gap-2 rounded-xl border bg-card bg-clip-padding p-1 text-card-foreground',
        className
      )}
      data-slot='toolbar'
      {...props}
    />
  )
}

function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) {
  return <ToolbarPrimitive.Button className={cn(className)} data-slot='toolbar-button' {...props} />
}

function ToolbarLink({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return <ToolbarPrimitive.Link className={cn(className)} data-slot='toolbar-link' {...props} />
}

// Toolbar.Input doesn't exist in Radix - use a plain input wrapper
function ToolbarInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(className)} data-slot='toolbar-input' {...props} />
}

function ToolbarGroup({
  className,
  type = 'multiple',
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  return (
    <ToolbarPrimitive.ToggleGroup
      className={cn('flex items-center gap-1', className)}
      data-slot='toolbar-group'
      {...(props as any)}
      type={type}
    />
  )
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:my-0.5 data-[orientation=vertical]:my-1.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
        className
      )}
      data-slot='toolbar-separator'
      {...props}
    />
  )
}

export { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarButton, ToolbarLink, ToolbarInput }
