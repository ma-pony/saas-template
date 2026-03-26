import { getBaseUrl } from '@/lib/utils'
import { getBrandConfig } from '@/config/branding'

export interface ArticleJsonLd {
  type: 'BlogPosting'
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}

export interface FaqJsonLd {
  type: 'FAQPage'
  questions: Array<{ question: string; answer: string }>
}

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const generateArticleJsonLd = (data: ArticleJsonLd): object => {
  const baseUrl = getBaseUrl()
  const brand = getBrandConfig()
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    datePublished: data.datePublished,
    ...(data.dateModified && { dateModified: data.dateModified }),
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`,
    },
    ...(data.image && {
      image: {
        '@type': 'ImageObject',
        url: data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`,
      },
    }),
    url: data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`,
  }
}

export const generateFaqJsonLd = (data: FaqJsonLd): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: escapeHtml(q.answer),
      },
    })),
  }
}

export const generateBlogJsonLd = (siteUrl: string, blogName: string): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: blogName,
    url: `${siteUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: blogName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/image.png`,
      },
    },
  }
}
