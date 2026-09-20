// ss-shelves.jsx — Shelves: the index, one shelf, filing a recipe onto one, making a new one.

// ─────────────────────────────────────────────────────────────
// Index — all your shelves, reorderable, with a new-shelf row
// ─────────────────────────────────────────────────────────────
function SSShelvesScreen({ onBack, onOpenShelf, onNewShelf }) {
  return (
    <>
      <SSTopBar title="Shelves" onBack={onBack} subtitle={`${SS_SHELVES.length} shelves · 34 recipes`}
        trailing={<SSBox compact onClick={onNewShelf}><SSIcon name="plus" size={12}/> New</SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {SS_SHELVES.map((sh, i) => (
            <div key={sh.id} onClick={() => onOpenShelf && onOpenShelf(sh.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0',
              borderTop: '1px dashed var(--ss-rule)',
              borderBottom: i === SS_SHELVES.length - 1 ? '1px dashed var(--ss-rule)' : 'none',
              cursor: 'pointer',
            }}>
              <SSIcon name="drag" size={13} color="var(--ss-rule)"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SSHeading level={3} style={{ fontSize: 17, marginBottom: 2 }}>{sh.title}</SSHeading>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                  {sh.subtitle} · {sh.count} recipes
                </div>
              </div>
              <SSIcon name="chevron" size={14} color="var(--ss-rule)"/>
            </div>
          ))}
          <div onClick={onNewShelf} style={{
            marginTop: 16, padding: '13px', border: '1px dashed var(--ss-rule)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            cursor: 'pointer', fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink-mute)',
          }}>
            <SSIcon name="plus" size={13}/> New shelf
          </div>
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// One shelf — its recipes, sortable, editable
// ─────────────────────────────────────────────────────────────
function SSShelfScreen({ shelfId = 'weeknight', onBack, onOpenRecipe }) {
  const sh = SS_SHELVES.find(s => s.id === shelfId) || SS_SHELVES[0];
  const [sort, setSort] = React.useState('added');
  const [editing, setEditing] = React.useState(false);
  const recipes = (sh.recipes || []).map(recipeById).filter(Boolean);
  const sorted = sort === 'title'
    ? [...recipes].sort((a, b) => a.title.localeCompare(b.title))
    : sort === 'time'
      ? [...recipes].sort((a, b) => (parseInt(a.time) || 999) - (parseInt(b.time) || 999))
      : recipes;

  return (
    <>
      <SSTopBar title={sh.title} onBack={onBack} subtitle={`${sh.count} recipes · private`}
        trailing={<SSBox compact onClick={() => setEditing(e => !e)}>{editing ? 'Done' : 'Edit'}</SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
            color: 'var(--ss-ink-mute)', marginBottom: 14,
          }}>{sh.subtitle}</div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {[['added', 'Recently added'], ['title', 'A–Z'], ['time', 'Quickest']].map(([k, l]) => (
              <span key={k} onClick={() => setSort(k)} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10.5, padding: '3px 8px',
                border: '1px solid var(--ss-ink)', borderRadius: 4, cursor: 'pointer',
                background: sort === k ? 'var(--ss-ink)' : 'transparent',
                color: sort === k ? 'var(--ss-bg)' : 'var(--ss-ink)',
              }}>{l}</span>
            ))}
          </div>

          {sorted.map(r => (
            <div key={r.id} onClick={() => !editing && onOpenRecipe && onOpenRecipe(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
              borderTop: '1px dashed var(--ss-rule)', cursor: 'pointer',
            }}>
              {editing && <SSIcon name="drag" size={13} color="var(--ss-rule)"/>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <SSHeading level={3} style={{ fontSize: 16, marginBottom: 2 }}>{r.title}</SSHeading>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>
                  @{r.author} · {r.time} · {r.difficulty}
                </div>
              </div>
              {editing
                ? <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-accent)' }}>Remove</span>
                : <SSIcon name="chevron" size={13} color="var(--ss-rule)"/>}
            </div>
          ))}

          {sorted.length === 0 && (
            <div style={{ padding: '26px 18px', textAlign: 'center', border: '1px dashed var(--ss-rule)', marginTop: 10 }}>
              <div style={{
                fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
                fontSize: 18, color: 'var(--ss-ink)', marginBottom: 6,
              }}>Empty shelf</div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.5, color: 'var(--ss-ink-mute)' }}>
                Save a recipe and file it here, or move things over from another shelf.
              </div>
            </div>
          )}
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Add-to-shelf sheet — what the bookmark button actually opens
// ─────────────────────────────────────────────────────────────
function SSAddToShelfSheet({ recipeId = 'brown-butter-miso', onClose, onNewShelf }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [on, setOn] = React.useState(['weeknight']);
  const toggle = (id) => setOn(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(35,36,89,0.28)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--ss-bg)', borderTop: '1px solid var(--ss-ink)',
        borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: '16px 20px 24px',
      }}>
        <div style={{
          fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
          fontSize: 19, color: 'var(--ss-ink)', marginBottom: 2,
        }}>Save to a shelf</div>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
          marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{r.title}</div>

        {SS_SHELVES.map(sh => (
          <div key={sh.id} onClick={() => toggle(sh.id)} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0',
            borderTop: '1px dashed var(--ss-rule)', cursor: 'pointer',
          }}>
            <SSCheckbox checked={on.includes(sh.id)} size={15}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>{sh.title}</div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>{sh.count} recipes</div>
            </div>
          </div>
        ))}

        <div onClick={onNewShelf} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0',
          borderTop: '1px dashed var(--ss-rule)', borderBottom: '1px dashed var(--ss-rule)',
          cursor: 'pointer', marginBottom: 14,
        }}>
          <SSIcon name="plus" size={15} color="var(--ss-ink)"/>
          <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>New shelf…</span>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '13px', borderRadius: 8,
          border: '1px solid var(--ss-ink)', background: 'var(--ss-ink)', color: 'var(--ss-bg)',
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
        }}>Save to {on.length} shelf{on.length === 1 ? '' : 'ves'}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// New shelf — name, one line, who can see it
// ─────────────────────────────────────────────────────────────
function SSNewShelfScreen({ onBack, onCreate }) {
  const [title, setTitle] = React.useState('');
  const [sub, setSub] = React.useState('');
  const [privacy, setPrivacy] = React.useState('Only me');
  return (
    <>
      <SSTopBar title="New shelf" onBack={onBack}
        trailing={<button onClick={onCreate} disabled={!title.trim()} style={{
          border: '1px solid var(--ss-ink)', borderRadius: 6, padding: '5px 12px',
          background: title.trim() ? 'var(--ss-ink)' : 'transparent',
          color: title.trim() ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          fontFamily: 'var(--ss-mono)', fontSize: 11.5, opacity: title.trim() ? 1 : 0.5,
        }}>Create</button>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <SSField label="Name" value={title} onChange={setTitle} mono={false} size={22}
            placeholder="Sunday Projects"/>
          <SSField label="One line about it" value={sub} onChange={setSub}
            placeholder="When I have time and nothing else to do"
            hint="Optional. Shows under the name."/>
          <div style={{ marginTop: 6 }}>
            <SSLabel style={{ marginBottom: 8 }}>Who can see it</SSLabel>
            {['Only me', 'People I follow back', 'Anyone with the link'].map(p => (
              <div key={p} onClick={() => setPrivacy(p)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
                borderTop: '1px dashed var(--ss-rule)', cursor: 'pointer',
              }}>
                <span style={{
                  width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                  border: '1.2px solid var(--ss-ink)',
                  background: privacy === p ? 'var(--ss-ink)' : 'transparent',
                  boxShadow: privacy === p ? 'inset 0 0 0 2px var(--ss-bg)' : 'none',
                }}/>
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, { SSShelvesScreen, SSShelfScreen, SSAddToShelfSheet, SSNewShelfScreen });
