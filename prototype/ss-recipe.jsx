// ss-recipe.jsx — Recipe detail. Noods-style document layout.
// Two-column ingredients + numbered method. Minimal.

function SSRecipeScreen({ recipeId, layout = 'document', onBack, onCook, onOpenProfile }) {
  const r = recipeById(recipeId);
  if (!r) return null;
  const author = byHandle(r.author);

  return (
    <>
      <SSTopBar
        onBack={onBack}
        trailing={<>
          <SSBox compact>
            <SSIcon name="bookmark" size={14}/>
          </SSBox>
          <SSBox compact>
            <SSIcon name="share" size={14}/>
          </SSBox>
        </>}
      />
      <SSScroll>
        {layout === 'document' && <DocumentDetail r={r} author={author} onCook={onCook} onOpenProfile={onOpenProfile}/>}
        {layout === 'focus'    && <FocusDetail    r={r} author={author} onCook={onCook} onOpenProfile={onOpenProfile}/>}
        {layout === 'margin'   && <MarginDetail   r={r} author={author} onCook={onCook} onOpenProfile={onOpenProfile}/>}
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared — meta grid
// ─────────────────────────────────────────────────────────────
function RecipeMeta({ r }) {
  const cols = [
    ['Time',   r.time],
    ['Serves', r.serves],
    ['Level',  r.difficulty],
    ['Rating', r.rating + ' ★'],
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
      borderTop: '1px dashed var(--ss-rule)',
      borderBottom: '1px dashed var(--ss-rule)',
      margin: '14px 0',
    }}>
      {cols.map(([k, v]) => (
        <div key={k} style={{
          padding: '10px 0', textAlign: 'center',
          borderRight: '1px dashed var(--ss-rule)',
        }}>
          <SSLabel style={{ fontSize: 9, letterSpacing: 0.05, marginBottom: 3 }}>{k}</SSLabel>
          <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

// Shared — checklist ingredients
function IngredientsBlock({ r, showTitle = true }) {
  const [checked, setChecked] = React.useState({});
  const toggle = (k) => setChecked(c => ({ ...c, [k]: !c[k] }));

  return (
    <div>
      {showTitle && <SSLabel style={{ marginBottom: 10 }}>Ingredients</SSLabel>}
      {r.ingredients.map((section, si) => (
        <div key={si} style={{ marginBottom: 12 }}>
          {section.section && (
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10, letterSpacing: 0.06,
              textTransform: 'uppercase', color: 'var(--ss-ink-mute)', marginBottom: 6,
            }}>{section.section}</div>
          )}
          {section.items.map((it, i) => {
            const key = `${si}-${i}`;
            const done = !!checked[key];
            return (
              <div
                key={i}
                onClick={() => toggle(key)}
                style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '6px 0',
                  borderTop: i === 0 && !section.section ? 'none' : '1px dotted var(--ss-rule)',
                  cursor: 'pointer', opacity: done ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <SSCheckbox checked={done} size={13} style={{ marginTop: 2, flexShrink: 0 }}/>
                <span style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11,
                  color: 'var(--ss-ink-mute)', width: 64, flexShrink: 0,
                  lineHeight: 1.4,
                }}>{it.q}</span>
                <span style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 12,
                  color: 'var(--ss-ink)', flex: 1, lineHeight: 1.4,
                  textDecoration: done ? 'line-through' : 'none',
                }}>{it.i}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Shared — numbered method
function MethodBlock({ r, showTitle = true }) {
  const [active, setActive] = React.useState(null);
  return (
    <div>
      {showTitle && <SSLabel style={{ marginBottom: 10 }}>Method</SSLabel>}
      {r.steps.map((s, i) => {
        const isActive = active === i;
        return (
          <div
            key={i}
            onClick={() => setActive(isActive ? null : i)}
            style={{
              padding: '12px 0',
              borderTop: '1px dashed var(--ss-rule)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11,
                color: 'var(--ss-ink-mute)', width: 20, flexShrink: 0,
                paddingTop: 1,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--ss-display)',
                  fontWeight: 'var(--ss-display-weight)',
                  fontSize: 16, lineHeight: 1.15, color: 'var(--ss-ink)',
                  letterSpacing: 'var(--ss-display-tracking)',
                  marginBottom: isActive ? 6 : 0,
                }}>{s.t}</div>
                {isActive && (
                  <div style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 12,
                    color: 'var(--ss-ink-mute)', lineHeight: 1.55,
                  }}>{s.d}</div>
                )}
              </div>
              {s.timer && (
                <span style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 10,
                  color: 'var(--ss-accent)', flexShrink: 0,
                  border: '1px solid var(--ss-accent)', padding: '2px 5px',
                  borderRadius: 3,
                }}>{s.timer}m</span>
              )}
            </div>
            {isActive && s.timer && (
              <div style={{ marginTop: 8, marginLeft: 32 }}>
                <SSBox compact>Start timer — {s.timer} min</SSBox>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Shared — comments
function CommentsBlock({ r }) {
  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ borderTop: '1px dashed var(--ss-rule)', marginBottom: 14 }}/>
      <SSLabel style={{ marginBottom: 12 }}>Notes from the table</SSLabel>
      {r.comments.map((c, i) => {
        const a = byHandle(c.by);
        return (
          <div key={i} style={{
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : '1px dotted var(--ss-rule)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
            }}>
              <SSAvatar name={a.name} size={18}/>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink)' }}>
                {a.name}
              </span>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                · {c.likes} ♥
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.5,
              color: 'var(--ss-ink-mute)', paddingLeft: 24,
            }}>{c.text}</div>
          </div>
        );
      })}
      <div style={{
        marginTop: 14, padding: '9px 12px',
        border: '1px dashed var(--ss-rule)',
        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
        color: 'var(--ss-ink-mute)', fontFamily: 'var(--ss-mono)', fontSize: 12,
      }}>
        <SSIcon name="pencil" size={13}/>
        Leave a note…
      </div>
    </div>
  );
}

// Shared — cook button
function CookButton({ onCook }) {
  return (
    <div style={{
      padding: '12px 20px 20px',
      background: 'var(--ss-bg)',
      borderTop: '1px dashed var(--ss-rule)',
      position: 'sticky', bottom: 0, zIndex: 2,
    }}>
      <button onClick={onCook} style={{
        width: '100%', padding: '13px',
        border: '1px solid var(--ss-ink)',
        background: 'var(--ss-ink)', color: 'var(--ss-bg)',
        borderRadius: 8, fontSize: 14, fontWeight: 600,
        letterSpacing: 0.04, cursor: 'pointer',
        fontFamily: 'var(--ss-mono)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <SSIcon name="cook" size={16} weight={2}/>
        Start cooking
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Document layout — header block, then inline two-col on wide.
// On narrow (phone) they stack: ingredients → method. Noods feel.
// ─────────────────────────────────────────────────────────────
function DocumentDetail({ r, author, onCook, onOpenProfile }) {
  return (
    <>
      <div style={{ padding: '0 20px' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {r.tags.map(t => <SSTag key={t}>{t}</SSTag>)}
        </div>

        {/* Title */}
        <SSHeading level={1} style={{ fontSize: 32, lineHeight: 1.05, marginBottom: 8, textWrap: 'balance' }}>
          {r.title}
        </SSHeading>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 13, color: 'var(--ss-ink-mute)',
          lineHeight: 1.5, marginBottom: 16,
        }}>{r.subtitle}</div>

        {/* Author */}
        <div
          onClick={() => onOpenProfile && onOpenProfile(author.handle)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, cursor: 'pointer',
          }}
        >
          <SSAvatar name={author.name} size={24}/>
          <SSLink style={{ fontSize: 13 }}>{author.name}</SSLink>
          <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
            @{author.handle}
          </span>
        </div>

        <RecipeMeta r={r}/>

        {/* Intro */}
        {r.intro && (
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 13, lineHeight: 1.65,
            color: 'var(--ss-ink-mute)', marginBottom: 20,
            padding: '0 0 20px',
            borderBottom: '1px dashed var(--ss-rule)',
          }}>{r.intro}</div>
        )}

        {/* Ingredients */}
        {r.ingredients.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <IngredientsBlock r={r}/>
          </div>
        )}

        {/* Method */}
        {r.steps.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <MethodBlock r={r}/>
          </div>
        )}

        {/* Author notes */}
        {r.notes.length > 0 && (
          <div style={{
            padding: '14px', background: 'var(--ss-bg-deep)',
            border: '1px dashed var(--ss-rule)',
            marginBottom: 20,
          }}>
            <SSLabel style={{ marginBottom: 8 }}>Author's notes</SSLabel>
            {r.notes.map((n, i) => (
              <div key={i} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
                color: 'var(--ss-ink-mute)', marginBottom: 4,
              }}>— {n.text}</div>
            ))}
          </div>
        )}

        {r.comments.length > 0 && <CommentsBlock r={r}/>}
      </div>
      <CookButton onCook={onCook}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Focus layout — one generous column, larger type
// ─────────────────────────────────────────────────────────────
function FocusDetail({ r, author, onCook, onOpenProfile }) {
  return (
    <>
      <div style={{ padding: '0 24px' }}>
        <SSHeading level={1} style={{ fontSize: 36, lineHeight: 1.02, marginBottom: 10, textWrap: 'balance' }}>
          {r.title}
        </SSHeading>

        <div style={{
          fontFamily: 'var(--ss-display)', fontSize: 16,
          color: 'var(--ss-ink-mute)', lineHeight: 1.4, marginBottom: 14,
          fontStyle: 'italic',
        }}>{r.subtitle}</div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {r.tags.map(t => <SSTag key={t}>{t}</SSTag>)}
        </div>

        <RecipeMeta r={r}/>

        {r.intro && (
          <p style={{
            fontFamily: 'var(--ss-mono)', fontSize: 14, lineHeight: 1.7,
            color: 'var(--ss-ink-mute)', margin: '0 0 24px',
          }}>{r.intro}</p>
        )}

        {r.ingredients.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <IngredientsBlock r={r}/>
          </div>
        )}

        {r.steps.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <MethodBlock r={r}/>
          </div>
        )}

        {r.notes.length > 0 && (
          <div style={{ padding: '14px', background: 'var(--ss-bg-deep)', marginBottom: 20 }}>
            {r.notes.map((n, i) => (
              <div key={i} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 13, lineHeight: 1.55,
                color: 'var(--ss-ink-mute)',
              }}>— {n.text}</div>
            ))}
          </div>
        )}

        {r.comments.length > 0 && <CommentsBlock r={r}/>}
      </div>
      <CookButton onCook={onCook}/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Margin layout — ingredients in a left margin column, steps on right
// ─────────────────────────────────────────────────────────────
function MarginDetail({ r, author, onCook, onOpenProfile }) {
  const flatIngs = r.ingredients.flatMap(s => s.items);
  const [checked, setChecked] = React.useState({});
  const toggle = (k) => setChecked(c => ({ ...c, [k]: !c[k] }));

  return (
    <>
      <div style={{ padding: '0 16px' }}>
        <SSHeading level={1} style={{ fontSize: 28, marginBottom: 6, textWrap: 'balance' }}>
          {r.title}
        </SSHeading>
        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink-mute)', marginBottom: 4 }}>
          {r.time} · serves {r.serves} · {r.difficulty}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {r.tags.map(t => <SSTag key={t}>{t}</SSTag>)}
        </div>
        <SSRule style={{ marginBottom: 14 }}/>

        {/* Two column: left = ingredients, right = steps */}
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Left margin — ingredient checklist */}
          <div style={{
            width: 112, flexShrink: 0,
            borderRight: '1px dashed var(--ss-rule)',
            paddingRight: 12,
          }}>
            <SSLabel style={{ fontSize: 9, marginBottom: 8 }}>Ingredients</SSLabel>
            {flatIngs.map((it, i) => {
              const done = !!checked[i];
              return (
                <div key={i} onClick={() => toggle(i)} style={{
                  display: 'flex', gap: 5, marginBottom: 8, cursor: 'pointer',
                  opacity: done ? 0.35 : 1,
                }}>
                  <SSCheckbox checked={done} size={11} style={{ marginTop: 2 }}/>
                  <div>
                    <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>{it.q}</div>
                    <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink)', lineHeight: 1.3 }}>{it.i}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — numbered steps */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <SSLabel style={{ fontSize: 9, marginBottom: 8 }}>Method</SSLabel>
            {r.steps.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 9, color: 'var(--ss-ink-mute)',
                  textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 2,
                }}>Step {String(i + 1).padStart(2, '0')}{s.timer ? ` · ${s.timer}m` : ''}</div>
                <div style={{
                  fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
                  fontSize: 14, color: 'var(--ss-ink)', marginBottom: 3,
                  lineHeight: 1.2, letterSpacing: 'var(--ss-display-tracking)',
                }}>{s.t}</div>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11, lineHeight: 1.55,
                  color: 'var(--ss-ink-mute)',
                }}>{s.d}</div>
              </div>
            ))}

            {r.notes.length > 0 && (
              <div style={{
                borderTop: '1px dashed var(--ss-rule)', paddingTop: 10, marginTop: 4,
              }}>
                {r.notes.map((n, i) => (
                  <div key={i} style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', marginBottom: 4 }}>
                    ↳ {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SSRule style={{ margin: '16px 0' }}/>
        {r.comments.length > 0 && <CommentsBlock r={r}/>}
      </div>
      <CookButton onCook={onCook}/>
    </>
  );
}

Object.assign(window, { SSRecipeScreen });
