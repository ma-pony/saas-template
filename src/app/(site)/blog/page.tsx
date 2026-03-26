import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog/content-reader'
import { generateBlogJsonLd } from '@/lib/blog/json-ld'
import { generateMetadata as genSeoMetadata, siteConfig } from '@/lib/seo'
import { getBaseUrl } from '@/lib/utils'
import BlogPostCard from '@/components/blog/blog-post-card'
import JsonLdScript from '@/components/blog/json-ld-script'

const POSTS_PER_PAGE = 10

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

export const metadata: Metadata = {
  ...genSeoMetadata({
    title: 'Blog',
    description: `Insights, tutorials, and updates from the ${siteConfig.name} team.`,
    canonical: '/blog',
  }),
  alternates: {
    canonical: `${getBaseUrl()}/blog`,
    types: {
      'application/rss+xml': `${getBaseUrl()}/blog/feed.xml`,
    },
  },
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page ?? 1))
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  const allPosts = getAllPosts()
  const totalPosts = allPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE))
  const posts = getAllPosts({ limit: POSTS_PER_PAGE, offset })

  const categories = getAllCategories()
  const tags = getAllTags()

  const jsonLd = generateBlogJsonLd(getBaseUrl(), `${siteConfig.name} Blog`)

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <div className='mx-auto max-w-7xl px-4 py-24 sm:px-6'>
        <div className='mb-12 text-center'>
          <h1
            className='text-4xl font-semibold tracking-tight'
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Blog
          </h1>
          <p className='mt-3 text-lg text-muted-foreground'>
            Insights, tutorials, and updates from our team.
          </p>
        </div>

        <div className='flex flex-col gap-10 lg:flex-row'>
          {/* Main content */}
          <main className='flex-1'>
            {posts.length === 0 ? (
              <div className='rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-12 text-center'>
                <p className='text-muted-foreground'>No posts published yet. Check back soon!</p>
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
                    href={`/blog?page=${currentPage - 1}`}
                    className='rounded-md border border-[#E4E4E7] px-4 py-2 text-sm transition-colors hover:bg-[#F4F4F5]'
                  >
                    ← Previous
                  </Link>
                )}
                <span className='text-sm text-muted-foreground'>
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className='rounded-md border border-[#E4E4E7] px-4 py-2 text-sm transition-colors hover:bg-[#F4F4F5]'
                  >
                    Next →
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
                  Categories
                </h2>
                <ul className='space-y-1.5'>
                  {categories.map((category) => (
                    <li key={category}>
                      <Link
                        href={`/blog/category/${encodeURIComponent(category.toLowerCase())}`}
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
                  Tags
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
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
