import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  // This reduces the Docker image size by including only necessary files
  // output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // next-intl 3.x sets experimental.turbo.resolveAlias which Next.js 16 ignores.
  // Manually set the turbopack alias so next-intl/config resolves correctly.
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    },
  },
  async headers() {
    return [
      {
        // Add Vary: Accept-Language for internationalized pages
        source: '/:locale(en|es|fr|zh)/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Language',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  // TODO: Replace with your Sentry organization and project
  org: 'your-sentry-org',

  project: 'your-sentry-project',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
}))
