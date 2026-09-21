import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Only the Supabase Admin API — which needs the service-role key, so it
// can only run server-side — can actually remove an auth.users row.
// queries.ts's deleteAccount() already erases the profile and everything
// that cascades from it on the client, but the person's email stays
// registered with Supabase Auth (and unusable for a fresh signup) unless
// this runs too. The bearer token proves who's asking, so this can only
// ever delete the account it belongs to, never an arbitrary one.
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ ok: false, reason: 'missing-token' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('account/delete: SUPABASE_SERVICE_ROLE_KEY is not set');
    return NextResponse.json({ ok: false, reason: 'not-configured' }, { status: 500 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error: userError } = await admin.auth.getUser(token);
  if (userError || !data.user) {
    return NextResponse.json({ ok: false, reason: 'invalid-session' }, { status: 401 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    console.error('account/delete: deleteUser', deleteError);
    return NextResponse.json({ ok: false, reason: 'delete-failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
