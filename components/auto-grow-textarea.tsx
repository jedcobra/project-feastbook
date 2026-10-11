'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

// A textarea that grows to fit everything typed into it instead of
// scrolling inside a small window, and shrinks back as text is deleted.
// `rows` still sets the starting (minimum) height. If the className sets
// a max-height (used by composers docked above the keyboard), it grows up
// to that and only then scrolls internally.
export function AutoGrowTextarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = el.scrollHeight > el.clientHeight ? 'auto' : 'hidden';
  }, []);

  useLayoutEffect(fit, [fit, props.value]);

  // Text rewraps when the width changes (e.g. rotating the phone).
  useEffect(() => {
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  return <textarea ref={ref} {...props} className={`overflow-hidden ${className}`} />;
}

// A one-line answer (a title, a name, a one-line description, a link)
// that wraps onto more lines as it grows rather than scrolling sideways
// and hiding its beginning. It's still one line of text: Enter doesn't
// add a line break (it calls onEnter if given), and line breaks pasted
// in become spaces.
export function AutoGrowLine({
  onChange,
  onEnter,
  onKeyDown,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'rows'> & {
  onChange: (value: string) => void;
  onEnter?: () => void;
}) {
  return (
    <AutoGrowTextarea
      rows={1}
      enterKeyHint={onEnter ? 'go' : 'done'}
      {...props}
      onChange={(e) => onChange(e.target.value.replace(/[ \t]*[\r\n]+[ \t]*/g, ' '))}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === 'Enter' && !e.defaultPrevented) {
          e.preventDefault();
          if (onEnter) onEnter();
          else e.currentTarget.blur();
        }
      }}
    />
  );
}
