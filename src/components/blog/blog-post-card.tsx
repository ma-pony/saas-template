import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import type { PostMeta } from '@/lib/blog/types'
import { cn } from '@/lib/utils'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config'

interface BlogPostCardProps {
  post: PostMeta
  className?: string
}

const LOCALE_TO_DATE_LOCALE: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es',
  fr: 'fr',
}

const BlogPostCard = async ({ post, className }: BlogPostCardProps) => {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value || DEFAULT_LOCALE
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE
  const dateLocale = LOCALE_TO_DATE_LOCALE[locale] ?? 'en-US'

  const formattedDate = new Date(post.date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const t = await getTranslations({ locale, namespace: 'blog' })
  const blogBase = `/${locale}/blog`

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-[#E4E4E7] bg-white transition-shadow hover:shadow-md',
        className
      )}
    >
      {post.coverImage && (
        <Link href={`${blogBase}/${post.slug}`} className='block overflow-hidden'>
          <div className='relative aspect-video w-full'>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
          </div>
        </Link>
      )}

      <div className='flex flex-1 flex-col gap-3 p-5'>
        {post.categories.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {post.categories.map((category) => (
              <Link
                key={category}
                href={`${blogBase}/category/${encodeURIComponent(category.toLowerCase())}`}
                className='rounded-full bg-[#F4F4F5] px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-[#E4E4E7] hover:text-foreground'
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        <Link href={`${blogBase}/${post.slug}`} className='group/title'>
          <h2 className='line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover/title:text-primary'>
            {post.title}
          </h2>
        </Link>

        <p className='line-clamp-3 flex-1 text-sm text-muted-foreground'>{post.description}</p>

        <div className='flex items-center justify-between pt-2'>
          <div className='text-xs text-muted-foreground'>
            <time dateTime={post.date}>{formattedDate}</time>
            {post.author && <span className='ml-1'>· {post.author}</span>}
          </div>

          <Link
            href={`${blogBase}/${post.slug}`}
            className='text-xs font-medium text-primary transition-colors hover:underline'
          >
            {t('readMore')}
          </Link>
        </div>

        {post.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 border-t border-[#E4E4E7] pt-3'>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`${blogBase}/tag/${encodeURIComponent(tag.toLowerCase())}`}
                className='text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default BlogPostCard
