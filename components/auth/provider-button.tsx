'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

const LABEL = { google: 'Continue with Google', facebook: 'Continue with Facebook' } as const;

// Redirects to the provider's own sign-in page — Supabase creates the
// account on first use or signs the person back in on a return visit,
// same button either way. Apple isn't wired up (Sign in with Apple needs
// a paid developer account); Google and Facebook are both free to set up.
export function ProviderButton({ provider }: { provider: 'google' | 'facebook' }) {
  const { signInWithProvider } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const handleClick = async () => {
    setError(null);
    setRedirecting(true);
    const { error } = await signInWithProvider(provider);
    // Only reached if the redirect itself failed to start — a successful
    // call navigates the page away before this line would matter.
    if (error) {
      setRedirecting(false);
      setError(error);
    }
  };

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={redirecting}
        className="w-full rounded-button border border-ink bg-transparent py-3 text-center font-mono text-[13px] text-ink disabled:opacity-60"
      >
        {redirecting ? 'Redirecting…' : LABEL[provider]}
      </button>
      {error && <div className="mt-1.5 font-mono text-[11px] text-accent">{error}</div>}
    </div>
  );
}
