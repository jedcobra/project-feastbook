import type { InputHTMLAttributes } from 'react';

export function FormField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <div className="mb-1.5 font-display text-caps font-bold uppercase text-ink">{label}</div>
      <input
        className="w-full rounded-button border border-ink bg-cream-surface px-3 py-2.5 font-mono text-[13px] text-ink placeholder:text-ink-mute focus:outline-none"
        {...props}
      />
    </label>
  );
}
