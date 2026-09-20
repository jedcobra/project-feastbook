'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ProviderButton } from '@/components/auth/provider-button';
import { Field } from '@/components/create/field';
import { TopBar } from '@/components/top-bar';

export function SignInScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ready = email.trim() && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
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
    <>
      <TopBar title="Sign in" backHref="/account" />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          <ProviderButton label="Continue with Apple" />
          <ProviderButton label="Continue with Google" />

          <div className="my-4 flex items-center gap-2.5">
            <div className="flex-1 border-t border-dashed border-rule" />
            <span className="font-mono text-[10px] text-ink-mute">or with an email</span>
            <div className="flex-1 border-t border-dashed border-rule" />
          </div>

          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          <div className="-mt-1 text-right font-mono text-[11px] text-ink-mute underline decoration-dashed underline-offset-[3px]">
            Forgotten it?
          </div>

          {error && <div className="mt-3.5 font-mono text-[12px] text-accent">{error}</div>}
        </div>

        <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
          <button
            type="submit"
            disabled={!ready || submitting}
            className={`w-full rounded-button border border-ink py-[13px] font-mono text-[13px] font-semibold ${
              ready ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
            }`}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </>
  );
}
