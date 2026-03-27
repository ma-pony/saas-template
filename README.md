# Next.js SaaS Boilerplate

A production-ready Next.js SaaS template built with modern web technologies. Clone this repo to skip weeks of setup and start building your product immediately.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Brand Customization](#brand-customization)
  - [Feature Flags](#feature-flags)
- [Authentication](#authentication)
  - [Email & Password](#email--password)
  - [Social OAuth](#social-oauth)
  - [Email OTP](#email-otp)
  - [Multi-tenant Organizations](#multi-tenant-organizations)
- [Payments](#payments)
  - [Provider Setup](#provider-setup)
  - [Plans & Pricing](#plans--pricing)
  - [Webhooks](#webhooks)
  - [Client-side Hooks](#client-side-hooks)
- [Email](#email)
  - [Provider Setup](#email-provider-setup)
  - [Sending Emails](#sending-emails)
  - [Email Templates](#email-templates)
- [Internationalization (i18n)](#internationalization-i18n)
  - [Supported Locales](#supported-locales)
  - [Using Translations](#using-translations)
  - [Locale-aware Navigation](#locale-aware-navigation)
  - [Adding a New Locale](#adding-a-new-locale)
  - [GEO-based Detection](#geo-based-detection)
  - [Currency Formatting](#currency-formatting)
- [Database](#database)
  - [Schema Overview](#schema-overview)
  - [Running Migrations](#running-migrations)
- [SEO](#seo)
  - [Metadata Generation](#metadata-generation)
  - [JSON-LD Structured Data](#json-ld-structured-data)
  - [Sitemap & Robots](#sitemap--robots)
  - [AI Crawler Support](#ai-crawler-support)
- [Analytics](#analytics)
- [Background Jobs](#background-jobs)
  - [Creating a Job](#creating-a-job)
  - [Job Pipeline](#job-pipeline)
- [Blog](#blog)
- [Admin Dashboard](#admin-dashboard)
- [Storage (Cloudflare R2)](#storage-cloudflare-r2)
- [Rate Limiting](#rate-limiting)
- [Cookie Consent (GDPR)](#cookie-consent-gdpr)
- [GEO Components](#geo-components)
- [Monitoring (Sentry)](#monitoring-sentry)
- [Deployment](#deployment)
  - [Vercel](#vercel)
  - [Docker](#docker)
- [Commands Reference](#commands-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication** — Email/password, social OAuth (Google, GitHub, Microsoft, Facebook), email OTP, multi-tenant organizations via Better-Auth
- **Payments** — Stripe, Polar, LemonSqueezy with unified adapter pattern — swap providers with a single env var
- **Email** — Resend, Postmark, Plunk, Nodemailer with auto-discovery fallback — email never throws in dev
- **i18n** — 4 locales (en, es, fr, zh) with GEO-based detection, currency formatting, hreflang SEO
- **SEO** — Open Graph, Twitter Cards, JSON-LD schemas, sitemap, robots.txt, `llms.txt` for AI crawlers
- **Analytics** — Plausible, Umami, Google Analytics with consent-aware tracking
- **Admin Dashboard** — Role-based admin panel with user management and stats
- **Background Jobs** — Cron framework with `node-cron` (local) and Vercel Cron adapters
- **Blog** — MDX-based blog with categories, tags, RSS, and syntax highlighting
- **Storage** — Cloudflare R2 integration for file uploads and signed URLs
- **Rate Limiting** — In-memory sliding window limiter with IP detection
- **Cookie Consent** — GDPR-compliant banner for EU users with granular consent categories
- **Docker** — Multi-stage production Dockerfile included

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + React 19 |
| Runtime | Bun |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better-Auth |
| Payments | Stripe / Polar / LemonSqueezy |
| Email | Resend / Postmark / Plunk / Nodemailer |
| Styling | TailwindCSS 4 + Radix UI primitives |
| i18n | next-intl (en, es, fr, zh) |
| Validation | Zod + @t3-oss/env-nextjs |
| Linting | Biome |
| Monitoring | Sentry |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/saas-template.git
cd saas-template

# 2. Copy environment file
cp .env.example .env.local

# 3. Fill in minimum required env vars in .env.local:
#    DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL

# 4. Install dependencies
bun install

# 5. Run database migrations
bun run migrate:local

# 6. Start development server
bun dev
```

**Minimum required environment variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mydb` |
| `BETTER_AUTH_SECRET` | Auth secret key (min 32 chars) | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Must match `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | `http://localhost:3000` |

All other features (OAuth, payments, email, analytics) work out of the box with sensible defaults when their env vars are absent.

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-aware pages
│   │   ├── (auth)/            # Login, register, verify, reset-password
│   │   ├── (main)/            # Dashboard (authenticated)
│   │   ├── terms/             # Legal: terms of service
│   │   ├── licenses/          # Legal: licenses
│   │   └── privacy/           # Legal: privacy policy
│   ├── (auth)/                # Shared auth components (NOT pages)
│   ├── (site)/                # Marketing/landing pages (no i18n)
│   ├── admin/                 # Admin dashboard (/admin)
│   ├── api/
│   │   ├── auth/[...all]/     # Better-Auth handler
│   │   ├── payments/          # Checkout, portal, subscription endpoints
│   │   ├── webhooks/payments/ # Unified payment webhook
│   │   └── jobs/              # Background job triggers
│   ├── blog/                  # MDX blog (no i18n)
│   ├── sitemap.ts             # Dynamic XML sitemap
│   └── robots.ts              # robots.txt
├── components/
│   ├── ui/                    # Shadcn/Radix UI components
│   ├── emails/                # React Email templates
│   ├── seo/                   # JSON-LD components
│   ├── geo/                   # SEO-optimized GEO components
│   ├── analytics/             # Analytics script injection
│   └── consent/               # Cookie consent banner
├── config/
│   ├── env.ts                 # Environment validation (@t3-oss/env-nextjs)
│   ├── branding.ts            # Brand name, theme, logo, links
│   ├── payments.ts            # Plan catalog and pricing
│   └── feature-flags.ts       # Feature flag booleans
├── database/
│   ├── schema.ts              # Drizzle schema definitions
│   └── index.ts               # Database connection
├── i18n/
│   ├── navigation.ts          # Locale-aware Link, useRouter, redirect
│   ├── routing.ts             # Locale list and routing config
│   └── request.ts             # next-intl plugin entry
├── lib/
│   ├── auth/                  # Better-Auth server & client config
│   ├── payments/              # Payment adapter pattern
│   ├── messaging/email/       # Email adapter pattern
│   ├── analytics/             # Analytics adapter pattern
│   ├── jobs/                  # Background job framework
│   ├── i18n/                  # Locale detection, currency, hreflang
│   ├── rate-limit/            # Rate limiter
│   ├── storage.ts             # Cloudflare R2 client
│   ├── seo.ts                 # SEO metadata + JSON-LD generators
│   └── consent/               # Cookie consent store (Zustand)
├── messages/                  # Translation JSON files (en, es, fr, zh)
└── content/blog/              # MDX blog posts
```

**Key conventions:**
- `@/*` path alias maps to `src/*`
- `src/app/(auth)/` contains **shared components** (forms, backgrounds) imported by `[locale]/(auth)/` pages — they are not pages themselves
- `src/app/(site)/` is outside `[locale]` — marketing pages without i18n
- Server Components by default; only add `'use client'` when interactivity is needed

---

## Configuration

### Environment Variables

All environment variables are validated via `@t3-oss/env-nextjs` in `src/config/env.ts`. **Never read `process.env` directly** — always import from:

```ts
import { env } from '@/config/env'
```

To add a new env var, add it to both `.env.local` and the Zod schema in `src/config/env.ts`:
- Server-only vars → `server` object
- Client vars (prefixed `NEXT_PUBLIC_`) → `client` object

See [`.env.example`](.env.example) for the full list with descriptions.

### Brand Customization

After cloning, update these files to apply your brand:

| File | What to Change |
|------|---------------|
| `src/config/branding.ts` | App name, support email, logo URL, theme colors, social links |
| `src/lib/seo.ts` | Site description, Twitter handle, keywords |
| `src/lib/constants.ts` | `APP_COOKIE_NAME` — cookie prefix for your app |
| `src/app/manifest.ts` | PWA manifest descriptions |
| `package.json` | `name` and `description` fields |

**Visual assets** — replace in `public/`:

| File | Description |
|------|-------------|
| `public/image.png` | App logo (128x128 PNG) |
| `public/opengraph-image.png` | OG social share image (1200x630) |
| `public/twitter-image.png` | Twitter card image (1200x630) |
| `public/favicon/` | Favicon suite |

**Landing page** — update components in `src/app/(site)/`:

- `navbar.tsx` — brand name, logo, GitHub link
- `hero.tsx` — headline, description, CTA
- `footer.tsx` — brand name, tagline, copyright
- `faq.tsx` — FAQ items, contact email
- `pricing.tsx` — pricing tiers, features

Search for `// TODO:` comments for a complete checklist.

### Feature Flags

Defined in `src/config/feature-flags.ts`:

```ts
import { isBillingEnabled, isEmailVerificationEnabled } from '@/config/feature-flags'
```

| Flag | Env Var | Default | Description |
|------|---------|---------|-------------|
| `isBillingEnabled` | `BILLING_ENABLED` | `false` | Gate payment enforcement |
| `isEmailVerificationEnabled` | `EMAIL_VERIFICATION_ENABLED` | `false` | Require email verification on signup |
| `isStripeConfigured` | Auto-detected | — | `true` when Stripe keys are present |
| `isPolarConfigured` | Auto-detected | — | `true` when Polar keys are present |
| `isLemonSqueezyConfigured` | Auto-detected | — | `true` when LemonSqueezy keys are present |
| `hasBillingProvider` | Auto-detected | — | `true` when any payment provider is configured |

---

## Authentication

Built on [Better-Auth](https://www.better-auth.com/) with Drizzle adapter.

### Email & Password

Enabled by default. Set `EMAIL_VERIFICATION_ENABLED=true` to require email verification before login.

```ts
// Client-side
import { signUp, signIn, signOut, useSession } from '@/lib/auth/auth-client'

// Sign up
await signUp.email({ email, password, name })

// Sign in
await signIn.email({ email, password })

// Get session
const { data: session } = useSession()

// Sign out
await signOut()
```

### Social OAuth

Each provider activates automatically when its credentials are present in env:

| Provider | Required Env Vars |
|----------|------------------|
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Microsoft | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` |
| Facebook | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` |

```ts
import { signIn } from '@/lib/auth/auth-client'

await signIn.social({ provider: 'google', callbackURL: '/dashboard' })
await signIn.social({ provider: 'github', callbackURL: '/dashboard' })
```

### Email OTP

6-digit OTP with 15-minute expiry, used for email verification:

```ts
import { emailOtp } from '@/lib/auth/auth-client'

// Send OTP
await emailOtp.sendVerificationOtp({ email, type: 'email-verification' })

// Verify OTP
await emailOtp.verifyEmail({ email, otp: '123456' })
```

### Multi-tenant Organizations

Enabled via Better-Auth's `organization` plugin:

```ts
import { organization } from '@/lib/auth/auth-client'

// Create org, invite members, switch active org
```

**Session settings:** 30-day expiry, 24-hour update interval, 1-hour freshness window, cookie caching enabled.

---

## Payments

Unified adapter pattern — swap providers by changing one env var.

### Provider Setup

Set `PAYMENT_PROVIDER` to one of: `stripe` (default), `polar`, `lemonsqueezy`.

| Provider | Required Env Vars |
|----------|------------------|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PRICE_*` |
| Polar | `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ORGANIZATION_ID`, `POLAR_PRODUCT_ID`, `NEXT_PUBLIC_POLAR_PRODUCT_*` |
| LemonSqueezy | `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `LEMONSQUEEZY_STORE_ID`, `NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_*` |

### Plans & Pricing

Defined in `src/config/payments.ts`:

| Plan | Monthly | Annual | Trial |
|------|---------|--------|-------|
| Free | $0 | $0 | — |
| Starter | $9.90 | $99/yr | 14 days |
| Pro | $29.90 | $299/yr | 14 days |
| Enterprise | $99.90 | $999/yr | 30 days |

Edit `src/config/payments.ts` to customize plans, pricing, and feature lists. Regional payment methods (Alipay, WeChat Pay, iDEAL, SEPA) are pre-configured.

### Webhooks

All providers share a single endpoint: `POST /api/webhooks/payments`

| Provider | Signature Header |
|----------|-----------------|
| Stripe | `stripe-signature` |
| Polar | `polar-webhook-signature` |
| LemonSqueezy | `x-signature` |

The webhook handler validates signatures, processes events (customer created, subscription updated, payment completed), and writes to the database with idempotency via unique indexes on `provider_*_id` columns.

### Client-side Hooks

```ts
import { useSubscription, useCheckout, usePortal } from '@/lib/payments/hooks'

// Get current subscription
const { data: subscription, isLoading } = useSubscription()

// Initiate checkout (redirects to provider)
const checkout = useCheckout()
checkout.mutate({ priceId: 'price_xxx', plan: 'pro', interval: 'month' })

// Open customer portal
const portal = usePortal()
portal.mutate()
```

**API routes:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/checkout` | Create checkout session |
| POST | `/api/payments/portal` | Create customer portal session |
| GET | `/api/payments/subscription` | Get current user's subscription |

---

## Email

### Email Provider Setup

Set `EMAIL_PROVIDER` or let the system auto-discover the first configured provider.

| Provider | Required Env Vars |
|----------|------------------|
| Resend | `RESEND_API_KEY`, `RESEND_DOMAIN` |
| Postmark | `POSTMARK_API_TOKEN` |
| Plunk | `PLUNK_API_KEY` |
| Nodemailer (SMTP) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Log (default) | None — prints to console |

**Auto-discovery order:** resend → postmark → nodemailer → plunk → custom → log

In development, if no provider is configured, emails are printed to console via the `log` provider. Email flows never throw for missing credentials.

### Sending Emails

```ts
import { sendEmail, sendBatchEmails, hasEmailService } from '@/lib/messaging/email'

// Send a single email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello</p>',
  emailType: 'transactional',
})

// Check if email service is available
if (hasEmailService()) {
  await sendBatchEmails([...])
}
```

Marketing emails automatically include `List-Unsubscribe` headers when `unsubscribeInfo` is provided.

### Email Templates

React Email templates are in `src/components/emails/`. Templates for OTP verification, welcome emails, and password reset are included. Subject lines in `src/components/emails/subjects.ts` use the brand name dynamically.

---

## Internationalization (i18n)

### Supported Locales

| Code | Language | Auto-detect Countries |
|------|----------|-----------------------|
| `en` | English | Default for all others |
| `es` | Spanish | ES, MX, AR, CO, PE, CL, and 16 more |
| `fr` | French | FR, BE, CH, CA, LU, MC, and 15+ African nations |
| `zh` | Chinese | CN, TW, HK, MO |

### Using Translations

Translation files live in `src/messages/{locale}.json`.

```tsx
// Server Component
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('dashboard')
  return <h1>{t('header.title')}</h1>
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations('auth.login')
  return <button>{t('submitButton')}</button>
}
```

### Locale-aware Navigation

Always import navigation utilities from `@/i18n/navigation` instead of `next/navigation`:

```tsx
import { Link, redirect, useRouter, usePathname } from '@/i18n/navigation'

// Link automatically prefixes with current locale
<Link href="/about">About</Link>

// Switch locale
<Link href="/about" locale="fr">About (French)</Link>

// Programmatic navigation
const router = useRouter()
router.push('/dashboard')

// Server-side redirect
redirect('/login')
```

### Adding a New Locale

1. Add the locale code to `SUPPORTED_LOCALES` in `src/lib/i18n/config.ts`
2. Add to `locales` array in `src/i18n/routing.ts`
3. Create `src/messages/de.json` (copy structure from `en.json`)
4. Add display name in `src/components/language-switcher.tsx`:
   ```ts
   const localeNames = { en: 'English', es: 'Español', fr: 'Français', zh: '中文', de: 'Deutsch' }
   ```
5. Add geo mapping in `src/lib/i18n/geo.ts` (optional)
6. Update middleware matcher in `middleware.ts` to include the new locale

### GEO-based Detection

Locale is automatically detected from the user's country via platform headers (`x-vercel-ip-country` or `cf-ipcountry`). Detection priority:

1. `NEXT_LOCALE` cookie (persisted for 1 year)
2. GEO header → country-to-locale mapping
3. `Accept-Language` header (quality-value sorted)

### Currency Formatting

```ts
import { detectCurrency, formatCurrency } from '@/lib/i18n/currency'

const currency = detectCurrency('CN') // → 'CNY'
formatCurrency(29.90, 'USD', 'en')    // → '$29.90'
formatCurrency(29.90, 'CNY', 'zh')    // → '¥29.90'
```

---

## Database

PostgreSQL via `postgres-js` driver + Drizzle ORM.

### Schema Overview

| Table | Description |
|-------|-------------|
| `user` | Users with `role` (default: `'user'`), email (unique), name, image |
| `session` | Sessions with 30-day expiry, linked to user (cascade delete) |
| `account` | OAuth/credential accounts linked to user |
| `verification` | Email verification tokens |
| `customer` | Payment customers with unique `provider_customer_id` |
| `subscription` | Subscriptions with status, plan, interval, billing period |
| `payment` | Payment records with unique `provider_payment_id` |
| `job_execution_logs` | Background job execution history |

Schema uses text primary keys, cascade deletes from `user`, and `$onUpdate` for `updatedAt` timestamps.

### Running Migrations

```bash
# After modifying src/database/schema.ts:
bun run generate-migration   # Generate migration SQL

# Apply locally:
bun run migrate:local

# Apply in production:
bun run migrate:prod
```

---

## SEO

### Metadata Generation

```tsx
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'

export async function generateMetadata() {
  const brand = getBrandConfig()
  return generateSEOMetadata({
    title: `Dashboard | ${brand.name}`,
    description: 'Manage your account',
    noindex: true,       // Exclude from search
    canonical: '/dashboard',
  })
}
```

Supports: Open Graph, Twitter Cards, robots meta, canonical URLs, hreflang alternates, title templates.

### JSON-LD Structured Data

```tsx
import { OrganizationJsonLd, FAQJsonLd, ArticleJsonLd } from '@/components/seo/json-ld'

// In your page
<OrganizationJsonLd />
<FAQJsonLd questions={[{ question: '...', answer: '...' }]} />
```

Available schemas: Organization, WebSite, Article, BreadcrumbList, FAQPage, SoftwareApplication, Product, Blog.

### Sitemap & Robots

- **Sitemap** (`/sitemap.xml`) — auto-generated from static pages, all locales, blog posts, categories, and tags
- **Robots** (`/robots.txt`) — controlled by `NEXT_PUBLIC_ALLOW_ROBOTS`. Set to `"false"` for staging. Default: disallow `/api/`, `/dashboard/`, `/settings/`, `/admin/`

### AI Crawler Support

`/llms.txt` and `/llms-full.txt` endpoints serve AI-friendly site descriptions powered by brand config and GEO settings.

---

## Analytics

Set `NEXT_PUBLIC_ANALYTICS_PROVIDER` to one of: `plausible`, `umami`, `google`, `none`.

| Provider | Required Env Vars |
|----------|------------------|
| Plausible | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` |
| Umami | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL` |
| Google Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

```tsx
// Add analytics script to root layout
import { AnalyticsScript } from '@/components/analytics/analytics-script'
<AnalyticsScript />

// Track custom events
import { useAnalytics } from '@/lib/analytics/hooks'
const { trackEvent } = useAnalytics()
trackEvent('signup', { plan: 'pro' })
```

Predefined events: `signup`, `login`, `subscription_started`, `subscription_cancelled`, `page_view`.

Analytics respects cookie consent — scripts only load after user consent.

---

## Background Jobs

### Creating a Job

1. Define the job in `src/lib/jobs/built-in/`:

```ts
// src/lib/jobs/built-in/my-job.ts
import type { JobDefinition } from '@/lib/jobs/types'

export const myJob: JobDefinition = {
  name: 'my-job',
  schedule: '0 */6 * * *',  // Every 6 hours
  description: 'Does something useful',
  timeoutMs: 60_000,         // 1 minute timeout (default: 30s)
  handler: async (context) => {
    context.logger.info('Starting job')
    // ... do work
    context.logger.info('Job complete', { processed: 42 })
  },
}
```

2. Register in `src/lib/jobs/index.ts`:

```ts
import { myJob } from './built-in/my-job'
registry.register(myJob)
```

3. For Vercel deployment, add to `vercel.json`:

```json
{ "path": "/api/jobs/my-job", "schedule": "0 */6 * * *" }
```

**Provider auto-detection:** Uses `vercel` adapter when `VERCEL` env var is present, otherwise `node-cron`.

Jobs include: in-memory lock (prevents concurrent runs), execution logging to database, timeout enforcement, error reporting to Sentry.

### Job Pipeline

For complex data processing, use the pipeline pattern in `src/lib/jobs/pipeline/`:

```
collect → process → store
```

---

## Blog

MDX-based blog at `/blog` (not under `[locale]`).

**Adding a post:** Create `content/blog/my-post.mdx`:

```mdx
---
title: "My Post Title"
description: "A brief description"
date: "2025-01-15"
author: "Author Name"
categories: ["Engineering"]
tags: ["nextjs", "react"]
coverImage: "/images/blog/my-post.png"
published: true
---

Your markdown content here...
```

**Features:** Categories, tags, syntax highlighting (`rehype-highlight`), GFM tables, auto-linked headings, table of contents component.

```ts
import { getAllPosts, getPostBySlug, getAllCategories } from '@/lib/blog/content-reader'

const posts = await getAllPosts({ limit: 10, offset: 0 })
const post = await getPostBySlug('my-post')
const categories = await getAllCategories()
```

---

## Admin Dashboard

Role-based admin panel at `/admin`. Requires `role: 'admin'` in the `user` table.

**Setting up an admin user:**

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
```

**Features:**
- Overview stats (users, subscriptions, revenue)
- User management with search and pagination
- Protected by server-side session check in layout

Non-authenticated users redirect to login. Non-admin users redirect to dashboard.

---

## Storage (Cloudflare R2)

File storage via Cloudflare R2 (S3-compatible), using `aws4fetch`.

**Required env vars:** `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_URL`, `R2_PUBLIC_BUCKET`, `R2_PRIVATE_BUCKET`

```ts
import { uploadBase64, uploadBlob, getSignedUrl, deleteObject } from '@/lib/storage'

// Upload base64 image
const url = await uploadBase64(base64String, 'avatars/user-123.png', 'public')

// Get signed download URL (expires in 1 hour)
const signedUrl = await getSignedUrl('documents/report.pdf', 'private')

// Delete object
await deleteObject('avatars/old.png', 'public')
```

---

## Rate Limiting

In-memory sliding window rate limiter.

```ts
import { createRateLimiter } from '@/lib/rate-limit'

const limiter = createRateLimiter({
  windowMs: 60_000,   // 1 minute window
  max: 60,            // 60 requests per window
  message: 'Too many requests',
})

// In API route
export async function POST(request: Request) {
  const result = await limiter(request)
  if (result instanceof Response) return result  // 429 Too Many Requests
  // ... handle request
}
```

IP detection: `x-real-ip` → `x-vercel-forwarded-for` → `cf-connecting-ip` → `x-forwarded-for`.

Rate limit responses include `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

---

## Cookie Consent (GDPR)

EU-only consent banner with granular categories.

**Categories:**
- `necessary` — always on, cannot be disabled
- `analytics` — analytics tracking scripts
- `marketing` — marketing/advertising scripts

**Usage:**

```tsx
// In your layout
import CookieConsentBanner from '@/components/consent/cookie-consent-banner'
<CookieConsentBanner locale={locale} countryCode={countryCode} />
```

The banner only displays for EU users (detected via country code). It includes built-in translations (en, es, fr, zh) — no next-intl dependency.

```ts
// Read consent state
import { useConsentStore } from '@/lib/consent/store'
const { consent, status, acceptAll, rejectAll } = useConsentStore()
```

---

## GEO Components

SEO-optimized components for AI engine optimization, in `src/components/geo/`:

- **`ComparisonTable`** — semantic HTML table with optional `schema.org/Table` markup
- **`DirectAnswer`** — FAQ-style direct answer block
- **`FAQSchema`** — FAQ structured data component

These generate rich snippets and improve search visibility for landing pages.

---

## Monitoring (Sentry)

Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` to enable error tracking.

**Config files:**
- `sentry.server.config.ts` — server-side DSN
- `sentry.edge.config.ts` — edge runtime DSN
- `instrumentation.ts` — server instrumentation hook
- `instrumentation-client.ts` — client instrumentation hook

Monitoring tunnel at `/monitoring` bypasses ad-blockers.

---

## Deployment

### Vercel

The project is pre-configured for Vercel with:
- `vercel.json` — cron schedules, caching headers, doc rewrites
- Automatic locale detection via `x-vercel-ip-country` header
- Sentry integration with automatic monitors

**Steps:**
1. Connect your repo to Vercel
2. Set all required env vars in Vercel dashboard
3. Run `bun run migrate:prod` to apply database migrations
4. Deploy

### Docker

Multi-stage production Dockerfile included in `docker/`.

```bash
# 1. Enable standalone output in next.config.ts:
#    output: 'standalone'

# 2. Build image
docker build -f docker/Dockerfile -t my-saas-app:latest .

# 3. Run
docker run -p 3000:3000 --env-file .env.local my-saas-app:latest
```

Compose files for different environments:
- `docker/development/compose.yaml` — port 3001
- `docker/staging/compose.yaml` — port 3002
- `docker/production/compose.yaml` — port 3003

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Production build |
| `bun start` | Start production server |
| `bun lint` | Run Biome linter |
| `bun format` | Format code with Biome |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run generate-migration` | Generate Drizzle migration after schema changes |
| `bun run migrate:local` | Run migrations locally |
| `bun run migrate:prod` | Run migrations in production |
| `bun run setup` | Run initial setup script |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Bug reports and feature requests via [GitHub Issues](https://github.com/your-username/saas-template/issues).

## License

See [LICENSE](LICENSE) for details.
