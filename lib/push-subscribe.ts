// Browser-side half of Web Push: registering the service worker, asking
// for permission, and turning the resulting PushSubscription into the
// three plain strings (endpoint, p256dh, auth) the `push_subscriptions`
// table stores. The actual sending happens server-side in
// app/api/push/send — this file only ever reaches as far as "subscribed".

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Mirrors the one-time "ask, then live with the answer" nature of the
// browser's own permission prompt — there's no "ask again" once denied,
// short of the person changing it in their browser's own site settings.
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64Safe);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function subscriptionKeys(sub: PushSubscription): { endpoint: string; p256dh: string; auth: string } | null {
  const p256dh = sub.getKey('p256dh');
  const auth = sub.getKey('auth');
  if (!p256dh || !auth) return null;
  const toBase64 = (buf: ArrayBuffer) => window.btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { endpoint: sub.endpoint, p256dh: toBase64(p256dh), auth: toBase64(auth) };
}

// Registers the service worker, prompts for permission if needed, and
// subscribes — returning the three fields ready to hand to
// savePushSubscription(). Returns an error string instead of throwing,
// same style as uploadPhoto, since every step here (permission, the
// subscribe call itself) can fail for reasons outside this app's control.
export async function subscribeToPush(
  vapidPublicKey: string,
): Promise<{ endpoint: string; p256dh: string; auth: string } | { error: string }> {
  if (!isPushSupported()) return { error: 'Push notifications aren’t supported in this browser.' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { error: 'Notifications are blocked — allow them in your browser’s site settings to turn this on.' };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      }));
    const keys = subscriptionKeys(subscription);
    if (!keys) return { error: "Couldn't read that subscription — try again." };
    return keys;
  } catch (err) {
    console.error('subscribeToPush', err);
    return { error: "Couldn't turn on push notifications — try again." };
  }
}

// Unsubscribes this device locally and returns the endpoint that was
// removed, so the caller can delete the matching row server-side — the
// subscription itself can't be un-deleted from the browser's end once
// this resolves.
export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

// Whether this device already has a live subscription — used to show the
// Settings toggle as on/off without needing a round trip to the server.
export async function getExistingSubscriptionEndpoint(): Promise<string | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  return subscription?.endpoint ?? null;
}
