import { getBrandConfig } from '@/config/branding'
import { getBaseUrl } from '@/lib/utils'

export interface LlmsPage {
  title: string
  url: string
  description?: string
}

/**
 * Core pages for this application
 */
export const DEFAULT_PAGES: LlmsPage[] = [
  {
    title: 'Home',
    url: '/',
    description: 'Landing page — overview of the Next.js SaaS boilerplate, features, and pricing.',
  },
  {
    title: 'Pricing',
    url: '/#pricing',
    description: 'Pricing plans, including the free open-source tier and pro upgrade.',
  },
  {
    title: 'Documentation',
    url: '/docs',
    description: 'Full documentation for setting up and extending the platform.',
  },
  {
    title: 'Terms of Service',
    url: '/terms',
    description: 'Terms of service governing use of the platform.',
  },
  {
    title: 'Privacy Policy',
    url: '/privacy',
    description: 'Privacy policy describing how the platform collects and handles user data.',
  },
]

/**
 * Generate llms.txt content following the llms.txt specification.
 * Format: brand name header, AI description, optional keywords, then page list.
 */
export const generateLlmsTxt = (pages: LlmsPage[]): string => {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const lines: string[] = []

  lines.push(`# ${brand.name}`)
  lines.push('')

  if (brand.geo?.aiDescription) {
    lines.push(`> ${brand.geo.aiDescription}`)
    lines.push('')
  }

  if (brand.geo?.primaryKeywords && brand.geo.primaryKeywords.length > 0) {
    lines.push(`Keywords: ${brand.geo.primaryKeywords.join(', ')}`)
    lines.push('')
  }

  lines.push('## Pages')
  lines.push('')

  for (const page of pages) {
    const absoluteUrl = page.url.startsWith('http') ? page.url : `${baseUrl}${page.url}`
    lines.push(`- [${page.title}](${absoluteUrl})`)
  }

  return lines.join('\n')
}

/**
 * Generate llms-full.txt content with detailed page descriptions.
 * Format: brand name header, AI description, optional keywords, then detailed page sections.
 */
export const generateLlmsFullTxt = (pages: LlmsPage[]): string => {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl().replace(/\/$/, '')
  const lines: string[] = []

  lines.push(`# ${brand.name}`)
  lines.push('')

  if (brand.geo?.aiDescription) {
    lines.push(`> ${brand.geo.aiDescription}`)
    lines.push('')
  }

  if (brand.geo?.primaryKeywords && brand.geo.primaryKeywords.length > 0) {
    lines.push(`Keywords: ${brand.geo.primaryKeywords.join(', ')}`)
    lines.push('')
  }

  lines.push('## Pages')
  lines.push('')

  for (const page of pages) {
    const absoluteUrl = page.url.startsWith('http') ? page.url : `${baseUrl}${page.url}`
    lines.push(`### [${page.title}](${absoluteUrl})`)
    if (page.description) {
      lines.push('')
      lines.push(page.description)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
