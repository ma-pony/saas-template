'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

// Context to share field id and validity state
type FieldContextValue = {
  id: string
  invalid?: boolean
}
const FieldContext = React.createContext<FieldContextValue | null>(null)

function useField() {
  return React.useContext(FieldContext)
}

function Field({ className, id, ...props }: React.ComponentProps<'div'>) {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId

  return (
    <FieldContext.Provider value={{ id: fieldId }}>
      <div
        className={cn('flex flex-col items-start gap-2', className)}
        data-slot='field'
        {...props}
      />
    </FieldContext.Provider>
  )
}

function FieldLabel({ className, htmlFor, ...props }: React.ComponentProps<typeof Label>) {
  const ctx = useField()
  return (
    <Label
      className={cn(
        'inline-flex items-center gap-2 font-medium text-base/4.5 sm:text-sm/4',
        className
      )}
      data-slot='field-label'
      htmlFor={htmlFor ?? ctx?.id}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-muted-foreground text-xs', className)}
      data-slot='field-description'
      {...props}
    />
  )
}

function FieldError({ className, children, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null
  return (
    <p
      className={cn('text-destructive-foreground text-xs', className)}
      data-slot='field-error'
      {...props}
    >
      {children}
    </p>
  )
}

// FieldControl wraps a child and forwards the id from context
function FieldControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// FieldValidity is a no-op placeholder
function FieldValidity({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldControl, FieldValidity }
