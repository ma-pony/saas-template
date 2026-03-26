import { generateMetadata } from '@/lib/seo'
import ResetPasswordClient from './reset-password-client'

export const metadata = generateMetadata({
  title: 'Reset Password',
  noindex: true,
  nofollow: true,
})

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
