'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetPopup,
  SheetHeader,
  SheetTitle,
  SheetPanel,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth/auth-client'

const navItems = [
  { href: '/admin', label: '概览', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

interface AdminMobileNavProps {
  user: {
    name: string
    email: string
  }
}

export const AdminMobileNav = ({ user }: AdminMobileNavProps) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Menu className='size-5' />
        </Button>
      </SheetTrigger>
      <SheetPopup side='left'>
        <SheetHeader>
          <SheetTitle>管理后台</SheetTitle>
        </SheetHeader>
        <SheetPanel>
          <nav className='flex flex-col gap-1'>
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
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    <item.icon className='size-4' />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
          <div className='mt-4 border-t pt-4'>
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
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  )
}
