import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/utils'
import { getBrandConfig } from '@/config/branding'
import { generateHreflangMetadata } from '@/lib/i18n/hreflang'

/**
 * Site configuration for SEO
 */
const brandConfig = getBrandConfig()

export const siteConfig = {
  name: brandConfig.name,
  // TODO: Replace with your product description
  description:
    'A production-ready Next.js SaaS boilerplate with auth, payments, and everything you need to launch fast.',
  url: getBaseUrl(),
  // TODO: Replace with your Twitter/X handle
  twitterHandle: '@yourhandle',
  // TODO: Replace with your company name
  creator: 'Your Company',
  keywords: [
    'Next.js SaaS boilerplate',
    'Open source SaaS template',
    'SaaS starter kit',
    'Next.js template',
    'Drizzle ORM',
    'Better Auth',
    'TypeScript boilerplate',
    'React SaaS',
    'Stripe integration',
    'Polar payments',
    'Resend email',
  ],
} as const

/**
 * Type for SEO metadata options
 *
 * @example
 * // Marketing page
 * generateMetadata({ title: 'Home', description: 'Welcome to our app', canonical: '/' })
 *
 * @example
 * // Page with hreflang alternates
 * generateMetadata({ title: 'Home', locale: 'en', alternateLocales: ['es', 'fr'] })
 */
export type SEOOptions = {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
  isRootLayout?: boolean
  allowCanonicalQuery?: boolean
  /** Current page locale, used for hreflang */
  locale?: string
  /** Other available locales for hreflang alternates */
  alternateLocales?: string[]
  /** Pathname without locale prefix for hreflang (e.g. '/pricing') */
  pathname?: string
}

/**
 * Generate absolute URL from a path
 */
const getAbsoluteUrl = (path: string): string => {
  const trimmed = path.trim()
  const isAbsolute = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')
  if (isAbsolute) {
    return trimmed
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${baseUrl}${cleanPath}`
}

const normalizeCanonicalPath = (canonicalPath?: string, allowQuery?: boolean) => {
  if (!canonicalPath) {
    return canonicalPath
  }

  const [withoutHash] = canonicalPath.split('#')
  if (allowQuery) {
    return withoutHash
  }

  const [withoutQuery] = withoutHash.split('?')
  return withoutQuery
}

/**
 * Generate Open Graph metadata
 */
const getOpenGraph = (options: SEOOptions) => {
  const imageUrl = options.image || '/opengraph-image.png'

  return {
    type: options.type || 'website',
    url: options.canonical ? getAbsoluteUrl(options.canonical) : siteConfig.url,
    title: options.title || siteConfig.name,
    description: options.description || siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: imageUrl,
        ...(options.imageAlt && { alt: options.imageAlt }),
      },
    ],
    ...(options.publishedTime && { publishedTime: options.publishedTime }),
    ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
    ...(options.authors && { authors: options.authors }),
  }
}

/**
 * Generate Twitter Card metadata
 */
const getTwitterCard = (options: SEOOptions) => {
  const imageUrl = options.image || '/twitter-image.png'

  return {
    card: 'summary_large_image' as const,
    title: options.title || siteConfig.name,
    description: options.description || siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [imageUrl],
  }
}

/**
 * Generate hreflang alternate language entries for international pages.
 * Returns an object mapping locale codes to their absolute URLs.
 *
 * @example
 * getAlternateLanguages({ locale: 'en', alternateLocales: ['es', 'fr'], canonical: '/' })
 * // => { es: 'https://example.com/es/', fr: 'https://example.com/fr/' }
 */
const getAlternateLanguages = (options: SEOOptions): Record<string, string> | undefined => {
  if (!options.alternateLocales?.length) return undefined
  return Object.fromEntries(
    options.alternateLocales.map((locale) => [
      locale,
      `${siteConfig.url}/${locale}${options.canonical || ''}`,
    ])
  )
}

/**
 * Generate comprehensive metadata for a page.
 * This is the main function to use for generating SEO metadata.
 *
 * @example
 * // Marketing page
 * export const metadata: Metadata = generateMetadata({
 *   title: 'Home',
 *   description: 'Welcome to My SaaS App',
 *   canonical: '/',
 * })
 *
 * @example
 * // Auth page (noindex)
 * export const metadata: Metadata = generateMetadata({
 *   title: 'Login',
 *   noindex: true,
 *   nofollow: true,
 * })
 *
 * @example
 * // Internationalized page with hreflang
 * export const metadata: Metadata = generateMetadata({
 *   title: 'Home',
 *   canonical: '/',
 *   locale: 'en',
 *   alternateLocales: ['es', 'fr'],
 * })
 */
export const generateMetadata = (options: SEOOptions = {}): Metadata => {
  const description = options.description || siteConfig.description
  const keywords = options.keywords || siteConfig.keywords
  const normalizedCanonicalPath = normalizeCanonicalPath(
    options.canonical,
    options.allowCanonicalQuery
  )
  const canonicalUrl = normalizedCanonicalPath
    ? getAbsoluteUrl(normalizedCanonicalPath)
    : siteConfig.url

  const alternateLanguages = getAlternateLanguages(options)

  // Generate hreflang if locale and pathname are provided (i18n approach)
  const hreflangAlternates =
    options.locale && options.pathname ? generateHreflangMetadata(options.pathname) : null

  // For root layout, use absolute and template
  // For child pages, just use string title (template will be applied automatically)
  const titleMetadata = options.isRootLayout
    ? {
        absolute: options.title || siteConfig.name,
        template: `%s · ${siteConfig.name}`,
      }
    : options.title || siteConfig.name

  return {
    title: titleMetadata,
    description,
    keywords: keywords.join(', '),
    authors: options.authors
      ? options.authors.map((author) => ({ name: author }))
      : [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
      ...(alternateLanguages && { languages: alternateLanguages }),
      ...(hreflangAlternates || {}),
    },
    openGraph: getOpenGraph({
      ...options,
      canonical: normalizedCanonicalPath,
    }),
    twitter: getTwitterCard({
      ...options,
      canonical: normalizedCanonicalPath,
    }),
    robots: {
      index: !options.noindex,
      follow: !options.nofollow,
      googleBot: {
        index: !options.noindex,
        follow: !options.nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate JSON-LD structured data for organization
 */
export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: getAbsoluteUrl('/logo.png'),
    // TODO: Replace with your organization's social/web profiles
    sameAs: ['https://github.com/your-org', 'https://x.com/yourhandle'],
  }
}

/**
 * Generate JSON-LD structured data for website
 */
export const getWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  }
}

/**
 * Generate JSON-LD structured data for article/blog post
 */
export const getArticleSchema = (options: {
  title: string
  description: string
  image?: string
  publishedTime: string
  modifiedTime?: string
  author?: string
  url: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description,
    datePublished: options.publishedTime,
    ...(options.modifiedTime && { dateModified: options.modifiedTime }),
    author: {
      '@type': 'Person',
      name: options.author || siteConfig.creator,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: getAbsoluteUrl('/image.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getAbsoluteUrl(options.url),
    },
  }
}

/**
 * Generate JSON-LD structured data for FAQ pages (FAQPage schema).
 * Improves search result visibility with rich snippets.
 *
 * @param questions - Array of question/answer pairs
 *
 * @example
 * getFAQSchema([
 *   { question: 'What is this app?', answer: 'A Next.js SaaS boilerplate.' },
 * ])
 */
export const getFAQSchema = (questions: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

/**
 * Alias for getFAQSchema — generates JSON-LD structured data for FAQ page.
 */
export const getFAQPageSchema = getFAQSchema

/**
 * Generate JSON-LD structured data for SaaS/software applications using brand config.
 * Uses GeoConfig if available for richer schema data.
 */
export const getSoftwareApplicationSchema = () => {
  const brand = getBrandConfig()
  const geo = brand.geo

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: brand.name,
    description: geo?.aiDescription || siteConfig.description,
    applicationCategory: geo?.softwareCategory || 'WebApplication',
    operatingSystem: geo?.operatingSystem || 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    url: siteConfig.url,
    ...(brand.supportEmail && { email: brand.supportEmail }),
  }
}

/**
 * Generate JSON-LD structured data for product
 */
export const getProductSchema = (
  options: { price?: string; currency?: string; availability?: string } = {}
) => {
  const brand = getBrandConfig()
  const geo = brand.geo

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brand.name,
    description: geo?.aiDescription || siteConfig.description,
    url: siteConfig.url,
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    offers: {
      '@type': 'Offer',
      price: options.price || '0',
      priceCurrency: options.currency || 'USD',
      availability: options.availability || 'https://schema.org/InStock',
    },
  }
}

/**
 * Generate JSON-LD structured data for blog/collection page
 */
export const getBlogSchema = (options: {
  name: string
  description: string
  url: string
  posts: Array<{
    title: string
    url: string
    datePublished: string
    author?: string
  }>
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: options.name,
    description: options.description,
    url: getAbsoluteUrl(options.url),
    blogPost: options.posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: getAbsoluteUrl(post.url),
      datePublished: post.datePublished,
      ...(post.author && {
        author: {
          '@type': 'Person',
          name: post.author,
        },
      }),
    })),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: getAbsoluteUrl('/image.png'),
      },
    },
  }
}
