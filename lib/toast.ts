// A one-line confirmation that floats above the tab bar for a moment
// ("Draft saved"). Fired as a window event so it can be raised right before
// a navigation and still show on the screen that comes next: the Toaster
// lives in the tabs layout, which stays mounted across those navigations.

const EVENT = 'ss:toast';

export function showToast(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function onToast(handler: (message: string) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
