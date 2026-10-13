import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next 14 only runs instrumentation.ts (where Sentry starts on the
    // server) with this on.
    instrumentationHook: true,
  },
  // PostHog is reached through /ingest on our own domain so ad blockers
  // don't drop events (see components/analytics/analytics-provider.tsx).
  async rewrites() {
    // us.i.posthog.com by default; eu.i.posthog.com for an EU project.
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    const assets = host.replace(/\/\/(\w+)\.i\./, '//$1-assets.i.');
    return [
      { source: '/ingest/static/:path*', destination: `${assets}/static/:path*` },
      { source: '/ingest/:path*', destination: `${host}/:path*` },
    ];
  },
  // PostHog's API uses trailing slashes; don't let Next redirect them away.
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Source maps upload only when SENTRY_AUTH_TOKEN is set (on Vercel);
  // without it the build still succeeds, stack traces are just minified.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Browser error reports go through our own domain, for the same
  // ad-blocker reason as /ingest above.
  tunnelRoute: '/monitoring',
  // Errors are what we're after; leave performance tracing and the SDK's
  // debug logging out of the browser bundle to keep pages light.
  bundleSizeOptimizations: {
    excludeTracing: true,
    excludeDebugStatements: true,
  },
});
