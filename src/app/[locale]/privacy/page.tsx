import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import Navbar from '@/app/(site)/navbar'
import Footer from '@/app/(site)/footer'
import { GridLayout } from '@/app/(site)/grid-layout'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const hreflang = generateHreflangMetadata('/privacy')

  return {
    ...generateSEOMetadata({
      title: 'Privacy Policy',
      description: 'Privacy Policy for [Your Company] platform',
    }),
    alternates: {
      ...hreflang,
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${locale}/privacy`,
    },
  }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: 17 jan 2026',
      intro: "we value your privacy. here's how we handle your info.",
      sections: [
        {
          title: '1. data we collect',
          content: null,
          list: [
            'basic account info (email, name, etc.)',
            'usage data (how you interact with the app)',
            'optional data you share (like feedback or support requests)',
          ],
        },
        {
          title: '2. how we use it',
          content: null,
          list: [
            'to run and improve our platform',
            'to communicate with you about updates or issues',
            'to prevent misuse or fraud',
          ],
        },
        {
          title: '3. cookies',
          content:
            'we use cookies to keep you logged in and track performance. you can disable cookies, but some features might not work properly.',
          list: null,
        },
        {
          title: '4. third-party services',
          content:
            'we may use analytics or hosting tools (like vercel, supabase, or stripe) that collect data in line with their own policies.',
          list: null,
        },
        {
          title: '5. data security',
          content:
            "we take reasonable steps to secure your info but can't guarantee 100% security.",
          list: null,
        },
        {
          title: '6. your rights',
          content:
            'you can request deletion or correction of your data anytime at support@your-domain.com.',
          list: null,
        },
      ],
    },
    zh: {
      title: '隐私政策',
      lastUpdated: '最后更新：2026年1月17日',
      intro: '我们重视您的隐私。以下是我们处理您信息的方式。',
      sections: [
        {
          title: '1. 我们收集的数据',
          content: null,
          list: [
            '基本账户信息（邮箱、姓名等）',
            '使用数据（您与应用的交互方式）',
            '您分享的可选数据（如反馈或支持请求）',
          ],
        },
        {
          title: '2. 我们如何使用',
          content: null,
          list: ['运营和改善我们的平台', '与您沟通有关更新或问题', '防止滥用或欺诈'],
        },
        {
          title: '3. Cookie',
          content:
            '我们使用 Cookie 保持您的登录状态并追踪性能。您可以禁用 Cookie，但某些功能可能无法正常运行。',
          list: null,
        },
        {
          title: '4. 第三方服务',
          content:
            '我们可能使用分析或托管工具（如 Vercel、Supabase 或 Stripe），这些工具按照其自己的政策收集数据。',
          list: null,
        },
        {
          title: '5. 数据安全',
          content: '我们采取合理措施保护您的信息，但无法保证100%的安全性。',
          list: null,
        },
        {
          title: '6. 您的权利',
          content: '您可以随时通过 support@your-domain.com 请求删除或更正您的数据。',
          list: null,
        },
      ],
    },
  }

  const pageContent = (content as any)[locale] || content.en

  return (
    <GridLayout>
      <Navbar />
      <main className='min-h-screen pt-14'>
        <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6'>
          <h1 className='mb-4 text-4xl font-semibold tracking-tight'>{pageContent.title}</h1>
          <p className='mb-12 text-sm text-muted-foreground'>{pageContent.lastUpdated}</p>

          <div className='prose prose-sm max-w-none space-y-8 text-muted-foreground'>
            <p>{pageContent.intro}</p>

            {pageContent.sections.map((section: any, index: number) => (
              <section key={index}>
                <h2 className='mb-4 text-xl font-semibold text-foreground'>{section.title}</h2>
                {section.list ? (
                  <ul className='list-disc space-y-2 pl-6'>
                    {section.list.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{section.content}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </GridLayout>
  )
}
