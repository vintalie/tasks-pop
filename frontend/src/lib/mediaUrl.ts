const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : `${window.location.origin}/api`);
const STORAGE_BASE = API_BASE.startsWith('http') ? API_BASE.replace(/\/api\/?$/, '') : null;

export function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (import.meta.env.DEV && !import.meta.env.VITE_API_URL && window.location.port === '5173') {
      try {
        const u = new URL(url);
        if (u.port === '8000' || u.hostname === 'localhost') {
          return u.pathname + (u.search || '');
        }
      } catch {
        /* ignore */
      }
    }
    return url;
  }
  if (STORAGE_BASE) {
    const base = STORAGE_BASE.endsWith('/') ? STORAGE_BASE.slice(0, -1) : STORAGE_BASE;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return path;
}

function extractUrl(item: Record<string, unknown>): string {
  const url = item.url ?? item.path ?? item.secure_url ?? item.src;
  return typeof url === 'string' ? url : '';
}

export function getMediaFromLog(log: {
  media?: unknown[];
  media_paths?: unknown[];
  photo_url?: string | null;
}): { url: string; type: 'image' | 'video' }[] {
  const raw = log.media ?? (log as { media_paths?: unknown[] }).media_paths;
  if (Array.isArray(raw) && raw.length > 0) {
    const result = raw
      .filter((m): m is Record<string, unknown> => m != null && typeof m === 'object')
      .map((m) => {
        const url = resolveMediaUrl(extractUrl(m));
        const type = (String(m.type).toLowerCase() === 'video' ? 'video' : 'image') as 'image' | 'video';
        return { url, type };
      })
      .filter((m) => m.url.length > 0);
    return result;
  }
  const photoUrl = log.photo_url;
  if (photoUrl && typeof photoUrl === 'string') {
    const url = resolveMediaUrl(photoUrl);
    if (url) {
      return [{ url, type: 'image' as const }];
    }
  }
  return [];
}
