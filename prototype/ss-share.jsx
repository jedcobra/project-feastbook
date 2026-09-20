// ss-share.jsx — What a shared link looks like to someone with no account.
// The whole recipe, readable, no wall. The ask comes after they've got what they came for.

function SSPublicRecipePage({ recipeId = 'brown-butter-miso', onSignUp }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const author = byHandle(r.author) || SS_PEOPLE[1];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Browser chrome */}
      <div style={{ padding: '52px 12px 8px', borderBottom: '1px solid var(--ss-rule-soft)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--ss-bg-deep)', borderRadius: 8, padding: '6px 10px',
          fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
        }}>
          <SSIcon name="link" size={11} color="var(--ss-ink-mute)"/>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            specialspoon.app/r/{r.id}
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
        borderBottom: '1px dashed var(--ss-rule)',
      }}>
        <span style={{
          fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
          fontSize: 15, color: 'var(--ss-ink)',
        }}>Special Spoon</span>
        <span style={{ flex: 1 }}/>
        <SSBox compact onClick={onSignUp}>Create an account</SSBox>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ padding: '18px 20px 24px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {r.tags.map(t => <SSTag key={t}>{t}</SSTag>)}
          </div>
          <SSHeading level={1} style={{ fontSize: 29, lineHeight: 1.05, marginBottom: 8, textWrap: 'balance' }}>
            {r.title}
          </SSHeading>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.5,
            color: 'var(--ss-ink-mute)', marginBottom: 14,
          }}>{r.subtitle}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SSAvatar name={author.name} size={24}/>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>{author.name}</span>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>@{author.handle}</span>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px dashed var(--ss-rule)', borderBottom: '1px dashed var(--ss-rule)', marginBottom: 16,
          }}>
            {[['Time', r.time], ['Serves', r.serves], ['Level', r.difficulty]].map(([k, v]) => (
              <div key={k} style={{ padding: '9px 0', textAlign: 'center', borderRight: '1px dashed var(--ss-rule)' }}>
                <SSLabel style={{ fontSize: 9, marginBottom: 3 }}>{k}</SSLabel>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>{v}</div>
              </div>
            ))}
          </div>

          {r.intro && (
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.65,
              color: 'var(--ss-ink-mute)', paddingBottom: 16, marginBottom: 16,
              borderBottom: '1px dashed var(--ss-rule)',
            }}>{r.intro}</div>
          )}

          <SSLabel style={{ marginBottom: 8 }}>Ingredients</SSLabel>
          {r.ingredients.map((sec, si) => (
            <div key={si} style={{ marginBottom: 10 }}>
              {sec.section && <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--ss-ink-mute)', marginBottom: 5,
              }}>{sec.section}</div>}
              {sec.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', borderTop: '1px dotted var(--ss-rule)' }}>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', width: 62, flexShrink: 0 }}>{it.q}</span>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>{it.i}</span>
                </div>
              ))}
            </div>
          ))}

          <SSLabel style={{ margin: '18px 0 8px' }}>Method</SSLabel>
          {r.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 11, padding: '11px 0', borderTop: '1px dashed var(--ss-rule)' }}>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', width: 20, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 15,
                  color: 'var(--ss-ink)', marginBottom: 3,
                }}>{s.t}</div>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11.5, lineHeight: 1.55, color: 'var(--ss-ink-mute)' }}>{s.d}</div>
              </div>
            </div>
          ))}

          {/* The ask — after the recipe, not before it */}
          <div style={{
            marginTop: 22, border: '1px solid var(--ss-ink)', padding: '18px 16px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
              fontSize: 19, color: 'var(--ss-ink)', marginBottom: 6,
            }}>Keep this one?</div>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 11.5, lineHeight: 1.55,
              color: 'var(--ss-ink-mute)', marginBottom: 14,
            }}>An account gives you a shelf to put it on, step-by-step cooking mode, and {author.name}’s next one.</div>
            <button onClick={onSignUp} style={{
              width: '100%', padding: '12px', border: '1px solid var(--ss-ink)', background: 'var(--ss-ink)',
              color: 'var(--ss-bg)', borderRadius: 8, fontFamily: 'var(--ss-mono)', fontSize: 12.5, fontWeight: 600,
            }}>Create an account — free</button>
          </div>

          <div style={{
            marginTop: 18, fontFamily: 'var(--ss-mono)', fontSize: 10,
            color: 'var(--ss-ink-mute)', textAlign: 'center', lineHeight: 1.6,
          }}>{r.madeIt} people have cooked this · Terms · Privacy</div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div style={{
        borderTop: '1px dashed var(--ss-rule)', background: 'var(--ss-bg)',
        padding: '10px 16px 26px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>Reading in a browser</div>
          <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>Open in the app to cook from it</div>
        </div>
        <SSBox compact onClick={onSignUp}>Open in app</SSBox>
      </div>
    </div>
  );
}

Object.assign(window, { SSPublicRecipePage });
