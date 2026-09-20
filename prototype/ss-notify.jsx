// ss-notify.jsx — The inbox. Grouped by day, unread marked, every row goes somewhere.

const SS_NOTIFS = [
  { id: 'n1', group: 'Today', kind: 'note', who: 'mayacooks', at: '2h', unread: true,
    text: 'noted on', subject: 'Brown Butter Miso Pasta', recipeId: 'brown-butter-miso',
    excerpt: 'Added a soft egg on top. 10/10.' },
  { id: 'n2', group: 'Today', kind: 'cooked', who: 'luminous', at: '5h', unread: true,
    text: 'cooked', subject: 'Lazy Sourdough Focaccia', recipeId: 'sourdough-focaccia' },
  { id: 'n3', group: 'Today', kind: 'follow', who: 'dev.iyer', at: '7h', unread: true,
    text: 'started following you' },
  { id: 'n4', group: 'This week', kind: 'reply', who: 'rensmallkitchen', at: 'Tue',
    text: 'replied to your note on', subject: 'Brown Butter Miso Pasta', recipeId: 'brown-butter-miso',
    excerpt: 'Ghee is already browned so you lose the step — but a good vegan block butter browns fine.' },
  { id: 'n5', group: 'This week', kind: 'cooked', who: 'sambeau', at: 'Tue',
    text: 'cooked', subject: 'Lazy Sourdough Focaccia', recipeId: 'sourdough-focaccia' },
  { id: 'n6', group: 'This week', kind: 'note', who: 'coral', at: 'Mon',
    text: 'noted on', subject: 'Lazy Sourdough Focaccia', recipeId: 'sourdough-focaccia',
    excerpt: 'The 24-hour cold prove is the whole thing. Don\u2019t rush it.' },
  { id: 'n7', group: 'Earlier', kind: 'digest', at: 'Sun',
    text: 'This week your people cooked 14 things', subject: 'Weekly digest' },
  { id: 'n8', group: 'Earlier', kind: 'follow', who: 'coral', at: '12 Apr',
    text: 'started following you' },
];

const SS_NOTIF_ICON = { note: 'comment', reply: 'comment', follow: 'user', cooked: 'pot', digest: 'book' };

function SSNotificationsScreen({ empty = false, onBack, onOpenRecipe, onOpenProfile, onSettings }) {
  const [items, setItems] = React.useState(() => empty ? [] : SS_NOTIFS);
  const [filter, setFilter] = React.useState('all');
  const shown = items.filter(n => filter === 'all' ? true : filter === 'unread' ? n.unread : n.kind === filter);
  const groups = shown.reduce((acc, n) => {
    (acc[n.group] = acc[n.group] || []).push(n); return acc;
  }, {});
  const unread = items.filter(n => n.unread).length;

  return (
    <>
      <SSTopBar title="Notifications" onBack={onBack}
        subtitle={unread ? `${unread} unread` : 'All caught up'}
        trailing={<SSBox compact onClick={() => setItems(is => is.map(n => ({ ...n, unread: false })))}>
          Mark read
        </SSBox>}/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {[['all', 'All'], ['unread', 'Unread'], ['note', 'Notes'], ['follow', 'Follows']].map(([k, l]) => (
              <span key={k} onClick={() => setFilter(k)} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '3px 8px',
                border: '1px solid var(--ss-ink)', borderRadius: 4, cursor: 'pointer',
                background: filter === k ? 'var(--ss-ink)' : 'transparent',
                color: filter === k ? 'var(--ss-bg)' : 'var(--ss-ink)',
              }}>{l}</span>
            ))}
          </div>

          {shown.length === 0 ? (
            <div style={{ marginTop: 16, padding: '28px 18px', textAlign: 'center', border: '1px dashed var(--ss-rule)' }}>
              <div style={{
                fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
                fontSize: 19, color: 'var(--ss-ink)', marginBottom: 6,
              }}>Nothing here</div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55, color: 'var(--ss-ink-mute)', marginBottom: 14 }}>
                When someone cooks or notes on one of yours, it lands here. Nothing else does.
              </div>
              <SSBox compact onClick={onSettings}>What gets sent</SSBox>
            </div>
          ) : Object.entries(groups).map(([g, rows]) => (
            <div key={g} style={{ marginTop: 16 }}>
              <SSLabel style={{ fontSize: 9, letterSpacing: '0.12em', marginBottom: 2 }}>{g}</SSLabel>
              {rows.map(n => {
                const p = n.who ? byHandle(n.who) : null;
                return (
                  <div key={n.id}
                    onClick={() => {
                      setItems(is => is.map(x => x.id === n.id ? { ...x, unread: false } : x));
                      if (n.recipeId && onOpenRecipe) onOpenRecipe(n.recipeId);
                      else if (n.who && onOpenProfile) onOpenProfile(n.who);
                    }}
                    style={{
                      display: 'flex', gap: 10, padding: '12px 0', cursor: 'pointer',
                      borderTop: '1px dashed var(--ss-rule)',
                    }}>
                    <div style={{ width: 6, flexShrink: 0, paddingTop: 7 }}>
                      {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ss-accent)' }}/>}
                    </div>
                    {p ? <SSAvatar name={p.name} size={26}/> : (
                      <div style={{
                        width: 26, height: 26, border: '1px solid var(--ss-ink)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                      }}><SSIcon name={SS_NOTIF_ICON[n.kind]} size={13} color="var(--ss-ink)"/></div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.45, color: 'var(--ss-ink)' }}>
                        {p && <span style={{ fontWeight: 600 }}>{p.name} </span>}
                        <span style={{ color: 'var(--ss-ink-mute)' }}>{n.text}</span>
                        {n.subject && !p ? '' : n.subject ? <span> {n.subject}</span> : null}
                      </div>
                      {n.excerpt && (
                        <div style={{
                          fontFamily: 'var(--ss-mono)', fontSize: 11, lineHeight: 1.5,
                          color: 'var(--ss-ink-mute)', marginTop: 4, paddingLeft: 9,
                          borderLeft: '1px dashed var(--ss-rule)',
                        }}>{n.excerpt}</div>
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)', flexShrink: 0,
                    }}>{n.at}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </SSScroll>
    </>
  );
}

// A lock-screen push, for reference in the handoff
function SSPushPreview() {
  return (
    <div style={{
      border: '1px solid var(--ss-rule)', borderRadius: 14, padding: '11px 13px',
      background: 'var(--ss-surface)', display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6, background: 'var(--ss-ink)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 14, color: 'var(--ss-bg)',
      }}>S</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink)', fontWeight: 600, marginBottom: 2,
        }}>Maya noted on your focaccia</div>
        <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, lineHeight: 1.45, color: 'var(--ss-ink-mute)' }}>
          “The 24-hour cold prove is the whole thing. Don’t rush it.”
        </div>
      </div>
      <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>now</span>
    </div>
  );
}

Object.assign(window, { SS_NOTIFS, SSNotificationsScreen, SSPushPreview });
