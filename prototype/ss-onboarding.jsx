// ss-onboarding.jsx — What happens between "account created" and the feed.
// Four short screens. Each one asks for something the app immediately uses.

// ─────────────────────────────────────────────────────────────
// Shared — step chrome: progress rule + skip
// ─────────────────────────────────────────────────────────────
function SSOnboardStep({ step, total, title, blurb, children, cta, ctaDisabled, onNext, onSkip, skipLabel = 'Skip' }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '58px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2,
              background: i <= step ? 'var(--ss-ink)' : 'var(--ss-rule-soft)',
            }}/>
          ))}
        </div>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--ss-ink-mute)', marginBottom: 10,
        }}>Step {step + 1} of {total}</div>
        <SSHeading level={1} style={{ fontSize: 27, marginBottom: 8, textWrap: 'balance' }}>{title}</SSHeading>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.6,
          color: 'var(--ss-ink-mute)', marginBottom: 18,
        }}>{blurb}</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px', minHeight: 0 }}>{children}</div>
      <div style={{ padding: '14px 20px 26px', borderTop: '1px dashed var(--ss-rule)' }}>
        <button onClick={onNext} disabled={ctaDisabled} style={{
          width: '100%', padding: '14px', borderRadius: 8,
          border: '1px solid var(--ss-ink)',
          background: ctaDisabled ? 'transparent' : 'var(--ss-ink)',
          color: ctaDisabled ? 'var(--ss-ink-mute)' : 'var(--ss-bg)',
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
          opacity: ctaDisabled ? 0.45 : 1, marginBottom: onSkip ? 10 : 0,
        }}>{cta}</button>
        {onSkip && (
          <div onClick={onSkip} style={{
            textAlign: 'center', fontFamily: 'var(--ss-mono)', fontSize: 12,
            color: 'var(--ss-ink-mute)', cursor: 'pointer',
          }}>{skipLabel}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · Taste — what you actually cook. Seeds the feed.
// ─────────────────────────────────────────────────────────────
const SS_TASTES = ['weeknight', 'baking', 'vegetarian', 'one-pot', 'slow cooking', 'sourdough',
  'grilling', 'preserves', 'desserts', 'south asian', 'west african', 'japanese',
  'italian', 'mexican', 'no dairy', 'low effort'];

function SSOnboardTaste({ onNext, onSkip }) {
  const [picked, setPicked] = React.useState([]);
  const toggle = (t) => setPicked(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  return (
    <SSOnboardStep
      step={0} total={4}
      title="What do you actually cook?"
      blurb="Pick a few. This decides what shows up in Discover — not what you're allowed to save."
      cta={picked.length < 3 ? `Pick ${3 - picked.length} more` : 'Continue'}
      ctaDisabled={picked.length < 3}
      onNext={onNext} onSkip={onSkip} skipLabel="I'll decide later"
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 20 }}>
        {SS_TASTES.map(t => {
          const on = picked.includes(t);
          return (
            <span key={t} onClick={() => toggle(t)} style={{
              fontFamily: 'var(--ss-mono)', fontSize: 12, padding: '6px 11px',
              border: '1px solid var(--ss-ink)', borderRadius: 4, cursor: 'pointer',
              background: on ? 'var(--ss-ink)' : 'transparent',
              color: on ? 'var(--ss-bg)' : 'var(--ss-ink)',
            }}>{t}</span>
          );
        })}
      </div>
    </SSOnboardStep>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · Follow — a feed needs people in it
// ─────────────────────────────────────────────────────────────
function SSOnboardFollow({ onNext, onSkip }) {
  const people = SS_PEOPLE.slice(1);
  const [following, setFollowing] = React.useState(() => people.slice(0, 3).map(p => p.handle));
  const toggle = (h) => setFollowing(f => f.includes(h) ? f.filter(x => x !== h) : [...f, h]);
  return (
    <SSOnboardStep
      step={1} total={4}
      title="Cooks worth following"
      blurb={`Chosen from what you picked. You're following ${following.length}.`}
      cta={following.length ? 'Continue' : 'Continue without following anyone'}
      onNext={onNext} onSkip={onSkip} skipLabel="Find people later"
    >
      <div style={{ paddingBottom: 20 }}>
        {people.map((p, i) => {
          const on = following.includes(p.handle);
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
              borderTop: '1px dashed var(--ss-rule)',
            }}>
              <SSAvatar name={p.name} size={32}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ss-ink)',
                }}>{p.name}</div>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 10.5, lineHeight: 1.45,
                  color: 'var(--ss-ink-mute)', marginTop: 1,
                  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{p.bio}</div>
              </div>
              <span onClick={() => toggle(p.handle)} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '5px 10px',
                border: '1px solid var(--ss-ink)', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
                background: on ? 'var(--ss-ink)' : 'transparent',
                color: on ? 'var(--ss-bg)' : 'var(--ss-ink)',
              }}>{on ? 'Following' : 'Follow'}</span>
            </div>
          );
        })}
      </div>
    </SSOnboardStep>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · First recipe — the one habit that makes the app stick
// ─────────────────────────────────────────────────────────────
function SSOnboardFirstRecipe({ onNext, onSkip, onImport }) {
  const ways = [
    ['link', 'Paste a link', 'From any recipe site. We pull out the parts.'],
    ['camera', 'Photograph a card', 'Handwritten, torn from a magazine, whatever it is.'],
    ['pencil', 'Type it out', 'The one you know by heart.'],
  ];
  return (
    <SSOnboardStep
      step={2} total={4}
      title="Put one recipe in"
      blurb="A cookbook with nothing in it is just a feed. Start with the thing you cooked last week."
      cta="Add it now" onNext={onImport || onNext}
      onSkip={onSkip} skipLabel="Not yet — take me to the feed"
    >
      <div style={{ paddingBottom: 20 }}>
        {ways.map(([icon, label, sub], i) => (
          <div key={label} onClick={onImport} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0',
            borderTop: '1px dashed var(--ss-rule)',
            borderBottom: i === ways.length - 1 ? '1px dashed var(--ss-rule)' : 'none',
            cursor: 'pointer',
          }}>
            <SSIcon name={icon} size={17} color="var(--ss-ink)"/>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ss-ink)',
              }}>{label}</div>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)', marginTop: 1,
              }}>{sub}</div>
            </div>
            <SSIcon name="chevron" size={13} color="var(--ss-rule)"/>
          </div>
        ))}
      </div>
    </SSOnboardStep>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · Notifications — asked for with a reason, before the OS asks
// ─────────────────────────────────────────────────────────────
function SSOnboardNotify({ onNext, onSkip }) {
  const [on, setOn] = React.useState({ notes: true, follows: true, cooked: false, digest: false });
  const rows = [
    ['notes', 'Someone notes on your recipe', 'Including answers to your questions'],
    ['follows', 'Someone follows you', ''],
    ['cooked', 'Someone cooks your recipe', 'Can get busy if a recipe takes off'],
    ['digest', 'Weekly: what your people cooked', 'One message, Sunday morning'],
  ];
  return (
    <SSOnboardStep
      step={3} total={4}
      title="What's worth interrupting you for?"
      blurb="Pick now, change any time in settings. We'll only ask the phone for permission if you say yes to something."
      cta="Done — take me in" onNext={onNext}
      onSkip={onSkip} skipLabel="None of it"
    >
      <div style={{ paddingBottom: 20 }}>
        {rows.map(([k, label, sub]) => (
          <div key={k} onClick={() => setOn(o => ({ ...o, [k]: !o[k] }))} style={{
            display: 'flex', alignItems: 'flex-start', gap: 11, padding: '12px 0',
            borderTop: '1px dashed var(--ss-rule)', cursor: 'pointer',
          }}>
            <SSCheckbox checked={on[k]} size={15} style={{ marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>{label}</div>
              {sub && <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)', marginTop: 2,
              }}>{sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </SSOnboardStep>
  );
}

// ─────────────────────────────────────────────────────────────
// Container — runs the four in order
// ─────────────────────────────────────────────────────────────
function SSOnboardingFlow({ onDone, onImport }) {
  const [i, setI] = React.useState(0);
  const next = () => i < 3 ? setI(i + 1) : onDone && onDone();
  const skip = () => i < 3 ? setI(i + 1) : onDone && onDone();
  const props = { onNext: next, onSkip: skip };
  return (
    <>
      {i === 0 && <SSOnboardTaste {...props}/>}
      {i === 1 && <SSOnboardFollow {...props}/>}
      {i === 2 && <SSOnboardFirstRecipe {...props} onImport={onImport}/>}
      {i === 3 && <SSOnboardNotify {...props} onNext={onDone}/>}
    </>
  );
}

Object.assign(window, {
  SS_TASTES, SSOnboardStep, SSOnboardTaste, SSOnboardFollow,
  SSOnboardFirstRecipe, SSOnboardNotify, SSOnboardingFlow,
});
