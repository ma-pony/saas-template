'use client'

import { Command as CommandPrimitive } from 'cmdk'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { SearchIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground',
      className
    )}
    data-slot='command'
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

function CommandDialog({ children, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className='fixed inset-0 z-50 bg-black/32 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          data-slot='command-dialog-backdrop'
        />
        <DialogPrimitive.Content
          className='fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          data-slot='command-dialog-viewport'
        >
          <Command className='-translate-y-0 relative row-start-2 flex max-h-100 min-h-0 w-full min-w-0 max-w-xl flex-col rounded-2xl border bg-popover bg-clip-padding text-popover-foreground shadow-lg before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/50 before:shadow-[0_1px_--theme(--color-black/4%)] **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]'>
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function CommandDialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='command-dialog-trigger' {...props} />
}

function CommandInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className='flex items-center px-2.5 py-1.5' cmdk-input-wrapper=''>
      <SearchIcon className='me-2 size-4.5 shrink-0 opacity-50' />
      <CommandPrimitive.Input
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:text-sm',
          className
        )}
        data-slot='command-input'
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn('max-h-[300px] scroll-py-2 overflow-y-auto overflow-x-hidden p-2', className)}
      data-slot='command-list'
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn('py-6 text-center text-base text-muted-foreground sm:text-sm', className)}
      data-slot='command-empty'
      {...props}
    />
  )
}

function CommandPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className='-mx-px relative min-h-0 rounded-t-xl border bg-popover bg-clip-padding shadow-xs [clip-path:inset(0_1px)] before:pointer-events-none before:absolute before:inset-0 before:rounded-t-[calc(var(--radius-xl)-1px)] **:data-[slot=scroll-area-scrollbar]:mt-2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]'
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs',
        className
      )}
      data-slot='command-group'
      {...props}
    />
  )
}

function CommandGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2 py-1.5 font-medium text-muted-foreground text-xs', className)}
      data-slot='command-group-label'
      {...props}
    />
  )
}

function CommandCollection({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className} data-slot='command-collection' {...props} />
}

function CommandItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-base outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 sm:text-sm',
        className
      )}
      data-slot='command-item'
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn('my-2 -mx-1 h-px bg-border', className)}
      data-slot='command-separator'
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <span
      className={cn(
        'ms-auto font-medium text-muted-foreground/72 text-xs tracking-widest',
        className
      )}
      data-slot='command-shortcut'
      {...props}
    />
  )
}

function CommandFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-b-[calc(var(--radius-2xl)-1px)] px-5 py-3 text-muted-foreground text-xs',
        className
      )}
      data-slot='command-footer'
      {...props}
    />
  )
}

export {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
}
