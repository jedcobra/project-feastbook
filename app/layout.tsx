import type { Metadata } from 'next';
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
        <div className="mx-auto flex min-h-dvh w-full max-w-column flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
