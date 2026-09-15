// ss-cooking.jsx — Cooking mode. Dark indigo bg, monospace step counter,
// huge serif title, clean progress bar.

function SSCookingScreen({ recipeId, onExit }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [step, setStep] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(null);
  const current = r.steps[step];

  // Start timer
  const startTimer = () => {
    if (!current.timer) return;
    setTimeLeft(current.timer * 60);
    setTimerActive(true);
  };

  React.useEffect(() => {
    if (!timerActive || timeLeft === null) return;
    if (timeLeft <= 0) { setTimerActive(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const progress = (step + 1) / r.steps.length;

  const goNext = () => {
    if (step < r.steps.length - 1) {
      setStep(step + 1);
      setTimerActive(false);
      setTimeLeft(null);
    } else {
      onExit && onExit();
    }
  };
  const goPrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setTimerActive(false);
      setTimeLeft(null);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--ss-ink)', color: 'var(--ss-bg)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--ss-body)',
    }}>
      {/* Top */}
      <div style={{
        paddingTop: 54, paddingBottom: 0,
        paddingLeft: 20, paddingRight: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onExit} style={{
          border: '1px solid rgba(255,255,255,0.25)', background: 'transparent',
          color: 'var(--ss-bg)', cursor: 'pointer',
          padding: '6px 10px', borderRadius: 6,
          display: 'flex', alignItems: 'center',
        }}>
          <SSIcon name="x" size={16}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 10,
            color: 'rgba(255,255,255,0.45)', letterSpacing: 0.12, textTransform: 'uppercase',
            marginBottom: 1,
          }}>now cooking</div>
          <div style={{
            fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{r.title}</div>
        </div>
        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {step + 1}/{r.steps.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', margin: '14px 20px 0' }}>
        <div style={{
          height: '100%', background: 'var(--ss-bg)',
          width: `${progress * 100}%`,
          transition: 'width 0.3s ease',
        }}/>
      </div>

      {/* Step content */}
      <div style={{
        flex: 1, padding: '28px 24px 16px',
        display: 'flex', flexDirection: 'column', overflow: 'auto',
      }}>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11,
          color: 'rgba(255,255,255,0.35)', marginBottom: 12,
          letterSpacing: 0.06, textTransform: 'uppercase',
        }}>Step {String(step + 1).padStart(2, '0')}</div>

        <div style={{
          fontFamily: 'var(--ss-display)',
          fontWeight: 'var(--ss-display-weight)',
          fontSize: 36, lineHeight: 1.02, marginBottom: 18,
          letterSpacing: 'var(--ss-display-tracking)',
          textWrap: 'balance',
        }}>{current.t}</div>

        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 14,
          lineHeight: 1.65, color: 'rgba(255,255,255,0.65)',
          marginBottom: 24,
        }}>{current.d}</div>

        {current.timer && (
          <div style={{
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            marginBottom: 20,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 32, fontWeight: 600,
                lineHeight: 1, letterSpacing: -0.01,
                color: timerActive ? 'var(--ss-bg)' : 'rgba(255,255,255,0.5)',
              }}>
                {timeLeft !== null ? fmt(timeLeft) : `${String(current.timer).padStart(2,'0')}:00`}
              </div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                {timerActive ? 'running' : 'timer'}
              </div>
            </div>
            {!timerActive ? (
              <button onClick={startTimer} style={{
                border: '1px solid var(--ss-bg)', background: 'transparent',
                color: 'var(--ss-bg)', padding: '8px 16px', borderRadius: 6,
                fontFamily: 'var(--ss-mono)', fontSize: 12, cursor: 'pointer',
              }}>Start</button>
            ) : (
              <button onClick={() => setTimerActive(false)} style={{
                border: '1px solid rgba(255,255,255,0.3)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: 6,
                fontFamily: 'var(--ss-mono)', fontSize: 12, cursor: 'pointer',
              }}>Pause</button>
            )}
          </div>
        )}

        {/* Quick ingredient reference on first step */}
        {step === 0 && r.ingredients.length > 0 && (
          <div style={{
            border: '1px dashed rgba(255,255,255,0.15)', padding: '12px 14px',
            marginTop: 'auto',
          }}>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8,
            }}>You'll need</div>
            {r.ingredients.flatMap(s => s.items).slice(0, 4).map((it, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '4px 0',
                fontFamily: 'var(--ss-mono)', fontSize: 12,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', width: 60, flexShrink: 0 }}>{it.q}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{it.i}</span>
              </div>
            ))}
            {r.ingredients.flatMap(s => s.items).length > 4 && (
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                + {r.ingredients.flatMap(s => s.items).length - 4} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{
        padding: '12px 20px 32px', display: 'flex', gap: 10,
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={goPrev}
          disabled={step === 0}
          style={{
            padding: '13px 18px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'var(--ss-bg)',
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0.25 : 1,
            fontFamily: 'var(--ss-mono)',
            display: 'flex', alignItems: 'center',
          }}>
          <SSIcon name="back" size={16}/>
        </button>
        <button
          onClick={goNext}
          style={{
            flex: 1, padding: '13px', borderRadius: 8,
            border: '1px solid var(--ss-bg)', background: 'var(--ss-bg)',
            color: 'var(--ss-ink)', fontFamily: 'var(--ss-mono)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {step < r.steps.length - 1 ? 'Next step' : 'Done'}
          <SSIcon name="chevron" size={16} weight={2} color="var(--ss-ink)"/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SSCookingScreen });
