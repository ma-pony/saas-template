import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'

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

  return <>{children}</>
}
