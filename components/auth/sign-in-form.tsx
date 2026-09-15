'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FormField } from '@/components/form-field';

export function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn({ email: email.trim(), password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.push('/me');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <FormField
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      {error && <div className="font-mono text-[12px] text-accent">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-button border border-ink bg-ink py-2.5 font-mono text-[13px] font-semibold text-cream disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={onSwitchToSignUp}
        className="font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
      >
        New here? Create an account
      </button>
    </form>
  );
}
