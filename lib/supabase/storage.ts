import { supabase } from '@/lib/supabase/client';

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB — a phone photo, not a scan.

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
};

export type PhotoKind = 'recipe-cover' | 'recipe-step' | 'cooked';

// Uploads to the public `photos` bucket under the uploader's own profile-id
// folder — storage RLS (see 0014_photos.sql) only lets someone write inside
// their own folder, so `profileId` here must be the signed-in viewer's own.
export async function uploadPhoto(
  profileId: string,
  file: File,
  kind: PhotoKind,
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith('image/')) {
    return { error: 'That’s not an image.' };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: 'That photo’s too big — try one under 8MB.' };
  }
  const ext = EXT_BY_TYPE[file.type] ?? file.name.split('.').pop() ?? 'jpg';
  const path = `${profileId}/${kind}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('photos').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error('uploadPhoto', error);
    return { error: "Couldn't upload that — try again." };
  }
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return { url: data.publicUrl };
}
