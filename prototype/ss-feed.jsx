// ss-feed.jsx — Home feed. Three layouts: index (default), magazine, compact.
// Text-first. No photo tiles. Dashed rules. Monospace meta.

function SSFeedScreen({ layout = 'index', onOpenRecipe, onOpenProfile, onOpenSearch, onOpenNotifications }) {
  return (
    <>
      <SSTopBar
        variant="brand"
        trailing={<>
          <SSBox compact onClick={onOpenSearch}>
            <SSIcon name="search" size={14}/>
          </SSBox>
          <SSBox compact onClick={onOpenNotifications} style={{ position: 'relative' }}>
            <SSIcon name="heart" size={14}/>
            <span style={{
              position: 'absolute', top: -3, right: -3, width: 7, height: 7,
              borderRadius: '50%', background: 'var(--ss-accent)',
            }}/>
          </SSBox>
        </>}
      />
      {/* Date bar */}
      <div style={{
        padding: '0 20px 0',
        borderBottom: '1px dashed var(--ss-rule)',
        marginBottom: 0,
      }}>
        <div style={{
          fontFamily: 'var(--ss-mono)', fontSize: 11,
          color: 'var(--ss-ink-mute)',
          paddingBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>WED 22 APR</span>
          <span style={{ color: 'var(--ss-ink)' }}>6 updates</span>
        </div>
      </div>
      <SSScroll>
        {layout === 'index'    && <IndexFeed    onOpenRecipe={onOpenRecipe} onOpenProfile={onOpenProfile}/>}
        {layout === 'magazine' && <MagazineFeed onOpenRecipe={onOpenRecipe} onOpenProfile={onOpenProfile}/>}
        {layout === 'compact'  && <CompactFeed  onOpenRecipe={onOpenRecipe} onOpenProfile={onOpenProfile}/>}
      </SSScroll>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Index feed — noods-style vertical list of activity rows.
// Each row: author + verb | recipe title | meta | tags
// ─────────────────────────────────────────────────────────────
function IndexFeed({ onOpenRecipe, onOpenProfile }) {
  return (
    <div style={{ paddingBottom: 32 }}>
      {SS_FEED.map((item, i) => {
        const r = recipeById(item.recipe);
        const a = byHandle(item.who);
        const kindVerb = {
          new:    'added',
          madeit: 'cooked',
          saved:  'saved',
        }[item.kind];

        return (
          <div key={i} style={{
            borderBottom: '1px dashed var(--ss-rule)',
          }}>
            {/* Author line */}
            <div style={{
              padding: '12px 20px 0',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <SSAvatar name={a.name} size={22}/>
              <span
                onClick={() => onOpenProfile && onOpenProfile(a.handle)}
                style={{
                  fontFamily: 'var(--ss-mono)', fontSize: 12,
                  color: 'var(--ss-ink)', cursor: 'pointer',
                  textDecoration: 'underline', textDecorationStyle: 'dashed',
                  textUnderlineOffset: 3,
                }}
              >{a.name}</span>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                {kindVerb}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                {item.when}
              </span>
            </div>

            {/* Recipe title */}
            <div
              onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
              style={{
                padding: '8px 20px 4px',
                fontFamily: 'var(--ss-display)',
                fontWeight: 'var(--ss-display-weight)',
                fontSize: 22, lineHeight: 1.1,
                letterSpacing: 'var(--ss-display-tracking)',
                color: 'var(--ss-ink)', cursor: 'pointer',
              }}
            >{r.title}</div>

            {/* Caption if any */}
            {item.caption && (
              <div style={{
                padding: '0 20px 4px',
                fontFamily: 'var(--ss-mono)', fontSize: 12,
                color: 'var(--ss-ink-mute)', lineHeight: 1.5,
              }}>
                "{item.caption}"
              </div>
            )}

            {/* Meta + tags row */}
            <div style={{
              padding: '6px 20px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                {r.time}
              </span>
              <span style={{ color: 'var(--ss-rule)' }}>·</span>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                serves {r.serves}
              </span>
              <span style={{ color: 'var(--ss-rule)' }}>·</span>
              <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                {r.madeIt} cooked
              </span>
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {r.tags.slice(0, 2).map(t => <SSTag key={t}>{t}</SSTag>)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Magazine feed — bold serif titles, descriptive, editorial
// ─────────────────────────────────────────────────────────────
function MagazineFeed({ onOpenRecipe, onOpenProfile }) {
  return (
    <div style={{ paddingBottom: 32 }}>
      {SS_FEED.map((item, i) => {
        const r = recipeById(item.recipe);
        const a = byHandle(item.who);
        const isFirst = i === 0;

        return (
          <div key={i} style={{
            padding: isFirst ? '24px 20px 20px' : '20px 20px',
            borderBottom: '1px dashed var(--ss-rule)',
          }}>
            {/* Tag + label row */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center',
            }}>
              {r.tags.slice(0, 2).map(t => <SSTag key={t}>{t}</SSTag>)}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                {item.when}
              </span>
            </div>

            {/* Title — big, serif */}
            <div
              onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
              style={{
                fontFamily: 'var(--ss-display)',
                fontWeight: 'var(--ss-display-weight)',
                fontSize: isFirst ? 32 : 24,
                lineHeight: 1.05,
                letterSpacing: 'var(--ss-display-tracking)',
                color: 'var(--ss-ink)',
                marginBottom: 6, cursor: 'pointer',
                textWrap: 'balance',
              }}
            >{r.title}</div>

            <div style={{
              fontFamily: 'var(--ss-mono)', fontSize: 13,
              color: 'var(--ss-ink-mute)', lineHeight: 1.45,
              marginBottom: 10,
            }}>{r.subtitle}</div>

            {item.caption && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--ss-bg-deep)',
                borderLeft: '2px solid var(--ss-ink)',
                fontFamily: 'var(--ss-mono)', fontSize: 12,
                color: 'var(--ss-ink-mute)', lineHeight: 1.5,
                marginBottom: 12,
              }}>"{item.caption}"</div>
            )}

            {/* Author + stats */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)',
            }}>
              <SSAvatar name={a.name} size={20}/>
              <span
                onClick={() => onOpenProfile && onOpenProfile(a.handle)}
                style={{ color: 'var(--ss-ink)', cursor: 'pointer',
                  textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3 }}
              >{a.name}</span>
              <span>·</span>
              <span>{r.time}</span>
              <span>·</span>
              <span>{r.madeIt} cooked</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compact feed — ultra-dense text index, 1-liner per item
// ─────────────────────────────────────────────────────────────
function CompactFeed({ onOpenRecipe }) {
  return (
    <div style={{ padding: '0 20px 32px' }}>
      {SS_FEED.map((item, i) => {
        const r = recipeById(item.recipe);
        const a = byHandle(item.who);
        const kindVerb = { new: '+', madeit: '✓', saved: '◆' }[item.kind];
        return (
          <div
            key={i}
            onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              padding: '9px 0',
              borderBottom: '1px dotted var(--ss-rule)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-accent)', width: 12, flexShrink: 0 }}>
              {kindVerb}
            </span>
            <span style={{
              fontFamily: 'var(--ss-display)', fontWeight: 'var(--ss-display-weight)',
              fontSize: 15, color: 'var(--ss-ink)', flex: 1, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{r.title}</span>
            <span style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', flexShrink: 0 }}>
              {a.name.split(' ')[0]} · {item.when}
            </span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { SSFeedScreen });
