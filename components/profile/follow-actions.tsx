import { OutlineBox } from '@/components/outline-box';

export function FollowActions() {
  return (
    <div className="flex gap-2 px-5 pb-[18px]">
      <button className="flex-1 rounded-button border border-ink bg-ink py-2.5 font-mono text-[13px] font-semibold text-cream">
        Follow
      </button>
      <OutlineBox>Message</OutlineBox>
    </div>
  );
}
