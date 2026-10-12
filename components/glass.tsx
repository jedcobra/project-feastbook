'use client';

import { useEffect, useState } from 'react';

// The SVG filter behind the glass bars' ripple (.glass-distort in
// globals.css): the backdrop is frosted, then gently warped by soft noise.
// Rendered once by the tab shell so the top bar and tab bar share it.
export function GlassFilter() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <filter id="glass-ripple" x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" edgeMode="duplicate" result="frosted" />
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves={2} seed={7} result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap in="frosted" in2="soft" scale={16} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

// Only Chromium (Android, desktop Chrome) can run an SVG filter over a
// backdrop; Safari and Firefox would drop the blur along with it, so they
// get the glass without the ripple.
export function useGlassDistort() {
  const [distort, setDistort] = useState(false);
  useEffect(() => {
    setDistort(/Chrome\//.test(navigator.userAgent));
  }, []);
  return distort;
}
