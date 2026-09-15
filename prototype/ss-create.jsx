// ss-create.jsx — Add-a-recipe flow.
// Entry picker (link-first) · long-page composer · opt-in wizard.
// Visual language: indigo on cream, dashed rules, mono body, serif display.

const SS_DRAFTS = [
  { id: 'd1', title: 'Charred Cabbage, Anchovy Butter', updated: '2h ago', pct: 60, source: 'manual' },
  { id: 'd2', title: 'Untitled recipe', updated: 'yesterday', pct: 15, source: 'photo' },
  { id: 'd3', title: 'Sticky Ginger Chicken', updated: '4 days ago', pct: 85, source: 'link' },
];

// ─────────────────────────────────────────────────────────────
// Field primitives — real inputs, styled to the system
// ─────────────────────────────────────────────────────────────
function SSField({ label, value, onChange, placeholder, mono = true, size = 13, multiline, rows = 3, hint, flag }) {
  const common = {
    width: '100%', border: 'none', background: 'transparent',
    outline: 'none', padding: '6px 0',
    fontFamily: mono ? 'var(--ss-mono)' : 'var(--ss-display)',
    fontSize: size, lineHeight: 1.5, color: 'var(--ss-ink)',
    resize: 'none', display: 'block',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
        <SSLabel style={{ fontSize: 9 }}>{label}</SSLabel>
        {flag && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontFamily: 'var(--ss-mono)', fontSize: 9, color: 'var(--ss-accent)',
            border: '1px solid var(--ss-accent)', padding: '0 4px', borderRadius: 3,
          }}>
            <SSIcon name="warn" size={9} color="var(--ss-accent)"/> check
          </span>
        )}
      </div>
      {multiline ? (
        <textarea rows={rows} value={value} placeholder={placeholder}
          onChange={e => onChange && onChange(e.target.value)} style={common}/>
      ) : (
        <input value={value} placeholder={placeholder}
          onChange={e => onChange && onChange(e.target.value)} style={common}/>
      )}
      <div style={{ borderBottom: `1px ${flag ? 'solid var(--ss-accent)' : 'dashed var(--ss-rule)'}` }}/>
      {hint && (
        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · Entry — paste a link first, other ways beneath
// ─────────────────────────────────────────────────────────────
function SSNewEntryScreen({ onClose, onCompose, onImportLink, onPhoto, onDrafts }) {
  const [url, setUrl] = React.useState('');
  return (
    <>
      <SSTopBar title="New recipe" onBack={onClose}
        trailing={<SSBox compact onClick={onDrafts}>Drafts · {SS_DRAFTS.length}</SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Primary: paste a link */}
          <div style={{ border: '1px solid var(--ss-ink)', padding: 16, marginBottom: 18 }}>
            <SSLabel style={{ marginBottom: 8 }}>Import from a link</SSLabel>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 8, marginBottom: 12,
            }}>
              <SSIcon name="link" size={14} color="var(--ss-ink-mute)"/>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Paste a recipe URL…"
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)',
                }}/>
            </div>
            <button
              onClick={() => onImportLink && onImportLink(url)}
              style={{
                width: '100%', padding: '11px', border: '1px solid var(--ss-ink)',
                background: 'var(--ss-ink)', color: 'var(--ss-bg)', borderRadius: 8,
                fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
              }}>Fetch recipe</button>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)',
              marginTop: 8, lineHeight: 1.5,
            }}>
              We pull the ingredients and method, then you confirm every field before it saves.
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>or</span>
            <div style={{ flex: 1, borderTop: '1px dashed var(--ss-rule)' }}/>
          </div>

          {/* Secondary routes */}
          {[
            { icon: 'pencil', title: 'Type it out', sub: 'Blank page. Your words, your measurements.', fn: onCompose },
            { icon: 'camera', title: 'Photograph a card', sub: 'Handwritten card or a page from a book.', fn: onPhoto },
            { icon: 'fork',   title: 'Fork a recipe',     sub: 'Start from someone else\u2019s and change it.', fn: onCompose },
          ].map((row, i) => (
            <div key={i} onClick={row.fn} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 0', cursor: 'pointer',
              borderTop: i === 0 ? '1px dashed var(--ss-rule)' : 'none',
              borderBottom: '1px dashed var(--ss-rule)',
            }}>
              <div style={{
                width: 34, height: 34, border: '1px solid var(--ss-ink)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <SSIcon name={row.icon} size={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SSHeading level={4} style={{ fontSize: 15, marginBottom: 1 }}>{row.title}</SSHeading>
                <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                  {row.sub}
                </div>
              </div>
              <SSIcon name="chevron" size={15} color="var(--ss-ink-mute)"/>
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · Composer — long page (default). Guide-me toggle opts into wizard.
// ─────────────────────────────────────────────────────────────
function SSComposerScreen({ onClose, onPublish, onGuideMe, seed }) {
  const s = seed || {};
  const [title, setTitle] = React.useState(s.title || '');
  const [subtitle, setSubtitle] = React.useState(s.subtitle || '');
  const [intro, setIntro] = React.useState(s.intro || '');
  const [meta, setMeta] = React.useState({ time: s.time || '', serves: s.serves || '', level: s.difficulty || 'Easy' });
  const [sections, setSections] = React.useState(s.ingredients || [{ section: '', items: [{ q: '', i: '' }] }]);
  const [steps, setSteps] = React.useState(s.steps || [{ t: '', d: '', timer: '' }]);
  const [notes, setNotes] = React.useState((s.notes || []).map(n => n.text).join('\n'));
  const [tags, setTags] = React.useState(s.tags || []);

  const setItem = (si, ii, key, v) => setSections(ss => ss.map((sec, i) =>
    i !== si ? sec : { ...sec, items: sec.items.map((it, j) => j !== ii ? it : { ...it, [key]: v }) }));
  const addItem = (si) => setSections(ss => ss.map((sec, i) =>
    i !== si ? sec : { ...sec, items: [...sec.items, { q: '', i: '' }] }));
  const addSection = () => setSections(ss => [...ss, { section: '', items: [{ q: '', i: '' }] }]);
  const setStep = (i, key, v) => setSteps(st => st.map((s2, j) => j !== i ? s2 : { ...s2, [key]: v }));
  const addStep = () => setSteps(st => [...st, { t: '', d: '', timer: '' }]);

  const filled = [title, sections[0]?.items[0]?.i, steps[0]?.t].filter(Boolean).length;
  const pct = Math.round((filled / 3) * 100);

  return (
    <>
      <SSTopBar title="Write it out" onBack={onClose}
        subtitle={`${pct}% \u00b7 draft saved`}
        trailing={<SSBox compact onClick={onGuideMe}>
          <SSIcon name="wand" size={12}/> Guide me
        </SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Progress hairline */}
          <div style={{ height: 2, background: 'var(--ss-rule-soft)', marginBottom: 18 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ss-ink)', transition: 'width .25s' }}/>
          </div>

          <SSField label="Title" value={title} onChange={setTitle}
            placeholder="Brown Butter Miso Pasta" mono={false} size={24}/>
          <SSField label="One-line description" value={subtitle} onChange={setSubtitle}
            placeholder="A 20-minute dinner that tastes like a two-hour one."/>

          {/* Meta trio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 6 }}>
            <SSField label="Time" value={meta.time} onChange={v => setMeta(m => ({ ...m, time: v }))} placeholder="25 min" size={12}/>
            <SSField label="Serves" value={meta.serves} onChange={v => setMeta(m => ({ ...m, serves: v }))} placeholder="2" size={12}/>
            <div style={{ marginBottom: 14 }}>
              <SSLabel style={{ fontSize: 9, marginBottom: 2 }}>Level</SSLabel>
              <div style={{ display: 'flex', gap: 4, paddingTop: 5 }}>
                {['Easy', 'Medium', 'Hard'].map(l => (
                  <span key={l} onClick={() => setMeta(m => ({ ...m, level: l }))} style={{
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

          <SSField label="Intro — the story" value={intro} onChange={setIntro} multiline rows={4}
            placeholder="Where it came from, what to watch for, why you make it."
            hint="Optional. This is what makes it yours rather than a spec sheet."/>

          {/* Ingredients editor */}
          <div style={{ marginTop: 22, marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10,
            }}>
              <SSLabel>Ingredients</SSLabel>
              <span onClick={addSection} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', cursor: 'pointer',
              }}>+ section</span>
            </div>
            {sections.map((sec, si) => (
              <div key={si} style={{ marginBottom: 14 }}>
                <input
                  value={sec.section}
                  onChange={e => setSections(ss => ss.map((x, i) => i !== si ? x : { ...x, section: e.target.value }))}
                  placeholder={si === 0 ? 'Section name (optional)' : 'Section name'}
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
                    <input value={it.q} onChange={e => setItem(si, ii, 'q', e.target.value)}
                      placeholder="200g" style={{
                        width: 62, border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', padding: 0,
                      }}/>
                    <input value={it.i} onChange={e => setItem(si, ii, 'i', e.target.value)}
                      placeholder="bucatini" style={{
                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)', padding: 0,
                      }}/>
                  </div>
                ))}
                <div onClick={() => addItem(si)} style={{
                  borderTop: '1px dotted var(--ss-rule)', padding: '6px 0 0', paddingLeft: 20,
                  fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer',
                }}>+ ingredient</div>
              </div>
            ))}
          </div>

          {/* Steps editor */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              borderBottom: '1px dashed var(--ss-rule)', paddingBottom: 6, marginBottom: 10,
            }}>
              <SSLabel>Method</SSLabel>
            </div>
            {steps.map((st, i) => (
              <div key={i} style={{
                borderTop: i === 0 ? 'none' : '1px dashed var(--ss-rule)', paddingTop: i === 0 ? 0 : 12, marginBottom: 12,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
                    width: 20, flexShrink: 0,
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input value={st.t} onChange={e => setStep(i, 't', e.target.value)}
                      placeholder="Brown the butter" style={{
                        width: '100%', border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 16,
                        color: 'var(--ss-ink)', padding: '0 0 4px',
                      }}/>
                    <textarea value={st.d} rows={2} onChange={e => setStep(i, 'd', e.target.value)}
                      placeholder="What to do, and what it should look like when it’s right."
                      style={{
                        width: '100%', border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55,
                        color: 'var(--ss-ink-mute)', resize: 'none', padding: 0, display: 'block',
                      }}/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <SSIcon name="timer" size={11} color="var(--ss-ink-mute)"/>
                      <input value={st.timer} onChange={e => setStep(i, 'timer', e.target.value)}
                        placeholder="timer (min)" style={{
                          width: 90, border: 'none', background: 'transparent', outline: 'none',
                          fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', padding: 0,
                        }}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div onClick={addStep} style={{
              borderTop: '1px dashed var(--ss-rule)', paddingTop: 8,
              fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
              cursor: 'pointer', paddingLeft: 30,
            }}>+ step</div>
          </div>

          <SSField label="Your notes" value={notes} onChange={setNotes} multiline rows={2}
            placeholder="Substitutions, warnings, the thing you always forget."/>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <SSLabel style={{ fontSize: 9, marginBottom: 6 }}>Tags</SSLabel>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.map(t => (
                <SSTag key={t} onRemove={() => setTags(x => x.filter(y => y !== t))}>{t}</SSTag>
              ))}
              {['pasta', 'weeknight', 'umami', 'vegetarian'].filter(t => !tags.includes(t)).slice(0, 3).map(t => (
                <span key={t} onClick={() => setTags(x => [...x, t])} style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '3px 8px',
                  border: '1px dashed var(--ss-rule)', color: 'var(--ss-ink-mute)',
                  borderRadius: 4, cursor: 'pointer',
                }}>+ {t}</span>
              ))}
            </div>
          </div>
        </div>
      </SSScroll>

      {/* Sticky footer */}
      <div style={{
        padding: '12px 20px 20px', background: 'var(--ss-bg)',
        borderTop: '1px dashed var(--ss-rule)', display: 'flex', gap: 10,
      }}>
        <SSBox onClick={onClose} style={{ padding: '12px 14px' }}>
          <SSIcon name="save" size={14}/>
        </SSBox>
        <button onClick={onPublish} style={{
          flex: 1, padding: '13px', border: '1px solid var(--ss-ink)',
          background: 'var(--ss-ink)', color: 'var(--ss-bg)', borderRadius: 8,
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
        }}>Continue to publish</button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · Wizard — opt-in "guide me" mode. Same fields, one at a time.
// ─────────────────────────────────────────────────────────────
function SSWizardScreen({ onClose, onPublish, onLongPage }) {
  const [i, setI] = React.useState(0);
  const [vals, setVals] = React.useState({});
  const set = (k, v) => setVals(x => ({ ...x, [k]: v }));

  const stepsDef = [
    { k: 'title',  label: 'What is it called?', hint: 'The name you\u2019d use telling a friend.', ph: 'Brown Butter Miso Pasta', display: true },
    { k: 'subtitle', label: 'Sum it up in one line.', hint: 'This shows under the title in the feed.', ph: 'A 20-minute dinner that tastes like a two-hour one.' },
    { k: 'meta',   label: 'How long, how many?', hint: 'Rough is fine \u2014 you can change it later.' },
    { k: 'ingredients', label: 'What goes in?', hint: 'One per line. Quantity first.', ph: '200g bucatini\n80g unsalted butter\n2 tbsp white miso', multiline: true, rows: 6 },
    { k: 'steps',  label: 'How is it made?', hint: 'One step per line. We\u2019ll number them.', ph: 'Boil a large pot of salted water\nBrown the butter until nutty\nWhisk in miso and a ladle of pasta water', multiline: true, rows: 6 },
    { k: 'intro',  label: 'Anything to say about it?', hint: 'Optional \u2014 skip if you\u2019d rather not.', ph: 'Where it came from, what to watch for.', multiline: true, rows: 4 },
  ];
  const cur = stepsDef[i];
  const last = i === stepsDef.length - 1;

  return (
    <>
      <SSTopBar title="Guide me" onBack={i === 0 ? onClose : () => setI(i - 1)}
        subtitle={`Step ${i + 1} of ${stepsDef.length}`}
        trailing={<SSBox compact onClick={onLongPage}>Long page</SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px' }}>
          {/* Segmented progress */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 28 }}>
            {stepsDef.map((_, j) => (
              <div key={j} style={{
                flex: 1, height: 2,
                background: j <= i ? 'var(--ss-ink)' : 'var(--ss-rule-soft)',
              }}/>
            ))}
          </div>

          <SSHeading level={1} style={{ fontSize: 28, lineHeight: 1.08, marginBottom: 8, textWrap: 'balance' }}>
            {cur.label}
          </SSHeading>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink-mute)',
            lineHeight: 1.55, marginBottom: 26,
          }}>{cur.hint}</div>

          {cur.k === 'meta' ? (
            <div>
              <SSField label="Time" value={vals.time || ''} onChange={v => set('time', v)} placeholder="25 min"/>
              <SSField label="Serves" value={vals.serves || ''} onChange={v => set('serves', v)} placeholder="2"/>
              <div>
                <SSLabel style={{ fontSize: 9, marginBottom: 6 }}>Level</SSLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Easy', 'Medium', 'Hard'].map(l => (
                    <span key={l} onClick={() => set('level', l)} style={{
                      fontFamily: 'var(--ss-mono)', fontSize: 12, padding: '7px 14px',
                      border: '1px solid var(--ss-ink)', cursor: 'pointer',
                      background: vals.level === l ? 'var(--ss-ink)' : 'transparent',
                      color: vals.level === l ? 'var(--ss-bg)' : 'var(--ss-ink)',
                    }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : cur.multiline ? (
            <div>
              <textarea rows={cur.rows} value={vals[cur.k] || ''} placeholder={cur.ph}
                onChange={e => set(cur.k, e.target.value)}
                style={{
                  width: '100%', border: '1px solid var(--ss-ink)', background: 'var(--ss-surface)',
                  outline: 'none', padding: 12, borderRadius: 6,
                  fontFamily: 'var(--ss-mono)', fontSize: 13, lineHeight: 1.7,
                  color: 'var(--ss-ink)', resize: 'none', display: 'block',
                }}/>
            </div>
          ) : (
            <div>
              <input value={vals[cur.k] || ''} placeholder={cur.ph}
                onChange={e => set(cur.k, e.target.value)}
                style={{
                  width: '100%', border: 'none', borderBottom: '1px solid var(--ss-ink)',
                  background: 'transparent', outline: 'none', padding: '8px 0',
                  fontFamily: cur.display ? 'var(--ss-display)' : 'var(--ss-mono)',
                  fontWeight: cur.display ? 700 : 400,
                  fontSize: cur.display ? 26 : 14, lineHeight: 1.3,
                  color: 'var(--ss-ink)',
                }}/>
            </div>
          )}
        </div>
      </SSScroll>

      <div style={{
        padding: '12px 20px 20px', background: 'var(--ss-bg)',
        borderTop: '1px dashed var(--ss-rule)', display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <span onClick={() => last ? onPublish() : setI(i + 1)} style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
          cursor: 'pointer', padding: '12px 4px',
        }}>Skip</span>
        <button onClick={() => last ? onPublish() : setI(i + 1)} style={{
          flex: 1, padding: '13px', border: '1px solid var(--ss-ink)',
          background: 'var(--ss-ink)', color: 'var(--ss-bg)', borderRadius: 8,
          fontFamily: 'var(--ss-mono)', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {last ? 'Review and publish' : 'Next'}
          <SSIcon name="chevron" size={15} weight={2} color="var(--ss-bg)"/>
        </button>
      </div>
    </>
  );
}

Object.assign(window, { SS_DRAFTS, SSField, SSNewEntryScreen, SSComposerScreen, SSWizardScreen });
