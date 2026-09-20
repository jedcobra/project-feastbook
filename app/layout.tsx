import type { Metadata } from 'next';
import { AuthGate } from '@/components/auth/auth-gate';
import { AuthProvider } from '@/components/auth/auth-provider';
import { display, mono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Special Spoon',
  description: 'A personal online recipe book — create, curate, and share what you cook.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <div className="mx-auto flex h-dvh w-full max-w-column flex-col overflow-hidden">
          <AuthProvider>
            <AuthGate />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
