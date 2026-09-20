// ss-settings.jsx — Settings, profile editing, account. Plain rows, honest labels.

function SSSettingRow({ label, value, onClick, danger, last }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
      borderTop: '1px dashed var(--ss-rule)',
      borderBottom: last ? '1px dashed var(--ss-rule)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{
        flex: 1, fontFamily: 'var(--ss-mono)', fontSize: 12.5,
        color: danger ? 'var(--ss-accent)' : 'var(--ss-ink)',
      }}>{label}</span>
      {value && <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11.5, color: 'var(--ss-ink-mute)' }}>{value}</span>}
      {onClick && !danger && <SSIcon name="chevron" size={13} color="var(--ss-rule)"/>}
    </div>
  );
}

function SSSettingsScreen({ onBack, onProfile, onAccount, onNotifications, onSignOut }) {
  const [units, setUnits] = React.useState('Metric');
  const [privacy, setPrivacy] = React.useState('Ask each time');
  const sections = [
    ['You', [
      ['Edit profile', 'You · @you', onProfile],
      ['Account and password', 'hello@…', onAccount],
      ['Who can follow you', 'Anyone', null],
    ]],
    ['Cooking', [
      ['Units', units, () => setUnits(u => u === 'Metric' ? 'Imperial' : 'Metric')],
      ['Keep screen awake while cooking', 'On', null],
      ['Default servings', 'As written', null],
    ]],
    ['Publishing', [
      ['Default privacy for new recipes', privacy,
        () => setPrivacy(p => p === 'Ask each time' ? 'Only me' : p === 'Only me' ? 'Followers' : 'Ask each time')],
      ['Notifications', 'Notes, follows', onNotifications],
    ]],
    ['About', [
      ['Terms', '', null],
      ['Privacy policy', '', null],
      ['Report a problem', '', null],
      ['Version', '1.0 (24)', null],
    ]],
  ];
  return (
    <>
      <SSTopBar title="Settings" onBack={onBack}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {sections.map(([title, rows]) => (
            <div key={title} style={{ marginBottom: 22 }}>
              <SSLabel style={{ fontSize: 9, letterSpacing: '0.12em', marginBottom: 2 }}>{title}</SSLabel>
              {rows.map(([l, v, fn], i) => (
                <SSSettingRow key={l} label={l} value={v} onClick={fn} last={i === rows.length - 1}/>
              ))}
            </div>
          ))}
          <div style={{ marginBottom: 22 }}>
            <SSSettingRow label="Sign out" onClick={onSignOut}/>
            <SSSettingRow label="Delete account" danger onClick={onAccount} last/>
          </div>
          <div style={{
            fontFamily: 'var(--ss-mono)', fontSize: 10.5, lineHeight: 1.55,
            color: 'var(--ss-ink-mute)', textAlign: 'center',
          }}>Special Spoon · made for people who cook the same eight things</div>
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit profile
// ─────────────────────────────────────────────────────────────
function SSEditProfileScreen({ onBack, onSave }) {
  const me = byHandle('you');
  const [name, setName] = React.useState(me.name);
  const [handle, setHandle] = React.useState(me.handle);
  const [bio, setBio] = React.useState(me.bio);
  const [link, setLink] = React.useState('');
  const [dirty, setDirty] = React.useState(false);
  const t = (fn) => (v) => { setDirty(true); fn(v); };
  return (
    <>
      <SSTopBar title="Edit profile" onBack={onBack}
        trailing={<button onClick={onSave} disabled={!dirty} style={{
          border: '1px solid var(--ss-ink)', borderRadius: 6, padding: '5px 12px',
          background: dirty ? 'var(--ss-ink)' : 'transparent',
          color: dirty ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
          fontFamily: 'var(--ss-mono)', fontSize: 11.5, opacity: dirty ? 1 : 0.5,
        }}>Save</button>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <SSAvatar name={name || 'Y'} size={58}/>
            <div>
              <SSBox compact>Change monogram</SSBox>
              <div style={{
                fontFamily: 'var(--ss-mono)', fontSize: 10.5, color: 'var(--ss-ink-mute)', marginTop: 6,
              }}>No photographs anywhere in Special Spoon — including here.</div>
            </div>
          </div>
          <SSField label="Name" value={name} onChange={t(setName)} mono={false} size={20}/>
          <SSField label="Handle" value={handle} onChange={t(setHandle)} hint="specialspoon.app/@you"/>
          <SSField label="Bio" value={bio} onChange={t(setBio)} multiline rows={3}
            hint="One or two lines. What you cook, where you cook it."/>
          <SSField label="Link" value={link} onChange={t(setLink)} placeholder="Optional"/>
        </div>
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Account — email, password, data, deletion
// ─────────────────────────────────────────────────────────────
function SSAccountScreen({ onBack }) {
  const [confirm, setConfirm] = React.useState(false);
  const [typed, setTyped] = React.useState('');
  return (
    <>
      <SSTopBar title="Account" onBack={onBack}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{ marginBottom: 22 }}>
            <SSLabel style={{ fontSize: 9, letterSpacing: '0.12em', marginBottom: 2 }}>Sign in</SSLabel>
            <SSSettingRow label="Email" value="hello@example.com" onClick={() => {}}/>
            <SSSettingRow label="Password" value="Last changed 6 Mar" onClick={() => {}}/>
            <SSSettingRow label="Connected accounts" value="Apple" onClick={() => {}} last/>
          </div>

          <div style={{ marginBottom: 22 }}>
            <SSLabel style={{ fontSize: 9, letterSpacing: '0.12em', marginBottom: 2 }}>Your writing</SSLabel>
            <SSSettingRow label="Export everything" value="34 recipes, .json" onClick={() => {}}/>
            <SSSettingRow label="Print your cookbook" value="PDF" onClick={() => {}} last/>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 10.5, lineHeight: 1.55,
              color: 'var(--ss-ink-mute)', marginTop: 8,
            }}>Your recipes are yours. Export is plain text with the photos you added — no account needed to read it.</div>
          </div>

          <div style={{ border: '1px solid var(--ss-accent)', padding: 14 }}>
            <div style={{
              fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 15,
              color: 'var(--ss-accent)', marginBottom: 6,
            }}>Delete your account</div>
            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 11.5, lineHeight: 1.55,
              color: 'var(--ss-ink)', marginBottom: 12,
            }}>Deletes 34 recipes, 4 shelves, and every note you’ve written. People who saved your recipes lose them. This can’t be undone — export first if you want a copy.</div>
            {!confirm ? (
              <SSBox compact color="var(--ss-accent)" onClick={() => setConfirm(true)}>Delete account</SSBox>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', marginBottom: 6,
                }}>Type DELETE to confirm</div>
                <input value={typed} onChange={e => setTyped(e.target.value)} style={{
                  width: '100%', border: '1px solid var(--ss-ink)', borderRadius: 6, padding: '8px 10px',
                  background: 'var(--ss-surface)', outline: 'none', marginBottom: 10,
                  fontFamily: 'var(--ss-mono)', fontSize: 12, color: 'var(--ss-ink)',
                }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setConfirm(false); setTyped(''); }} style={{
                    flex: 1, padding: '9px', border: '1px solid var(--ss-ink)', background: 'transparent',
                    color: 'var(--ss-ink)', borderRadius: 6, fontFamily: 'var(--ss-mono)', fontSize: 12,
                  }}>Cancel</button>
                  <button disabled={typed !== 'DELETE'} style={{
                    flex: 1, padding: '9px', borderRadius: 6, fontFamily: 'var(--ss-mono)', fontSize: 12,
                    border: '1px solid var(--ss-accent)',
                    background: typed === 'DELETE' ? 'var(--ss-accent)' : 'transparent',
                    color: typed === 'DELETE' ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
                    opacity: typed === 'DELETE' ? 1 : 0.5,
                  }}>Delete for good</button>
                </div>
              </>
            )}
          </div>
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, { SSSettingRow, SSSettingsScreen, SSEditProfileScreen, SSAccountScreen });
