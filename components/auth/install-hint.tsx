'use client';

import { useEffect, useState } from 'react';
import { IosShareIcon } from '@/components/icons';

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

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setPlatform(null);
  };

  const share = <IosShareIcon size={10} className="mx-0.5 inline -translate-y-0.5" />;
  const steps: Record<Platform, React.ReactNode> = {
    'ios-safari': <>Tap {share} Share below, then &ldquo;Add to Home Screen&rdquo;.</>,
    'ios-safari-26': <>Tap &bull;&bull;&bull; below, then {share} Share, then &ldquo;Add to Home Screen&rdquo;.</>,
    'ios-other': <>Tap {share} Share at the top, then &ldquo;Add to Home Screen&rdquo;.</>,
    'android-prompt': <>It opens full screen, like an app.</>,
    'android-menu': <>Open your browser menu &#8942; above, then &ldquo;Add to Home screen&rdquo;.</>,
  };

  // Kept quiet: one small line of body copy above the sign-in buttons.
  return (
    <p className="mb-3 px-5 text-center font-mono text-[11px] leading-[1.55] text-ink-mute">
      Best on your home screen. {steps[platform]}{' '}
      {platform === 'android-prompt' && (
        <button type="button" onClick={install} className="text-ink underline underline-offset-2">
          Add it now
        </button>
      )}
    </p>
  );
}
