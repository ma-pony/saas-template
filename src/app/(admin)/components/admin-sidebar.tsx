'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth/auth-client'

const navItems = [
  { href: '/admin', label: '概览', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

interface AdminSidebarProps {
  user: {
    name: string
    email: string
  }
}

export const AdminSidebar = ({ user }: AdminSidebarProps) => {
  const pathname = usePathname()

  return (
    <aside className='hidden w-56 flex-col border-r bg-background lg:flex'>
      <div className='flex h-14 items-center border-b px-4'>
        <span className='font-semibold text-sm'>管理后台</span>
      </div>
      <nav className='flex flex-1 flex-col gap-1 p-2'>
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-2')}
              asChild
            >
              <Link href={item.href}>
                <item.icon className='size-4' />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>
      <div className='border-t p-3'>
        <div className='mb-2 px-1'>
          <p className='truncate text-sm font-medium'>{user.name}</p>
          <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
        </div>
        <Button
          variant='ghost'
          className='w-full justify-start gap-2 text-muted-foreground'
          onClick={() => signOut()}
        >
          <LogOut className='size-4' />
          退出登录
        </Button>
      </div>
    </aside>
  )
}
