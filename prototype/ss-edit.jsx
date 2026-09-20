// ss-edit.jsx — Owning a recipe: the action sheet, the editor, revisions, deletion.
// Editing is the same document you read, with the rules turned into fields.

// ─────────────────────────────────────────────────────────────
// Owner action sheet — what "…" opens on a recipe you wrote
// ─────────────────────────────────────────────────────────────
function SSOwnerSheet({ recipeId, privacy = 'Friends', onEdit, onRevisions, onPrivacy, onClose }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [confirm, setConfirm] = React.useState(false);
  const rows = [
    ['edit', 'Edit recipe', 'Title, ingredients, method, notes', onEdit],
    ['save', 'Revision history', 'Six edits since you published it', onRevisions],
    ['book', 'Change who can see it', `Currently: ${privacy}`, onPrivacy],
    ['link', 'Copy link', 'specialspoon.app/r/' + r.id, null],
    ['print', 'Print or save as PDF', 'One page, no screen furniture', null],
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(35,36,89,0.28)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--ss-bg)', borderTop: '1px solid var(--ss-ink)',
        padding: '16px 20px 24px', borderTopLeftRadius: 14, borderTopRightRadius: 14,
      }}>
        <div style={{
          fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
          fontSize: 19, color: 'var(--ss-ink)', marginBottom: 2,
        }}>{r.title}</div>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', marginBottom: 12,
        }}>Yours · published 14 Mar · edited 3 days ago</div>

        {rows.map(([icon, label, sub, fn]) => (
          <div key={label} onClick={fn || undefined} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderTop: '1px dashed var(--ss-rule)', cursor: fn ? 'pointer' : 'default',
          }}>
            <SSIcon name={icon} size={16} color="var(--ss-ink)"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-ink)' }}>{label}</div>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{sub}</div>
            </div>
            <SSIcon name="chevron" size={13} color="var(--ss-rule)"/>
          </div>
        ))}

        {/* Deletion, gated behind a second tap and an honest sentence */}
        <div style={{ borderTop: '1px dashed var(--ss-rule)', paddingTop: 12, marginTop: 4 }}>
          {!confirm ? (
            <div onClick={() => setConfirm(true)} style={{
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <SSIcon name="trash" size={16} color="var(--ss-accent)"/>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 12.5, color: 'var(--ss-accent)' }}>Delete recipe</span>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--ss-accent)', padding: '12px' }}>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11.5, lineHeight: 1.55,
                color: 'var(--ss-ink)', marginBottom: 10,
              }}>Delete “{r.title}”? The {r.comments?.length || 0} notes on it go too. The 41 people who saved it will lose it.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} style={{
                  flex: 1, padding: '9px', border: '1px solid var(--ss-ink)', background: 'transparent',
                  color: 'var(--ss-ink)', borderRadius: 6, fontFamily: 'var(--ss-mono)', fontSize: 12,
                }}>Keep it</button>
                <button onClick={onClose} style={{
                  flex: 1, padding: '9px', border: '1px solid var(--ss-accent)', background: 'var(--ss-accent)',
                  color: 'var(--ss-bg)', borderRadius: 6, fontFamily: 'var(--ss-mono)', fontSize: 12,
                }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit screen — the recipe as fields. Save is only live when dirty.
// ─────────────────────────────────────────────────────────────
function SSEditRecipeScreen({ recipeId = 'sourdough-focaccia', onClose, onSave, onRevisions }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [title, setTitle] = React.useState(r.title);
  const [subtitle, setSubtitle] = React.useState(r.subtitle || '');
  const [intro, setIntro] = React.useState(r.intro || '');
  const [meta, setMeta] = React.useState({ time: r.time, serves: String(r.serves), level: r.difficulty });
  const [sections, setSections] = React.useState(() => JSON.parse(JSON.stringify(r.ingredients || [])));
  const [steps, setSteps] = React.useState(() => JSON.parse(JSON.stringify(r.steps || [])));
  const [tags, setTags] = React.useState(r.tags || []);
  const [dirty, setDirty] = React.useState(false);
  const touch = (fn) => (...a) => { setDirty(true); fn(...a); };

  const setItem = touch((si, ii, key, v) => setSections(ss => ss.map((sec, i) =>
    i !== si ? sec : { ...sec, items: sec.items.map((it, j) => j !== ii ? it : { ...it, [key]: v }) })));
  const delItem = touch((si, ii) => setSections(ss => ss.map((sec, i) =>
    i !== si ? sec : { ...sec, items: sec.items.filter((_, j) => j !== ii) })));
  const addItem = touch((si) => setSections(ss => ss.map((sec, i) =>
    i !== si ? sec : { ...sec, items: [...sec.items, { q: '', i: '' }] })));
  const setStep = touch((i, key, v) => setSteps(st => st.map((s, j) => j !== i ? s : { ...s, [key]: v })));
  const delStep = touch((i) => setSteps(st => st.filter((_, j) => j !== i)));
  const addStep = touch(() => setSteps(st => [...st, { t: '', d: '', timer: '' }]));

  return (
    <>
      <SSTopBar title="Edit recipe" onBack={onClose}
        subtitle={dirty ? 'Unsaved changes' : 'Published 14 Mar'}
        trailing={<button onClick={onSave} disabled={!dirty} style={{
          border: '1px solid var(--ss-ink)', borderRadius: 6, padding: '5px 12px',
          background: dirty ? 'var(--ss-ink)' : 'transparent',
          color: dirty ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          fontFamily: 'var(--ss-mono)', fontSize: 11.5, opacity: dirty ? 1 : 0.5,
        }}>Save</button>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* What changes for readers */}
          <div style={{
            border: '1px dashed var(--ss-rule)', padding: '9px 11px', marginBottom: 16,
            display: 'flex', gap: 9, alignItems: 'flex-start',
          }}>
            <SSIcon name="warn" size={14} color="var(--ss-ink-mute)"/>
            <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10.5, lineHeight: 1.5, color: 'var(--ss-ink-mute)' }}>
              41 people have this saved. Edits show up in their copy, and the old version stays in <span
                onClick={onRevisions} style={{
                  color: 'var(--ss-ink)', textDecoration: 'underline', textDecorationStyle: 'dashed',
                  textUnderlineOffset: 3, cursor: 'pointer',
                }}>revision history</span>.
            </div>
          </div>

          <SSField label="Title" value={title} onChange={touch(setTitle)} mono={false} size={22}/>
          <SSField label="One-line description" value={subtitle} onChange={touch(setSubtitle)}/>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 6 }}>
            <SSField label="Time" value={meta.time} onChange={touch(v => setMeta(m => ({ ...m, time: v })))} size={12}/>
            <SSField label="Serves" value={meta.serves} onChange={touch(v => setMeta(m => ({ ...m, serves: v })))} size={12}/>
            <div style={{ marginBottom: 14 }}>
              <SSLabel style={{ fontSize: 9, marginBottom: 2 }}>Level</SSLabel>
              <div style={{ display: 'flex', gap: 4, paddingTop: 5 }}>
                {['Easy', 'Medium', 'Hard'].map(l => (
                  <span key={l} onClick={touch(() => setMeta(m => ({ ...m, level: l })))} style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 10, padding: '2px 5px',
                    border: '1px solid var(--ss-ink)', cursor: 'pointer',
                    background: meta.level === l ? 'var(--ss-ink)' : 'transparent',
                    color: meta.level === l ? 'var(--ss-bg)' : 'var(--ss-ink)',
                  }}>{l[0]}</span>
                ))}
              </div>
              <div style={{ borderBottom: '1px dashed var(--ss-rule)', marginTop: 5 }}/>
            </div>
          </div>

          <SSField label="Intro" value={intro} onChange={touch(setIntro)} multiline rows={4}/>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <SSLabel style={{ marginBottom: 8 }}>Tags</SSLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.map(t => (
                <SSTag key={t} onRemove={touch(() => setTags(ts => ts.filter(x => x !== t)))}>{t}</SSTag>
              ))}
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer' }}>+ tag</span>
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10 }}>
              <SSLabel>Ingredients</SSLabel>
            </div>
            {sections.map((sec, si) => (
              <div key={si} style={{ marginBottom: 14 }}>
                <input value={sec.section || ''}
                    onChange={touch(e => setSections(ss => ss.map((x, i) => i !== si ? x : { ...x, section: e.target.value })))}
                    placeholder="Section name (optional)"
                    style={{
                      width: '100%', border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'var(--ss-mono)', fontSize: 10, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--ss-ink-mute)', marginBottom: 6, padding: 0,
                    }}/>
                {sec.items.map((it, ii) => (
                  <div key={ii} style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                    borderTop: '1px dotted var(--ss-rule)', padding: '5px 0',
                  }}>
                    <SSIcon name="drag" size={12} color="var(--ss-rule)"/>
                    <input value={it.q} onChange={e => setItem(si, ii, 'q', e.target.value)} style={{
                      width: 62, border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', padding: 0,
                    }}/>
                    <input value={it.i} onChange={e => setItem(si, ii, 'i', e.target.value)} style={{
                      flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)', padding: 0,
                    }}/>
                    <span onClick={() => delItem(si, ii)} style={{
                      fontFamily: 'var(--ss-mono)', fontSize: 13, color: 'var(--ss-ink-mute)', cursor: 'pointer', padding: '0 2px',
                    }}>×</span>
                  </div>
                ))}
                <div onClick={() => addItem(si)} style={{
                  borderTop: '1px dotted var(--ss-rule)', padding: '6px 0 0', paddingLeft: 20,
                  fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer',
                }}>+ ingredient</div>
              </div>
            ))}
          </div>

          {/* Method */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10 }}>
              <SSLabel>Method</SSLabel>
            </div>
            {steps.map((st, i) => (
              <div key={i} style={{
                borderTop: i === 0 ? 'none' : '1px dashed var(--ss-rule)',
                paddingTop: i === 0 ? 0 : 12, marginBottom: 12,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', width: 20, flexShrink: 0,
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input value={st.t} onChange={e => setStep(i, 't', e.target.value)} style={{
                      width: '100%', border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 16,
                      color: 'var(--ss-ink)', padding: '0 0 4px',
                    }}/>
                    <textarea value={st.d} rows={2} onChange={e => setStep(i, 'd', e.target.value)} style={{
                      width: '100%', border: 'none', background: 'transparent', outline: 'none', resize: 'none',
                      fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
                      color: 'var(--ss-ink-mute)', padding: 0,
                    }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>Timer</span>
                      <input value={st.timer || ''} onChange={e => setStep(i, 'timer', e.target.value)}
                        placeholder="—" style={{
                          width: 36, border: '1px solid var(--ss-rule)', background: 'transparent', outline: 'none',
                          fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink)', padding: '1px 4px',
                        }}/>
                      <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>min</span>
                      <span style={{ flex: 1 }}/>
                      <span onClick={() => delStep(i)} style={{
                        fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', cursor: 'pointer',
                      }}>Remove step</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div onClick={addStep} style={{
              borderTop: '1px dashed var(--ss-rule)', paddingTop: 10,
              fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer',
            }}>+ step</div>
          </div>
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Revision history — a ledger of edits, each restorable
// ─────────────────────────────────────────────────────────────
const SS_REVISIONS = [
  { at: '3 days ago',  by: 'you', summary: 'Method — rewrote step 4, added the overnight fridge option', diff: '+42 −18' },
  { at: '2 weeks ago', by: 'you', summary: 'Ingredients — 500g flour → 450g flour', diff: '+1 −1' },
  { at: '6 Apr',       by: 'you', summary: 'Intro — added the bit about the tin', diff: '+64 −0' },
  { at: '2 Apr',       by: 'you', summary: 'Title — “Focaccia” → “Lazy Sourdough Focaccia”', diff: '+3 −1' },
  { at: '28 Mar',      by: 'you', summary: 'Timings — bake 22 min → 25 min', diff: '+1 −1' },
  { at: '14 Mar',      by: 'you', summary: 'Published', diff: 'first version', first: true },
];

function SSRevisionsScreen({ recipeId = 'sourdough-focaccia', onBack }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [open, setOpen] = React.useState(null);
  return (
    <>
      <SSTopBar title="Revision history" onBack={onBack} subtitle={r.title}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11, lineHeight: 1.55,
            color: 'var(--ss-ink-mute)', marginBottom: 14,
          }}>Every save keeps the version before it. Nothing you write here is ever lost.</div>
          {SS_REVISIONS.map((rev, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
              borderTop: '1px dashed var(--ss-rule)', padding: '12px 0', cursor: 'pointer',
              display: 'flex', gap: 12,
            }}>
              <div style={{
                width: 8, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  border: '1px solid var(--ss-ink)',
                  background: i === 0 ? 'var(--ss-ink)' : 'transparent',
                }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ss-ink)',
                  }}>{rev.at}</span>
                  {i === 0 && <span style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                    border: '1px solid var(--ss-ink)', padding: '1px 4px', color: 'var(--ss-ink)',
                  }}>current</span>}
                  <span style={{ flex: 1 }}/>
                  <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>{rev.diff}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11.5, lineHeight: 1.5, color: 'var(--ss-ink-mute)',
                }}>{rev.summary}</div>
                {open === i && !rev.first && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                    <SSBox compact>View this version</SSBox>
                    {i !== 0 && <SSBox compact>Restore</SSBox>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, { SSOwnerSheet, SSEditRecipeScreen, SS_REVISIONS, SSRevisionsScreen });
