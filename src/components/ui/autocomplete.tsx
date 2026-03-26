'use client'

import { Command as CommandPrimitive } from 'cmdk'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronsUpDownIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const AutocompleteContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  inputValue: string
  setInputValue: (value: string) => void
}>({
  open: false,
  setOpen: () => {},
  inputValue: '',
  setInputValue: () => {},
})

function Autocomplete({
  children,
  defaultValue,
  value,
  onValueChange,
  ...props
}: {
  children?: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  [key: string]: unknown
}) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value ?? defaultValue ?? '')

  const handleInputChange = React.useCallback(
    (val: string) => {
      setInputValue(val)
      onValueChange?.(val)
    },
    [onValueChange]
  )

  return (
    <AutocompleteContext.Provider
      value={{ open, setOpen, inputValue, setInputValue: handleInputChange }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </AutocompleteContext.Provider>
  )
}

function AutocompleteInput({
  className,
  showTrigger = false,
  showClear = false,
  startAddon,
  size,
  ref,
  onChange,
  ...props
}: {
  showTrigger?: boolean
  showClear?: boolean
  startAddon?: React.ReactNode
  size?: 'sm' | 'default' | 'lg' | number
  ref?: React.Ref<HTMLInputElement>
  className?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  [key: string]: unknown
}) {
  const { setOpen, setInputValue } = React.useContext(AutocompleteContext)
  const sizeValue = (size ?? 'default') as 'sm' | 'default' | 'lg' | number

  return (
    <PopoverPrimitive.Anchor asChild>
      <div className='relative not-has-[>*.w-full]:w-fit w-full'>
        {startAddon && (
          <div
            aria-hidden='true'
            className="[&_svg]:-mx-0.5 pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4"
            data-slot='autocomplete-start-addon'
          >
            {startAddon}
          </div>
        )}
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(
            startAddon &&
              (sizeValue === 'sm'
                ? 'ps-[calc(--spacing(7.5)-1px)] sm:ps-[calc(--spacing(7)-1px)]'
                : 'ps-[calc(--spacing(8.5)-1px)] sm:ps-[calc(--spacing(8)-1px)]'),
            (showTrigger || showClear) && (sizeValue === 'sm' ? 'pe-6.5' : 'pe-7'),
            className
          )}
          data-slot='autocomplete-input'
          data-size={typeof sizeValue === 'string' ? sizeValue : undefined}
          size={typeof sizeValue === 'number' ? sizeValue : undefined}
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpen(true)
            onChange?.(e)
          }}
          onFocus={() => setOpen(true)}
          {...props}
        />
        {showTrigger && !showClear && (
          <button
            type='button'
            className={cn(
              "-translate-y-1/2 absolute top-1/2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              sizeValue === 'sm' ? 'end-0' : 'end-0.5'
            )}
            data-slot='autocomplete-trigger'
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronsUpDownIcon />
          </button>
        )}
        {showClear && (
          <button
            type='button'
            className={cn(
              "-translate-y-1/2 absolute top-1/2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              sizeValue === 'sm' ? 'end-0' : 'end-0.5'
            )}
            data-slot='autocomplete-clear'
            onClick={() => setInputValue('')}
          >
            <XIcon />
          </button>
        )}
      </div>
    </PopoverPrimitive.Anchor>
  )
}

function AutocompletePopup({
  className,
  children,
  sideOffset = 4,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  sideOffset?: number
  [key: string]: unknown
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          'z-50 w-[var(--radix-popover-trigger-width)] select-none rounded-lg border bg-popover bg-clip-padding shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:not-in-data-[slot=group]:bg-clip-border',
          className
        )}
        sideOffset={sideOffset}
        data-slot='autocomplete-popup'
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        <CommandPrimitive className='flex max-h-[min(var(--radix-popover-available-height,23rem),23rem)] flex-col'>
          {children}
        </CommandPrimitive>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function AutocompleteItem({
  className,
  children,
  value,
  onSelect,
  disabled,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean
  [key: string]: unknown
}) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'flex min-h-8 cursor-default select-none items-center rounded-sm px-2 py-1 text-base outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-64 sm:min-h-7 sm:text-sm',
        className
      )}
      data-slot='autocomplete-item'
      value={value}
      onSelect={onSelect}
      disabled={disabled}
      {...props}
    >
      {children}
    </CommandPrimitive.Item>
  )
}

function AutocompleteSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mx-2 my-1 h-px bg-border last:hidden', className)}
      data-slot='autocomplete-separator'
      {...props}
    />
  )
}

function AutocompleteGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn('[[role=group]+&]:mt-1.5', className)}
      data-slot='autocomplete-group'
      {...props}
    />
  )
}

function AutocompleteGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2 py-1.5 font-medium text-muted-foreground text-xs', className)}
      data-slot='autocomplete-group-label'
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn('p-2 text-center text-base text-muted-foreground sm:text-sm', className)}
      data-slot='autocomplete-empty'
      {...props}
    >
      {children}
    </CommandPrimitive.Empty>
  )
}

function AutocompleteRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className} data-slot='autocomplete-row' {...props} />
}

function AutocompleteValue({ children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot='autocomplete-value' {...props}>
      {children}
    </span>
  )
}

function AutocompleteList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <ScrollArea scrollbarGutter scrollFade>
      <CommandPrimitive.List
        className={cn('not-empty:scroll-py-1 not-empty:p-1 in-data-has-overflow-y:pe-3', className)}
        data-slot='autocomplete-list'
        {...props}
      />
    </ScrollArea>
  )
}

function AutocompleteClear({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { setInputValue } = React.useContext(AutocompleteContext)
  return (
    <button
      type='button'
      className={cn(
        "-translate-y-1/2 absolute end-0.5 top-1/2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-[color,background-color,box-shadow,opacity] pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='autocomplete-clear'
      onClick={(e) => {
        setInputValue('')
        onClick?.(e)
      }}
      {...props}
    >
      <XIcon />
    </button>
  )
}

function AutocompleteStatus({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0',
        className
      )}
      data-slot='autocomplete-status'
      {...props}
    />
  )
}

function AutocompleteCollection({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className} data-slot='autocomplete-collection' {...props} />
}

function AutocompleteTrigger({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { setOpen } = React.useContext(AutocompleteContext)
  return (
    <button
      type='button'
      className={className}
      data-slot='autocomplete-trigger'
      onClick={(e) => {
        setOpen((v: boolean) => !v)
        onClick?.(e)
      }}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteInput,
  AutocompleteTrigger,
  AutocompletePopup,
  AutocompleteItem,
  AutocompleteSeparator,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteEmpty,
  AutocompleteValue,
  AutocompleteList,
  AutocompleteClear,
  AutocompleteStatus,
  AutocompleteRow,
  AutocompleteCollection,
}
