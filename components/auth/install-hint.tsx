'use client';

import { useEffect, useState } from 'react';
import { IosShareIcon, PlusIcon, XIcon } from '@/components/icons';

const DISMISSED_KEY = 'ss-install-hint-dismissed';

// Chrome's install prompt event (not in the DOM typings).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform =
  // Safari's Share button sits in its bottom toolbar (iOS 18 and earlier).
  | 'ios-safari'
  // Safari 26's compact toolbar tucks Share into the ••• button, bottom right.
  | 'ios-safari-26'
  // Chrome/Firefox/Edge on iOS: Share sits in the top address bar.
  | 'ios-other'
  // Chrome on Android offered its own install prompt.
  | 'android-prompt'
  // Any other phone browser: "Add to Home screen" lives in the ⋮ menu.
  | 'android-menu';

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) {
    if (/crios|fxios|edgios/i.test(ua)) return 'ios-other';
    const safariMajor = Number(ua.match(/version\/(\d+)/i)?.[1] ?? 0);
    return safariMajor >= 26 ? 'ios-safari-26' : 'ios-safari';
  }
  if (/android/i.test(ua)) return 'android-menu';
  return null; // a computer — nothing to install to
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// On the welcome screen, for someone in a phone's browser rather than the
// app opened from their home screen: a nudge to add it (it's also what iOS
// needs before it'll send push notifications), with the steps for their
// browser — or, where Chrome offers it, a button that does it.
export function InstallHint() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (window.localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      // Storage blocked — just show it.
    }
    setPlatform(detectPlatform());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setPlatform('android-prompt');
    };
    const onInstalled = () => setPlatform(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!platform) return null;

  const dismiss = () => {
    setPlatform(null);
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Ignore — it'll just show again next time.
    }
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setPlatform(null);
  };

  const share = <IosShareIcon size={12} className="mx-0.5 inline -translate-y-0.5" />;
  const steps: Record<Platform, React.ReactNode> = {
    'ios-safari': <>Tap {share} Share below, then &ldquo;Add to Home Screen&rdquo;.</>,
    'ios-safari-26': <>Tap &bull;&bull;&bull; below, then {share} Share, then &ldquo;Add to Home Screen&rdquo;.</>,
    'ios-other': <>Tap {share} Share at the top, then &ldquo;Add to Home Screen&rdquo;.</>,
    'android-prompt': <>Install it like an app — it opens full screen, straight from your home screen.</>,
    'android-menu': <>Open your browser menu &#8942; above, then &ldquo;Add to Home screen&rdquo;.</>,
  };

  return (
    <div className="relative mx-5 mb-4 rounded-button border border-dashed border-ink bg-cream-surface px-4 py-3.5 pr-10">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center text-ink-mute"
      >
        <XIcon size={11} />
      </button>
      <div className="font-display text-[16px] font-bold text-ink">Best on your home screen</div>
      <p className="mt-1 font-mono text-[12px] leading-[1.55] text-ink-mute">
        Special Spoon works best added to your home screen, and that&rsquo;s where notifications work too.{' '}
        {steps[platform]}
      </p>
      {platform === 'android-prompt' && (
        <button
          type="button"
          onClick={install}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-button border border-ink px-3 py-1.5 font-mono text-[12px] font-semibold text-ink"
        >
          <PlusIcon size={11} />
          Add to home screen
        </button>
      )}
    </div>
  );
}
