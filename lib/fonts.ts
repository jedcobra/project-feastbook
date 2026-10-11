import { JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Display: Maragsâ Display by John David Maza (free), for headlines. It
// comes in one weight; declaring it for 400–700 lets the font-bold
// headlines use it as drawn instead of the browser faking a bold.
export const display = localFont({
  src: '../app/fonts/maragsa-display.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

// Body: monospace for all body text + meta.
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
