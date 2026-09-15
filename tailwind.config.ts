import type { Config } from 'tailwindcss';

// Design tokens from design_handoff_special_spoon/README.md — "Cream" palette.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F4EEDD', // --bg
          deep: '#EDE4C9', // --bg-deep
          surface: '#FBF6E6', // --surface
        },
        ink: {
          DEFAULT: '#232459', // --ink
          soft: '#3A3C7A', // --ink-soft
          mute: '#8B8AAF', // --ink-mute
        },
        rule: {
          DEFAULT: '#CFC49C', // --rule
          soft: '#E0D7B4', // --rule-soft
        },
        accent: {
          DEFAULT: '#D13E3E', // --accent (vermilion)
          2: '#2E6E5A', // --accent-2 (forest)
          3: '#B07A1F', // --accent-3 (mustard)
        },
        highlight: '#F2E27A',
        tag: {
          DEFAULT: '#EBE1BA', // --tag-bg
          ink: '#5A5534', // --tag-ink
        },
      },
      borderColor: {
        rule: {
          DEFAULT: '#CFC49C',
          soft: '#E0D7B4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Type scale from README
        'hero': ['32px', { lineHeight: '1.05', letterSpacing: '-0.005em' }],
        'cook-step': ['36px', { lineHeight: '1.02', letterSpacing: '-0.005em' }],
        'profile-name': ['26px', { lineHeight: '1.1', letterSpacing: '-0.005em' }],
        'feed-title': ['22px', { lineHeight: '1.1', letterSpacing: '-0.005em' }],
        'section': ['18px', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        'body': ['13px', { lineHeight: '1.55' }],
        'meta': ['11px', { lineHeight: '1.45' }],
        'caps': ['11px', { lineHeight: '1.2', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        button: '6px',
        tag: '4px',
        checkbox: '2px',
      },
      maxWidth: {
        column: '560px',
      },
    },
  },
  plugins: [],
};

export default config;
