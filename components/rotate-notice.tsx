import { PhoneIcon } from '@/components/icons';

// The app is portrait-only. Android's installed app stays upright on its
// own (manifest `orientation`), but browsers and iOS can't be locked from a
// web page, so a phone turned sideways gets this screen over the app until
// it's turned back. "Phone" means a landscape viewport too short to be a
// tablet or laptop (max-height 500px), so desktop windows are never covered.
export function RotateNotice() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-cream px-8 text-center [@media(orientation:landscape)_and_(max-height:500px)]:flex"
    >
      <PhoneIcon size={28} className="text-ink" />
      <div className="font-display text-[20px] font-bold text-ink">Turn your phone upright</div>
      <div className="font-mono text-[14px] text-ink-mute">Special Spoon works in portrait.</div>
    </div>
  );
}
