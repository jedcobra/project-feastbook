import type { MetadataRoute } from 'next';

// Served at /manifest.webmanifest — Next.js links it into <head>
// automatically. What makes "Add to Home Screen" install a real
// standalone app instead of a plain bookmark, which iOS requires before
// it'll allow Web Push at all (see lib/push-subscribe.ts).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Special Spoon',
    short_name: 'Special Spoon',
    description: 'A personal online recipe book — create, curate, and share what you cook.',
    start_url: '/feed',
    display: 'standalone',
    // Portrait only. Android honours this for the installed app; iOS ignores
    // it, so components/rotate-notice.tsx covers landscape phones instead.
    orientation: 'portrait',
    background_color: '#F4EEDD',
    theme_color: '#F4EEDD',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
