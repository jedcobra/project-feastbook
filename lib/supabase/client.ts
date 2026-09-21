import { createClient } from '@supabase/supabase-js';

// A plain anon-key client — safe to import from both Client Components and
// Server Components (e.g. the public share page's SSR fetch), since it
// never touches cookies or localStorage on its own. Auth state (session in
// localStorage) is only ever read/written from the browser, via
// AuthProvider — nothing server-side calls the auth methods on this.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
