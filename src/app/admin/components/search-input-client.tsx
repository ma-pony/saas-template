'use client'

import { useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchInputClientProps {
  defaultValue?: string
}

export const SearchInputClient = ({ defaultValue }: SearchInputClientProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('page', '1')
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className='relative'>
      <Search className='pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='search'
        placeholder='搜索姓名或邮箱...'
        defaultValue={defaultValue}
        className='pl-8 w-64'
        onChange={(e) => {
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => handleSearch(e.target.value), 300)
        }}
      />
    </div>
  )
}
