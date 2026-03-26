import { NextResponse } from 'next/server'
import { siteConfig } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'

/**
 * GET /llms.txt
 *
 * Generates an llms.txt file following the llmstxt.org specification.
 * This file helps AI language models understand the site's content and purpose.
 */
export const GET = () => {
  const brandConfig = getBrandConfig()

  const content = `# ${brandConfig.name}

> ${siteConfig.description}

${brandConfig.name} is a production-ready Next.js SaaS boilerplate that helps developers ship SaaS products in days rather than weeks.

## Core Features

- Authentication: Email + OAuth (Google/GitHub/Microsoft/Facebook) + OTP verification
- Payments: Stripe / Polar / LemonSqueezy multi-provider support
- Email: Resend / Postmark / Nodemailer / Plunk multi-provider support
- Internationalization: English, Spanish, French support
- Database: PostgreSQL + Drizzle ORM

## Main Pages

- Home: ${siteConfig.url}
- Pricing: ${siteConfig.url}/pricing
- Privacy Policy: ${siteConfig.url}/privacy
- Terms of Service: ${siteConfig.url}/terms

## License

This project is open-source software.
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
