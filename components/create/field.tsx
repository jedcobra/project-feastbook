import { Label } from '@/components/label';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
  size?: number;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  type?: string;
  autoComplete?: string;
}

// Underline field — real input, no border box. The composer's signature
// look: a label, the value, and a dashed rule underneath.
export function Field({
  label,
  value,
  onChange,
  placeholder,
  mono = true,
  size = 13,
  multiline,
  rows = 3,
  hint,
  type = 'text',
  autoComplete,
}: FieldProps) {
  const inputClassName = `block w-full resize-none border-none bg-transparent py-1.5 outline-none ${
    mono ? 'font-mono' : 'font-display'
  } text-ink`;
  const style = { fontSize: size, lineHeight: 1.5 };

  return (
    <div className="mb-3.5">
      <div className="mb-0.5 flex items-baseline gap-1.5">
        <Label className="text-[9px]">{label}</Label>
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          style={style}
        />
      ) : (
        <input
          type={type}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          style={style}
        />
      )}
      <div className="border-b border-dashed border-rule" />
      {hint && <div className="mt-1 font-mono text-[10px] text-ink-mute">{hint}</div>}
    </div>
  );
}
