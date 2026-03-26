import type { MetadataRoute } from 'next'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/blog/content-reader'
import { getBaseUrl } from '@/lib/utils'
import { SUPPORTED_LOCALES } from '@/lib/i18n/config'

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

  // Locale-prefixed static pages
  const localizedStaticPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ])

  // Blog posts
  const posts = getAllPosts()
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Locale-prefixed blog posts
  const localizedPostPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  // Category pages
  const categories = getAllCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${encodeURIComponent(category.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // Locale-prefixed category pages
  const localizedCategoryPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    categories.map((category) => ({
      url: `${baseUrl}/${locale}/blog/category/${encodeURIComponent(category.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  )

  // Tag pages
  const tags = getAllTags()
  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/blog/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // Locale-prefixed tag pages
  const localizedTagPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    tags.map((tag) => ({
      url: `${baseUrl}/${locale}/blog/tag/${encodeURIComponent(tag.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  )

  return [
    ...staticPages,
    ...localizedStaticPages,
    ...postPages,
    ...localizedPostPages,
    ...categoryPages,
    ...localizedCategoryPages,
    ...tagPages,
    ...localizedTagPages,
  ]
}
