import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { LanguageSwitcher } from '@/components/language-switcher'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    // Preserve the original URL so the user can be redirected back after login
    const url = headersList.get('x-url') || headersList.get('x-invoke-path') || ''
    const callbackParam = url ? `?callbackUrl=${encodeURIComponent(url)}` : ''
    redirect(`/login${callbackParam}`)
  }

  return (
    <>
      <div className='flex h-10 items-center justify-end px-4'>
        <LanguageSwitcher size='sm' />
      </div>
      {children}
    </>
  )
}
