'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminUsersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AdminUsersError]', error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
      <h2 className='text-xl font-semibold'>用户列表加载失败</h2>
      <p className='text-muted-foreground text-sm'>无法加载用户数据，请稍后重试。</p>
      <Button onClick={reset}>刷新重试</Button>
    </div>
  )
}
