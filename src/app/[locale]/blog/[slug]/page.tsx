import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { getTranslations } from 'next-intl/server'
import { getAllPosts, getPostBySlug } from '@/lib/blog/content-reader'
import { generateArticleJsonLd } from '@/lib/blog/json-ld'
import { generateMetadata as genSeoMetadata } from '@/lib/seo'
import { getBaseUrl } from '@/lib/utils'
import { SUPPORTED_LOCALES, type LocaleParams } from '@/lib/i18n/config'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import { getMDXComponents } from '@/components/blog/mdx-components'
import JsonLdScript from '@/components/blog/json-ld-script'
import TableOfContents from '@/components/blog/table-of-contents'
import type { TocItem } from '@/components/blog/table-of-contents'
import Link from 'next/link'
import Image from 'next/image'

const LOCALE_TO_DATE_LOCALE: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es',
  fr: 'fr',
}

interface BlogPostPageProps {
  params: Promise<LocaleParams & { slug: string }>
}

export const generateStaticParams = () => {
  const posts = getAllPosts()
  return SUPPORTED_LOCALES.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  )
}

export const generateMetadata = async ({ params }: BlogPostPageProps): Promise<Metadata> => {
  const { slug, locale } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const hreflang = generateHreflangMetadata(`/blog/${post.slug}`)

  return {
    ...genSeoMetadata({
      title: post.title,
      description: post.description,
      canonical: `/${locale}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      ...(post.coverImage && { image: post.coverImage }),
    }),
    alternates: {
      ...hreflang,
    },
  }
}

// Extract h2/h3 headings from MDX content for TOC
const extractHeadings = (content: string): TocItem[] => {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    headings.push({ id, text, level })
  }

  return headings
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const headings = extractHeadings(post.content)
  const baseUrl = getBaseUrl()

  const articleJsonLd = generateArticleJsonLd({
    type: 'BlogPosting',
    title: post.title,
    description: post.description,
    author: post.author,
    datePublished: post.date,
    url: `${baseUrl}/${locale}/blog/${post.slug}`,
    ...(post.coverImage && { image: `${baseUrl}${post.coverImage}` }),
  })

  const dateLocale = LOCALE_TO_DATE_LOCALE[locale] ?? 'en-US'

  const formattedDate = new Date(post.date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const t = await getTranslations({ locale, namespace: 'blog' })
  const blogBase = `/${locale}/blog`

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight],
    },
  }

  return (
    <>
      <JsonLdScript data={articleJsonLd} />
      <div className='mx-auto max-w-7xl px-4 py-24 sm:px-6'>
        <div className='flex flex-col gap-10 lg:flex-row'>
          {/* Article */}
          <article className='min-w-0 flex-1'>
            {/* Breadcrumb */}
            <nav className='mb-6 text-sm text-muted-foreground'>
              <Link href={blogBase} className='hover:text-foreground transition-colors'>
                {t('title')}
              </Link>
              <span className='mx-2'>›</span>
              <span>{post.title}</span>
            </nav>

            {/* Header */}
            <header className='mb-8'>
              {post.categories.length > 0 && (
                <div className='mb-4 flex flex-wrap gap-2'>
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

              <h1
                className='text-3xl font-bold tracking-tight sm:text-4xl'
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                {post.title}
              </h1>

              <div className='mt-4 flex items-center gap-3 text-sm text-muted-foreground'>
                <time dateTime={post.date}>{formattedDate}</time>
                {post.author && (
                  <>
                    <span>·</span>
                    <span>{post.author}</span>
                  </>
                )}
              </div>

              {post.coverImage && (
                <div className='relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-[#E4E4E7]'>
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    priority
                    className='object-cover'
                  />
                </div>
              )}
            </header>

            {/* MDX Content */}
            <div className='prose prose-zinc max-w-none'>
              <MDXRemote
                source={post.content}
                components={getMDXComponents()}
                options={mdxOptions}
              />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <footer className='mt-10 border-t border-[#E4E4E7] pt-6'>
                <div className='flex flex-wrap gap-2'>
                  <span className='text-sm font-medium text-muted-foreground'>{t('tagsLabel')}</span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`${blogBase}/tag/${encodeURIComponent(tag.toLowerCase())}`}
                      className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>

                <div className='mt-6'>
                  <Link
                    href={blogBase}
                    className='text-sm font-medium text-primary transition-colors hover:underline'
                  >
                    {t('backToBlog')}
                  </Link>
                </div>
              </footer>
            )}
          </article>

          {/* TOC Sidebar */}
          {headings.length > 0 && (
            <aside className='hidden w-56 shrink-0 lg:block'>
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </div>
    </>
  )
}
