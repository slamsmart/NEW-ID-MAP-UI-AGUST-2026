/**
 * Maintenance mode — menutup satu/beberapa route selagi fiturnya diperbaiki.
 *
 * Konfigurasi lewat env (tanpa sentuh kode):
 *   VITE_MAINTENANCE=on                  → kunci SELURUH situs
 *   VITE_MAINTENANCE_ROUTES=/data-pokmaswas,/verifikasi-data
 *                                        → kunci halaman tertentu saja
 *   VITE_MAINTENANCE_MESSAGE=...         → opsional, ganti teks penjelasan
 *   VITE_MAINTENANCE_ETA=...             → opsional, mis. "hari ini, 17.00 WIB"
 *
 * Kosong / tidak diisi = maintenance mati.
 * Vite membaca env saat start, jadi restart dev server setelah mengubahnya.
 *
 * CATATAN: selain env (build-time) ada saklar RUNTIME yang bisa digeser
 * verifikator dari halaman Verifikasi Data — disimpan di Convex
 * (tabel `siteConfig`). Keduanya digabung di `src/hooks/useMaintenance.ts`:
 * situs terkunci bila salah satu aktif. Env tetap berguna untuk menutup
 * route tertentu saja; saklar verifikator mengunci seluruh situs.
 */

const BYPASS_KEY = 'idmap:maintenance-bypass';

function parseRoutes(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item === '*' || item.startsWith('/') ? item : `/${item}`));
}

/** Saklar kunci seluruh situs: VITE_MAINTENANCE=on (sama dengan ROUTES=*). */
const WHOLE_SITE = ['on', '1', 'true', 'all', 'yes'].includes(
  ((import.meta.env.VITE_MAINTENANCE as string | undefined) ?? '').trim().toLowerCase(),
);

export const MAINTENANCE_ROUTES = WHOLE_SITE
  ? ['*']
  : parseRoutes(import.meta.env.VITE_MAINTENANCE_ROUTES as string | undefined);

export const MAINTENANCE_ENABLED = MAINTENANCE_ROUTES.length > 0;

export const MAINTENANCE_MESSAGE =
  (import.meta.env.VITE_MAINTENANCE_MESSAGE as string | undefined)?.trim() ||
  'Halaman ini sementara ditutup karena datanya sedang dirapikan. Data yang sudah masuk tidak terhapus — silakan kembali beberapa saat lagi.';

export const MAINTENANCE_ETA =
  (import.meta.env.VITE_MAINTENANCE_ETA as string | undefined)?.trim() || '';

/**
 * Bypass untuk developer/penguji: buka URL apa pun dengan `?maintenance=off`
 * (mati lagi dengan `?maintenance=on`). Disimpan di localStorage per browser.
 */
export function hasMaintenanceBypass(): boolean {
  try {
    return localStorage.getItem(BYPASS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMaintenanceBypass(active: boolean): void {
  try {
    if (active) localStorage.setItem(BYPASS_KEY, '1');
    else localStorage.removeItem(BYPASS_KEY);
  } catch {
    /* localStorage diblokir — abaikan */
  }
}

/** Baca `?maintenance=off|on` dari URL dan simpan pilihannya. */
export function syncMaintenanceBypassFromUrl(search: string): void {
  const value = new URLSearchParams(search).get('maintenance');
  if (value === 'off') setMaintenanceBypass(true);
  else if (value === 'on') setMaintenanceBypass(false);
}

/** Nama fitur yang enak dibaca, untuk banner pemberitahuan di landing page. */
const ROUTE_LABELS: Record<string, string> = {
  '*': 'Seluruh layanan',
  '/': 'Halaman Utama',
  '/peta': 'Peta Interaktif',
  '/pedoman-teknis': 'Pedoman Teknis',
  '/dashboard': 'Dashboard',
  '/ekosistem': 'Kondisi Ekosistem',
  '/input-lapangan': 'Input Data Lapangan',
  '/rekomendasi-lokasi': 'Potensi & Rekomendasi',
  '/vegetasi-mangrove': 'Monitoring Vegetasi',
  '/pendaratan-penyu': 'Titik Pendaratan Penyu',
  '/pembibitan-mangrove': 'Pembibitan Mangrove',
  '/lingkungan': 'Analisis Lingkungan',
  '/tekanan-sosial': 'Tekanan Sosial',
  '/laporan': 'Laporan & Analitik',
  '/laporan-pengunjung': 'Laporan Pengunjung',
  '/verifikasi-data': 'Verifikasi Data',
  '/data-pokmaswas': 'Data Pokmaswas',
  '/mangrove-nasional': 'Mangrove Nasional',
};

/** Label enak dibaca untuk satu route (dipakai juga oleh useMaintenance). */
export function routeLabel(route: string): string {
  return labelFor(route);
}

function labelFor(route: string): string {
  if (ROUTE_LABELS[route]) return ROUTE_LABELS[route];
  return route
    .replace(/^\//, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Daftar nama fitur yang sedang ditutup, untuk ditampilkan ke pengunjung. */
export function maintenanceLabels(): string[] {
  return MAINTENANCE_ROUTES.map(labelFor);
}

/** True bila pathname termasuk route yang sedang ditutup. */
export function isRouteUnderMaintenance(pathname: string): boolean {
  if (!MAINTENANCE_ENABLED) return false;
  return MAINTENANCE_ROUTES.some((route) => {
    if (route === '*') return true;
    if (pathname === route) return true;
    const prefix = route.endsWith('/') ? route : `${route}/`;
    return pathname.startsWith(prefix);
  });
}
