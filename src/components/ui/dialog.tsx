'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const Dialog = DialogPrimitive.Root

const DialogPortal = DialogPrimitive.Portal

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

function DialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      data-slot='dialog-backdrop'
      {...props}
    />
  )
}

function DialogViewport({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4',
        className
      )}
      data-slot='dialog-viewport'
      {...props}
    >
      {children}
    </div>
  )
}

function DialogPopup({
  className,
  children,
  showCloseButton = true,
  bottomStickOnMobile = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  bottomStickOnMobile?: boolean
}) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg flex-col rounded-2xl border bg-popover bg-clip-padding text-popover-foreground shadow-lg duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          bottomStickOnMobile &&
            'max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:before:hidden max-sm:before:rounded-none max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-full',
          className
        )}
        data-slot='dialog-popup'
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild aria-label='Close' className='absolute end-2 top-2'>
            <Button size='icon' variant='ghost'>
              <XIcon />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-3 max-sm:pb-4',
        className
      )}
      data-slot='dialog-header'
      {...props}
    />
  )
}

function DialogFooter({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'bare'
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end sm:rounded-b-[calc(var(--radius-2xl)-1px)]',
        variant === 'default' && 'border-t bg-muted/50 py-4',
        variant === 'bare' &&
          'in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pt-3 pt-4 pb-6',
        className
      )}
      data-slot='dialog-footer'
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-heading text-xl leading-none', className)}
      data-slot='dialog-title'
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='dialog-description'
      {...props}
    />
  )
}

function DialogPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <ScrollArea>
      <div
        className={cn(
          'px-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-header])]:pt-1 in-[[data-slot=dialog-popup]:not(:has([data-slot=dialog-header]))]:pt-6 in-[[data-slot=dialog-popup]:not(:has([data-slot=dialog-footer]))]:pb-6! in-[[data-slot=dialog-popup]:not(:has([data-slot=dialog-footer].border-t))]:pb-1 pb-6',
          className
        )}
        data-slot='dialog-panel'
        {...props}
      />
    </ScrollArea>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogBackdrop,
  DialogBackdrop as DialogOverlay,
  DialogPopup,
  DialogPopup as DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogPanel,
  DialogViewport,
}
