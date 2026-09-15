import type { ButtonHTMLAttributes } from 'react';

// Shared classes for the design's one button shape — outlined, square corners.
// `filled` swaps to the solid ink/cream treatment (e.g. an active toggle state).
export function outlineBoxClasses(compact: boolean, filled = false, className = '') {
  return `inline-flex items-center gap-1.5 rounded-button border border-ink font-mono font-medium ${
    filled ? 'bg-ink text-cream' : 'bg-cream text-ink'
  } ${compact ? 'px-2 py-1 text-meta' : 'px-3 py-1.5 text-body'} ${className}`;
}

export function OutlineBox({
  compact = false,
  filled = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { compact?: boolean; filled?: boolean }) {
  return <button className={outlineBoxClasses(compact, filled, className)} {...props} />;
}
