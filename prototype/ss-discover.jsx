// ss-discover.jsx — Discover / search. Text index of trending + people.

function SSDiscoverScreen({ onOpenRecipe, onOpenProfile }) {
  const [query, setQuery] = React.useState('');

  return (
    <>
      <SSTopBar title="Discover"/>
      <SSScroll>
        <div style={{ padding: '0 20px 32px' }}>
          {/* Search input */}
          <SSInput
            placeholder="Search recipes, cooks, tags…"
            value={query}
            rightSlot={<SSIcon name="search" size={14}/>}
            style={{ marginBottom: 20 }}
          />

          {/* Trending tags */}
          <div style={{ marginBottom: 24 }}>
            <SSLabel style={{ marginBottom: 10 }}>Trending tags</SSLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['weeknight', 'spring produce', 'sourdough', 'one-pot', 'vegetarian', 'under 30 min', 'brunch', 'baking'].map((t, i) => (
                <SSTag key={i} style={i === 0 ? {
                  background: 'var(--ss-ink)', color: 'var(--ss-bg)',
                  borderColor: 'var(--ss-ink)',
                } : {}}>{t}</SSTag>
              ))}
            </div>
          </div>

          {/* People to follow */}
          <div style={{ marginBottom: 24 }}>
            <SSLabel style={{ marginBottom: 10 }}>Cooks to follow</SSLabel>
            {SS_PEOPLE.slice(1, 5).map((p, i) => (
              <div
                key={p.id}
                onClick={() => onOpenProfile && onOpenProfile(p.handle)}
                style={{
                  padding: '12px 0',
                  borderTop: i === 0 ? '1px dashed var(--ss-rule)' : 'none',
                  borderBottom: '1px dashed var(--ss-rule)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer',
                }}
              >
                <SSAvatar name={p.name} size={30}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--ss-display)', fontWeight: 700, fontSize: 15, color: 'var(--ss-ink)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)', marginTop: 1 }}>
                    {p.recipes} recipes · {p.followers > 999 ? (p.followers/1000).toFixed(1)+'k' : p.followers} followers
                  </div>
                </div>
                <SSBox compact>Follow</SSBox>
              </div>
            ))}
          </div>

          {/* Editor's picks — text index */}
          <div>
            <SSLabel style={{ marginBottom: 10 }}>Editor's picks</SSLabel>
            {SS_RECIPES.slice(0, 5).map((r, i) => (
              <div
                key={r.id}
                onClick={() => onOpenRecipe && onOpenRecipe(r.id)}
                style={{
                  padding: '11px 0',
                  borderTop: i === 0 ? '1px dashed var(--ss-rule)' : 'none',
                  borderBottom: '1px dashed var(--ss-rule)',
                  display: 'flex', alignItems: 'baseline', gap: 10, cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <SSHeading level={3} style={{ fontSize: 16, marginBottom: 2 }}>
                    {r.title}
                  </SSHeading>
                  <div style={{ fontFamily: 'var(--ss-mono)', fontSize: 11, color: 'var(--ss-ink-mute)' }}>
                    {r.time} · {r.difficulty} · {r.madeIt} cooked
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {r.tags.slice(0, 1).map(t => <SSTag key={t}>{t}</SSTag>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SSScroll>
    </>
  );
}

Object.assign(window, { SSDiscoverScreen });
