/**
 * Offline queue for task logs.
 * Stores pending task log submissions when offline and syncs when back online.
 */

const OFFLINE_QUEUE_KEY = 'tasks-pop-offline-queue';
const MAX_PHOTO_BASE64_LEN = 1.4 * 1024 * 1024; // ~1MB image as base64

export interface QueuedTaskLog {
  task_id: number;
  status: string;
  observation?: string;
  photo_base64?: string;
  photo_mime?: string;
  media_base64?: { base64: string; mime: string }[];
  queued_at: string;
}

export function fileToBase64(file: File): Promise<{ base64: string; mime: string } | null> {
  return new Promise((resolve) => {
    if (file.size > 1024 * 1024) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result?.split(',') ?? [];
      const mime = header?.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
      if (base64 && base64.length <= MAX_PHOTO_BASE64_LEN) resolve({ base64, mime });
      else resolve(null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string, mimeType = 'image/jpeg'): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export function getOfflineQueue(): QueuedTaskLog[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: Omit<QueuedTaskLog, 'queued_at'>): void {
  const queue = getOfflineQueue();
  queue.push({ ...item, queued_at: new Date().toISOString() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromOfflineQueue(index: number): void {
  const queue = getOfflineQueue();
  queue.splice(index, 1);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export function isOnline(): boolean {
  return navigator.onLine;
}
