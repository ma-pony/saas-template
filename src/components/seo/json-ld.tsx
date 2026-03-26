import {
  getOrganizationSchema,
  getWebsiteSchema,
  getArticleSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getSoftwareApplicationSchema,
} from '@/lib/seo'

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Generic JSON-LD script tag component.
 * Renders structured data as a <script type="application/ld+json"> tag.
 * Must be used as a Server Component (no 'use client').
 *
 * @example
 * <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'My Site' }} />
 */
const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

/**
 * Injects Organization structured data into the page.
 * Use in the root layout for site-wide organization markup.
 */
const OrganizationJsonLd = () => <JsonLd data={getOrganizationSchema()} />

/**
 * Injects WebSite structured data into the page.
 * Use in the root layout for site-wide website markup with search action.
 */
const WebsiteJsonLd = () => <JsonLd data={getWebsiteSchema()} />

type ArticleJsonLdProps = Parameters<typeof getArticleSchema>[0]

/**
 * Injects Article structured data into the page.
 * Use on blog post or article pages.
 *
 * @example
 * <ArticleJsonLd
 *   title="My Post"
 *   description="Post description"
 *   publishedTime="2024-01-01"
 *   url="/blog/my-post"
 * />
 */
const ArticleJsonLd = (props: ArticleJsonLdProps) => <JsonLd data={getArticleSchema(props)} />

type BreadcrumbJsonLdProps = { items: Array<{ name: string; url: string }> }

/**
 * Injects BreadcrumbList structured data into the page.
 * Helps search engines display breadcrumb navigation in results.
 *
 * @example
 * <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }]} />
 */
const BreadcrumbJsonLd = ({ items }: BreadcrumbJsonLdProps) => (
  <JsonLd data={getBreadcrumbSchema(items)} />
)

type FAQJsonLdProps = { questions: Array<{ question: string; answer: string }> }

/**
 * Injects FAQPage structured data into the page.
 * Enables rich FAQ snippets in Google search results.
 *
 * @example
 * <FAQJsonLd questions={[{ question: 'What is this app?', answer: 'A Next.js SaaS boilerplate.' }]} />
 */
const FAQJsonLd = ({ questions }: FAQJsonLdProps) => <JsonLd data={getFAQSchema(questions)} />

type SoftwareApplicationJsonLdProps = {
  name: string
  description: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: { price: string; priceCurrency: string }
}

/**
 * Injects SoftwareApplication structured data into the page.
 * Ideal for SaaS product pages to improve search result appearance.
 *
 * @example
 * <SoftwareApplicationJsonLd
 *   name="My SaaS App"
 *   description="A free Next.js SaaS boilerplate."
 *   offers={{ price: '0', priceCurrency: 'USD' }}
 * />
 */
const SoftwareApplicationJsonLd = (props: SoftwareApplicationJsonLdProps) => (
  <JsonLd data={getSoftwareApplicationSchema()} />
)

export {
  JsonLd,
  OrganizationJsonLd,
  WebsiteJsonLd,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
  SoftwareApplicationJsonLd,
}
