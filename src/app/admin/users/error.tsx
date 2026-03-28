'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminUsersError({ error, reset }: ErrorProps) {
  const t = useTranslations('admin.error')

  useEffect(() => {
    console.error('[AdminUsersError]', error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
      <h2 className='text-xl font-semibold'>{t('usersLoadFailed')}</h2>
      <p className='text-muted-foreground text-sm'>{t('usersLoadFailedDesc')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </div>
  )
}
