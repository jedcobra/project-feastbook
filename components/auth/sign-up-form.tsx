'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FormField } from '@/components/form-field';

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const normalizedHandle = handle.trim().toLowerCase();
    const { error: signUpError, needsEmailConfirmation } = await signUp({
      email: email.trim(),
      password,
      name: name.trim(),
      handle: normalizedHandle,
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmationSent(true);
    } else {
      router.push('/me');
    }
  };

  if (confirmationSent) {
    return (
      <div className="border border-dashed border-rule p-4 text-center font-mono text-[13px] leading-relaxed text-ink-mute">
        Check <span className="text-ink">{email}</span> for a confirmation link, then come back
        and sign in.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField
        label="Name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jamie Oliver"
      />
      <FormField
        label="Handle"
        type="text"
        required
        pattern="[a-z0-9._]+"
        title="Lowercase letters, numbers, dots, and underscores only"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="jamie.cooks"
      />
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
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
      />

      {error && <div className="font-mono text-[12px] text-accent">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-button border border-ink bg-ink py-2.5 font-mono text-[13px] font-semibold text-cream disabled:opacity-50"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>

      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
      >
        Already have an account? Sign in
      </button>
    </form>
  );
}
