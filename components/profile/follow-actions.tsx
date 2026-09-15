import { OutlineBox } from '@/components/outline-box';

export function FollowActions({
  following,
  onToggleFollow,
}: {
  following: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <div className="flex gap-2 px-5 pb-[18px]">
      <button
        type="button"
        onClick={onToggleFollow}
        className={`flex-1 rounded-button border border-ink py-2.5 font-mono text-[13px] font-semibold ${
          following ? 'bg-cream text-ink' : 'bg-ink text-cream'
        }`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      <OutlineBox>Message</OutlineBox>
    </div>
  );
}
