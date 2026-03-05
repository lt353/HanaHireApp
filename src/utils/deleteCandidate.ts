import { supabase } from './supabase/client';

const BUCKET = 'candidate-videos';
const URL_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

/** Extracts the storage object path from a Supabase public URL, or null if not applicable. */
export function extractStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  const withoutQuery = publicUrl.split('?')[0];
  const idx = withoutQuery.indexOf(URL_PREFIX);
  if (idx === -1) return null;
  return decodeURIComponent(withoutQuery.slice(idx + URL_PREFIX.length));
}

/**
 * Removes storage objects by their public URLs (best-effort).
 * Use when replacing a candidate's video/thumbnail so old files are deleted.
 */
export async function removeStorageFilesFromUrls(
  ...urls: (string | null | undefined)[]
): Promise<void> {
  const paths = urls.map(extractStoragePath).filter((p): p is string => p !== null && p !== '');
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error('[removeStorageFilesFromUrls]', error.message);
}

/**
 * Deletes a candidate's storage files (video + thumbnail) then removes the
 * candidate row. Storage cleanup is best-effort — the row is deleted even if
 * the storage call fails, so orphaned files never block the delete.
 *
 * Usage:
 *   const { error } = await deleteCandidate(candidateId, videoUrl, thumbnailUrl);
 */
export async function deleteCandidate(
  candidateId: number,
  videoUrl: string | null | undefined,
  videoThumbnailUrl: string | null | undefined,
): Promise<{ error: string | null }> {
  // 1. Delete storage files (best-effort, non-blocking)
  await removeStorageFilesFromUrls(videoUrl, videoThumbnailUrl);

  // 2. Delete the candidate row
  const { error: dbError } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);

  return { error: dbError?.message ?? null };
}
