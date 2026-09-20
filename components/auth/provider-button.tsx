// A text-only, non-functional provider button — Apple/Google sign-in is
// still engineering, not design (see MERGE.md); the design calls for the
// row to exist so the two email paths aren't the only thing on the page.
export function ProviderButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="mb-2 w-full rounded-button border border-ink bg-transparent py-3 text-center font-mono text-[13px] text-ink opacity-60"
    >
      {label}
    </button>
  );
}
