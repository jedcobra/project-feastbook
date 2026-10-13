// Error monitoring in the browser. Without NEXT_PUBLIC_SENTRY_DSN (local dev,
// previews without the variable) Sentry stays off entirely.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  // Errors only: no performance tracing (stripped from the bundle, see
  // next.config.mjs) and no session replay, for the same privacy reason
  // analytics has session recording off.
});
