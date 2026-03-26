'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  headings: TocItem[]
  className?: string
}

const TableOfContents = ({ headings, className }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        rootMargin: '-80px 0% -80% 0%',
      }
    )

    for (const heading of headings) {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={cn('sticky top-20', className)}>
      <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
        On this page
      </p>
      <ul className='space-y-1.5 text-sm'>
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && 'pl-4')}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block text-muted-foreground transition-colors hover:text-foreground',
                activeId === heading.id && 'font-medium text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

export type { TocItem }
