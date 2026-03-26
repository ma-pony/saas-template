'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const Sheet = DialogPrimitive.Root

const SheetPortal = DialogPrimitive.Portal

function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot='sheet-trigger' {...props} />
}

function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot='sheet-close' {...props} />
}

function SheetBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      data-slot='sheet-backdrop'
      {...props}
    />
  )
}

// Viewport layout wrapper - not a Radix concept but kept for API compatibility
function SheetViewport({
  className,
  side,
  inset = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'right' | 'left' | 'top' | 'bottom'
  inset?: boolean
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid',
        side === 'bottom' && 'grid grid-rows-[1fr_auto] pt-12',
        side === 'top' && 'grid grid-rows-[auto_1fr] pb-12',
        side === 'left' && 'flex justify-start',
        side === 'right' && 'flex justify-end',
        inset && 'sm:p-4'
      )}
      data-slot='sheet-viewport'
      {...props}
    >
      {children}
    </div>
  )
}

function SheetPopup({
  className,
  children,
  showCloseButton = true,
  side = 'right',
  inset = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  side?: 'right' | 'left' | 'top' | 'bottom'
  inset?: boolean
}) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex max-h-full min-h-0 flex-col bg-popover bg-clip-padding text-popover-foreground shadow-lg duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=open]:animate-in data-[state=closed]:animate-out dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          side === 'bottom' &&
            'bottom-0 left-0 right-0 w-full border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          side === 'top' &&
            'top-0 left-0 right-0 w-full border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          side === 'left' &&
            'left-0 top-0 bottom-0 h-full w-[calc(100%-3rem)] max-w-md border-e data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          side === 'right' &&
            'right-0 top-0 bottom-0 h-full w-[calc(100%-3rem)] max-w-md border-s data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          inset &&
            'before:hidden sm:rounded-2xl sm:border sm:before:rounded-[calc(var(--radius-2xl)-1px)]',
          className
        )}
        data-slot='sheet-popup'
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
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4',
        className
      )}
      data-slot='sheet-header'
      {...props}
    />
  )
}

function SheetFooter({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'bare'
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end',
        variant === 'default' && 'border-t bg-muted/50 py-4',
        variant === 'bare' &&
          'in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pt-3 pt-4 pb-6',
        className
      )}
      data-slot='sheet-footer'
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-heading text-xl leading-none', className)}
      data-slot='sheet-title'
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='sheet-description'
      {...props}
    />
  )
}

function SheetPanel({
  className,
  scrollFade = true,
  ...props
}: React.ComponentProps<'div'> & { scrollFade?: boolean }) {
  return (
    <ScrollArea scrollFade={scrollFade}>
      <div
        className={cn(
          'px-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-header]))]:pt-6 in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-footer]))]:pb-6! in-[[data-slot=sheet-popup]:not(:has([data-slot=sheet-footer].border-t))]:pb-1 pb-6',
          className
        )}
        data-slot='sheet-panel'
        {...props}
      />
    </ScrollArea>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetPortal,
  SheetClose,
  SheetBackdrop,
  SheetBackdrop as SheetOverlay,
  SheetPopup,
  SheetPopup as SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPanel,
  SheetViewport,
}
