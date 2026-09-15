import type { ButtonHTMLAttributes } from 'react';

// Shared classes for the design's one button shape — outlined, square corners.
export function outlineBoxClasses(compact: boolean, className = '') {
  return `inline-flex items-center gap-1.5 rounded-button border border-ink bg-cream font-mono font-medium text-ink ${
    compact ? 'px-2 py-1 text-meta' : 'px-3 py-1.5 text-body'
  } ${className}`;
}

export function OutlineBox({
  compact = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { compact?: boolean }) {
  return <button className={outlineBoxClasses(compact, className)} {...props} />;
}
