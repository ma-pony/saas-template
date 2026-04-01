import AuthBackground from '@/app/(auth)/components/auth-background'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground>
      <main className='relative flex min-h-screen flex-col text-foreground'>
        {/* Language switcher — top right corner */}
        <div className='absolute top-4 right-4 z-40'>
          <LanguageSwitcher size='sm' />
        </div>
        {/* Content */}
        <div className='relative z-30 flex flex-1 items-center justify-center px-4 pb-24'>
          <div className='w-full max-w-lg px-4'>{children}</div>
        </div>
      </main>
    </AuthBackground>
  )
}
