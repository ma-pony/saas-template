'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { ChevronRightIcon } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const Menu = DropdownMenuPrimitive.Root

const MenuPortal = DropdownMenuPrimitive.Portal

function MenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot='menu-trigger' {...props} />
}

function MenuPopup({
  children,
  className,
  sideOffset = 4,
  align = 'center',
  alignOffset,
  side = 'bottom',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        className={cn(
          'relative z-50 min-w-32 rounded-lg border bg-popover bg-clip-padding p-1 text-popover-foreground shadow-lg outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          className
        )}
        data-slot='menu-popup'
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

function MenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot='menu-group' {...props} />
}

function MenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "[&_svg]:-mx-0.5 flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[variant=destructive]:text-destructive-foreground data-[highlighted]:text-accent-foreground data-[disabled]:opacity-64 focus:bg-accent focus:text-accent-foreground sm:min-h-7 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        inset && 'ps-8',
        variant === 'destructive' && 'text-destructive-foreground',
        className
      )}
      data-slot='menu-item'
      data-variant={variant}
      {...props}
    />
  )
}

function MenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none data-[disabled]:pointer-events-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='menu-checkbox-item'
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator className='col-start-1 flex items-center justify-center'>
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
      </DropdownMenuPrimitive.ItemIndicator>
      <span className='col-start-2'>{children}</span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function MenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot='menu-radio-group' {...props} />
}

function MenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none data-[disabled]:pointer-events-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='menu-radio-item'
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator className='col-start-1 flex items-center justify-center'>
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
      </DropdownMenuPrimitive.ItemIndicator>
      <span className='col-start-2'>{children}</span>
    </DropdownMenuPrimitive.RadioItem>
  )
}

function MenuGroupLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2 py-1.5 font-medium text-muted-foreground text-xs',
        inset && 'ps-9 sm:ps-8',
        className
      )}
      data-slot='menu-label'
      {...props}
    />
  )
}

function MenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('mx-2 my-1 h-px bg-border', className)}
      data-slot='menu-separator'
      {...props}
    />
  )
}

function MenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'ms-auto font-medium text-muted-foreground/72 text-xs tracking-widest',
        className
      )}
      data-slot='menu-shortcut'
      {...props}
    />
  )
}

function MenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot='menu-sub' {...props} />
}

function MenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-sm px-2 py-1 text-base outline-none data-[disabled]:pointer-events-none focus:bg-accent data-[state=open]:bg-accent focus:text-accent-foreground data-[state=open]:text-accent-foreground data-[disabled]:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        inset && 'ps-8',
        className
      )}
      data-slot='menu-sub-trigger'
      {...props}
    >
      {children}
      <ChevronRightIcon className='-me-0.5 ms-auto opacity-80' />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function MenuSubPopup({
  className,
  sideOffset = -1,
  alignOffset = -5,
  align = 'start',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        alignOffset={alignOffset}
        className={cn(
          'relative z-50 min-w-32 rounded-lg border bg-popover bg-clip-padding p-1 text-popover-foreground shadow-lg outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          className
        )}
        data-slot='menu-sub-content'
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  Menu,
  Menu as DropdownMenu,
  MenuPortal,
  MenuPortal as DropdownMenuPortal,
  MenuTrigger,
  MenuTrigger as DropdownMenuTrigger,
  MenuPopup,
  MenuPopup as DropdownMenuContent,
  MenuGroup,
  MenuGroup as DropdownMenuGroup,
  MenuItem,
  MenuItem as DropdownMenuItem,
  MenuCheckboxItem,
  MenuCheckboxItem as DropdownMenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioGroup as DropdownMenuRadioGroup,
  MenuRadioItem,
  MenuRadioItem as DropdownMenuRadioItem,
  MenuGroupLabel,
  MenuGroupLabel as DropdownMenuLabel,
  MenuSeparator,
  MenuSeparator as DropdownMenuSeparator,
  MenuShortcut,
  MenuShortcut as DropdownMenuShortcut,
  MenuSub,
  MenuSub as DropdownMenuSub,
  MenuSubTrigger,
  MenuSubTrigger as DropdownMenuSubTrigger,
  MenuSubPopup,
  MenuSubPopup as DropdownMenuSubContent,
}
