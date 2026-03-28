import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { SearchInputClient } from './search-input-client'
import type { GetUsersResult } from '../actions/users'

interface UsersTableProps {
  users: GetUsersResult['users']
  total: number
  page: number
  pageCount: number
  query?: string
}

function buildPageUrl(page: number, query?: string) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (query) params.set('q', query)
  return `/admin/users?${params.toString()}`
}

export const UsersTable = async ({ users, total: _total, page, pageCount, query }: UsersTableProps) => {
  const t = await getTranslations('admin.users')

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Suspense>
          <SearchInputClient defaultValue={query} />
        </Suspense>
      </div>

      {users.length === 0 ? (
        <Empty className='border'>
          <EmptyHeader>
            <EmptyTitle>{t('empty.title')}</EmptyTitle>
            <EmptyDescription>
              {query ? t('empty.noResults', { query }) : t('empty.noUsers')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.user')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.emailVerification')}</TableHead>
                <TableHead>{t('table.registeredAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Avatar className='size-7'>
                        {u.image && <AvatarImage src={u.image} alt={u.name} />}
                        <AvatarFallback>
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium text-sm'>{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.emailVerified ? 'success' : 'warning'}>
                      {u.emailVerified ? t('table.verified') : t('table.unverified')}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {new Date(u.createdAt).toLocaleDateString('en', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={page > 1 ? buildPageUrl(page - 1, query) : undefined}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href={buildPageUrl(p, query)} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={page < pageCount ? buildPageUrl(page + 1, query) : undefined}
                    aria-disabled={page >= pageCount}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
