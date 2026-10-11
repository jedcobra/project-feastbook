import { DM_Mono } from 'next/font/google';
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

// Body: monospace for all body text + meta. DM Mono comes in 400 and 500
// only; semibold and bold text uses the 500 (globals.css turns off the
// browser's fake bold). Its zeros are slashed, so a plain zero is swapped
// in from public/fonts (see globals.css).
export const mono = DM_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
