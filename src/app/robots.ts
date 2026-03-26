import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'
import { env } from '@/config/env'

/**
 * Generate robots.txt configuration.
 * Set NEXT_PUBLIC_ALLOW_ROBOTS=false to block all crawlers (e.g., for staging environments).
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const allowRobots = env.NEXT_PUBLIC_ALLOW_ROBOTS !== 'false'

  if (!allowRobots) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
