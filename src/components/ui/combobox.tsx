'use client'

import { Command as CommandPrimitive } from 'cmdk'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronsUpDownIcon, CheckIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const ComboboxContext = React.createContext<{
  chipsRef: React.RefObject<Element | null> | null
  multiple: boolean
  open: boolean
  setOpen: (open: boolean) => void
  value: string | string[]
  setValue: (value: string | string[]) => void
}>({
  chipsRef: null,
  multiple: false,
  open: false,
  setOpen: () => {},
  value: '',
  setValue: () => {},
})

function Combobox<ItemValue = string, Multiple extends boolean | undefined = false>({
  children,
  multiple,
  value: valueProp,
  onValueChange,
  defaultValue,
  ...props
}: {
  children?: React.ReactNode
  multiple?: Multiple
  value?: Multiple extends true ? string[] : string
  onValueChange?: Multiple extends true ? (value: string[]) => void : (value: string) => void
  defaultValue?: Multiple extends true ? string[] : string
  [key: string]: unknown
}) {
  const chipsRef = React.useRef<Element | null>(null)
  const [open, setOpen] = React.useState(false)
  const isMultiple = !!multiple

  const defaultVal = defaultValue ?? (isMultiple ? [] : '')
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultVal as string | string[]
  )
  const value = valueProp !== undefined ? (valueProp as string | string[]) : internalValue

  const setValue = React.useCallback(
    (val: string | string[]) => {
      setInternalValue(val)
      ;(onValueChange as ((v: string | string[]) => void) | undefined)?.(val)
    },
    [onValueChange]
  )

  return (
    <ComboboxContext.Provider
      value={{ chipsRef, multiple: isMultiple, open, setOpen, value, setValue }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </ComboboxContext.Provider>
  )
}

function ComboboxInput({
  className,
  showTrigger = true,
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
  const { multiple, open, setOpen } = React.useContext(ComboboxContext)
  const sizeValue = (size ?? 'default') as 'sm' | 'default' | 'lg' | number

  // multiple mode - render a plain input within chips
  if (multiple) {
    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={cn(
          'min-w-12 flex-1 text-base outline-none sm:text-sm [[data-slot=combobox-chip]+&]:ps-0.5',
          sizeValue === 'sm' ? 'ps-1.5' : 'ps-2',
          className
        )}
        data-size={typeof sizeValue === 'string' ? sizeValue : undefined}
        data-slot='combobox-input'
        onChange={(e) => {
          setOpen(true)
          onChange?.(e)
        }}
        {...props}
      />
    )
  }

  // single mode
  return (
    <PopoverPrimitive.Anchor asChild>
      <div className='relative not-has-[>*.w-full]:w-fit w-full has-disabled:opacity-64'>
        {startAddon && (
          <div
            aria-hidden='true'
            className="[&_svg]:-mx-0.5 pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4"
            data-slot='combobox-start-addon'
          >
            {startAddon}
          </div>
        )}
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(
            'has-disabled:opacity-100',
            startAddon &&
              (sizeValue === 'sm'
                ? 'ps-[calc(--spacing(7.5)-1px)] sm:ps-[calc(--spacing(7)-1px)]'
                : 'ps-[calc(--spacing(8.5)-1px)] sm:ps-[calc(--spacing(8)-1px)]'),
            (showTrigger || showClear) && (sizeValue === 'sm' ? 'pe-6.5' : 'pe-7'),
            className
          )}
          data-slot='combobox-input'
          onChange={(e) => {
            setOpen(true)
            onChange?.(e)
          }}
          {...props}
        />
        {showTrigger && !showClear && (
          <button
            type='button'
            className={cn(
              "-translate-y-1/2 absolute top-1/2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              sizeValue === 'sm' ? 'end-0' : 'end-0.5'
            )}
            data-slot='combobox-trigger'
            onClick={() => setOpen(!open)}
          >
            <ChevronsUpDownIcon />
          </button>
        )}
        {showClear && (
          <button
            type='button'
            className={cn(
              "-translate-y-1/2 absolute top-1/2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              sizeValue === 'sm' ? 'end-0' : 'end-0.5'
            )}
            data-slot='combobox-clear'
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </button>
        )}
      </div>
    </PopoverPrimitive.Anchor>
  )
}

function ComboboxTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger className={className} data-slot='combobox-trigger' {...props} />
}

function ComboboxPopup({
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
        data-slot='combobox-popup'
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

function ComboboxItem({
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
  const { value: selectedValue, setValue, setOpen, multiple } = React.useContext(ComboboxContext)

  const isSelected = multiple
    ? Array.isArray(selectedValue) && selectedValue.includes(value ?? '')
    : selectedValue === value

  return (
    <CommandPrimitive.Item
      className={cn(
        "grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='combobox-item'
      value={value}
      onSelect={(val) => {
        if (multiple && Array.isArray(selectedValue)) {
          const next = selectedValue.includes(val)
            ? selectedValue.filter((v) => v !== val)
            : [...selectedValue, val]
          setValue(next)
        } else {
          setValue(val)
          setOpen(false)
        }
        onSelect?.(val)
      }}
      disabled={disabled}
      {...props}
    >
      <span className='col-start-1 flex items-center justify-center'>
        {isSelected && <CheckIcon className='size-4' />}
      </span>
      <div className='col-start-2'>{children}</div>
    </CommandPrimitive.Item>
  )
}

function ComboboxSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mx-2 my-1 h-px bg-border last:hidden', className)}
      data-slot='combobox-separator'
      {...props}
    />
  )
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn('[[role=group]+&]:mt-1.5', className)}
      data-slot='combobox-group'
      {...props}
    />
  )
}

function ComboboxGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2 py-1.5 font-medium text-muted-foreground text-xs', className)}
      data-slot='combobox-group-label'
      {...props}
    />
  )
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn('p-2 text-center text-base text-muted-foreground sm:text-sm', className)}
      data-slot='combobox-empty'
      {...props}
    />
  )
}

function ComboboxRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className} data-slot='combobox-row' {...props} />
}

function ComboboxValue({ children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot='combobox-value' {...props}>
      {children}
    </span>
  )
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <ScrollArea scrollbarGutter scrollFade>
      <CommandPrimitive.List
        className={cn(
          'not-empty:scroll-py-1 not-empty:px-1 not-empty:py-1 in-data-has-overflow-y:pe-3',
          className
        )}
        data-slot='combobox-list'
        {...props}
      />
    </ScrollArea>
  )
}

function ComboboxClear({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { setValue } = React.useContext(ComboboxContext)
  return (
    <button
      type='button'
      className={className}
      data-slot='combobox-clear'
      onClick={(e) => {
        setValue('')
        onClick?.(e)
      }}
      {...props}
    />
  )
}

function ComboboxStatus({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0',
        className
      )}
      data-slot='combobox-status'
      {...props}
    />
  )
}

function ComboboxCollection({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={className} data-slot='combobox-collection' {...props} />
}

function ComboboxChips({
  className,
  children,
  startAddon,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  startAddon?: React.ReactNode
} & React.ComponentProps<'div'>) {
  const { chipsRef } = React.useContext(ComboboxContext)

  return (
    <PopoverPrimitive.Anchor asChild>
      <div
        className={cn(
          'relative inline-flex min-h-9 w-full flex-wrap gap-1 rounded-lg border border-input bg-background bg-clip-padding p-[calc(--spacing(1)-1px)] text-base shadow-xs outline-none ring-ring/24 transition-shadow *:min-h-7 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-within:border-ring focus-within:ring-[3px] has-disabled:pointer-events-none has-data-[size=lg]:min-h-10 has-data-[size=sm]:min-h-8 has-aria-invalid:border-destructive/36 has-disabled:opacity-64 has-[:disabled,:focus-within,[aria-invalid]]:shadow-none focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 has-data-[size=lg]:*:min-h-8 has-data-[size=sm]:*:min-h-6 sm:min-h-8 sm:text-sm sm:has-data-[size=lg]:min-h-9 sm:has-data-[size=sm]:min-h-7 sm:*:min-h-6 sm:has-data-[size=lg]:*:min-h-7 sm:has-data-[size=sm]:*:min-h-5 dark:not-has-disabled:bg-input/32 dark:not-in-data-[slot=group]:bg-clip-border dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/4%)]',
          className
        )}
        data-slot='combobox-chips'
        onMouseDown={(e) => {
          const target = e.target as HTMLElement
          const isChip = target.closest('[data-slot="combobox-chip"]')
          if (isChip || !chipsRef?.current) return
          e.preventDefault()
          const input: HTMLInputElement | null = chipsRef.current.querySelector('input')
          if (input && !chipsRef.current.querySelector('input:focus')) {
            input.focus()
          }
        }}
        ref={chipsRef as React.Ref<HTMLDivElement> | null}
        {...props}
      >
        {startAddon && (
          <div
            aria-hidden='true'
            className="[&_svg]:-ms-0.5 [&_svg]:-me-1.5 flex shrink-0 items-center ps-2 opacity-80 has-[~[data-size=sm]]:has-[+[data-slot=combobox-chip]]:pe-1.5 has-[~[data-size=sm]]:ps-1.5 has-[+[data-slot=combobox-chip]]:pe-2 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none"
            data-slot='combobox-start-addon'
          >
            {startAddon}
          </div>
        )}
        {children}
      </div>
    </PopoverPrimitive.Anchor>
  )
}

function ComboboxChip({
  children,
  value,
  onRemove,
  ...props
}: {
  children?: React.ReactNode
  value?: string
  onRemove?: () => void
} & React.ComponentProps<'span'>) {
  const { setValue, value: selectedValue } = React.useContext(ComboboxContext)

  return (
    <span
      className="flex items-center rounded-[calc(var(--radius-md)-1px)] bg-accent ps-2 font-medium text-accent-foreground text-sm outline-none sm:text-xs/(--text-xs--line-height) [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
      data-slot='combobox-chip'
      {...props}
    >
      {children}
      <ComboboxChipRemove
        onClick={() => {
          if (value && Array.isArray(selectedValue)) {
            setValue(selectedValue.filter((v) => v !== value))
          }
          onRemove?.()
        }}
      />
    </span>
  )
}

function ComboboxChipRemove({ onClick, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type='button'
      aria-label='Remove'
      className="h-full shrink-0 cursor-pointer px-1.5 opacity-80 hover:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
      data-slot='combobox-chip-remove'
      onClick={onClick}
      {...props}
    >
      <XIcon />
    </button>
  )
}

export {
  Combobox,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxItem,
  ComboboxSeparator,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxEmpty,
  ComboboxValue,
  ComboboxList,
  ComboboxClear,
  ComboboxStatus,
  ComboboxRow,
  ComboboxCollection,
  ComboboxChips,
  ComboboxChip,
}
