/**
 * statsClient — wrapper tipis di atas Convex `stats.*` mutations.
 *
 * Best-effort: kalau Convex tidak terkonfigurasi atau call gagal, kita
 * tetap lanjut tanpa error (telemetri bukan critical path).
 *
 * Anti-double-count: visit hanya direkam SEKALI per page-load (key
 * sessionStorage) untuk hindari spam saat React StrictMode mount ulang.
 */
import { convex, isConvexConfigured } from './convexClient';
import { api } from '../../convex/_generated/api';

// LAZY resolve — `api.stats` mungkin masih undefined sebelum user pertama
// kali jalankan `npx convex dev` (yang men-trigger codegen). Jangan akses
// property di top-level karena akan throw saat module di-import → crash app.
function statsApi() {
  return (api as unknown as {
    stats?: {
      recordVisit?: unknown;
      recordDownload?: unknown;
      getStats?: unknown;
    };
  }).stats;
}

const VISIT_KEY = 'idmap_visit_logged';

export async function recordVisit() {
  if (!isConvexConfigured()) return;
  const s = statsApi();
  if (!s?.recordVisit) return;
  try {
    if (sessionStorage.getItem(VISIT_KEY) === '1') return;
    sessionStorage.setItem(VISIT_KEY, '1');
    await convex.mutation(s.recordVisit as any, {});
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[stats] recordVisit gagal:', err);
  }
}

export type DownloadKind = 'pdf' | 'geojson' | 'csv';

export async function recordDownload(kind: DownloadKind) {
  if (!isConvexConfigured()) return;
  const s = statsApi();
  if (!s?.recordDownload) return;
  try {
    await convex.mutation(s.recordDownload as any, { kind });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[stats] recordDownload gagal:', err);
  }
}
