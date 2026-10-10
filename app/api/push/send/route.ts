import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// web-push needs Node's crypto, not available on the Edge runtime.
export const runtime = 'nodejs';

const KIND_VERB: Record<string, string> = {
  note: 'noted on',
  reply: 'replied to your note on',
  cooked: 'cooked',
  follow: 'started following you',
  digest: 'sent you a weekly digest',
  message: 'sent you a message',
  kiss: 'sent a kiss to your photo of',
  photo_comment: 'commented on your photo of',
};

function unwrapOne<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

// Sends the push for one already-written notification row — the caller
// names it by id rather than supplying title/body/recipient directly, so
// nobody can use this route to push arbitrary text to an arbitrary
// person: the bearer token has to belong to the same profile the row's
// actor_id already says triggered it, and the message text itself is
// always rebuilt here from the fixed per-kind templates above, the same
// ones the in-app Notifications screen uses.
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ ok: false, reason: 'missing-token' }, { status: 401 });
  }

  let notificationId = '';
  try {
    const body = await request.json();
    notificationId = typeof body?.notificationId === 'string' ? body.notificationId : '';
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid-body' }, { status: 400 });
  }
  if (!notificationId) {
    return NextResponse.json({ ok: false, reason: 'invalid-body' }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!serviceKey || !vapidPublicKey || !vapidPrivateKey) {
    console.error('push/send: missing SUPABASE_SERVICE_ROLE_KEY / VAPID keys');
    return NextResponse.json({ ok: false, reason: 'not-configured' }, { status: 500 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ ok: false, reason: 'invalid-session' }, { status: 401 });
  }

  const { data: notifRow, error: notifError } = await admin
    .from('notifications')
    .select(
      'recipient_id, actor_id, kind, recipe_id, conversation_id, cook_photo_id, actor:profiles!actor_id(handle), recipe:recipes(title)',
    )
    .eq('id', notificationId)
    .maybeSingle();
  if (notifError || !notifRow) {
    return NextResponse.json({ ok: false, reason: 'not-found' }, { status: 404 });
  }

  const { data: callerProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (!callerProfile || callerProfile.id !== notifRow.actor_id) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }

  const { data: subs, error: subsError } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', notifRow.recipient_id);
  if (subsError) {
    console.error('push/send: fetch subscriptions', subsError);
    return NextResponse.json({ ok: false, reason: 'lookup-failed' }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  webpush.setVapidDetails('mailto:support@specialspoon.app', vapidPublicKey, vapidPrivateKey);

  const actorHandle = unwrapOne(notifRow.actor as { handle: string } | { handle: string }[] | null)?.handle;
  const actorName = actorHandle ? `@${actorHandle}` : 'Someone';
  const recipeTitle = unwrapOne(notifRow.recipe as { title: string } | { title: string }[] | null)?.title;
  const verb = KIND_VERB[notifRow.kind] ?? 'did something on';
  const body = recipeTitle ? `${actorName} ${verb} ${recipeTitle}` : `${actorName} ${verb}`;
  const url = notifRow.cook_photo_id
    ? `/me?photo=${notifRow.cook_photo_id}`
    : notifRow.conversation_id
      ? `/messages/${notifRow.conversation_id}`
      : notifRow.recipe_id
        ? `/recipe/${notifRow.recipe_id}`
        : '/notifications';
  const payload = JSON.stringify({ title: 'Special Spoon', body, url });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number } | null)?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // The browser dropped this subscription (uninstalled, cleared
        // data, ...) — stop trying it instead of erroring every time.
        await admin.from('push_subscriptions').delete().eq('id', sub.id);
      } else {
        console.error('push/send: sendNotification', err);
      }
    }
  }
  return NextResponse.json({ ok: true, sent });
}
