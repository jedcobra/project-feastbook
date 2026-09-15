import { createClient } from '@supabase/supabase-js';

// Client-side only: the app ships as a static export (see next.config.mjs),
// so auth runs entirely in the browser with the session in localStorage
// rather than via server-rendered cookies.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
