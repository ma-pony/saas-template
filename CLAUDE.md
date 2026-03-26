# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShipFree is a Next.js SaaS boilerplate (free ShipFast alternative) using Bun runtime, PostgreSQL, Drizzle ORM, Better-Auth, and TailwindCSS 4.

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

All pages live under `src/app/[locale]/` with three route groups (don't affect URLs):
- `(auth)` — login, register, verify, etc.
- `(main)` — dashboard, settings, authenticated pages
- `(site)` — marketing/landing pages

API routes are at `src/app/api/` (not under `[locale]`).

### Payment Adapter Pattern (`src/lib/payments/`)

Strategy pattern: a `PaymentAdapter` interface (`types.ts`) with methods like `createCheckout`, `createCustomer`, `processWebhook`. A singleton factory in `service.ts` selects the adapter based on `env.PAYMENT_PROVIDER` (Stripe, Polar, or LemonSqueezy). Client-side hooks in `hooks.ts` use TanStack Query against `/api/payments/*` endpoints. Swapping providers requires only env var changes.

The `premiumPurchase` table in the schema is isolated — it's for the template's own one-time purchase flow (selling the boilerplate itself), separate from the app's subscription payment system.

### Email Provider Pattern (`src/lib/messaging/email/`)

Similar adapter pattern with auto-discovery fallback. Provider order: resend → postmark → nodemailer → plunk → custom → log. If no `EMAIL_PROVIDER` env var is set, it auto-discovers the first configured provider. Falls back to `log` provider (console output) in development — email flows never throw for missing credentials.

### Auth (`src/lib/auth/`)

Better-Auth with Drizzle adapter. Social providers (Google, GitHub, Microsoft, Facebook) conditionally enabled based on env vars being present. Plugins: `nextCookies`, `emailOTP` (6-digit, 15 min expiry), `organization` (multi-tenant). Auth client in `auth-client.ts` separates billing operations into a different client for type clarity.

### Database (`src/database/`)

PostgreSQL via `postgres-js` driver + Drizzle ORM. Schema in `schema.ts` uses text PKs (not serial/uuid), cascade deletes from user, and `$onUpdate` for `updatedAt`. Payment tables have a `provider` column for multi-provider safety.

### Internationalization

`next-intl` with locales: `en`, `es`, `fr`. Translation files in `src/messages/*.json`.
- Server components: `getTranslations` from `next-intl/server`
- Client components: `useTranslations` from `next-intl`

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
