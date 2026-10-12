import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth/auth-gate';
import { AuthProvider } from '@/components/auth/auth-provider';
import { DismissKeyboardOnScroll } from '@/components/dismiss-keyboard-on-scroll';
import { RotateNotice } from '@/components/rotate-notice';
import { ThemeSync } from '@/components/theme-sync';
import { display, mono } from '@/lib/fonts';
import { THEME_COLOR, THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Special Spoon',
  description: 'A personal online recipe book — create, curate, and share what you cook.',
  // iOS only treats a site as an installable app (the prerequisite for Web
  // Push on iPhone — see lib/push-subscribe.ts) once it carries these
  // apple-mobile-web-app-* tags and gets added to the Home Screen from there.
  appleWebApp: {
    capable: true,
    title: 'Special Spoon',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the theme script below adds the `dark` class
    // before React hydrates, so the server's class list won't match.
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* The status bar / browser bar colour, in the page from the start so
            it's right for the phone's light or dark setting before any script
            runs; the theme script repaints both to the theme chosen in the
            app. Here rather than in Next's viewport export, which re-adds its
            own copies on navigation and undoes that repaint. */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content={THEME_COLOR.light} suppressHydrationWarning />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content={THEME_COLOR.dark} suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeSync />
        <RotateNotice />
        <div className="mx-auto flex h-dvh w-full max-w-column flex-col overflow-hidden">
          <DismissKeyboardOnScroll />
          <AuthProvider>
            <AuthGate />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
