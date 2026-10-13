'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

// Last-resort boundary for a crash in the root layout itself. It replaces
// the whole document, so it can't use the app's fonts or screens — just
// report the error and offer a reload.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-monospace, monospace', padding: 24, background: '#F2E9D8', color: '#1F3D2B' }}>
        <h1 style={{ fontFamily: 'Georgia, serif' }}>Something went wrong.</h1>
        <p>We&rsquo;ve been told about it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12, padding: '6px 12px', border: '1px solid currentColor', borderRadius: 6, background: 'transparent', color: 'inherit', fontFamily: 'inherit' }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
