'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { AutoGrowLine, AutoGrowTextarea } from '@/components/auto-grow-textarea';
import { Field } from '@/components/create/field';
import { PhotoField } from '@/components/create/photo-field';
import { TimeField } from '@/components/create/time-field';
import { DragIcon, SaveIcon, TimerIcon, XIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { OutlineBox } from '@/components/outline-box';
import { Tag } from '@/components/tag';
import { TopBar } from '@/components/top-bar';
import { useBackNav } from '@/lib/back-nav';
import { moveItem } from '@/lib/cookbook-order';
import { clampServingsInput } from '@/lib/format';
import {
  createDraft,
  draftFromRecipe,
  draftProgress,
  loadDraft,
  saveDraft,
  type DraftSource,
  type RecipeDraft,
} from '@/lib/recipe-draft';
import { fetchRecipeFull } from '@/lib/supabase/queries';
import { Subheading } from '@/components/subheading';

const LEVELS = ['Easy', 'Medium', 'Hard'] as const;
const SUGGESTED_TAGS = ['pasta', 'weeknight', 'umami', 'vegetarian'];
const STEP_DESCRIPTION_LIMIT = 300;

type Drag = { kind: 'item'; si: number; ii: number } | { kind: 'step'; i: number };

// How long "Undo" stays offered after removing an ingredient or step.
const UNDO_MS = 6000;

// The grip at the start of an ingredient or step: press and drag to move it.
function DragHandle({ label, onStart }: { label: string; onStart: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onStart();
      }}
      className="-my-1.5 -ml-1.5 flex-shrink-0 cursor-grab touch-none p-1.5 text-ink-mute active:cursor-grabbing"
    >
      <DragIcon size={14} />
    </button>
  );
}

// The × at the end of an ingredient or step.
function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="-my-1 -mr-1.5 flex-shrink-0 p-1.5 text-ink-mute"
    >
      <XIcon size={11} />
    </button>
  );
}

export function ComposerScreen() {
  const router = useRouter();
  const goBack = useBackNav();
  const { loading, user, profile } = useAuth();
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const [tagInput, setTagInput] = useState('');
  // The ingredient or step being dragged by its handle, tracked by its live
  // position (it moves as the rows reorder under it).
  const [dragging, setDragging] = useState<Drag | null>(null);
  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;
  const ingredientRows = useRef(new Map<string, HTMLElement>());
  const stepRows = useRef(new Map<number, HTMLElement>());
  const draftRef = useRef(draft);
  draftRef.current = draft;
  // The draft as it was before the last ingredient or step was removed,
  // offered back for a few seconds.
  const [undo, setUndo] = useState<{ label: string; draft: RecipeDraft } | null>(null);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(t);
  }, [undo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draft');
    const editId = params.get('edit');

    async function init() {
      let resolved: RecipeDraft;
      if (draftId) {
        resolved = loadDraft(draftId) ?? createDraft();
      } else if (editId) {
        const data = await fetchRecipeFull(editId);
        resolved = data ? draftFromRecipe(data.recipe) : createDraft();
      } else {
        const source = (params.get('source') as DraftSource | null) ?? 'manual';
        const url = params.get('url') ?? undefined;
        resolved = createDraft(source, url);
      }
      setDraft(resolved);

      // The URL's `draft` id is the stable identifier from here on — drop the
      // one-time `source`/`url`/`edit` creation hints (and adopt the fresh id
      // if this was a brand-new, missing, or freshly-seeded draft) so a
      // refresh resumes from storage instead of re-fetching or losing it.
      if (draftId !== resolved.id) {
        window.history.replaceState(null, '', `${window.location.pathname}?draft=${resolved.id}`);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (draft) saveDraft(draft);
  }, [draft]);

  // While an ingredient or step is held, follow the pointer on the window
  // (moving the row's DOM node would drop pointer capture on the handle)
  // and slot it in wherever it's dragged — an ingredient within its
  // section, a step within the method.
  const isDragging = !!dragging;
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      const cur = draggingRef.current;
      const d = draftRef.current;
      if (!cur || !d) return;
      const from = cur.kind === 'item' ? cur.ii : cur.i;
      const count = cur.kind === 'item' ? d.sections[cur.si]?.items.length ?? 0 : d.steps.length;
      const rowAt = (j: number) =>
        cur.kind === 'item' ? ingredientRows.current.get(`${cur.si}:${j}`) : stepRows.current.get(j);
      let target = 0;
      for (let j = 0; j < count; j++) {
        if (j === from) continue;
        const rect = rowAt(j)?.getBoundingClientRect();
        if (rect && rect.top + rect.height / 2 < e.clientY) target++;
      }
      if (target === from) return;
      if (cur.kind === 'item') {
        draggingRef.current = { ...cur, ii: target };
        setDraft((dd) =>
          dd
            ? {
                ...dd,
                sections: dd.sections.map((s, i) => (i !== cur.si ? s : { ...s, items: moveItem(s.items, from, target) })),
              }
            : dd,
        );
      } else {
        draggingRef.current = { kind: 'step', i: target };
        setDraft((dd) => (dd ? { ...dd, steps: moveItem(dd.steps, from, target) } : dd));
      }
      setDragging(draggingRef.current);
    };
    const onUp = () => setDragging(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging]);

  if (loading || !draft) {
    return (
      <>
        <TopBar title="Type it out" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[14px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <TopBar title="Type it out" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[14px] text-ink-mute">Sign in to write a recipe.</span>
        </div>
      </>
    );
  }

  const isEdit = !!draft.editId;
  const closeHref = isEdit ? `/recipe/${draft.editId}` : '/new';
  const pct = draftProgress(draft);
  const update = (patch: Partial<RecipeDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const setSectionName = (si: number, value: string) =>
    setDraft((d) =>
      d ? { ...d, sections: d.sections.map((s, i) => (i === si ? { ...s, section: value } : s)) } : d,
    );
  const setItem = (si: number, ii: number, key: 'q' | 'i', value: string) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            sections: d.sections.map((s, i) =>
              i !== si ? s : { ...s, items: s.items.map((it, j) => (j !== ii ? it : { ...it, [key]: value })) },
            ),
          }
        : d,
    );
  const addItem = (si: number) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            sections: d.sections.map((s, i) => (i !== si ? s : { ...s, items: [...s.items, { q: '', i: '' }] })),
          }
        : d,
    );
  const removeItem = (si: number, ii: number) => {
    setUndo({ label: 'Ingredient removed', draft });
    setDraft((d) =>
      d
        ? { ...d, sections: d.sections.map((s, i) => (i !== si ? s : { ...s, items: s.items.filter((_, j) => j !== ii) })) }
        : d,
    );
  };
  const addSection = () =>
    setDraft((d) => (d ? { ...d, sections: [...d.sections, { section: '', items: [{ q: '', i: '' }] }] } : d));

  const setStep = (i: number, key: 't' | 'd' | 'timer' | 'photoUrl', value: string) =>
    setDraft((d) => (d ? { ...d, steps: d.steps.map((s, j) => (j !== i ? s : { ...s, [key]: value })) } : d));
  const removeStep = (i: number) => {
    setUndo({ label: 'Step removed', draft });
    setDraft((d) => (d ? { ...d, steps: d.steps.filter((_, j) => j !== i) } : d));
  };
  const addStep = () =>
    setDraft((d) => (d ? { ...d, steps: [...d.steps, { t: '', d: '', timer: '', photoUrl: '' }] } : d));

  const startDrag = (drag: Drag) => {
    (document.activeElement as HTMLElement | null)?.blur();
    draggingRef.current = drag;
    setDragging(drag);
  };

  const toggleTag = (tag: string) =>
    setDraft((d) =>
      d ? { ...d, tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag] } : d,
    );

  const addCustomTag = () => {
    const tag = tagInput.trim().toLowerCase();
    setTagInput('');
    if (!tag) return;
    setDraft((d) => (d && !d.tags.includes(tag) ? { ...d, tags: [...d.tags, tag] } : d));
  };

  return (
    <>
      <TopBar
        title={isEdit ? 'Edit recipe' : 'Type it out'}
        backHref={closeHref}
        subtitle={`${pct}% · draft saved`}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-[18px] h-0.5 bg-rule-soft">
          <div className="h-full bg-ink transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>

        <Field
          label="Title"
          value={draft.title}
          onChange={(v) => update({ title: v })}
          placeholder="Brown Butter Miso Pasta"
          mono={false}
          size={24}
        />
        <Field
          label="One-line description"
          value={draft.subtitle}
          onChange={(v) => update({ subtitle: v })}
          placeholder="A 20-minute dinner that tastes like a two-hour one."
        />

        <PhotoField
          label="Cover photo"
          photoUrl={draft.coverPhotoUrl}
          onChange={(url) => update({ coverPhotoUrl: url })}
          profileId={profile.id}
          kind="recipe-cover"
        />

        <div className="mb-1.5 grid grid-cols-3 gap-2.5">
          <TimeField value={draft.time} onChange={(v) => update({ time: v })} />
          <Field
            label="Serves"
            type="number"
            min={1}
            max={20}
            value={draft.serves}
            onChange={(v) => update({ serves: clampServingsInput(v) })}
            placeholder="2"
            size={12}
          />
          <div className="mb-3.5">
            <Label className="mb-0.5 text-[11px]">Level</Label>
            <div className="flex gap-1 pt-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ level: l })}
                  className={`border border-ink px-[5px] py-0.5 font-mono text-[11px] ${
                    draft.level === l ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                  }`}
                >
                  {l[0]}
                </button>
              ))}
            </div>
            <div className="mt-1.5 border-b border-rule-soft" />
          </div>
        </div>

        <Field
          label="Intro — the story"
          value={draft.intro}
          onChange={(v) => update({ intro: v })}
          multiline
          rows={4}
          placeholder="Where it came from, what to watch for, why you make it."
          hint="Optional. This is what makes it yours rather than a spec sheet."
        />

        <div className="mb-5 mt-[22px]">
          <div className="mb-2.5 flex items-baseline justify-between border-b border-rule-soft pb-1.5">
            <Subheading>Ingredients</Subheading>
            <button type="button" onClick={addSection} className="font-mono text-[11px] text-ink-mute">
              + section
            </button>
          </div>
          {draft.sections.map((section, si) => (
            <div key={si} className="mb-3.5">
              <AutoGrowLine
                value={section.section}
                onChange={(v) => setSectionName(si, v)}
                placeholder={si === 0 ? 'Section name (optional)' : 'Section name'}
                className="mb-1.5 block w-full resize-none border-none bg-transparent p-0 font-mono text-[11px] uppercase tracking-wide text-ink-mute outline-none"
              />
              {section.items.map((item, ii) => (
                <div
                  key={ii}
                  ref={(el) => {
                    if (el) ingredientRows.current.set(`${si}:${ii}`, el);
                    else ingredientRows.current.delete(`${si}:${ii}`);
                  }}
                  className={`flex items-start gap-2 border-t border-rule-soft py-1.5 ${
                    dragging?.kind === 'item' && dragging.si === si && dragging.ii === ii ? 'bg-cream-deep' : ''
                  }`}
                >
                  <DragHandle label="Drag to reorder" onStart={() => startDrag({ kind: 'item', si, ii })} />
                  <AutoGrowLine
                    value={item.q}
                    onChange={(v) => setItem(si, ii, 'q', v)}
                    placeholder="200g"
                    className="block w-[112px] flex-shrink-0 resize-none border-none bg-transparent p-0 pt-px font-mono text-[12px] leading-[1.5] text-ink-mute outline-none"
                  />
                  <AutoGrowLine
                    value={item.i}
                    onChange={(v) => setItem(si, ii, 'i', v)}
                    placeholder="bucatini"
                    className="block min-w-0 flex-1 resize-none border-none bg-transparent p-0 font-mono text-[14px] leading-[1.4] text-ink outline-none"
                  />
                  <RemoveButton label="Remove ingredient" onClick={() => removeItem(si, ii)} />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(si)}
                className="w-full border-t border-rule-soft py-1.5 pl-5 text-left font-mono text-[12px] text-ink-mute"
              >
                + ingredient
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <div className="mb-2.5 border-b border-rule-soft pb-1.5">
            <Subheading>Method</Subheading>
          </div>
          {draft.steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) stepRows.current.set(i, el);
                else stepRows.current.delete(i);
              }}
              className={`pb-3 ${i === 0 ? '' : 'border-t border-rule-soft pt-3'} ${
                dragging?.kind === 'step' && dragging.i === i ? 'bg-cream-deep' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <DragHandle label="Drag to reorder" onStart={() => startDrag({ kind: 'step', i })} />
                <span className="w-5 flex-shrink-0 pt-[3px] font-mono text-meta text-ink-mute">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <AutoGrowLine
                    value={step.t}
                    onChange={(v) => setStep(i, 't', v)}
                    placeholder="Brown the butter"
                    className="mb-1 block w-full resize-none border-none bg-transparent p-0 font-display text-[16px] font-bold leading-[1.3] text-ink outline-none"
                  />
                  <AutoGrowTextarea
                    value={step.d}
                    rows={2}
                    maxLength={STEP_DESCRIPTION_LIMIT}
                    onChange={(e) => setStep(i, 'd', e.target.value)}
                    placeholder="What to do, and what it should look like when it's right."
                    className="block w-full resize-none border-none bg-transparent p-0 font-mono text-[14px] leading-[1.55] text-ink-mute outline-none"
                  />
                  {step.d.length >= STEP_DESCRIPTION_LIMIT - 40 && (
                    <div className="text-right font-mono text-[11px] text-ink-mute">
                      {step.d.length}/{STEP_DESCRIPTION_LIMIT}
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1.5">
                    <TimerIcon size={11} className="text-ink-mute" />
                    <input
                      value={step.timer}
                      onChange={(e) => setStep(i, 'timer', e.target.value)}
                      placeholder="timer (min)"
                      className="w-[110px] border-none bg-transparent p-0 font-mono text-[11px] text-ink-mute outline-none"
                    />
                  </div>
                  <div className="mt-1.5">
                    <PhotoField
                      label="Step photo"
                      photoUrl={step.photoUrl}
                      onChange={(url) => setStep(i, 'photoUrl', url)}
                      profileId={profile.id}
                      kind="recipe-step"
                      size={56}
                    />
                  </div>
                </div>
                <RemoveButton label="Remove step" onClick={() => removeStep(i)} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="w-full border-t border-rule-soft pl-[58px] pt-2 text-left font-mono text-[12px] text-ink-mute"
          >
            + step
          </button>
        </div>

        <Field
          label="Your notes"
          value={draft.notes}
          onChange={(v) => update({ notes: v })}
          multiline
          rows={2}
          placeholder="Substitutions, warnings, the thing you always forget."
        />

        <div className="mb-5">
          <Label className="mb-1.5 text-[11px]">Tags</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {draft.tags.map((t) => (
              <Tag key={t} selected onRemove={() => toggleTag(t)}>
                {t}
              </Tag>
            ))}
            {[...new Set([...(draft.suggestedTags ?? []), ...SUGGESTED_TAGS])]
              .filter((t) => !draft.tags.includes(t))
              .slice(0, 6)
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className="rounded-tag border border-rule px-2 py-[3px] font-mono text-meta text-ink-mute"
                >
                  + {t}
                </button>
              ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              onBlur={addCustomTag}
              placeholder="Add a tag…"
              className="w-[108px] min-w-0 flex-shrink-0 rounded-tag border border-rule bg-transparent px-2 py-[3px] font-mono text-meta text-ink outline-none placeholder:text-ink-mute focus:border-ink"
            />
          </div>
        </div>

      </div>

      {undo && (
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-rule-soft bg-cream-deep px-5 py-2.5 font-mono text-[12px] text-ink">
          <span>{undo.label}</span>
          <button
            type="button"
            onClick={() => {
              setDraft(undo.draft);
              setUndo(null);
            }}
            className="font-semibold underline"
          >
            Undo
          </button>
        </div>
      )}
      <div className="tabbar-clearance flex flex-shrink-0 gap-2.5 border-t border-rule-soft bg-cream px-5 pb-5 pt-3">
        <OutlineBox onClick={() => goBack(closeHref)} aria-label="Save and close">
          <SaveIcon size={14} />
        </OutlineBox>
        <button
          type="button"
          onClick={() => router.push(`/new/publish?draft=${draft.id}`)}
          className="flex-1 rounded-button border border-ink bg-ink py-[13px] font-mono text-[14px] font-semibold text-cream"
        >
          Continue to publish
        </button>
      </div>
    </>
  );
}
