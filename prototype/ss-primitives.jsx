// ss-primitives.jsx — Noods-style building blocks.
// Text-first. No photography. Monospace details, serif display.

// ─────────────────────────────────────────────────────────────
// SSCheckbox — square outline, indigo tick
// ─────────────────────────────────────────────────────────────
function SSCheckbox({ checked = false, size = 14, onClick, style = {} }) {
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 2,
      border: `1.2px solid var(--ss-ink)`,
      background: checked ? 'var(--ss-ink)' : 'transparent',
      cursor: onClick ? 'pointer' : 'default',
      flexShrink: 0, ...style,
    }}>
      {checked && (
        <svg width={size - 4} height={size - 4} viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-5" stroke="var(--ss-bg)" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SSBox — outlined button / capsule
// ─────────────────────────────────────────────────────────────
function SSBox({ children, onClick, color, ghost, compact, style = {} }) {
  const c = color || 'var(--ss-ink)';
  return (
    <button onClick={onClick} style={{
      padding: compact ? '4px 8px' : '6px 12px',
      border: `1px solid ${c}`,
      borderRadius: 6,
      background: ghost ? 'transparent' : 'var(--ss-bg)',
      color: c, cursor: onClick ? 'pointer' : 'default',
      fontFamily: 'var(--ss-body)',
      fontSize: compact ? 11 : 13,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: 0,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// SSTag — small rounded tag pill
// ─────────────────────────────────────────────────────────────
function SSTag({ children, onRemove, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px', borderRadius: 4,
      background: 'var(--ss-tag)',
      color: 'var(--ss-tag-ink)',
      fontFamily: 'var(--ss-mono)', fontSize: 11,
      fontWeight: 500, letterSpacing: 0,
      border: '1px solid var(--ss-rule-soft)',
      ...style,
    }}>
      {children}
      {onRemove && <span style={{ opacity: 0.5, cursor: 'pointer' }}>×</span>}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SSAvatar — monogram, indigo ring
// ─────────────────────────────────────────────────────────────
function SSAvatar({ name = 'A', size = 28, seed = 0, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--ss-bg-deep)', color: 'var(--ss-ink)',
      border: '1px solid var(--ss-ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--ss-display)', fontWeight: 700,
      fontSize: size * 0.42, flexShrink: 0,
      ...style,
    }}>{name[0].toUpperCase()}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSRule — dashed hairline (noods-style dotted underline)
// ─────────────────────────────────────────────────────────────
function SSRule({ dashed = true, style = {} }) {
  return (
    <div style={{
      height: 0,
      borderTop: dashed
        ? '1px dashed var(--ss-rule)'
        : '1px solid var(--ss-rule)',
      ...style,
    }}/>
  );
}

// ─────────────────────────────────────────────────────────────
// SSHeading — bold serif heading, indigo
// ─────────────────────────────────────────────────────────────
function SSHeading({ level = 1, children, style = {} }) {
  const sizes = { 1: 28, 2: 22, 3: 18, 4: 15 };
  const size = sizes[level] || sizes[2];
  const Tag = `h${level}`;
  return (
    <Tag style={{
      fontFamily: 'var(--ss-display)',
      fontWeight: 'var(--ss-display-weight)',
      fontSize: size, lineHeight: 1.15,
      letterSpacing: 'var(--ss-display-tracking)',
      color: 'var(--ss-ink)',
      margin: 0,
      ...style,
    }}>{children}</Tag>
  );
}

// ─────────────────────────────────────────────────────────────
// SSLabel — uppercase meta label (PREP TIME, COOK TIME, etc.)
// ─────────────────────────────────────────────────────────────
function SSLabel({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--ss-display)',
      fontWeight: 700,
      fontSize: 11, letterSpacing: 0.06,
      textTransform: 'uppercase',
      color: 'var(--ss-ink)',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSLink — dashed-underline link, indigo
// ─────────────────────────────────────────────────────────────
function SSLink({ children, onClick, style = {} }) {
  return (
    <span onClick={onClick} style={{
      color: 'var(--ss-ink)',
      textDecoration: 'underline',
      textDecorationStyle: 'dashed',
      textUnderlineOffset: 3,
      cursor: 'pointer',
      fontFamily: 'var(--ss-mono)',
      fontSize: 12,
      ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// SSIcon — minimal line icons
// ─────────────────────────────────────────────────────────────
function SSIcon({ name, size = 18, color = 'currentColor', weight = 1.4 }) {
  const s = { width: size, height: size, fill: 'none', stroke: color,
    strokeWidth: weight, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <path d="M3 11L12 4l9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    add: <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></>,
    book: <path d="M5 4h14v16H5V4zM5 4v16M19 4v16M9 4v16M9 9h10M9 14h10"/>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3z"/>,
    comment: <path d="M4 5h16v11H9l-5 4V5z"/>,
    share: <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 10.5l8-3.5M8 13.5l8 3.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    timer: <><circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M9 3h6M12 6V3"/></>,
    check: <path d="M5 12l5 5 9-11"/>,
    chevron: <path d="M9 6l6 6-6 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    x: <path d="M6 6l12 12M18 6L6 18"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    back: <path d="M15 6l-6 6 6 6"/>,
    minus: <path d="M5 12h14"/>,
    ext: <><path d="M14 4h6v6"/><path d="M20 4l-8 8"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4M12 17.5h.01"/></>,
    print: <><rect x="6" y="3" width="12" height="5"/><path d="M6 17H4a1 1 0 01-1-1v-7a1 1 0 011-1h16a1 1 0 011 1v7a1 1 0 01-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>,
    cook: <><path d="M5 10h14M5 10a2 2 0 012-2h10a2 2 0 012 2M6 10v6a3 3 0 003 3h6a3 3 0 003-3v-6"/><path d="M9 6l1-2M12 6l1-2M15 6l1-2"/></>,
    pot: <><path d="M4 10h16v2a7 7 0 01-7 7h-2a7 7 0 01-7-7v-2z"/><path d="M3 10h18M8 6v3M12 6v3M16 6v3"/></>,
    pencil: <path d="M3 21l4-1L19 8l-3-3L4 17l-1 4z"/>,
    star: <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5l6.5-.5L12 3z"/>,
    link: <><path d="M10 13a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 11a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></>,
    camera: <><path d="M3 8a1 1 0 011-1h3l1.5-2h7L17 7h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"/><circle cx="12" cy="12.5" r="3.5"/></>,
    fork: <><circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M7 8.5v2a3 3 0 003 3h4a3 3 0 003-3v-2M12 13.5v3"/></>,
    drag: <><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></>,
    warn: <><path d="M12 4l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/></>,
    save: <><path d="M5 4h11l3 3v13H5V4z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/></>,
    wand: <><path d="M6 18L17 7"/><path d="M15 5l1 1M19 9l1 1M4 12h2M12 4v2"/></>,
  };
  return <svg viewBox="0 0 24 24" style={s}>{paths[name] || null}</svg>;
}

// ─────────────────────────────────────────────────────────────
// SSInput — bordered input field mock
// ─────────────────────────────────────────────────────────────
function SSInput({ value, placeholder, rightSlot, style = {} }) {
  return (
    <div style={{
      border: '1px solid var(--ss-ink)', borderRadius: 6,
      background: 'var(--ss-surface)', padding: '8px 10px',
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--ss-mono)', fontSize: 12,
      color: value ? 'var(--ss-ink)' : 'var(--ss-ink-mute)',
      ...style,
    }}>
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value || placeholder}
      </span>
      {rightSlot}
    </div>
  );
}

Object.assign(window, { SSCheckbox, SSBox, SSTag, SSAvatar, SSRule,
  SSHeading, SSLabel, SSLink, SSIcon, SSInput });
