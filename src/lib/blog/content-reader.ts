import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostMeta } from './types'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Module-level cache to avoid repeated file I/O
let cachedPosts: PostMeta[] | null = null

const readAllPostsFromDisk = (): PostMeta[] => {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  const posts: PostMeta[] = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '')
      const filePath = path.join(BLOG_DIR, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)

      return {
        slug,
        title: data.title ?? '',
        description: data.description ?? '',
        date: data.date ?? '',
        author: data.author ?? '',
        categories: Array.isArray(data.categories) ? data.categories : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        coverImage: data.coverImage,
        published: data.published ?? false,
      } satisfies PostMeta
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

const getCache = (): PostMeta[] => {
  if (cachedPosts === null) {
    cachedPosts = readAllPostsFromDisk()
  }
  return cachedPosts
}

export const getAllPosts = (options?: { limit?: number; offset?: number }): PostMeta[] => {
  const posts = getCache()
  const offset = options?.offset ?? 0
  const limit = options?.limit

  const sliced = posts.slice(offset)
  return limit !== undefined ? sliced.slice(0, limit) : sliced
}

export const getPostBySlug = (slug: string): Post | null => {
  if (!fs.existsSync(BLOG_DIR)) {
    return null
  }

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!filePath.startsWith(BLOG_DIR)) return null
  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  if (!data.published) {
    return null
  }

  return {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    author: data.author ?? '',
    categories: Array.isArray(data.categories) ? data.categories : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    coverImage: data.coverImage,
    published: data.published ?? false,
    content,
  }
}

export const getPostsByCategory = (category: string): PostMeta[] => {
  return getCache().filter((post) =>
    post.categories.some((c) => c.toLowerCase() === category.toLowerCase())
  )
}

export const getPostsByTag = (tag: string): PostMeta[] => {
  return getCache().filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
}

export const getAllCategories = (): string[] => {
  const posts = getCache()
  const categoriesSet = new Set<string>()
  for (const post of posts) {
    for (const cat of post.categories) {
      categoriesSet.add(cat)
    }
  }
  return Array.from(categoriesSet).sort()
}

export const getAllTags = (): string[] => {
  const posts = getCache()
  const tagsSet = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) {
      tagsSet.add(tag)
    }
  }
  return Array.from(tagsSet).sort()
}
