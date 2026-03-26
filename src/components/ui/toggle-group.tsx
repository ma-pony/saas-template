'use client'

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import type { toggleVariants } from '@/components/ui/toggle'

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
})

function ToggleGroup({
  className,
  variant = 'default',
  size = 'default',
  type = 'single',
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        'flex w-fit *:focus-visible:z-10',
        variant === 'default'
          ? 'gap-0.5'
          : '*:not-first:before:-start-[0.5px] *:not-last:before:-end-[0.5px] *:not-first:rounded-s-none *:not-last:rounded-e-none *:not-first:border-s-0 *:not-last:border-e-0 *:not-first:before:rounded-s-none *:not-last:before:rounded-e-none',
        className
      )}
      data-size={size}
      data-slot='toggle-group'
      data-variant={variant}
      type={type}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function Toggle({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  const resolvedVariant = context.variant || variant
  const resolvedSize = context.size || size

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-base outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground sm:text-sm dark:data-[state=on]:bg-input/80 dark:hover:bg-accent',
        resolvedVariant === 'default' ? 'border-transparent' : 'border-border',
        resolvedSize === 'sm'
          ? 'h-8 min-w-8 px-[calc(--spacing(1.5)-1px)] sm:h-7 sm:min-w-7'
          : resolvedSize === 'lg'
            ? 'h-10 min-w-10 px-[calc(--spacing(2.5)-1px)] sm:h-9 sm:min-w-9'
            : 'h-9 min-w-9 px-[calc(--spacing(2)-1px)] sm:h-8 sm:min-w-8',
        className
      )}
      data-size={resolvedSize}
      data-slot='toggle-group-item'
      data-variant={resolvedVariant}
      value={value}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

function ToggleGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: {
  className?: string
} & React.ComponentProps<typeof Separator>) {
  return <Separator className={className} orientation={orientation} {...props} />
}

export { ToggleGroup, Toggle, Toggle as ToggleGroupItem, ToggleGroupSeparator }
