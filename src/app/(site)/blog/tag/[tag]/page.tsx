import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllTags, getPostsByTag } from '@/lib/blog/content-reader'
import { generateMetadata as genSeoMetadata, siteConfig } from '@/lib/seo'
import BlogPostCard from '@/components/blog/blog-post-card'

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export const generateStaticParams = () => {
  const tags = getAllTags()
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag.toLowerCase()),
  }))
}

export const generateMetadata = async ({ params }: TagPageProps): Promise<Metadata> => {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const displayName = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1)

  return genSeoMetadata({
    title: `#${displayName} - Blog`,
    description: `Browse all posts tagged with #${displayName} on the ${siteConfig.name} blog.`,
    canonical: `/blog/tag/${tag}`,
  })
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const displayName = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1)

  const posts = getPostsByTag(decodedTag)

  const t = await getTranslations('blog')

  return (
    <div className='mx-auto max-w-7xl px-4 py-24 sm:px-6'>
      <nav className='mb-6 text-sm text-muted-foreground'>
        <Link href='/blog' className='hover:text-foreground transition-colors'>
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
            href='/blog'
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
          href='/blog'
          className='text-sm font-medium text-primary transition-colors hover:underline'
        >
          {t('backToBlog')}
        </Link>
      </div>
    </div>
  )
}
