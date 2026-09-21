'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ProviderButton } from '@/components/auth/provider-button';
import { Field } from '@/components/create/field';
import { Label } from '@/components/label';
import { TopBar } from '@/components/top-bar';
import { checkHandleAvailable } from '@/lib/supabase/queries';

export function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [taken, setTaken] = useState(false);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const normalized = handle.trim().toLowerCase();
    if (!normalized) {
      setTaken(false);
      return;
    }
    setCheckingHandle(true);
    const timer = setTimeout(async () => {
      const available = await checkHandleAvailable(normalized);
      setTaken(!available);
      setCheckingHandle(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [handle]);

  const ready = name.trim() && handle.trim() && email.trim() && password.length >= 8 && !taken && !checkingHandle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setError(null);
    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp({
      email: email.trim(),
      password,
      name: name.trim(),
      handle: handle.trim().toLowerCase(),
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmationSent(true);
    } else {
      router.push('/onboarding');
    }
  };

  if (confirmationSent) {
    return (
      <>
        <TopBar title="Create an account" backHref="/account" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
            Check <span className="text-ink">{email}</span> for a confirmation link. Tap it to
            finish creating your account — you&rsquo;ll land signed in.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Create an account" backHref="/account" />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          <ProviderButton label="Continue with Apple" />
          <ProviderButton label="Continue with Google" />

          <div className="my-4 flex items-center gap-2.5">
            <div className="flex-1 border-t border-dashed border-rule" />
            <span className="font-mono text-[10px] text-ink-mute">or with an email</span>
            <div className="flex-1 border-t border-dashed border-rule" />
          </div>

          <Field label="Your name" value={name} onChange={setName} placeholder="Maya Osei" mono={false} size={18} />

          <div className="mb-3.5">
            <div className="mb-0.5 flex items-baseline gap-1.5">
              <Label className="text-[9px]">Handle</Label>
              {handle.trim() && !checkingHandle && (
                <span
                  className={`rounded px-1 font-mono text-[9px] border ${
                    taken ? 'border-accent text-accent' : 'border-accent-2 text-accent-2'
                  }`}
                >
                  {taken ? 'taken' : 'free'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <span className="font-mono text-[13px] text-ink-mute">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="mayacooks"
                className="min-w-0 flex-1 border-none bg-transparent py-1.5 font-mono text-[13px] text-ink outline-none"
              />
            </div>
            <div className={`border-b ${taken ? 'border-solid border-accent' : 'border-dashed border-rule'}`} />
            <div className="mt-1 font-mono text-[10px] text-ink-mute">
              {taken ? 'Someone has that one. Try another.' : 'This is how people find your cookbook.'}
            </div>
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
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            hint={password && password.length < 8 ? `${8 - password.length} more to go` : undefined}
          />

          {error && <div className="font-mono text-[12px] text-accent">{error}</div>}

          <div className="mt-[18px] border-t border-dashed border-rule pt-3.5 font-mono text-[10px] leading-relaxed text-ink-mute">
            By creating an account you agree to the terms and privacy notice. Your cookbook is
            private until you publish something.
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
          <button
            type="submit"
            disabled={!ready || submitting}
            className={`w-full rounded-button border border-ink py-[13px] font-mono text-[13px] font-semibold ${
              ready ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
            }`}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>
    </>
  );
}
