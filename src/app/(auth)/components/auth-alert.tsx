import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthAlertProps {
  type: 'error' | 'success'
  message: string
  className?: string
}

export function AuthAlert({ type, message, className }: AuthAlertProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        type === 'error' && 'border-red-200 bg-red-50 text-red-700',
        type === 'success' && 'border-green-200 bg-green-50 text-green-700',
        className
      )}
    >
      {type === 'error' ? (
        <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
      ) : (
        <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
      )}
      <span>{message}</span>
    </div>
  )
}
