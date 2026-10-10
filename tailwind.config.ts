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
      // Every theme colour is an RGB triplet in a CSS variable (globals.css),
      // so dark mode swaps the whole palette at once and opacity modifiers
      // (bg-ink/30) keep working. `night` and `paper` are the light theme's
      // ink and cream, fixed in both themes, for things that stay dark
      // either way: popup backdrops, the full-screen photo view, cooking mode.
      colors: {
        cream: {
          DEFAULT: 'rgb(var(--c-cream) / <alpha-value>)', // --bg
          deep: 'rgb(var(--c-cream-deep) / <alpha-value>)', // --bg-deep
          surface: 'rgb(var(--c-cream-surface) / <alpha-value>)', // --surface
        },
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)', // --ink
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)', // --ink-soft
          mute: 'rgb(var(--c-ink-mute) / <alpha-value>)', // --ink-mute
        },
        rule: {
          DEFAULT: 'rgb(var(--c-rule) / <alpha-value>)', // --rule
          soft: 'rgb(var(--c-rule-soft) / <alpha-value>)', // --rule-soft
        },
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)', // --accent (vermilion)
          2: 'rgb(var(--c-accent-2) / <alpha-value>)', // --accent-2 (forest)
          3: 'rgb(var(--c-accent-3) / <alpha-value>)', // --accent-3 (mustard)
        },
        highlight: 'rgb(var(--c-highlight) / <alpha-value>)',
        tag: {
          DEFAULT: 'rgb(var(--c-tag) / <alpha-value>)', // --tag-bg
          ink: 'rgb(var(--c-tag-ink) / <alpha-value>)', // --tag-ink
        },
        night: 'rgb(35 36 89 / <alpha-value>)',
        paper: 'rgb(244 238 221 / <alpha-value>)',
      },
      borderColor: {
        rule: {
          DEFAULT: 'rgb(var(--c-rule) / <alpha-value>)',
          soft: 'rgb(var(--c-rule-soft) / <alpha-value>)',
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
        // body/meta/caps sit on Instagram's scale: 14px for reading text,
        // 12px for secondary detail.
        'body': ['14px', { lineHeight: '1.55' }],
        'meta': ['12px', { lineHeight: '1.45' }],
        'caps': ['12px', { lineHeight: '1.2', letterSpacing: '0.06em' }],
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
