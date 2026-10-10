'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

// A textarea that grows to fit everything typed into it instead of
// scrolling inside a small window. `rows` still sets the starting
// (minimum) height.
export function AutoGrowTextarea({ className = '', style, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(fit, [fit, props.value]);

  // Text rewraps when the width changes (e.g. rotating the phone).
  useEffect(() => {
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  return <textarea ref={ref} {...props} className={`overflow-hidden ${className}`} style={style} />;
}
