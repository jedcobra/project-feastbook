'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Field } from '@/components/create/field';
import { DragIcon, SaveIcon, TimerIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { OutlineBox } from '@/components/outline-box';
import { Tag } from '@/components/tag';
import { TopBar } from '@/components/top-bar';
import { emptyDraft, loadDraft, saveDraft, type RecipeDraft } from '@/lib/recipe-draft';

const LEVELS = ['Easy', 'Medium', 'Hard'] as const;
const SUGGESTED_TAGS = ['pasta', 'weeknight', 'umami', 'vegetarian'];

function computeProgress(draft: RecipeDraft) {
  const filled = [draft.title, draft.sections[0]?.items[0]?.i, draft.steps[0]?.t].filter((v) => v?.trim()).length;
  return Math.round((filled / 3) * 100);
}

export function ComposerScreen() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [draft, setDraft] = useState<RecipeDraft | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      const url = params.get('url') ?? undefined;
      setDraft(emptyDraft(url));
      // Drop the one-time init params so a refresh resumes the draft from
      // storage instead of wiping it with a fresh one every time.
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      setDraft(loadDraft() ?? emptyDraft());
    }
  }, []);

  useEffect(() => {
    if (draft) saveDraft(draft);
  }, [draft]);

  if (loading || !draft) {
    return (
      <>
        <TopBar title="Write it out" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopBar title="Write it out" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">Sign in to write a recipe.</span>
        </div>
      </>
    );
  }

  const pct = computeProgress(draft);
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
  const addSection = () =>
    setDraft((d) => (d ? { ...d, sections: [...d.sections, { section: '', items: [{ q: '', i: '' }] }] } : d));

  const setStep = (i: number, key: 't' | 'd' | 'timer', value: string) =>
    setDraft((d) => (d ? { ...d, steps: d.steps.map((s, j) => (j !== i ? s : { ...s, [key]: value })) } : d));
  const addStep = () => setDraft((d) => (d ? { ...d, steps: [...d.steps, { t: '', d: '', timer: '' }] } : d));

  const toggleTag = (tag: string) =>
    setDraft((d) =>
      d ? { ...d, tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag] } : d,
    );

  return (
    <>
      <TopBar title="Write it out" backHref="/new" subtitle={`${pct}% · draft saved`} />
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

        <div className="mb-1.5 grid grid-cols-3 gap-2.5">
          <Field label="Time" value={draft.time} onChange={(v) => update({ time: v })} placeholder="25 min" size={12} />
          <Field
            label="Serves"
            value={draft.serves}
            onChange={(v) => update({ serves: v })}
            placeholder="2"
            size={12}
          />
          <div className="mb-3.5">
            <Label className="mb-0.5 text-[9px]">Level</Label>
            <div className="flex gap-1 pt-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ level: l })}
                  className={`border border-ink px-[5px] py-0.5 font-mono text-[10px] ${
                    draft.level === l ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                  }`}
                >
                  {l[0]}
                </button>
              ))}
            </div>
            <div className="mt-1.5 border-b border-dashed border-rule" />
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
          <div className="mb-2.5 flex items-baseline justify-between border-b border-dashed border-rule pb-1.5">
            <Label>Ingredients</Label>
            <button type="button" onClick={addSection} className="font-mono text-[10px] text-ink-mute">
              + section
            </button>
          </div>
          {draft.sections.map((section, si) => (
            <div key={si} className="mb-3.5">
              <input
                value={section.section}
                onChange={(e) => setSectionName(si, e.target.value)}
                placeholder={si === 0 ? 'Section name (optional)' : 'Section name'}
                className="mb-1.5 w-full border-none bg-transparent p-0 font-mono text-[10px] uppercase tracking-wide text-ink-mute outline-none"
              />
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2 border-t border-dotted border-rule py-1.5">
                  <DragIcon size={12} className="flex-shrink-0 text-rule" />
                  <input
                    value={item.q}
                    onChange={(e) => setItem(si, ii, 'q', e.target.value)}
                    placeholder="200g"
                    className="w-[62px] flex-shrink-0 border-none bg-transparent p-0 font-mono text-[11px] text-ink-mute outline-none"
                  />
                  <input
                    value={item.i}
                    onChange={(e) => setItem(si, ii, 'i', e.target.value)}
                    placeholder="bucatini"
                    className="min-w-0 flex-1 border-none bg-transparent p-0 font-mono text-[12px] text-ink outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem(si)}
                className="w-full border-t border-dotted border-rule py-1.5 pl-5 text-left font-mono text-[11px] text-ink-mute"
              >
                + ingredient
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <div className="mb-2.5 border-b border-dashed border-rule pb-1.5">
            <Label>Method</Label>
          </div>
          {draft.steps.map((step, i) => (
            <div key={i} className={`mb-3 ${i === 0 ? '' : 'border-t border-dashed border-rule pt-3'}`}>
              <div className="flex gap-2.5 items-baseline">
                <span className="w-5 flex-shrink-0 font-mono text-meta text-ink-mute">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    value={step.t}
                    onChange={(e) => setStep(i, 't', e.target.value)}
                    placeholder="Brown the butter"
                    className="mb-1 w-full border-none bg-transparent p-0 font-display text-[16px] font-bold text-ink outline-none"
                  />
                  <textarea
                    value={step.d}
                    rows={2}
                    onChange={(e) => setStep(i, 'd', e.target.value)}
                    placeholder="What to do, and what it should look like when it's right."
                    className="block w-full resize-none border-none bg-transparent p-0 font-mono text-[12px] leading-[1.55] text-ink-mute outline-none"
                  />
                  <div className="mt-1 flex items-center gap-1.5">
                    <TimerIcon size={11} className="text-ink-mute" />
                    <input
                      value={step.timer}
                      onChange={(e) => setStep(i, 'timer', e.target.value)}
                      placeholder="timer (min)"
                      className="w-[90px] border-none bg-transparent p-0 font-mono text-[10px] text-ink-mute outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="w-full border-t border-dashed border-rule pl-[30px] pt-2 text-left font-mono text-[11px] text-ink-mute"
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
          <Label className="mb-1.5 text-[9px]">Tags</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {draft.tags.map((t) => (
              <Tag key={t} selected onRemove={() => toggleTag(t)}>
                {t}
              </Tag>
            ))}
            {SUGGESTED_TAGS.filter((t) => !draft.tags.includes(t))
              .slice(0, 3)
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className="rounded-tag border border-dashed border-rule px-2 py-[3px] font-mono text-meta text-ink-mute"
                >
                  + {t}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-2.5 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
        <OutlineBox onClick={() => router.push('/me')} aria-label="Save and close">
          <SaveIcon size={14} />
        </OutlineBox>
        <button
          type="button"
          onClick={() => router.push('/new/publish')}
          className="flex-1 rounded-button border border-ink bg-ink py-[13px] font-mono text-[13px] font-semibold text-cream"
        >
          Continue to publish
        </button>
      </div>
    </>
  );
}
