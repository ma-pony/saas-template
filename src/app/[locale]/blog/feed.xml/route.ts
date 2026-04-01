import { getAllPosts } from '@/lib/blog/content-reader'
import { getBaseUrl } from '@/lib/utils'
import { siteConfig } from '@/lib/seo'
import { SUPPORTED_LOCALES } from '@/lib/i18n/config'

export const dynamic = 'force-static'

export const generateStaticParams = () =>
  SUPPORTED_LOCALES.map((locale) => ({ locale }))

export const GET = async (_req: Request, { params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const baseUrl = getBaseUrl()
  const posts = getAllPosts({ limit: 20 })

  const rssItems = posts
    .map((post) => {
      const postUrl = `${baseUrl}/${locale}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()
      const categories = post.categories
        .map((cat) => `<category><![CDATA[${cat}]]></category>`)
        .join('\n        ')

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author}</author>
      ${categories}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteConfig.name} Blog]]></title>
    <link>${baseUrl}/${locale}/blog</link>
    <description><![CDATA[${siteConfig.description}]]></description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/${locale}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
