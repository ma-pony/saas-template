'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { captureErrorSync } from '@/lib/errors'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  const t = useTranslations('admin.error')

  useEffect(() => {
    captureErrorSync(error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
      <h2 className='text-xl font-semibold'>{t('loadFailed')}</h2>
      <p className='text-muted-foreground text-sm'>{t('loadFailedDesc')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </div>
  )
}
