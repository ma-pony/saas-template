'use client'

import { toast, Toaster } from 'sonner'

type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

interface ToastAddOptions {
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  actionProps?: {
    children?: React.ReactNode
    onClick?: () => void
  }
}

const toastManager = {
  add: (opts: ToastAddOptions) => {
    const { title, description, type, actionProps } = opts
    const options = {
      description,
      action: actionProps
        ? { label: actionProps.children as string, onClick: actionProps.onClick ?? (() => {}) }
        : undefined,
    }
    switch (type) {
      case 'success':
        return toast.success(title, options)
      case 'error':
        return toast.error(title, options)
      case 'warning':
        return toast.warning(title, options)
      case 'info':
        return toast.info(title, options)
      case 'loading':
        return toast.loading(title, options)
      default:
        return toast(title ?? '', options)
    }
  },
}

// anchoredToastManager is a simplified compat shim (no anchor positioning support)
const anchoredToastManager = toastManager

interface ToastProviderProps {
  children?: React.ReactNode
  position?: ToastPosition
}

function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position={position} richColors />
    </>
  )
}

// AnchoredToastProvider is kept for API compat but simplified (uses same Toaster)
function AnchoredToastProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export {
  toast,
  Toaster,
  ToastProvider,
  type ToastPosition,
  toastManager,
  AnchoredToastProvider,
  anchoredToastManager,
}
