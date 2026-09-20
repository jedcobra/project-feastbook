import { ChevronIcon } from '@/components/icons';

interface SettingRowProps {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  first?: boolean;
}

// One row of a settings section: a label, an optional value, and a chevron
// when it's tappable. Rows with no onClick are plain display — the app's
// way of showing something honestly without faking that it does anything.
export function SettingRow({ label, value, onClick, danger, first }: SettingRowProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 border-b border-dashed border-rule py-3 text-left ${
        first ? 'border-t' : ''
      }`}
    >
      <span className={`flex-1 font-mono text-[12.5px] ${danger ? 'text-accent' : 'text-ink'}`}>{label}</span>
      {value && <span className="font-mono text-[11.5px] text-ink-mute">{value}</span>}
      {onClick && !danger && <ChevronIcon size={13} className="flex-shrink-0 text-rule" />}
    </Tag>
  );
}
