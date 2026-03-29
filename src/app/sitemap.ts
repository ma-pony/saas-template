import type { MetadataRoute } from 'next'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog/content-reader'
import { getBaseUrl } from '@/lib/utils'
import { SUPPORTED_LOCALES } from '@/lib/i18n/config'
import { createLogger } from '@/lib/logger'

const log = createLogger({ module: 'sitemap' })

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()

  // Static pages (default/non-prefixed)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Locale-prefixed static pages (only localized app pages, not blog)
  const localizedStaticPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Blog posts (blog is not under [locale], so no locale prefix)
  let postPages: MetadataRoute.Sitemap = []
  let categoryPages: MetadataRoute.Sitemap = []
  let tagPages: MetadataRoute.Sitemap = []

  try {
    const posts = getAllPosts()
    postPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const categories = getAllCategories()
    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/blog/category/${encodeURIComponent(category.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    const tags = getAllTags()
    tagPages = tags.map((tag) => ({
      url: `${baseUrl}/blog/tag/${encodeURIComponent(tag.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }))
  } catch (error) {
    log.error('Error generating blog sitemap entries', { error })
  }

  return [
    ...staticPages,
    ...localizedStaticPages,
    ...postPages,
    ...categoryPages,
    ...tagPages,
  ]
}
