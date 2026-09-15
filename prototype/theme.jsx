// theme.jsx — Special Spoon, noods-inspired direction.
// Bookish, utilitarian, text-first. Indigo ink on cream paper.
// Serif headings, monospace body text. No photography — type does the work.

const SS_THEMES = {
  // Cream — noods-style. Default.
  cream: {
    name: 'Cream',
    bg: '#F4EEDD',           // warm cream paper
    bgDeep: '#EDE4C9',       // slightly deeper
    surface: '#FBF6E6',      // card surface
    ink: '#232459',          // indigo ink — primary
    inkSoft: '#3A3C7A',
    inkMute: '#8B8AAF',
    rule: '#CFC49C',         // hairline rules (dashed in use)
    ruleSoft: '#E0D7B4',
    accent: '#D13E3E',       // vermilion — destructive / red stamp
    accent2: '#2E6E5A',      // forest — success / green checks
    accent3: '#B07A1F',      // mustard — tags
    highlight: '#F2E27A',
    tag: '#EBE1BA',
    tagInk: '#5A5534',
    cursor: '#232459',
  },
  // Ivory — cooler, whiter
  ivory: {
    name: 'Ivory',
    bg: '#F8F4E8',
    bgDeep: '#EEE9D4',
    surface: '#FFFDF5',
    ink: '#1F2A4A',
    inkSoft: '#384267',
    inkMute: '#8A90A8',
    rule: '#D4CCAD',
    ruleSoft: '#E5DEC3',
    accent: '#C63A3A',
    accent2: '#2E6E5A',
    accent3: '#A47218',
    highlight: '#E8DE82',
    tag: '#EDE5C4',
    tagInk: '#534F30',
    cursor: '#1F2A4A',
  },
  // Graph — cool pale green paper (accountant's pad)
  graph: {
    name: 'Graph',
    bg: '#E8EEDD',
    bgDeep: '#D9E1C5',
    surface: '#F2F6E6',
    ink: '#233A55',
    inkSoft: '#3A4E68',
    inkMute: '#8196A8',
    rule: '#BCC5A1',
    ruleSoft: '#CDD5B5',
    accent: '#B93D2B',
    accent2: '#2E6A4A',
    accent3: '#9E6A18',
    highlight: '#DFEA7A',
    tag: '#DCE6BE',
    tagInk: '#3E4A28',
    cursor: '#233A55',
  },
};

const SS_TYPE_PAIRS = {
  // Default: bookish serif + typewriter mono. The noods pairing.
  bookish: {
    name: 'Bookish',
    display: '"Libre Caslon Text", "Caslon", Georgia, serif',
    displayWeight: 700,
    displayItalic: false,
    body: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    hand: '"Caveat", cursive',
    displayTracking: -0.005,
    bodySize: 13,
    bodyLine: 1.55,
  },
  // Old garamond for display, readable serif body
  garamond: {
    name: 'Garamond',
    display: '"EB Garamond", "Garamond", Georgia, serif',
    displayWeight: 700,
    displayItalic: false,
    body: '"IBM Plex Mono", ui-monospace, monospace',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
    hand: '"Caveat", cursive',
    displayTracking: 0,
    bodySize: 13,
    bodyLine: 1.55,
  },
  // More modern: grotesk display + mono body
  grotesk: {
    name: 'Grotesk',
    display: '"Inter Tight", "Söhne", -apple-system, system-ui, sans-serif',
    displayWeight: 700,
    displayItalic: false,
    body: '"JetBrains Mono", ui-monospace, monospace',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    hand: '"Caveat", cursive',
    displayTracking: -0.02,
    bodySize: 13,
    bodyLine: 1.55,
  },
};

const SS_FEED_LAYOUTS = {
  index: 'Index',        // text index (like noods cookbook list) — default
  magazine: 'Magazine',  // text-led editorial feed, no photos
  compact: 'Compact',    // dense list of activity
};

const SS_DETAIL_LAYOUTS = {
  document: 'Document',  // two-column ingredients + instructions. noods-style
  focus: 'Focus',        // single column, generous
  margin: 'Margin',      // notes in the margin
};

function ssStyleVars(theme, type) {
  return {
    '--ss-bg': theme.bg,
    '--ss-bg-deep': theme.bgDeep,
    '--ss-surface': theme.surface,
    '--ss-ink': theme.ink,
    '--ss-ink-soft': theme.inkSoft,
    '--ss-ink-mute': theme.inkMute,
    '--ss-rule': theme.rule,
    '--ss-rule-soft': theme.ruleSoft,
    '--ss-accent': theme.accent,
    '--ss-accent-2': theme.accent2,
    '--ss-accent-3': theme.accent3,
    '--ss-tag': theme.tag,
    '--ss-tag-ink': theme.tagInk,
    '--ss-highlight': theme.highlight,
    '--ss-cursor': theme.cursor,
    '--ss-display': type.display,
    '--ss-body': type.body,
    '--ss-mono': type.mono,
    '--ss-hand': type.hand,
    '--ss-display-weight': type.displayWeight,
    '--ss-display-tracking': `${type.displayTracking}em`,
    '--ss-body-size': `${type.bodySize}px`,
    '--ss-body-line': type.bodyLine,
    fontFamily: type.body,
    fontSize: type.bodySize,
    lineHeight: type.bodyLine,
    color: theme.ink,
    background: theme.bg,
  };
}

Object.assign(window, {
  SS_THEMES, SS_TYPE_PAIRS, SS_FEED_LAYOUTS, SS_DETAIL_LAYOUTS, ssStyleVars,
});
