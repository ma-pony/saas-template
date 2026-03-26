import type { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...generateMetadata({
    // TODO: Replace with your product title and description
    title: 'My SaaS App - Launch Your SaaS Fast',
    description:
      'A production-ready Next.js boilerplate with auth, payments, and everything you need to launch your SaaS fast.',
    isRootLayout: true,
  }),
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
  themeColor: '#701ffc',
}

// This is a minimal root layout that acts as a pass-through.
// The actual html/body is rendered by [locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
