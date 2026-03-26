'use client'

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogPortal = AlertDialogPrimitive.Portal

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />
}

function AlertDialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      data-slot='alert-dialog-backdrop'
      {...props}
    />
  )
}

// Viewport is now just a div for layout (Radix doesn't have Viewport concept)
function AlertDialogViewport({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 grid grid-rows-[1fr_auto] justify-items-center pt-6 sm:grid-rows-[1fr_auto_3fr] sm:p-4',
        className
      )}
      data-slot='alert-dialog-viewport'
      {...props}
    >
      {children}
    </div>
  )
}

function AlertDialogPopup({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogPrimitive.Content
        className={cn(
          'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border bg-popover bg-clip-padding text-popover-foreground shadow-lg duration-200 ease-in-out before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]',
          className
        )}
        data-slot='alert-dialog-popup'
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-6 not-has-[+[data-slot=alert-dialog-footer]]:pb-4 text-center max-sm:pb-4 sm:text-left',
        className
      )}
      data-slot='alert-dialog-header'
      {...props}
    />
  )
}

function AlertDialogFooter({
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
        variant === 'bare' && 'pt-4 pb-6',
        className
      )}
      data-slot='alert-dialog-footer'
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn('font-heading text-xl leading-none', className)}
      data-slot='alert-dialog-title'
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='alert-dialog-description'
      {...props}
    />
  )
}

function AlertDialogClose(props: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot='alert-dialog-close' {...props} />
}

function AlertDialogAction(props: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action data-slot='alert-dialog-action' {...props} />
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogBackdrop as AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogPopup as AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
  AlertDialogAction,
  AlertDialogViewport,
}
