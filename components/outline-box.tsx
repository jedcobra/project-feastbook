import type { ButtonHTMLAttributes } from 'react';

// Outlined square-cornered button — the design's only button shape.
export function OutlineBox({
  compact,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { compact?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-button border border-ink bg-cream font-mono font-medium text-ink ${
        compact ? 'px-2 py-1 text-meta' : 'px-3 py-1.5 text-body'
      } ${className}`}
      {...props}
    />
  );
}
