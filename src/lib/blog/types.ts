export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string // ISO 8601
  author: string
  categories: string[]
  tags: string[]
  coverImage?: string
  published: boolean
}

export interface Post extends PostMeta {
  content: string // raw MDX string for next-mdx-remote compilation
}

export interface FAQItem {
  question: string
  answer: string
}
