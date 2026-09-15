import { FollowActions } from '@/components/profile/follow-actions';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { RECIPES, SHELVES } from '@/lib/fixtures';
import type { Person } from '@/lib/types';

// Shared between /me (own cookbook) and /[handle] (friend profile).
export function ProfileScreen({ person, isOwn }: { person: Person; isOwn: boolean }) {
  const ownRecipes = RECIPES.filter((r) => r.author === person.handle);
  const recipes = ownRecipes.length > 0 ? ownRecipes : RECIPES.slice(0, 4);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileHeader person={person} />
      {!isOwn && <FollowActions />}
      <ProfileTabs
        shelves={SHELVES}
        recipes={recipes}
        firstName={person.name.split(' ')[0]}
        isOwn={isOwn}
      />
    </div>
  );
}
