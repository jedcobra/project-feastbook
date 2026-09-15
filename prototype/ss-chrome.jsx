// ss-chrome.jsx — App chrome, noods-direction.
// Utilitarian. Outlined buttons. Dashed rules. Indigo ink on cream.

// ─────────────────────────────────────────────────────────────
// SSDevice — iPhone bezel shell. Cream-paper interior.
// ─────────────────────────────────────────────────────────────
function SSDevice({ children, width = 402, height = 874, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 48, overflow: 'hidden',
      position: 'relative',
      background: 'var(--ss-bg)',
      boxShadow: '0 40px 80px rgba(35,36,89,0.18), 0 0 0 1px rgba(35,36,89,0.12)',
      fontFamily: 'var(--ss-body)',
      WebkitFontSmoothing: 'antialiased',
      ...style,
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }}/>
      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar dark={false} />
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        paddingBottom: 8, pointerEvents: 'none',
      }}>
        <div style={{
          width: 139, height: 5, borderRadius: 100, background: 'rgba(35,36,89,0.35)',
        }}/>
      </div>
      {/* Screen content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSTopBar — header bar.
// Nothing fancy — brand name or title + trailing slot for outlined buttons.
// ─────────────────────────────────────────────────────────────
function SSTopBar({
  title, onBack, trailing, variant = 'default', subtitle,
}) {
  return (
    <div style={{
      paddingTop: 54,
      paddingBottom: 14,
      paddingLeft: 20, paddingRight: 20,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--ss-bg)',
      position: 'relative', zIndex: 5,
      minHeight: 98, boxSizing: 'border-box',
    }}>
      {onBack && (
        <SSBox onClick={onBack} compact style={{ padding: '7px 10px' }}>
          <SSIcon name="back" size={14} weight={1.8}/>
        </SSBox>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {variant === 'brand' && (
          <div style={{
            fontFamily: 'var(--ss-display)',
            fontWeight: 'var(--ss-display-weight)',
            fontSize: 26,
            letterSpacing: 'var(--ss-display-tracking)',
            color: 'var(--ss-ink)', lineHeight: 1,
          }}>Special Spoon</div>
        )}
        {variant !== 'brand' && title && (
          <SSHeading level={2} style={{ fontSize: 22 }}>{title}</SSHeading>
        )}
        {subtitle && (
          <div style={{
            fontSize: 11, color: 'var(--ss-ink-mute)', marginTop: 2,
            fontFamily: 'var(--ss-mono)', letterSpacing: 0.04,
          }}>{subtitle}</div>
        )}
      </div>
      {trailing && <div style={{ display: 'flex', gap: 6 }}>{trailing}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSTabBar — bottom nav. Noods doesn't have tab bar, but this is iOS
// so we need one. Keep it austere: mono labels, no pill highlight,
// just a small dot underneath active.
// ─────────────────────────────────────────────────────────────
function SSTabBar({ current, onChange }) {
  const tabs = [
    { id: 'feed',     label: 'Feed' },
    { id: 'cookbook', label: 'Cookbook' },
    { id: 'add',      label: 'New', primary: true },
    { id: 'discover', label: 'Discover' },
    { id: 'me',       label: 'Me' },
  ];
  return (
    <div style={{
      paddingTop: 10, paddingBottom: 30,
      background: 'var(--ss-bg)',
      borderTop: '1px solid var(--ss-rule)',
      display: 'flex', alignItems: 'stretch', justifyContent: 'space-around',
      flexShrink: 0, zIndex: 40, gap: 4, paddingLeft: 16, paddingRight: 16,
    }}>
      {tabs.map(t => {
        const active = current === t.id;
        if (t.primary) {
          return (
            <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{
              border: `1px solid var(--ss-ink)`,
              background: 'var(--ss-ink)', color: 'var(--ss-bg)',
              padding: '8px 14px', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, cursor: 'pointer', alignSelf: 'center',
              fontFamily: 'var(--ss-mono)', fontSize: 12, fontWeight: 500,
            }}>
              <SSIcon name="plus" size={14} weight={2}/>
              <span>{t.label}</span>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{
            border: 'none', background: 'transparent', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, cursor: 'pointer', flex: 1, paddingTop: 6,
            color: active ? 'var(--ss-ink)' : 'var(--ss-ink-mute)',
            fontFamily: 'var(--ss-mono)',
          }}>
            <span style={{
              fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: 0,
            }}>{t.label}</span>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: active ? 'var(--ss-ink)' : 'transparent',
            }}/>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSScroll — scrollable content region
// ─────────────────────────────────────────────────────────────
function SSScroll({ children, style = {} }) {
  return (
    <div style={{
      flex: 1, overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      ...style,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { SSDevice, SSTopBar, SSTabBar, SSScroll });
