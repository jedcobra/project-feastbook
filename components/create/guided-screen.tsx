'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Field } from '@/components/create/field';
import { TimeField } from '@/components/create/time-field';
import { ChevronIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { outlineBoxClasses } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { useBackNav } from '@/lib/back-nav';
import { clampServingsInput } from '@/lib/format';
import { createDraft, loadDraft, saveDraft, type RecipeDraft } from '@/lib/recipe-draft';

const LEVELS = ['Easy', 'Medium', 'Hard'] as const;

interface WizardValues {
  title: string;
  subtitle: string;
  time: string;
  serves: string;
  level: (typeof LEVELS)[number];
  ingredientsText: string;
  stepsText: string;
  intro: string;
}

type TextField = 'title' | 'subtitle' | 'ingredientsText' | 'stepsText' | 'intro';

interface WizardStep {
  key: 'title' | 'subtitle' | 'meta' | 'ingredients' | 'steps' | 'intro';
  field?: TextField;
  label: string;
  hint: string;
  placeholder?: string;
  display?: boolean;
  multiline?: boolean;
  rows?: number;
}

const STEPS: WizardStep[] = [
  {
    key: 'title',
    field: 'title',
    label: 'What is it called?',
    hint: 'The name you’d use telling a friend.',
    placeholder: 'Brown Butter Miso Pasta',
    display: true,
  },
  {
    key: 'subtitle',
    field: 'subtitle',
    label: 'Sum it up in one line.',
    hint: 'This shows under the title in the feed.',
    placeholder: 'A 20-minute dinner that tastes like a two-hour one.',
  },
  {
    key: 'meta',
    label: 'How long, how many?',
    hint: 'Rough is fine — you can change it later.',
  },
  {
    key: 'ingredients',
    field: 'ingredientsText',
    label: 'What goes in?',
    hint: 'One per line. Quantity first.',
    placeholder: '200g bucatini\n80g unsalted butter\n2 tbsp white miso',
    multiline: true,
    rows: 6,
  },
  {
    key: 'steps',
    field: 'stepsText',
    label: 'How is it made?',
    hint: 'One step per line. We’ll number them.',
    placeholder: 'Boil a large pot of salted water\nBrown the butter until nutty\nWhisk in miso and a ladle of pasta water',
    multiline: true,
    rows: 6,
  },
  {
    key: 'intro',
    field: 'intro',
    label: 'Anything to say about it?',
    hint: 'Optional — skip if you’d rather not.',
    placeholder: 'Where it came from, what to watch for.',
    multiline: true,
    rows: 4,
  },
];

// Flattens the composer's structured ingredients/steps into the wizard's
// one-per-line text, and back. Lossy for multi-section ingredients or
// step descriptions/timers — acceptable for an opt-in, simplified editor
// that's never anyone's only way to fill those fields in.
function flattenIngredients(draft: RecipeDraft): string {
  return draft.sections
    .flatMap((s) => s.items)
    .filter((it) => it.i.trim())
    .map((it) => [it.q.trim(), it.i.trim()].filter(Boolean).join(' '))
    .join('\n');
}

function parseIngredientLine(line: string): { q: string; i: string } {
  const trimmed = line.trim();
  const space = trimmed.indexOf(' ');
  if (space > 0 && /\d/.test(trimmed.slice(0, space))) {
    return { q: trimmed.slice(0, space), i: trimmed.slice(space + 1).trim() };
  }
  return { q: '', i: trimmed };
}

function flattenSteps(draft: RecipeDraft): string {
  return draft.steps
    .map((s) => s.t.trim())
    .filter(Boolean)
    .join('\n');
}

function valuesFromDraft(draft: RecipeDraft): WizardValues {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    time: draft.time,
    serves: draft.serves,
    level: draft.level,
    ingredientsText: flattenIngredients(draft),
    stepsText: flattenSteps(draft),
    intro: draft.intro,
  };
}

function applyValues(draft: RecipeDraft, v: WizardValues): RecipeDraft {
  const ingredientLines = v.ingredientsText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const stepLines = v.stepsText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return {
    ...draft,
    title: v.title,
    subtitle: v.subtitle,
    time: v.time,
    serves: v.serves,
    level: v.level,
    intro: v.intro,
    sections: ingredientLines.length > 0 ? [{ section: '', items: ingredientLines.map(parseIngredientLine) }] : draft.sections,
    steps: stepLines.length > 0 ? stepLines.map((t) => ({ t, d: '', timer: '' })) : draft.steps,
  };
}

// Opt-in alternative to the composer (7d): the same fields, one question
// per screen. Only reached via the composer's "Guide me" button, and
// "Long page" always escapes back to it — nothing here is ever forced.
export function GuidedScreen() {
  const router = useRouter();
  const backNav = useBackNav();
  const { loading, user } = useAuth();
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const [values, setValues] = useState<WizardValues | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('draft');
    const resolved = (id && loadDraft(id)) || createDraft();
    setDraft(resolved);
    setValues(valuesFromDraft(resolved));
    if (id !== resolved.id) {
      window.history.replaceState(null, '', `${window.location.pathname}?draft=${resolved.id}`);
    }
  }, []);

  if (loading || !draft || !values) {
    return (
      <>
        <TopBar title="Guide me" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopBar title="Guide me" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">Sign in to write a recipe.</span>
        </div>
      </>
    );
  }

  const longPageHref = `/new/edit?draft=${draft.id}`;
  const cur = STEPS[i];
  const last = i === STEPS.length - 1;

  const set = <K extends keyof WizardValues>(key: K, value: WizardValues[K]) =>
    setValues((v) => (v ? { ...v, [key]: value } : v));

  const commit = () => {
    const next = applyValues(draft, values);
    setDraft(next);
    saveDraft(next);
  };

  const advance = () => {
    commit();
    if (last) {
      router.push(`/new/publish?draft=${draft.id}`);
    } else {
      setI(i + 1);
    }
  };

  const goBack = () => {
    commit();
    if (i === 0) {
      backNav(longPageHref);
    } else {
      setI(i - 1);
    }
  };

  return (
    <>
      <TopBar
        title="Guide me"
        subtitle={`Step ${i + 1} of ${STEPS.length}`}
        onBack={goBack}
        trailing={
          <Link href={longPageHref} className={outlineBoxClasses(true)}>
            Long page
          </Link>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <div className="mb-7 flex gap-[3px]">
          {STEPS.map((_, j) => (
            <div key={j} className={`h-0.5 flex-1 ${j <= i ? 'bg-ink' : 'bg-rule-soft'}`} />
          ))}
        </div>

        <h1 className="mb-2 text-balance font-display text-[28px] font-bold leading-[1.08] text-ink">
          {cur.label}
        </h1>
        <div className="mb-[26px] font-mono text-[12px] leading-[1.55] text-ink-mute">{cur.hint}</div>

        {cur.key === 'meta' ? (
          <div>
            <TimeField value={values.time} onChange={(v) => set('time', v)} />
            <Field
              label="Serves"
              type="number"
              min={1}
              max={20}
              value={values.serves}
              onChange={(v) => set('serves', clampServingsInput(v))}
              placeholder="2"
            />
            <div>
              <Label className="mb-1.5 text-[9px]">Level</Label>
              <div className="flex gap-1.5">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set('level', l)}
                    className={`border border-ink px-3.5 py-[7px] font-mono text-[12px] ${
                      values.level === l ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : cur.multiline ? (
          <textarea
            rows={cur.rows}
            value={values[cur.field as TextField]}
            placeholder={cur.placeholder}
            onChange={(e) => set(cur.field as TextField, e.target.value)}
            className="block w-full resize-none rounded-button border border-ink bg-cream-surface p-3 font-mono text-[13px] leading-[1.7] text-ink outline-none"
          />
        ) : (
          <input
            value={values[cur.field as TextField]}
            placeholder={cur.placeholder}
            onChange={(e) => set(cur.field as TextField, e.target.value)}
            className={`w-full border-none border-b border-ink bg-transparent py-2 text-ink outline-none ${
              cur.display ? 'font-display text-[26px] font-bold' : 'font-mono text-[14px]'
            }`}
          />
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
        <button type="button" onClick={advance} className="px-1 py-3 font-mono text-[11px] text-ink-mute">
          Skip
        </button>
        <button
          type="button"
          onClick={advance}
          className="flex flex-1 items-center justify-center gap-2 rounded-button border border-ink bg-ink py-[13px] font-mono text-[13px] font-semibold text-cream"
        >
          {last ? 'Review and publish' : 'Next'}
          <ChevronIcon size={15} weight={2} />
        </button>
      </div>
    </>
  );
}
