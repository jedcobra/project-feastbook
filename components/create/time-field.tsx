import { Label } from '@/components/label';
import { formatDuration, parseDuration } from '@/lib/format';

// Hours + minutes number inputs in place of a free-text "Time" box, so
// every recipe's time reads consistently (see lib/format's
// formatDuration) instead of whatever wording someone typed.
export function TimeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { hours, minutes } = parseDuration(value);

  const setHours = (h: number) => onChange(formatDuration(Math.min(23, Math.max(0, h)), minutes));
  const setMinutes = (m: number) => onChange(formatDuration(hours, Math.min(59, Math.max(0, m))));

  return (
    <div className="mb-3.5">
      <Label className="mb-0.5 text-[9px]">Time</Label>
      <div className="flex items-baseline gap-1 pt-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={23}
          value={hours || ''}
          onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
          placeholder="0"
          className="w-7 border-none bg-transparent p-0 font-mono text-[12px] text-ink outline-none"
        />
        <span className="font-mono text-[10px] text-ink-mute">hr</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={minutes || ''}
          onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
          placeholder="0"
          className="w-7 border-none bg-transparent p-0 font-mono text-[12px] text-ink outline-none"
        />
        <span className="font-mono text-[10px] text-ink-mute">min</span>
      </div>
      <div className="mt-1.5 border-b border-dashed border-rule" />
    </div>
  );
}
