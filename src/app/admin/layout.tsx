import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { AdminSidebar } from './components/admin-sidebar'
import { AdminMobileNav } from './components/admin-mobile-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/en/login')
  }

  const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id))

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/en/dashboard')
  }

  return (
    <div className='flex min-h-screen'>
      <AdminSidebar user={dbUser} />
      <div className='flex flex-1 flex-col'>
        <header className='flex h-14 items-center border-b px-4 lg:hidden'>
          <AdminMobileNav user={dbUser} />
        </header>
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  )
}
