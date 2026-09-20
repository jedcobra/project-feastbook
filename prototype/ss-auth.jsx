// ss-auth.jsx — Unsigned-in landing + sign up + sign in.
// Reads as the title page of a book: premise in serif, ways in beneath.
// No hero imagery — type carries it, same as every other screen.

// ─────────────────────────────────────────────────────────────
// Shared — a text-only provider button. No vendor logos.
// ─────────────────────────────────────────────────────────────
function SSProviderButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px', marginBottom: 8,
      border: '1px solid var(--ss-ink)', background: 'transparent',
      color: 'var(--ss-ink)', borderRadius: 8,
      fontFamily: 'var(--ss-mono)', fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · Landing — the title page
// ─────────────────────────────────────────────────────────────
function SSLandingScreen({ onSignUp, onSignIn }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
          fontSize: 44, lineHeight: 1.05, letterSpacing: 'var(--ss-display-tracking)',
          color: 'var(--ss-ink)', textAlign: 'center',
        }}>Special<br/>Spoon</div>
      </div>
      <div style={{ padding: '20px 20px 34px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onSignUp} style={{
          width: '100%', padding: '14px',
          border: '1px solid var(--ss-ink)', background: 'var(--ss-ink)',
          color: 'var(--ss-bg)', borderRadius: 8,
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
        }}>Create an account</button>
        <button onClick={onSignIn} style={{
          width: '100%', padding: '14px',
          border: '1px solid var(--ss-ink)', background: 'transparent',
          color: 'var(--ss-ink)', borderRadius: 8,
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
        }}>Sign in</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · Sign up
// ─────────────────────────────────────────────────────────────
function SSSignUpScreen({ onBack, onDone, onSignIn }) {
  const [name, setName] = React.useState('');
  const [handle, setHandle] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const taken = handle.trim().toLowerCase() === 'coral';
  const ready = name && handle && email && pw.length >= 8 && !taken;

  return (
    <>
      <SSTopBar title="Create an account" onBack={onBack}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <SSProviderButton label="Continue with Apple"/>
          <SSProviderButton label="Continue with Google"/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 18px' }}>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>or with an email</span>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
          </div>

          <SSField label="Your name" value={name} onChange={setName} placeholder="Maya Osei" mono={false} size={18}/>

          {/* Handle with live availability */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <SSLabel style={{ fontSize: 9 }}>Handle</SSLabel>
              {handle && (
                <span style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 9, borderRadius: 3, padding: '0 4px',
                  color: taken ? 'var(--ss-accent)' : 'var(--ss-accent-2)',
                  border: `1px solid ${taken ? 'var(--ss-accent)' : 'var(--ss-accent-2)'}`,
                }}>{taken ? 'taken' : 'free'}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 13, color: 'var(--ss-ink-mute)' }}>@</span>
              <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="mayacooks" style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                padding: '6px 0', fontFamily: 'var(--ss-mono)', fontSize: 13, color: 'var(--ss-ink)',
              }}/>
            </div>
            <div style={{ borderBottom: `1px ${taken ? 'solid var(--ss-accent)' : 'dashed var(--ss-rule)'}` }}/>
            <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', marginTop: 4 }}>
              {taken ? 'Someone has that one. Try another.' : 'This is how people find your cookbook.'}
            </div>
          </div>

          <SSField label="Email" value={email} onChange={setEmail} placeholder="you@example.com"/>
          <SSField label="Password" value={pw} onChange={setPw} placeholder="At least 8 characters"
            hint={pw && pw.length < 8 ? `${8 - pw.length} more to go` : null}/>

          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 10, lineHeight: 1.6,
            color: 'var(--ss-ink-mute)', marginTop: 18,
            paddingTop: 14, borderTop: '1px dashed var(--ss-rule)',
          }}>
            By creating an account you agree to the{' '}
            <span style={{ color: 'var(--ss-ink)', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 2 }}>terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--ss-ink)', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 2 }}>privacy notice</span>.
            Your cookbook is private until you publish something.
          </div>
        </div>
      </SSScroll>

      <div style={{ padding: '12px 20px 20px', borderTop: '1px dashed var(--ss-rule)', background: 'var(--ss-bg)' }}>
        <button onClick={ready ? onDone : undefined} disabled={!ready} style={{
          width: '100%', padding: '13px', border: '1px solid var(--ss-ink)',
          background: ready ? 'var(--ss-ink)' : 'transparent',
          color: ready ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          borderRadius: 8, fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
          opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'default',
        }}>Create account</button>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
          Already have one?{' '}
          <span onClick={onSignIn} style={{
            color: 'var(--ss-ink)', cursor: 'pointer',
            textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3,
          }}>Sign in</span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · Sign in
// ─────────────────────────────────────────────────────────────
function SSSignInScreen({ onBack, onDone, onSignUp }) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const ready = email && pw;

  return (
    <>
      <SSTopBar title="Sign in" onBack={onBack}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <SSProviderButton label="Continue with Apple"/>
          <SSProviderButton label="Continue with Google"/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 18px' }}>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>or with an email</span>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
          </div>

          <SSField label="Email" value={email} onChange={setEmail} placeholder="you@example.com"/>
          <SSField label="Password" value={pw} onChange={setPw} placeholder="••••••••"/>

          <div style={{ textAlign: 'right', marginTop: -4 }}>
            <span style={{
              fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
              cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3,
            }}>Forgotten it?</span>
          </div>
        </div>
      </SSScroll>

      <div style={{ padding: '12px 20px 20px', borderTop: '1px dashed var(--ss-rule)', background: 'var(--ss-bg)' }}>
        <button onClick={ready ? onDone : undefined} disabled={!ready} style={{
          width: '100%', padding: '13px', border: '1px solid var(--ss-ink)',
          background: ready ? 'var(--ss-ink)' : 'transparent',
          color: ready ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          borderRadius: 8, fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
          opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'default',
        }}>Sign in</button>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
          New here?{' '}
          <span onClick={onSignUp} style={{
            color: 'var(--ss-ink)', cursor: 'pointer',
            textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3,
          }}>Create an account</span>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  SSProviderButton, SSLandingScreen, SSSignUpScreen, SSSignInScreen,
});
