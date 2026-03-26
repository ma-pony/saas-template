'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const CheckboxGroupContext = React.createContext<{
  value: string[]
  onValueChange: (value: string[]) => void
}>({
  value: [],
  onValueChange: () => {},
})

function useCheckboxGroup() {
  return React.useContext(CheckboxGroupContext)
}

function CheckboxGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}) {
  const [internalValue, setInternalValue] = React.useState<string[]>(value ?? defaultValue ?? [])
  const resolvedValue = value !== undefined ? value : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string[]) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    },
    [onValueChange]
  )

  return (
    <CheckboxGroupContext.Provider
      value={{ value: resolvedValue, onValueChange: handleValueChange }}
    >
      <div className={cn('flex flex-col items-start gap-3', className)} role='group' {...props}>
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  )
}

export { CheckboxGroup, useCheckboxGroup }
