import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllTags, getPostsByTag } from '@/lib/blog/content-reader'
import { generateMetadata as genSeoMetadata, siteConfig } from '@/lib/seo'
import { SUPPORTED_LOCALES, type LocaleParams } from '@/lib/i18n/config'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import BlogPostCard from '@/components/blog/blog-post-card'

interface TagPageProps {
  params: Promise<LocaleParams & { tag: string }>
}

export const generateStaticParams = () => {
  const tags = getAllTags()
  return SUPPORTED_LOCALES.flatMap((locale) =>
    tags.map((tag) => ({
      locale,
      tag: encodeURIComponent(tag.toLowerCase()),
    }))
  )
}

export const generateMetadata = async ({ params }: TagPageProps): Promise<Metadata> => {
  const { tag, locale } = await params
  const decodedTag = decodeURIComponent(tag)
  const displayName = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1)
  const t = await getTranslations({ locale, namespace: 'blog' })
  const hreflang = generateHreflangMetadata(`/blog/tag/${tag}`)

  return {
    ...genSeoMetadata({
      title: `#${displayName} - ${t('title')}`,
      description: t('tag.description', { name: displayName, site: siteConfig.name }),
      canonical: `/${locale}/blog/tag/${tag}`,
    }),
    alternates: { ...hreflang },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag, locale } = await params
  const decodedTag = decodeURIComponent(tag)
  const displayName = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1)

  const posts = getPostsByTag(decodedTag)

  const t = await getTranslations({ locale, namespace: 'blog' })
  const blogBase = `/${locale}/blog`

  return (
    <div className='mx-auto max-w-7xl px-4 py-24 sm:px-6'>
      <nav className='mb-6 text-sm text-muted-foreground'>
        <Link href={blogBase} className='hover:text-foreground transition-colors'>
          {t('title')}
        </Link>
        <span className='mx-2'>›</span>
        <span>{t('tag.title', { name: displayName })}</span>
      </nav>

      <div className='mb-10'>
        <h1
          className='text-3xl font-bold tracking-tight'
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          #{displayName}
        </h1>
        <p className='mt-2 text-muted-foreground'>
          {posts.length === 1 ? t('tag.countOne') : t('tag.count', { count: posts.length })}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className='rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-12 text-center'>
          <p className='text-muted-foreground'>{t('tag.empty')}</p>
          <Link
            href={blogBase}
            className='mt-4 inline-block text-sm font-medium text-primary hover:underline'
          >
            {t('backToBlog')}
          </Link>
        </div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <div className='mt-8'>
        <Link
          href={blogBase}
          className='text-sm font-medium text-primary transition-colors hover:underline'
        >
          {t('backToBlog')}
        </Link>
      </div>
    </div>
  )
}
