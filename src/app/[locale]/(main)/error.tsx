'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { captureErrorSync } from '@/lib/errors'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MainError({ error, reset }: ErrorProps) {
  const t = useTranslations('common.pageError')

  useEffect(() => {
    captureErrorSync(error)
  }, [error])

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center'>
      <h2 className='text-xl font-semibold'>{t('title')}</h2>
      <p className='text-muted-foreground text-sm'>{t('description')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </div>
  )
}
