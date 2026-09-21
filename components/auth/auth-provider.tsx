'use client';

import type { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ProfileRow } from '@/lib/supabase/types';

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  refreshProfile: () => Promise<void>;
  signUp: (args: {
    email: string;
    password: string;
    name: string;
    handle: string;
  }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (args: { email: string; password: string }) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    setProfile(data as ProfileRow | null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp: AuthContextValue['signUp'] = async ({ email, password, name, handle }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, handle },
        // Without this, Supabase sends the confirmation link to whatever
        // Site URL is set in the project dashboard — which may point
        // nowhere real. Sending people back to a page this app actually
        // has means the link works regardless of that setting (as long as
        // this exact origin is also in the dashboard's redirect allow-list).
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) return { error: error.message, needsEmailConfirmation: false };
    // Set session/profile locally instead of waiting on the onAuthStateChange
    // listener — the caller navigates immediately after this resolves, and
    // AuthGate/OnboardingGate need `user`/`profile` current by then or they'll
    // bounce the fresh signup right back to the Landing screen.
    if (data.session) {
      setSession(data.session);
      await loadProfile(data.session.user.id);
    }
    return { error: null, needsEmailConfirmation: !data.session };
  };

  const signIn: AuthContextValue['signIn'] = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      setSession(data.session);
      await loadProfile(data.session.user.id);
    }
    return { error: null };
  };

  // Redirects the whole page to the provider's consent screen — there's no
  // session to set here on return, unlike signIn/signUp above. The
  // "error" case only ever fires if the redirect itself couldn't start
  // (e.g. the provider isn't enabled in Supabase); a successful call
  // navigates away before anything else in the caller would run.
  const signInWithProvider: AuthContextValue['signInWithProvider'] = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/oauth` },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/account');
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        user: session?.user ?? null,
        profile,
        refreshProfile,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
