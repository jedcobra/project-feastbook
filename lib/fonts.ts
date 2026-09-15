import { Libre_Caslon_Text, JetBrains_Mono } from 'next/font/google';

// Display: serif headlines, 700 weight only (per design tokens).
export const display = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-display',
  display: 'swap',
});

// Body: monospace for all body text + meta.
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
