'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Checkbox } from '@/components/checkbox';
import { Label } from '@/components/label';
import { TopBar } from '@/components/top-bar';
import { deleteDraft, draftCounts, loadDraft, type RecipeDraft } from '@/lib/recipe-draft';
import {
  createShelf,
  fetchProfileByHandle,
  fetchShelfIdsForRecipe,
  publishRecipe,
  updateRecipe,
} from '@/lib/supabase/queries';
import type { Shelf, Visibility } from '@/lib/types';
import { VISIBILITY_OPTIONS } from '@/lib/visibility';

export function PublishScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [draft, setDraft] = useState<RecipeDraft | null | undefined>(undefined);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [selectedShelves, setSelectedShelves] = useState<Set<string>>(new Set());
  const [newShelfOpen, setNewShelfOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [visibility, setVisibility] = useState<Visibility | null>(null);
  const [notify, setNotify] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('draft');
    setDraft(id ? loadDraft(id) : null);
  }, []);

  useEffect(() => {
    if (profile) fetchProfileByHandle(profile.handle).then((data) => setShelves(data?.shelves ?? []));
  }, [profile]);

  // Editing an existing recipe: it already has a visibility and shelf
  // membership, so start from those instead of forcing the choice again.
  useEffect(() => {
    if (!draft?.editId) return;
    if (draft.visibility) setVisibility(draft.visibility);
    setNotify(false);
    fetchShelfIdsForRecipe(draft.editId).then(setSelectedShelves);
  }, [draft]);

  const toggleShelf = (id: string) =>
    setSelectedShelves((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAddShelf = async () => {
    const name = newShelfName.trim();
    if (!name || !profile) return;
    const created = await createShelf(profile.id, name);
    if (created) {
      setShelves((s) => [...s, { id: created.id, title: created.title, subtitle: '', count: 0, recipes: [] }]);
      setSelectedShelves((s) => new Set(s).add(created.id));
    }
    setNewShelfName('');
    setNewShelfOpen(false);
  };

  const handlePublish = async () => {
    if (!visibility || !draft || !profile) return;
    setPublishing(true);
    const recipeId = draft.editId
      ? await updateRecipe(draft.editId, draft, visibility, [...selectedShelves])
      : await publishRecipe(profile.id, draft, visibility, [...selectedShelves]);
    setPublishing(false);
    if (recipeId) {
      deleteDraft(draft.id);
      router.push(draft.editId ? `/recipe/${draft.editId}` : '/me');
    }
  };

  if (draft === undefined) {
    return (
      <>
        <TopBar title="Publish" backHref="/new/edit" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (!draft) {
    return (
      <>
        <TopBar title="Publish" backHref="/new" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">No draft to publish yet.</span>
        </div>
      </>
    );
  }

  const { ingredientCount, stepCount } = draftCounts(draft);
  const isEdit = !!draft.editId;

  return (
    <>
      <TopBar title={isEdit ? 'Save changes' : 'Publish'} backHref={`/new/edit?draft=${draft.id}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-[22px] border border-ink p-3.5">
          <h3 className="mb-1 font-display text-section font-bold text-ink">
            {draft.title.trim() || 'Untitled recipe'}
          </h3>
          <div className="font-mono text-meta text-ink-mute">
            {[
              draft.time.trim(),
              draft.serves.trim() && `serves ${draft.serves.trim()}`,
              draft.level,
              `${ingredientCount} ingredient${ingredientCount === 1 ? '' : 's'}`,
              `${stepCount} step${stepCount === 1 ? '' : 's'}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2.5 flex items-baseline justify-between border-b border-dashed border-rule pb-1.5">
            <Label>Who can see it</Label>
            {!visibility && <span className="font-mono text-[10px] text-accent">required</span>}
          </div>
          {VISIBILITY_OPTIONS.map((o, i) => {
            const on = visibility === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setVisibility(o.id)}
                className={`flex w-full items-start gap-2.5 py-[11px] text-left ${
                  i === 0 ? '' : 'border-t border-dotted border-rule'
                }`}
              >
                <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                  {on && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
                </span>
                <span className="flex-1">
                  <span className={`block font-mono text-[13px] ${on ? 'font-semibold' : 'font-normal'} text-ink`}>
                    {o.title}
                  </span>
                  <span className="block font-mono text-[11px] leading-snug text-ink-mute">{o.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="mb-2.5 border-b border-dashed border-rule pb-1.5">
            <Label>Add to shelves</Label>
          </div>
          {shelves.map((shelf, i) => (
            <button
              key={shelf.id}
              type="button"
              onClick={() => toggleShelf(shelf.id)}
              className={`flex w-full items-center gap-2.5 py-2.5 text-left ${
                i === 0 ? '' : 'border-t border-dotted border-rule'
              }`}
            >
              <Checkbox checked={selectedShelves.has(shelf.id)} />
              <span className="flex-1 font-mono text-[12px] text-ink">{shelf.title}</span>
              <span className="font-mono text-meta text-ink-mute">{shelf.count}</span>
            </button>
          ))}
          {newShelfOpen ? (
            <div className="flex items-center gap-2 border-t border-dotted border-rule pt-2.5">
              <input
                autoFocus
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddShelf()}
                placeholder="Shelf name"
                className="min-w-0 flex-1 border-b border-dashed border-rule bg-transparent font-mono text-[12px] text-ink outline-none"
              />
              <button type="button" onClick={handleAddShelf} className="font-mono text-[11px] text-ink">
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNewShelfOpen(true)}
              className="w-full border-t border-dotted border-rule pl-[23px] pt-[9px] text-left font-mono text-[11px] text-ink-mute"
            >
              + new shelf
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setNotify(!notify)}
          className="flex w-full items-center gap-2.5 border-y border-dashed border-rule py-[11px] text-left"
        >
          <Checkbox checked={notify} />
          <span className="flex-1 font-mono text-[12px] text-ink">Tell my followers</span>
        </button>
      </div>

      <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
        <button
          type="button"
          onClick={handlePublish}
          disabled={!visibility || publishing}
          className={`w-full rounded-button border border-ink py-[13px] font-mono text-[13px] font-semibold ${
            visibility ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
          }`}
        >
          {publishing
            ? isEdit
              ? 'Saving…'
              : 'Publishing…'
            : visibility
              ? isEdit
                ? 'Save changes'
                : 'Publish to my cookbook'
              : 'Choose who can see it'}
        </button>
      </div>
    </>
  );
}
