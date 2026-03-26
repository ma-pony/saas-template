'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default' | 'lg'
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "relative inline-flex min-h-9 w-full min-w-36 select-none items-center justify-between gap-2 rounded-lg border border-input bg-background bg-clip-padding px-[calc(--spacing(3)-1px)] text-left text-base shadow-xs outline-none ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-disabled:not-focus-visible:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 disabled:pointer-events-none disabled:opacity-64 sm:min-h-8 sm:text-sm dark:bg-input/32 dark:not-in-data-[slot=group]:bg-clip-border dark:aria-invalid:ring-destructive/24 dark:not-disabled:not-focus-visible:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)] [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:shadow-none focus-visible:shadow-none aria-invalid:shadow-none",
        size === 'sm' && 'min-h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:min-h-7',
        size === 'lg' && 'min-h-10 sm:min-h-9',
        className
      )}
      data-slot='select-trigger'
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronsUpDownIcon className='-me-1 size-4.5 opacity-80 sm:size-4' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      data-slot='select-scroll-up-arrow'
      {...props}
    >
      <ChevronUpIcon className='size-4.5 sm:size-4' />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      data-slot='select-scroll-down-arrow'
      {...props}
    >
      <ChevronDownIcon className='size-4.5 sm:size-4' />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectPopup({
  className,
  children,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  sideOffset?: number
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-popover bg-clip-padding text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:not-in-data-[slot=group]:bg-clip-border',
          className
        )}
        data-slot='select-popup'
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className='max-h-[min(var(--radix-select-content-available-height),23rem)] min-w-[var(--radix-select-trigger-width)] p-1'
          data-slot='select-list'
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='select-item'
      {...props}
    >
      <SelectPrimitive.ItemIndicator className='col-start-1 flex items-center justify-center'>
        <svg
          fill='none'
          height='24'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
          width='24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M5.252 12.7 10.2 18.63 18.748 5.37' />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className='col-start-2 min-w-0'>
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('mx-2 my-1 h-px bg-border', className)}
      data-slot='select-separator'
      {...props}
    />
  )
}

function SelectGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2 py-1.5 font-medium text-muted-foreground text-xs', className)}
      data-slot='select-group-label'
      {...props}
    />
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectPopup as SelectContent,
  SelectItem,
  SelectSeparator,
  SelectGroup,
  SelectGroupLabel,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
