// Simple audio storage using IndexedDB via idb-keyval
// Stores File/Blob under stable keys and returns reusable object URLs
import { get, set, del } from 'idb-keyval';

export type AudioKey = 'end' | 'half' | 'oneMin';

const keyName = (k: AudioKey) => `audio:${k}`;
const urlCache = new Map<string, string>();

export async function saveAudio(k: AudioKey, blob: Blob) {
  await set(keyName(k), blob);
  // refresh cached URL
  const cacheKey = keyName(k);
  const prev = urlCache.get(cacheKey);
  if (prev) URL.revokeObjectURL(prev);
  const url = URL.createObjectURL(blob);
  urlCache.set(cacheKey, url);
  return { size: blob.size, type: blob.type };
}

export async function getAudioBlob(k: AudioKey): Promise<Blob | undefined> {
  const blob = await get<Blob>(keyName(k));
  return blob ?? undefined;
}

export async function getAudioUrl(k: AudioKey): Promise<string | undefined> {
  const cacheKey = keyName(k);
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;
  const blob = await getAudioBlob(k);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(cacheKey, url);
  return url;
}

export async function deleteAudio(k: AudioKey) {
  await del(keyName(k));
  const cacheKey = keyName(k);
  const prev = urlCache.get(cacheKey);
  if (prev) URL.revokeObjectURL(prev);
  urlCache.delete(cacheKey);
}
