import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog/content-reader'
import { generateBlogJsonLd } from '@/lib/blog/json-ld'
import { generateMetadata as genSeoMetadata, siteConfig } from '@/lib/seo'
import { getBaseUrl } from '@/lib/utils'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'
import { SUPPORTED_LOCALES, type LocaleParams } from '@/lib/i18n/config'
import BlogPostCard from '@/components/blog/blog-post-card'
import JsonLdScript from '@/components/blog/json-ld-script'

const POSTS_PER_PAGE = 10

interface BlogPageProps {
  params: Promise<LocaleParams>
  searchParams: Promise<{ page?: string }>
}

export const generateStaticParams = () =>
  SUPPORTED_LOCALES.map((locale) => ({ locale }))

export const generateMetadata = async ({ params }: BlogPageProps): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const hreflang = generateHreflangMetadata('/blog')

  return {
    ...genSeoMetadata({
      title: t('title'),
      description: t('subtitle'),
      canonical: `/${locale}/blog`,
    }),
    alternates: {
      ...hreflang,
      canonical: `${getBaseUrl()}/${locale}/blog`,
      types: {
        'application/rss+xml': `${getBaseUrl()}/${locale}/blog/feed.xml`,
      },
    },
  }
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params
  const sp = await searchParams
  const rawPage = Number(sp.page)
  const parsedPage = Number.isFinite(rawPage) ? rawPage : 1

  const allPosts = getAllPosts()
  const totalPosts = allPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE))
  const currentPage = Math.max(1, Math.min(parsedPage, totalPages))
  const offset = (currentPage - 1) * POSTS_PER_PAGE
  const posts = allPosts.slice(offset, offset + POSTS_PER_PAGE)

  const categories = getAllCategories()
  const tags = getAllTags()

  const jsonLd = generateBlogJsonLd(getBaseUrl(), `${siteConfig.name} Blog`)

  const t = await getTranslations({ locale, namespace: 'blog' })

  const blogBase = `/${locale}/blog`

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <div className='mx-auto max-w-7xl px-4 py-24 sm:px-6'>
        <div className='mb-12 text-center'>
          <h1
            className='text-4xl font-semibold tracking-tight'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {t('title')}
          </h1>
          <p className='mt-3 text-lg text-muted-foreground'>
            {t('subtitle')}
          </p>
        </div>

        <div className='flex flex-col gap-10 lg:flex-row'>
          {/* Main content */}
          <main className='flex-1'>
            {posts.length === 0 ? (
              <div className='rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-12 text-center'>
                <p className='text-muted-foreground'>{t('empty')}</p>
              </div>
            ) : (
              <div className='grid gap-6 sm:grid-cols-2'>
                {posts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className='mt-10 flex items-center justify-center gap-2'>
                {currentPage > 1 && (
                  <Link
                    href={`${blogBase}?page=${currentPage - 1}`}
                    className='rounded-md border border-[#E4E4E7] px-4 py-2 text-sm transition-colors hover:bg-[#F4F4F5]'
                  >
                    {t('pagination.previous')}
                  </Link>
                )}
                <span className='text-sm text-muted-foreground'>
                  {t('pagination.page', { current: currentPage, total: totalPages })}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`${blogBase}?page=${currentPage + 1}`}
                    className='rounded-md border border-[#E4E4E7] px-4 py-2 text-sm transition-colors hover:bg-[#F4F4F5]'
                  >
                    {t('pagination.next')}
                  </Link>
                )}
              </nav>
            )}
          </main>

          {/* Sidebar */}
          <aside className='w-full lg:w-64 shrink-0'>
            {categories.length > 0 && (
              <div className='mb-8'>
                <h2 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  {t('categories')}
                </h2>
                <ul className='space-y-1.5'>
                  {categories.map((category) => (
                    <li key={category}>
                      <Link
                        href={`${blogBase}/category/${encodeURIComponent(category.toLowerCase())}`}
                        className='text-sm text-muted-foreground transition-colors hover:text-foreground'
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <h2 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                  {t('tags')}
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`${blogBase}/tag/${encodeURIComponent(tag.toLowerCase())}`}
                      className='rounded-full bg-[#F4F4F5] px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-[#E4E4E7] hover:text-foreground'
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
