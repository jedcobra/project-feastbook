'use client';

import { useState } from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { TopBar } from '@/components/top-bar';

export default function AccountPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <>
      <TopBar title={mode === 'signin' ? 'Sign in' : 'Create account'} backHref="/me" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {mode === 'signin' ? (
          <SignInForm onSwitchToSignUp={() => setMode('signup')} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
        )}
      </div>
    </>
  );
}
