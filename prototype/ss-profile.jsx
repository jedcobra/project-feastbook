// ss-profile.jsx — Personal cookbook / profile. Text-first, noods-style.

function SSProfileScreen({ handle = 'me', onBack, onOpenRecipe, isOwn }) {
  const p = byHandle(handle === 'me' ? 'you' : handle) || SS_PEOPLE[0];
  const myRecipes = SS_RECIPES.filter(r => r.author === p.handle);
  const [tab, setTab] = React.useState('shelves');

  return (
    <>
      <SSTopBar
        onBack={isOwn ? undefined : onBack}
        title={isOwn ? null : undefined}
        variant={isOwn ? 'brand' : 'default'}
        trailing={isOwn
          ? <SSBox compact><SSIcon name="edit" size={14}/></SSBox>
          : <SSBox compact><SSIcon name="share" size={14}/></SSBox>
        }
      />
      <SSScroll>
        {/* Profile header — text block, bordered */}
        <div style={{
          margin: '0 20px 20px',
          padding: '18px 18px 14px',
          border: '1px solid var(--ss-ink)',
          position: 'relative',
        }}>
          {/* Name */}
          <SSHeading level={1} style={{ fontSize: 26, marginBottom: 2 }}>
            {p.name}
          </SSHeading>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
            marginBottom: 10,
          }}>@{p.handle}</div>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
            color: 'var(--ss-ink-mute)', marginBottom: 14,
          }}>{p.bio}</div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px dashed var(--ss-rule)', paddingTop: 12,
          }}>
            {[
              ['Recipes', p.recipes],
              ['Followers', p.followers > 999 ? (p.followers/1000).toFixed(1)+'k' : p.followers],
              ['Following', p.following],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--ss-display)', fontWeight: 700,
                  fontSize: 20, color: 'var(--ss-ink)',
                }}>{v}</div>
                <SSLabel style={{ fontSize: 9, letterSpacing: 0.06 }}>{k}</SSLabel>
              </div>
            ))}
          </div>
        </div>

        {/* Follow / message actions for non-own */}
        {!isOwn && (
          <div style={{ padding: '0 20px 18px', display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, padding: '11px', border: '1px solid var(--ss-ink)',
              background: 'var(--ss-ink)', color: 'var(--ss-bg)',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--ss-mono)',
            }}>Follow</button>
            <SSBox style={{ padding: '11px 18px' }}>Message</SSBox>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          margin: '0 20px',
          borderBottom: '1px dashed var(--ss-rule)',
          display: 'flex', gap: 0,
        }}>
          {['shelves', 'recipes', 'cooked'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 0', marginRight: 22, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--ss-mono)', fontSize: 12,
              color: tab === t ? 'var(--ss-ink)' : 'var(--ss-ink-mute)',
              fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? '2px solid var(--ss-ink)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {t === 'shelves' ? 'Shelves' : t === 'recipes' ? 'Recipes' : 'Cooked'}
            </button>
          ))}
        </div>

        {/* Shelves tab — book spine metaphor, but text index */}
        {tab === 'shelves' && (
          <div style={{ margin: '0 20px', paddingBottom: 32 }}>
            {SS_SHELVES.map((s, i) => (
              <div key={s.id} style={{
                padding: '14px 0',
                borderBottom: '1px dashed var(--ss-rule)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                cursor: 'pointer',
              }}>
                {/* Count badge */}
                <div style={{
                  width: 36, height: 36, border: '1px solid var(--ss-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ss-ink)' }}>
                    {s.count}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <SSHeading level={3} style={{ fontSize: 17, marginBottom: 2 }}>
                    {s.title}
                  </SSHeading>
                  <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', marginBottom: 6 }}>
                    {s.subtitle}
                  </div>
                  {/* Mini recipe index */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.recipes.slice(0, 3).map(rid => {
                      const r = recipeById(rid);
                      return r ? (
                        <SSTag key={rid}>{r.title}</SSTag>
                      ) : null;
                    })}
                    {s.count > 3 && (
                      <SSTag>+{s.count - 3} more</SSTag>
                    )}
                  </div>
                </div>
                <SSIcon name="chevron" size={16} color="var(--ss-ink-mute)" style={{ flexShrink: 0, marginTop: 10 }}/>
              </div>
            ))}
            {isOwn && (
              <button style={{
                width: '100%', marginTop: 14, padding: '12px',
                background: 'transparent', border: '1px dashed var(--ss-rule)',
                borderRadius: 0, color: 'var(--ss-ink-mute)',
                fontFamily: 'var(--ss-mono)', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <SSIcon name="plus" size={13}/> New shelf
              </button>
            )}
          </div>
        )}

        {/* Recipes tab — text index */}
        {tab === 'recipes' && (
          <div style={{ margin: '0 20px', paddingBottom: 32 }}>
            {(myRecipes.length ? myRecipes : SS_RECIPES.slice(0, 4)).map((r, i) => (
              <div
                key={r.id}
                onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
                style={{
                  padding: '13px 0',
                  borderBottom: '1px dashed var(--ss-rule)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <SSHeading level={3} style={{ fontSize: 17, flex: 1, minWidth: 0 }}>
                    {r.title}
                  </SSHeading>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', flexShrink: 0 }}>
                    {r.saves} saves
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
                  marginTop: 3, display: 'flex', gap: 10,
                }}>
                  <span>{r.time}</span>
                  <span>·</span>
                  <span>{r.madeIt} cooked</span>
                  <span>·</span>
                  <span>{r.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cooked tab */}
        {tab === 'cooked' && (
          <div style={{ margin: '0 20px', paddingTop: 24, paddingBottom: 32 }}>
            <div style={{
              padding: '20px', border: '1px dashed var(--ss-rule)',
              fontFamily: 'var(--ss-mono)', fontSize: 12,
              color: 'var(--ss-ink-mute)', textAlign: 'center', lineHeight: 1.6,
            }}>
              Recipes {p.name.split(' ')[0]} has cooked<br/>will appear here.
            </div>
          </div>
        )}
      </SSScroll>
    </>
  );
}

Object.assign(window, { SSProfileScreen });
