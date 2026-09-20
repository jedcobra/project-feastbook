// ss-search.jsx — Real search. Everything at once, filtered as you type.
// Recents and saved searches when the field is empty; three kinds of result when it isn't.

const SS_RECENT_SEARCHES = ['miso', 'sunday bread', '@mayacooks', 'under 30 min', 'plum'];

function ssSearchAll(q) {
  const s = q.trim().toLowerCase();
  if (!s) return { recipes: [], people: [], shelves: [] };
  const hit = (str) => (str || '').toLowerCase().includes(s.replace(/^@/, ''));
  return {
    recipes: SS_RECIPES.filter(r =>
      hit(r.title) || hit(r.subtitle) || (r.tags || []).some(hit) ||
      (r.ingredients || []).some(sec => (sec.items || []).some(it => hit(it.i)))),
    people: SS_PEOPLE.filter(p => hit(p.name) || hit(p.handle) || hit(p.bio)),
    shelves: SS_SHELVES.filter(sh => hit(sh.title) || hit(sh.subtitle)),
  };
}

function SSSearchScreen({ initial = '', onBack, onOpenRecipe, onOpenProfile, onOpenShelf }) {
  const [q, setQ] = React.useState(initial);
  const [scope, setScope] = React.useState('all');
  const [filters, setFilters] = React.useState([]);
  const inputRef = React.useRef(null);
  const res = ssSearchAll(q);

  const toggleFilter = (f) => setFilters(fs => fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f]);
  const recipes = res.recipes.filter(r =>
    filters.every(f =>
      f === 'under 30' ? /^\d+ min/.test(r.time) && parseInt(r.time) <= 30 :
      f === 'easy' ? r.difficulty === 'Easy' :
      f === 'saved' ? true : true));

  const count = recipes.length + res.people.length + res.shelves.length;
  const showRecipes = scope === 'all' || scope === 'recipes';
  const showPeople  = scope === 'all' || scope === 'people';
  const showShelves = scope === 'all' || scope === 'shelves';

  return (
    <>
      {/* Search bar in place of a title bar */}
      <div style={{ padding: '54px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span onClick={onBack} style={{ cursor: 'pointer', display: 'flex' }}>
          <SSIcon name="back" size={19} color="var(--ss-ink)"/>
        </span>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--ss-ink)', borderRadius: 8, padding: '8px 10px',
          background: 'var(--ss-surface)',
        }}>
          <SSIcon name="search" size={14} color="var(--ss-ink-mute)"/>
          <input
            ref={inputRef} value={q} autoFocus
            onChange={e => setQ(e.target.value)}
            placeholder="Recipes, cooks, tags, ingredients…"
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)', padding: 0,
            }}/>
          {q && <span onClick={() => setQ('')} style={{
            fontFamily: 'var(--ss-mono)', fontSize: 14, color: 'var(--ss-ink-mute)', cursor: 'pointer',
          }}>×</span>}
        </div>
      </div>

      {/* Scope + filters, only once there's something to scope */}
      {q.trim() && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['all', `All ${count}`], ['recipes', `Recipes ${recipes.length}`],
            ['people', `Cooks ${res.people.length}`], ['shelves', `Shelves ${res.shelves.length}`]].map(([k, l]) => (
            <span key={k} onClick={() => setScope(k)} style={{
              fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '3px 8px',
              border: '1px solid var(--ss-ink)', borderRadius: 4, cursor: 'pointer',
              background: scope === k ? 'var(--ss-ink)' : 'transparent',
              color: scope === k ? 'var(--ss-bg)' : 'var(--ss-ink)',
            }}>{l}</span>
          ))}
          <span style={{ flexBasis: '100%', height: 0 }}/>
          {['under 30', 'easy', 'saved'].map(f => (
            <span key={f} onClick={() => toggleFilter(f)} style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10.5, padding: '2px 7px',
              border: '1px dashed var(--ss-rule)', borderRadius: 4, cursor: 'pointer',
              background: filters.includes(f) ? 'var(--ss-bg-deep)' : 'transparent',
              color: filters.includes(f) ? 'var(--ss-ink)' : 'var(--ss-ink-mute)',
            }}>{filters.includes(f) ? '✓ ' : '+ '}{f}</span>
          ))}
        </div>
      )}

      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {!q.trim() ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'baseline',
                borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 4,
              }}>
                <SSLabel style={{ flex: 1 }}>Recent</SSLabel>
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)', cursor: 'pointer' }}>Clear</span>
              </div>
              {SS_RECENT_SEARCHES.map(s => (
                <div key={s} onClick={() => setQ(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '10px 0',
                  borderBottom: '1px dotted var(--ss-rule)', cursor: 'pointer',
                }}>
                  <SSIcon name="clock" size={13} color="var(--ss-ink-mute)"/>
                  <span style={{ flex: 1, fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>{s}</span>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 13, color: 'var(--ss-ink-mute)' }}>×</span>
                </div>
              ))}
              <div style={{ marginTop: 22 }}>
                <SSLabel style={{ marginBottom: 10 }}>Try</SSLabel>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['weeknight', 'sourdough', 'one-pot', 'vegan', 'dessert', 'preserves'].map(t => (
                    <span key={t} onClick={() => setQ(t)} style={{ cursor: 'pointer' }}><SSTag>{t}</SSTag></span>
                  ))}
                </div>
              </div>
            </>
          ) : count === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', border: '1px dashed var(--ss-rule)', marginTop: 8 }}>
              <div style={{
                fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
                fontSize: 19, color: 'var(--ss-ink)', marginBottom: 6,
              }}>Nothing for “{q}”</div>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
                color: 'var(--ss-ink-mute)', marginBottom: 14,
              }}>Not in your cookbook, and nobody you follow has written one.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <SSBox compact>Search all of Special Spoon</SSBox>
                <SSBox compact>Write it yourself</SSBox>
              </div>
            </div>
          ) : (
            <>
              {showRecipes && recipes.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SSLabel style={{ marginBottom: 6 }}>Recipes</SSLabel>
                  {recipes.map((r, i) => (
                    <div key={r.id} onClick={() => onOpenRecipe && onOpenRecipe(r.id)} style={{
                      padding: '11px 0', borderTop: '1px dashed var(--ss-rule)',
                      display: 'flex', alignItems: 'baseline', gap: 10, cursor: 'pointer',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <SSHeading level={3} style={{ fontSize: 15.5, marginBottom: 2 }}>{r.title}</SSHeading>
                        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>
                          @{r.author} · {r.time} · {r.madeIt} cooked
                        </div>
                      </div>
                      {r.author === 'you' && <span style={{
                        fontFamily: 'var(--ss-mono)', fontSize: 9, textTransform: 'uppercase',
                        letterSpacing: '0.08em', border: '1px solid var(--ss-ink)', padding: '1px 4px',
                        color: 'var(--ss-ink)', flexShrink: 0,
                      }}>yours</span>}
                    </div>
                  ))}
                </div>
              )}

              {showPeople && res.people.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SSLabel style={{ marginBottom: 6 }}>Cooks</SSLabel>
                  {res.people.map(p => (
                    <div key={p.id} onClick={() => onOpenProfile && onOpenProfile(p.handle)} style={{
                      padding: '10px 0', borderTop: '1px dashed var(--ss-rule)',
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    }}>
                      <SSAvatar name={p.name} size={28}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14, color: 'var(--ss-ink)' }}>{p.name}</div>
                        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>@{p.handle} · {p.recipes} recipes</div>
                      </div>
                      <SSBox compact>Follow</SSBox>
                    </div>
                  ))}
                </div>
              )}

              {showShelves && res.shelves.length > 0 && (
                <div>
                  <SSLabel style={{ marginBottom: 6 }}>Shelves</SSLabel>
                  {res.shelves.map(sh => (
                    <div key={sh.id} onClick={() => onOpenShelf && onOpenShelf(sh.id)} style={{
                      padding: '10px 0', borderTop: '1px dashed var(--ss-rule)',
                      display: 'flex', alignItems: 'baseline', gap: 10, cursor: 'pointer',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14, color: 'var(--ss-ink)' }}>{sh.title}</div>
                        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>{sh.subtitle}</div>
                      </div>
                      <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)' }}>{sh.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, { SS_RECENT_SEARCHES, ssSearchAll, SSSearchScreen });
