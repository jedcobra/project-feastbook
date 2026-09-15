// ss-create-2.jsx — Import review (confident + uncertain), publish sheet,
// drafts list, first-recipe empty state.

// ─────────────────────────────────────────────────────────────
// 4 · Import review — confirm what was pulled in.
// mode: 'confident' (link import, clean parse) | 'uncertain' (photo, flagged fields)
// ─────────────────────────────────────────────────────────────
function SSImportReviewScreen({ mode = 'confident', onBack, onAccept, onSwitchMode }) {
  const uncertain = mode === 'uncertain';
  const src = uncertain
    ? { label: 'Photo \u00b7 handwritten card', sub: 'IMG_4471.heic' }
    : { label: 'Link \u00b7 smittenkitchen.com', sub: 'Brown butter miso pasta' };

  const [ings, setIngs] = React.useState(
    uncertain
      ? [
          { q: '200g', i: 'bucatini', flag: false },
          { q: '80g',  i: 'unsalted butter', flag: false },
          { q: '2 tbsp', i: 'white miso paste', flag: true },
          { q: '1 ?', i: 'lemon, zested', flag: true },
          { q: '30g', i: 'Parmesan', flag: false },
        ]
      : [
          { q: '200g', i: 'bucatini or spaghetti', flag: false },
          { q: '80g',  i: 'unsalted butter', flag: false },
          { q: '2 tbsp', i: 'white miso paste', flag: false },
          { q: '1', i: 'lemon, zested', flag: false },
          { q: '30g', i: 'Parmesan, finely grated', flag: false },
        ]
  );
  const flagged = ings.filter(x => x.flag).length + (uncertain ? 1 : 0);

  const setIng = (idx, key, v) => setIngs(a => a.map((x, j) => j !== idx ? x : { ...x, [key]: v, flag: false }));

  return (
    <>
      <SSTopBar title="Check the import" onBack={onBack}
        subtitle={flagged ? `${flagged} field${flagged > 1 ? 's' : ''} to confirm` : 'Everything parsed cleanly'}
        trailing={<SSBox compact onClick={onSwitchMode}>
          {uncertain ? 'Clean sample' : 'Messy sample'}
        </SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Source chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: '1px dashed var(--ss-rule)', marginBottom: 16,
          }}>
            <SSIcon name={uncertain ? 'camera' : 'link'} size={15} color="var(--ss-ink-mute)"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink)' }}>{src.label}</div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>{src.sub}</div>
            </div>
          </div>

          {/* Status banner */}
          <div style={{
            padding: '12px 14px', marginBottom: 20,
            border: `1px solid ${uncertain ? 'var(--ss-accent)' : 'var(--ss-accent-2)'}`,
            background: 'var(--ss-bg-deep)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <SSIcon name={uncertain ? 'warn' : 'check'} size={15}
              color={uncertain ? 'var(--ss-accent)' : 'var(--ss-accent-2)'}/>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 11, lineHeight: 1.55,
              color: 'var(--ss-ink-soft)', flex: 1,
            }}>
              {uncertain
                ? <>The handwriting was hard to read in places. Fields marked <b style={{ color: 'var(--ss-accent)' }}>check</b> are our best guess — confirm or correct them before saving.</>
                : <>Ingredients and method came through cleanly. Read it over anyway — sites sometimes bury steps in prose.</>}
            </div>
          </div>

          {/* Title / subtitle */}
          <SSField label="Title" value="Brown Butter Miso Pasta" mono={false} size={22} onChange={() => {}}/>
          <SSField label="Time" value={uncertain ? '' : '25 min'} placeholder="Not found — add it"
            flag={uncertain} onChange={() => {}}/>

          {/* Parsed ingredients */}
          <div style={{ marginTop: 10, marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 8,
            }}>
              <SSLabel>Ingredients found</SSLabel>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>
                {ings.length} lines
              </span>
            </div>
            {ings.map((it, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0',
                borderTop: i === 0 ? 'none' : '1px dotted var(--ss-rule)',
              }}>
                <input value={it.q} onChange={e => setIng(i, 'q', e.target.value)} style={{
                  width: 62, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '2px 0',
                  color: it.flag ? 'var(--ss-accent)' : 'var(--ss-ink-mute)',
                  borderBottom: it.flag ? '1px solid var(--ss-accent)' : '1px solid transparent',
                }}/>
                <input value={it.i} onChange={e => setIng(i, 'i', e.target.value)} style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--ss-mono)', fontSize: 12, padding: '2px 0',
                  color: 'var(--ss-ink)',
                  borderBottom: it.flag ? '1px solid var(--ss-accent)' : '1px solid transparent',
                }}/>
                {it.flag && (
                  <span style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 9, color: 'var(--ss-accent)',
                    border: '1px solid var(--ss-accent)', padding: '0 4px', borderRadius: 3, flexShrink: 0,
                  }}>check</span>
                )}
              </div>
            ))}
          </div>

          {/* Parsed steps */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10 }}>
              <SSLabel>Method found</SSLabel>
            </div>
            {[
              { t: 'Boil a large pot of water', ok: true },
              { t: 'Brown the butter', ok: true },
              { t: uncertain ? 'Whisk in miso and s—[illegible]' : 'Build the sauce', ok: !uncertain },
              { t: 'Combine', ok: true },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'baseline', padding: '8px 0',
                borderTop: i === 0 ? 'none' : '1px dotted var(--ss-rule)',
              }}>
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', width: 18, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  flex: 1, fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14,
                  color: s.ok ? 'var(--ss-ink)' : 'var(--ss-accent)',
                }}>{s.t}</span>
                {!s.ok && (
                  <span style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 9, color: 'var(--ss-accent)',
                    border: '1px solid var(--ss-accent)', padding: '0 4px', borderRadius: 3, flexShrink: 0,
                  }}>check</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </SSScroll>

      <div style={{
        padding: '12px 20px 20px', background: 'var(--ss-bg)',
        borderTop: '1px dashed var(--ss-rule)', display: 'flex', gap: 10,
      }}>
        <SSBox onClick={onBack} style={{ padding: '12px 14px' }}>Discard</SSBox>
        <button onClick={onAccept} style={{
          flex: 1, padding: '13px', border: '1px solid var(--ss-ink)',
          background: 'var(--ss-ink)', color: 'var(--ss-bg)', borderRadius: 8,
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
        }}>{uncertain ? 'Open in editor' : 'Looks right \u2014 continue'}</button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 5 · Publish sheet — shelves, visibility, tags. Visibility asked each time.
// ─────────────────────────────────────────────────────────────
function SSPublishScreen({ onBack, onDone }) {
  const [vis, setVis] = React.useState(null);
  const [shelves, setShelves] = React.useState({ weeknight: true });
  const [notify, setNotify] = React.useState(true);

  const visOptions = [
    { id: 'public',  title: 'Public',      sub: 'Anyone can find it. Appears in your followers\u2019 feeds.' },
    { id: 'friends', title: 'Followers',   sub: 'Only people who follow you.' },
    { id: 'private', title: 'Just me',     sub: 'Saved to your cookbook. Nobody else sees it.' },
  ];

  return (
    <>
      <SSTopBar title="Publish" onBack={onBack}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Summary card */}
          <div style={{ border: '1px solid var(--ss-ink)', padding: 14, marginBottom: 22 }}>
            <SSHeading level={3} style={{ fontSize: 18, marginBottom: 4 }}>Brown Butter Miso Pasta</SSHeading>
            <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
              25 min · serves 2 · Easy · 5 ingredients · 4 steps
            </div>
          </div>

          {/* Visibility — required, no default */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10,
            }}>
              <SSLabel>Who can see it</SSLabel>
              {!vis && (
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-accent)' }}>
                  required
                </span>
              )}
            </div>
            {visOptions.map((o, i) => {
              const on = vis === o.id;
              return (
                <div key={o.id} onClick={() => setVis(o.id)} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 0',
                  borderTop: i === 0 ? 'none' : '1px dotted var(--ss-rule)', cursor: 'pointer',
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    border: '1.2px solid var(--ss-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ss-ink)' }}/>}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--ss-mono)', fontSize: 13,
                      fontWeight: on ? 600 : 400, color: 'var(--ss-ink)', marginBottom: 1,
                    }}>{o.title}</div>
                    <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', lineHeight: 1.45 }}>
                      {o.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shelves */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10 }}>
              <SSLabel>Add to shelves</SSLabel>
            </div>
            {SS_SHELVES.map((s, i) => (
              <div key={s.id} onClick={() => setShelves(x => ({ ...x, [s.id]: !x[s.id] }))} style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0',
                borderTop: i === 0 ? 'none' : '1px dotted var(--ss-rule)', cursor: 'pointer',
              }}>
                <SSCheckbox checked={!!shelves[s.id]} size={13}/>
                <span style={{ flex: 1, fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>
                  {s.title}
                </span>
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>
                  {s.count}
                </span>
              </div>
            ))}
            <div style={{
              borderTop: '1px dotted var(--ss-rule)', paddingTop: 9, paddingLeft: 23,
              fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer',
            }}>+ new shelf</div>
          </div>

          {/* Notify */}
          <div onClick={() => setNotify(!notify)} style={{
            display: 'flex', gap: 10, alignItems: 'center', padding: '11px 0',
            borderTop: '1px dashed var(--ss-rule)', borderBottom: '1px dashed var(--ss-rule)',
            cursor: 'pointer',
          }}>
            <SSCheckbox checked={notify} size={13}/>
            <span style={{ flex: 1, fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)' }}>
              Tell my followers
            </span>
          </div>
        </div>
      </SSScroll>

      <div style={{
        padding: '12px 20px 20px', background: 'var(--ss-bg)',
        borderTop: '1px dashed var(--ss-rule)',
      }}>
        <button onClick={vis ? onDone : undefined} disabled={!vis} style={{
          width: '100%', padding: '13px',
          border: '1px solid var(--ss-ink)',
          background: vis ? 'var(--ss-ink)' : 'transparent',
          color: vis ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          borderRadius: 8, fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
          opacity: vis ? 1 : 0.5, cursor: vis ? 'pointer' : 'default',
        }}>{vis ? 'Publish to my cookbook' : 'Choose who can see it'}</button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · Drafts — unfinished recipes
// ─────────────────────────────────────────────────────────────
function SSDraftsScreen({ onBack, onOpen }) {
  return (
    <>
      <SSTopBar title="Drafts" onBack={onBack} subtitle={`${SS_DRAFTS.length} unfinished`}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {SS_DRAFTS.map((d, i) => (
            <div key={d.id} onClick={() => onOpen && onOpen(d)} style={{
              padding: '14px 0', cursor: 'pointer',
              borderTop: i === 0 ? '1px dashed var(--ss-rule)' : 'none',
              borderBottom: '1px dashed var(--ss-rule)',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <SSHeading level={4} style={{
                  fontSize: 16, flex: 1, minWidth: 0,
                  color: d.title === 'Untitled recipe' ? 'var(--ss-ink-mute)' : 'var(--ss-ink)',
                }}>{d.title}</SSHeading>
                <SSIcon name={d.source === 'photo' ? 'camera' : d.source === 'link' ? 'link' : 'pencil'}
                  size={12} color="var(--ss-ink-mute)"/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 2, background: 'var(--ss-rule-soft)' }}>
                  <div style={{ height: '100%', width: `${d.pct}%`, background: 'var(--ss-ink)' }}/>
                </div>
                <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', flexShrink: 0 }}>
                  {d.pct}% · {d.updated}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · Empty state — no recipes yet
// ─────────────────────────────────────────────────────────────
function SSEmptyCookbookScreen({ onStart }) {
  return (
    <>
      <SSTopBar variant="brand"/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Empty cookbook plate */}
          <div style={{
            border: '1px solid var(--ss-ink)', padding: '28px 22px', marginBottom: 20,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ss-ink-mute)', marginBottom: 14,
            }}>the cookbook of</div>
            <SSHeading level={1} style={{ fontSize: 26, marginBottom: 6 }}>You</SSHeading>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink-mute)',
              lineHeight: 1.6, marginBottom: 20,
            }}>
              Nothing in it yet.
            </div>
            {/* Ruled empty lines — a blank page */}
            <div style={{ marginBottom: 22 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  borderBottom: '1px dashed var(--ss-rule)',
                  height: 22, opacity: 1 - i * 0.18,
                }}/>
              ))}
            </div>
            <button onClick={onStart} style={{
              width: '100%', padding: '12px', border: '1px solid var(--ss-ink)',
              background: 'var(--ss-ink)', color: 'var(--ss-bg)', borderRadius: 8,
              fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
            }}>Add your first recipe</button>
          </div>

          {/* Three ways in */}
          <SSLabel style={{ marginBottom: 10 }}>Three ways to start</SSLabel>
          {[
            { n: '01', t: 'Paste a link', s: 'From any recipe site. We pull the fields, you confirm them.' },
            { n: '02', t: 'Photograph a card', s: 'A handwritten card, or a page from a book you own.' },
            { n: '03', t: 'Type it out', s: 'A blank page, if you already know it by heart.' },
          ].map((r, i) => (
            <div key={i} onClick={onStart} style={{
              display: 'flex', gap: 12, padding: '12px 0', cursor: 'pointer',
              borderTop: i === 0 ? '1px dashed var(--ss-rule)' : 'none',
              borderBottom: '1px dashed var(--ss-rule)',
            }}>
              <span style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
                width: 20, flexShrink: 0, paddingTop: 2,
              }}>{r.n}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 15,
                  color: 'var(--ss-ink)', marginBottom: 2,
                }}>{r.t}</div>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', lineHeight: 1.5,
                }}>{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, {
  SSImportReviewScreen, SSPublishScreen, SSDraftsScreen, SSEmptyCookbookScreen,
});
