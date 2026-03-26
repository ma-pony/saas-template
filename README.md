# Next.js SaaS Boilerplate

A production-ready Next.js SaaS boilerplate built with modern web technologies. Clone this repo to skip weeks of setup and start building your product immediately.

## Features

- SEO Optimization
- User authentication with Better-Auth (email/password, magic links, social OAuth)
- Stripe, Polar, LemonSqueezy billing integration
- Email messaging via Resend, Postmark, Plunk, and Nodemailer
- Modern UI built with Next.js, TailwindCSS, and BaseUI
- Bun as runtime and package manager
- Drizzle ORM and Postgres for database operations
- Internationalization (i18n) with next-intl supporting English, French, and Spanish
- Background jobs / cron support

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your values
3. Run `bun install` to install dependencies
4. Run `bun run migrate:local` to set up the database
5. Run `bun dev` to start the development server

## Commands

- `bun dev` — start dev server
- `bun build` — production build
- `bun lint` — run Biome linter
- `bun format` — format with Biome
- `bun run typecheck` — run `tsc --noEmit`
- `bun run generate-migration` — generate Drizzle migration after schema changes
- `bun run migrate:local` — run migrations locally

## Brand Customization Guide

After cloning, replace the following files and values to apply your own brand:

### Configuration Files

| File | What to change |
|------|---------------|
| `package.json` | `name` and `description` fields |
| `src/config/branding.ts` | `defaultConfig.name` (app name) and `defaultConfig.supportEmail` |
| `src/lib/seo.ts` | `siteConfig.description`, `twitterHandle`, `creator`, `keywords`, `sameAs` links |
| `src/lib/constants.ts` | `APP_COOKIE_NAME` (cookie prefix for your app) |
| `src/app/layout.tsx` | Root metadata `title` and `description` |
| `src/app/manifest.ts` | PWA manifest `description` and shortcut descriptions |

### Visual Assets

Replace these files in the `public/` directory with your own brand assets:

| File | Description |
|------|-------------|
| `public/image.png` | App logo (recommended: 128×128 PNG) |
| `public/opengraph-image.png` | Open Graph social share image (recommended: 1200×630) |
| `public/twitter-image.png` | Twitter/X card image (recommended: 1200×630) |
| `public/favicon/` | Favicon suite (favicon.ico, apple-touch-icon.png, android-chrome files) |

### Landing Page Components

Update the following components under `src/app/(site)/` to reflect your product's content:

- `navbar.tsx` — brand name, logo alt text, GitHub repo link
- `hero.tsx` — hero headline, description, and CTA button
- `footer.tsx` — brand name, tagline, copyright, social links
- `faq.tsx` — FAQ items and contact email
- `pricing.tsx` — pricing tiers, feature lists, and CTA buttons

Search for `// TODO:` comments throughout the codebase for a quick checklist of items to replace.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better-Auth
- **Payments**: Stripe / Polar / LemonSqueezy (configurable via env)
- **Email**: Resend / Postmark / Plunk / Nodemailer (auto-discovered)
- **Styling**: TailwindCSS 4 + BaseUI
- **i18n**: next-intl (en, fr, es)
- **Validation**: Zod + @t3-oss/env-nextjs

## Internationalization (i18n) Navigation

This boilerplate includes internationalization support using `next-intl` with automatic locale routing. The template supports English (`en`), French (`fr`), and Spanish (`es`) out of the box.

### Navigation Components and Hooks

The `i18n/navigation.ts` file exports internationalized versions of Next.js navigation components and hooks that automatically handle locale prefixes:

- **`Link`** - Internationalized Link component that automatically prefixes routes with the current locale
- **`redirect`** - Server-side redirect function that preserves locale
- **`usePathname`** - Hook that returns the pathname without the locale prefix
- **`useRouter`** - Hook for programmatic navigation with locale support

### Usage Examples

#### Using the Link Component

```tsx
import { Link } from '@/i18n/navigation'

// Automatically includes locale prefix (e.g., /en/about, /fr/about)
<Link href="/about">About</Link>

// Switch to a different locale
<Link href="/about" locale="fr">À propos</Link>
```

#### Using Navigation Hooks

```tsx
'use client'

import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'

export function MyComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleClick = () => {
    router.push('/dashboard')
  }

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div>
      <p>Current locale: {locale}</p>
      <p>Current pathname: {pathname}</p>
      <button onClick={handleClick}>Go to Dashboard</button>
      <button onClick={() => switchLanguage('fr')}>Switch to French</button>
    </div>
  )
}
```

#### Using Translations

```tsx
// Server Component
import { getTranslations } from 'next-intl/server'

export default async function ServerPage() {
  const t = await getTranslations('MyPage')
  return <h1>{t('title')}</h1>
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'

export default function ClientPage() {
  const t = useTranslations('MyPage')
  return <h1>{t('title')}</h1>
}
```

### Adding New Locales

To add a new locale:

1. Add the locale to `i18n/routing.ts`:
   ```ts
   locales: ['en', 'fr', 'es', 'de'], // Add 'de' for German
   ```

2. Create a translation file in `messages/`:
   ```json
   // messages/de.json
   {
     "PRICING": "Preise"
   }
   ```

3. Update the `localeNames` object in `components/language-switcher.tsx`:
   ```tsx
   const localeNames: Record<string, string> = {
     en: 'English',
     fr: 'Français',
     es: 'Español',
     de: 'Deutsch',
   }
   ```

### Route Structure

All routes are automatically prefixed with the locale:
- `/` or `/en` → English homepage
- `/fr` → French homepage
- `/es` → Spanish homepage
- `/en/about` → English about page
- `/fr/about` → French about page

The default locale (`en`) uses the `as-needed` prefix strategy, meaning it doesn't show the locale prefix in the URL when it's the default language.
