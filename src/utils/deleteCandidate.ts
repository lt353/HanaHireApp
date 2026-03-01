import { supabase } from './supabase/client';

const BUCKET = 'candidate-videos';
const URL_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

/** Extracts the storage object path from a Supabase public URL, or null if not applicable. */
function extractStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null;
  const idx = publicUrl.indexOf(URL_PREFIX);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + URL_PREFIX.length));
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
  console.log('[deleteCandidate] raw URLs:', { videoUrl, videoThumbnailUrl });

  const paths = [
    extractStoragePath(videoUrl),
    extractStoragePath(videoThumbnailUrl),
  ].filter((p): p is string => p !== null);

  console.log('[deleteCandidate] extracted storage paths:', paths);

  if (paths.length > 0) {
    const storageResult = await supabase.storage.from(BUCKET).remove(paths);
    console.log('[deleteCandidate] storage.remove() result:', storageResult);
    if (storageResult.error) {
      console.error('Storage cleanup failed (continuing with row delete):', storageResult.error.message);
    }
  } else {
    console.log('[deleteCandidate] no storage paths to delete, skipping storage.remove()');
  }

  // 2. Delete the candidate row
  const { error: dbError } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);

  return { error: dbError?.message ?? null };
}
