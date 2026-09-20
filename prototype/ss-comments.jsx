// ss-comments.jsx — The full notes thread. Comments, replies, "cooked it" marks.
// Reads like marginalia in a shared book: one rule per note, reply nested under it.

const SS_THREADS = {
  'brown-butter-miso': [
    { id: 'c1', by: 'mayacooks', at: '2d', text: 'Made this for dinner last night. Added a soft egg on top. 10/10.',
      likes: 12, cooked: true, liked: false, replies: [
        { id: 'c1r1', by: 'rensmallkitchen', at: '2d', text: 'The egg is a good call. I do that when I want it to feel like a proper meal.', likes: 4, author: true },
        { id: 'c1r2', by: 'mayacooks', at: '1d', text: 'Next time I\u2019m trying it with a jammy one.', likes: 1 },
      ] },
    { id: 'c2', by: 'luminous', at: '4d', text: 'My kids asked for seconds. Thirds, even. Adding to the rotation.',
      likes: 8, cooked: true, liked: true, replies: [] },
    { id: 'c3', by: 'sambeau', at: '6d', text: 'Tried with red miso and it was deeply savoury \u2014 almost too much. Stick to white!',
      likes: 3, cooked: true, replies: [
        { id: 'c3r1', by: 'rensmallkitchen', at: '6d', text: 'Red is a different animal. If you want to use it up, halve the amount.', likes: 6, author: true },
      ] },
    { id: 'c4', by: 'dev.iyer', at: '1w', text: 'Is there a way to do this without dairy? Would ghee work or does it need the milk solids to brown?',
      likes: 2, question: true, replies: [
        { id: 'c4r1', by: 'rensmallkitchen', at: '1w', text: 'Ghee is already browned so you lose the step \u2014 but a good vegan block butter browns fine. Just watch it, it goes faster.', likes: 9, author: true },
      ] },
    { id: 'c5', by: 'you', at: '3h', text: 'Halved it for one and it still worked. Used the rest of the sauce on rice the next day.',
      likes: 0, mine: true, cooked: true, replies: [] },
  ],
};

function ssThread(r) {
  if (SS_THREADS[r.id]) return SS_THREADS[r.id];
  return (r.comments || []).map((c, i) => ({
    id: `f${i}`, by: c.by, at: `${i + 2}d`, text: c.text, likes: c.likes, cooked: true, replies: [],
  }));
}

// ─────────────────────────────────────────────────────────────
// A single note. Recursive for one level of reply.
// ─────────────────────────────────────────────────────────────
function SSNote({ c, depth = 0, onLike, onReply, onOpenProfile }) {
  const p = byHandle(c.by) || { name: 'Someone', handle: c.by };
  return (
    <div style={{ paddingLeft: depth ? 22 : 0, borderLeft: depth ? '1px dashed var(--ss-rule)' : 'none' }}>
      <div style={{ padding: '11px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <SSAvatar name={p.name} size={depth ? 16 : 20}/>
          <span onClick={() => onOpenProfile && onOpenProfile(p.handle)} style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11.5, color: 'var(--ss-ink)', cursor: 'pointer',
          }}>{c.mine ? 'You' : p.name}</span>
          {c.author && <span style={{
            fontFamily: 'var(--ss-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
            border: '1px solid var(--ss-ink)', padding: '1px 4px', color: 'var(--ss-ink)',
          }}>author</span>}
          {c.cooked && !depth && <span style={{
            fontFamily: 'var(--ss-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--ss-accent)', border: '1px solid var(--ss-accent)', padding: '1px 4px',
          }}>cooked it</span>}
          <span style={{ flex: 1 }}/>
          <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 10, color: 'var(--ss-ink-mute)' }}>{c.at}</span>
        </div>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.55,
          color: 'var(--ss-ink)', paddingLeft: depth ? 22 : 26, marginBottom: 7,
        }}>{c.text}</div>
        <div style={{ display: 'flex', gap: 14, paddingLeft: depth ? 22 : 26, alignItems: 'center' }}>
          <span onClick={() => onLike(c.id)} style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11, cursor: 'pointer',
            color: c.liked ? 'var(--ss-accent)' : 'var(--ss-ink-mute)',
          }}>{c.liked ? '♥' : '♡'} {c.likes > 0 ? c.likes : ''}</span>
          <span onClick={() => onReply(c)} style={{
            fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer',
          }}>Reply</span>
          {c.mine && <>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer' }}>Edit</span>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', cursor: 'pointer' }}>Delete</span>
          </>}
        </div>
      </div>
      {(c.replies || []).map(rp => (
        <SSNote key={rp.id} c={rp} depth={depth + 1} onLike={onLike} onReply={onReply} onOpenProfile={onOpenProfile}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Full thread screen
// ─────────────────────────────────────────────────────────────
function SSCommentsScreen({ recipeId = 'brown-butter-miso', empty = false, onBack, onOpenProfile }) {
  const r = recipeById(recipeId) || SS_RECIPES[0];
  const [notes, setNotes] = React.useState(() => empty ? [] : ssThread(r));
  const [filter, setFilter] = React.useState('all');
  const [replyTo, setReplyTo] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [cookedMark, setCookedMark] = React.useState(false);

  const like = (id) => setNotes(ns => ns.map(n => {
    if (n.id === id) return { ...n, liked: !n.liked, likes: n.likes + (n.liked ? -1 : 1) };
    return { ...n, replies: (n.replies || []).map(rp => rp.id === id
      ? { ...rp, liked: !rp.liked, likes: rp.likes + (rp.liked ? -1 : 1) } : rp) };
  }));

  const post = () => {
    if (!draft.trim()) return;
    const note = { id: 'n' + Date.now(), by: 'you', at: 'now', text: draft.trim(),
      likes: 0, mine: true, cooked: cookedMark, replies: [] };
    if (replyTo) {
      setNotes(ns => ns.map(n => n.id === replyTo.id
        ? { ...n, replies: [...(n.replies || []), { ...note, cooked: false }] } : n));
    } else {
      setNotes(ns => [note, ...ns]);
    }
    setDraft(''); setReplyTo(null); setCookedMark(false);
  };

  const shown = notes.filter(n =>
    filter === 'all' ? true :
    filter === 'cooked' ? n.cooked :
    filter === 'questions' ? n.question : true);
  const total = notes.reduce((a, n) => a + 1 + (n.replies || []).length, 0);

  return (
    <>
      <SSTopBar title="Notes" onBack={onBack}
        subtitle={`${r.title} \u00b7 ${total} note${total === 1 ? '' : 's'}`}/>
      <SSScroll>
        <div style={{ padding: '0 20px 20px' }}>
          {/* Cooked-it ledger */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            borderTop: '1px dashed var(--ss-rule)', borderBottom: '1px dashed var(--ss-rule)',
            padding: '10px 0', marginBottom: 12,
          }}>
            <div style={{ display: 'flex' }}>
              {['mayacooks', 'luminous', 'sambeau'].map((h, i) => {
                const p = byHandle(h);
                return <SSAvatar key={h} name={p.name} size={20} style={{ marginLeft: i ? -6 : 0 }}/>;
              })}
            </div>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', flex: 1 }}>
              {r.madeIt} people cooked this
            </span>
            <SSBox compact onClick={() => setCookedMark(c => !c)}
              style={cookedMark ? { background: 'var(--ss-ink)', color: 'var(--ss-bg)' } : {}}>
              {cookedMark ? '✓ Cooked it' : 'I cooked it'}
            </SSBox>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            {[['all', 'All'], ['cooked', 'Cooked it'], ['questions', 'Questions']].map(([k, label]) => (
              <span key={k} onClick={() => setFilter(k)} style={{
                fontFamily: 'var(--ss-mono)', fontSize: 11, padding: '3px 8px',
                border: '1px solid var(--ss-ink)', cursor: 'pointer', borderRadius: 4,
                background: filter === k ? 'var(--ss-ink)' : 'transparent',
                color: filter === k ? 'var(--ss-bg)' : 'var(--ss-ink)',
              }}>{label}</span>
            ))}
          </div>

          {/* Thread */}
          {shown.length === 0 ? (
            <div style={{
              marginTop: 16, padding: '28px 18px', textAlign: 'center',
              border: '1px dashed var(--ss-rule)',
            }}>
              <div style={{
                fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
                fontSize: 19, color: 'var(--ss-ink)', marginBottom: 6,
              }}>No notes yet</div>
              <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 12, lineHeight: 1.55, color: 'var(--ss-ink-mute)' }}>
                {filter === 'all'
                  ? 'If you change something, or it goes wrong, say so here. That\u2019s what makes the recipe better next time.'
                  : 'Nothing under this filter yet.'}
              </div>
            </div>
          ) : shown.map((c, i) => (
            <div key={c.id} style={{ borderTop: '1px dashed var(--ss-rule)' }}>
              <SSNote c={c} onLike={like} onReply={setReplyTo} onOpenProfile={onOpenProfile}/>
            </div>
          ))}
        </div>
      </SSScroll>

      {/* Composer */}
      <div style={{
        borderTop: '1px dashed var(--ss-rule)', background: 'var(--ss-bg)',
        padding: '10px 16px 18px',
      }}>
        {replyTo && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
          }}>
            <span>Replying to {(byHandle(replyTo.by) || {}).name || replyTo.by}</span>
            <span onClick={() => setReplyTo(null)} style={{ cursor: 'pointer', color: 'var(--ss-ink)' }}>×</span>
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          border: '1px solid var(--ss-ink)', borderRadius: 8, padding: '8px 10px',
          background: 'var(--ss-surface)',
        }}>
          <textarea
            value={draft} rows={1}
            onChange={e => setDraft(e.target.value)}
            placeholder={replyTo ? 'Write a reply…' : 'Leave a note…'}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent', resize: 'none',
              fontFamily: 'var(--ss-mono)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--ss-ink)',
              padding: 0, maxHeight: 80,
            }}/>
          <button onClick={post} disabled={!draft.trim()} style={{
            border: '1px solid var(--ss-ink)', borderRadius: 6, padding: '5px 10px',
            background: draft.trim() ? 'var(--ss-ink)' : 'transparent',
            color: draft.trim() ? 'var(--ss-bg)' : 'var(--ss-ink-mute)',
            fontFamily: 'var(--ss-mono)', fontSize: 11,
            opacity: draft.trim() ? 1 : 0.5,
          }}>Post</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { SS_THREADS, ssThread, SSNote, SSCommentsScreen });
