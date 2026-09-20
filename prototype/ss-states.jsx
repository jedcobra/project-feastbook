// ss-states.jsx — The states a design reference usually skips:
// loading, offline, server error, failed import, recipe gone.

// ─────────────────────────────────────────────────────────────
// Loading — the feed's own shape, greyed. No spinners.
// ─────────────────────────────────────────────────────────────
function SSSkeletonLine({ w = '100%', h = 11, mb = 8 }) {
  return <div style={{
    width: w, height: h, marginBottom: mb, borderRadius: 2,
    background: 'var(--ss-rule-soft)', opacity: 0.7,
    animation: 'ssPulse 1.4s ease-in-out infinite',
  }}/>;
}

function SSFeedLoadingScreen() {
  return (
    <>
      <style>{`@keyframes ssPulse{0%,100%{opacity:.45}50%{opacity:.85}}`}</style>
      <SSTopBar variant="brand" trailing={<SSBox compact><SSIcon name="search" size={14}/></SSBox>}/>
      <div style={{ padding: '0 20px 10px', borderBottom: '1px dashed var(--ss-rule)' }}>
        <SSSkeletonLine w="42%" h={10} mb={0}/>
      </div>
      <SSScroll>
        <div style={{ padding: '14px 20px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px dashed var(--ss-rule)' }}>
              <SSSkeletonLine w="38%" h={9}/>
              <SSSkeletonLine w="88%" h={19} mb={10}/>
              <SSSkeletonLine w="64%" h={11}/>
              <SSSkeletonLine w="30%" h={9} mb={0}/>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Error — one component, four honest variants
// ─────────────────────────────────────────────────────────────
const SS_ERRORS = {
  offline: {
    title: 'No connection',
    body: 'You can still read anything you\u2019ve opened before, and cook from it. New recipes will load when you\u2019re back.',
    cta: 'Try again', alt: 'Open saved recipes', icon: 'warn',
  },
  server: {
    title: 'Something broke on our end',
    body: 'Not your fault and not your data. We\u2019ve been told about it.',
    cta: 'Try again', alt: 'Go to your cookbook', icon: 'warn',
  },
  gone: {
    title: 'This recipe is gone',
    body: 'The person who wrote it deleted it. If you saved it, your copy is still in your cookbook.',
    cta: 'Open my copy', alt: 'Back to feed', icon: 'trash',
  },
  private: {
    title: 'This one is private',
    body: 'Ren keeps some recipes to themselves. Follow them and it may show up later.',
    cta: 'Follow Ren Takeda', alt: 'Back to feed', icon: 'book',
  },
};

function SSErrorScreen({ kind = 'offline', onBack, onRetry }) {
  const e = SS_ERRORS[kind] || SS_ERRORS.offline;
  return (
    <>
      <SSTopBar onBack={onBack}/>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 28px 60px', textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, border: '1px solid var(--ss-ink)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <SSIcon name={e.icon} size={20} color="var(--ss-ink)"/>
        </div>
        <SSHeading level={2} style={{ fontSize: 24, marginBottom: 10, textWrap: 'balance' }}>{e.title}</SSHeading>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.65,
          color: 'var(--ss-ink-mute)', marginBottom: 20, maxWidth: 270,
        }}>{e.body}</div>
        <button onClick={onRetry} style={{
          padding: '12px 22px', border: '1px solid var(--ss-ink)', background: 'var(--ss-ink)',
          color: 'var(--ss-bg)', borderRadius: 8, fontFamily: 'var(--ss-mono)', fontSize: 12.5,
          fontWeight: 600, marginBottom: 10,
        }}>{e.cta}</button>
        <div onClick={onBack} style={{
          fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink-mute)', cursor: 'pointer',
        }}>{e.alt}</div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Import failed — the parser couldn't read the page
// ─────────────────────────────────────────────────────────────
function SSImportFailScreen({ onBack, onPhoto, onManual }) {
  return (
    <>
      <SSTopBar title="Couldn't read that page" onBack={onBack} subtitle="seriouseats.com/…/pasta"/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{
            border: '1px dashed var(--ss-rule)', padding: '13px', marginBottom: 18,
            fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.6, color: 'var(--ss-ink-mute)',
          }}>
            We got the title and a photo, but no ingredient list we trust. Some sites hide the recipe behind a script, and guessing at quantities is worse than not guessing.
          </div>

          <SSLabel style={{ marginBottom: 8 }}>What we did get</SSLabel>
          <div style={{ borderTop: '1px dashed var(--ss-rule)', padding: '10px 0', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 17, color: 'var(--ss-ink)', marginBottom: 3 }}>
              Cacio e Pepe, Properly
            </div>
            <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
              serious eats · 20 min · source saved
            </div>
          </div>

          <SSLabel style={{ marginBottom: 8 }}>Three ways forward</SSLabel>
          {[
            ['pencil', 'Fill in the rest yourself', 'Keeps the title and the link. You write the parts we missed.', onManual],
            ['camera', 'Screenshot the page instead', 'Photo reading is often better than page reading.', onPhoto],
            ['ext', 'Just save the link', 'Sits in your cookbook as a bookmark until you have time.', onBack],
          ].map(([icon, label, sub, fn], i) => (
            <div key={label} onClick={fn} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', cursor: 'pointer',
              borderTop: '1px dashed var(--ss-rule)', borderBottom: i === 2 ? '1px dashed var(--ss-rule)' : 'none',
            }}>
              <SSIcon name={icon} size={17} color="var(--ss-ink)"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ss-ink)' }}>{label}</div>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, lineHeight: 1.45, color: 'var(--ss-ink-mute)', marginTop: 1 }}>{sub}</div>
              </div>
              <SSIcon name="chevron" size={13} color="var(--ss-rule)"/>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, {
  SSSkeletonLine, SSFeedLoadingScreen, SS_ERRORS, SSErrorScreen, SSImportFailScreen,
});
