# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A generic Next.js SaaS boilerplate/template using Bun runtime, PostgreSQL, Drizzle ORM, Better-Auth, Shadcn UI, and TailwindCSS 4.

## Commands

- `bun dev` — start dev server
- `bun build` — production build (note: `typescript.ignoreBuildErrors: true` in next.config)
- `bun lint` — run Biome linter
- `bun format` — format with Biome
- `bun run typecheck` — run `tsc --noEmit`
- `bun run generate-migration` — generate Drizzle migration after schema changes
- `bun run migrate:local` — run migrations locally

## Architecture

### Path Alias

`@/*` maps to `src/*` (e.g., `@/lib/auth` resolves to `src/lib/auth`).

### Route Structure

Locale-aware pages live under `src/app/[locale]/` with two route groups:
- `(auth)` — login, register, verify, etc.
- `(main)` — dashboard, settings, authenticated pages

Non-locale routes:
- `src/app/(site)/` — marketing/landing pages + blog (not under `[locale]`)
- `src/app/admin/` — admin dashboard (actual path segment `/admin`, not a route group)
- `src/app/api/` — API routes

Shared components live in `src/app/(auth)/` (forms, backgrounds) — these are NOT pages, only reusable components imported by `[locale]/(auth)/` pages.

### Payment Adapter Pattern (`src/lib/payments/`)

Strategy pattern: a `PaymentAdapter` interface (`types.ts`) with methods like `createCheckout`, `createCustomer`, `processWebhook`. A singleton factory in `service.ts` selects the adapter based on `env.PAYMENT_PROVIDER` (Stripe, Polar, or LemonSqueezy). Client-side hooks in `hooks.ts` use TanStack Query against `/api/payments/*` endpoints. Swapping providers requires only env var changes.

### Email Provider Pattern (`src/lib/messaging/email/`)

Similar adapter pattern with auto-discovery fallback. Provider order: resend → postmark → nodemailer → plunk → custom → log. If no `EMAIL_PROVIDER` env var is set, it auto-discovers the first configured provider. Falls back to `log` provider (console output) in development — email flows never throw for missing credentials.

### Auth (`src/lib/auth/`)

Better-Auth with Drizzle adapter. Social providers (Google, GitHub, Microsoft, Facebook) conditionally enabled based on env vars being present. Plugins: `nextCookies`, `emailOTP` (6-digit, 15 min expiry), `organization` (multi-tenant). Auth client in `auth-client.ts` separates billing operations into a different client for type clarity.

### Database (`src/database/`)

PostgreSQL via `postgres-js` driver + Drizzle ORM. Schema in `schema.ts` uses text PKs (not serial/uuid), cascade deletes from user, and `$onUpdate` for `updatedAt`. Payment tables have a `provider` column for multi-provider safety.

### Internationalization

`next-intl` with locales: `en`, `es`, `fr`, `zh`. Translation files in `src/messages/*.json`. Locale config in `src/lib/i18n/config.ts`.
- Server components: `getTranslations` from `next-intl/server`
- Client components: `useTranslations` from `next-intl`

### Analytics (`src/lib/analytics/`)

Adapter pattern supporting Plausible, Umami, and Google Analytics. Provider selected via `NEXT_PUBLIC_ANALYTICS_PROVIDER` env var. Client-side hooks in `hooks.ts`, script injection via `AnalyticsScript` component in root layout. Consent-aware — respects cookie consent before loading.

### Background Jobs (`src/lib/jobs/`)

Cron job framework with two providers: `node-cron` (local) and `vercel-cron` (production). Jobs defined in `src/app/api/jobs/`. Execution logs stored in `job_execution_logs` table. Config: `CRON_PROVIDER`, `CRON_SECRET`, `JOB_LOG_RETENTION_DAYS`.

### SEO & GEO (`src/lib/seo.ts`, `src/components/geo/`)

JSON-LD structured data (FAQ, Product, Website, Breadcrumb schemas), Open Graph metadata, `sitemap.xml`, `robots.txt`, `llms.txt` for AI crawlers. GEO components for AI engine optimization. Brand config in `src/config/brand.ts`.

### Blog (`src/app/(site)/blog/`)

MDX-based blog with categories, tags, RSS feed. Content in `content/blog/`. Uses `gray-matter` + `next-mdx-remote`. Not under `[locale]` (English-only).

### Admin Dashboard (`src/app/admin/`)

Role-based admin panel at `/admin`. Requires `role: 'admin'` in user table. Features: user management, stats overview. Protected by session check in layout.

### Environment Variables

Validated via `@t3-oss/env-nextjs` in `src/config/env.ts`. Server vars in `server` object, client vars in `client` object (prefixed `NEXT_PUBLIC_`). Always add new env vars here.

## Code Style

- **Formatter**: Biome — 2-space indent, single quotes, semicolons as-needed, trailing commas (ES5), 100-char line width
- **Styling**: TailwindCSS only, use `cn()` from `@/lib/utils/css` for conditional classes
- **Components**: PascalCase names, kebab-case filenames, `const` arrow functions preferred over `function` declarations
- **Linter notes**: a11y rules are disabled, `noExplicitAny` is off, `useExhaustiveDependencies` is off
- **Server Components by default**: only add `'use client'` when interactivity is needed


# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Simplified Chinese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)
