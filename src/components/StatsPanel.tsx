/**
 * StatsPanel
 * — Menampilkan total visit, total download (per format), dan total user
 *   dari Convex `stats.getStats`. Aman ditampilkan kalau Convex tidak ter-
 *   konfigurasi: panel akan render placeholder graceful.
 * — Dipakai di Dashboard, dibungkus role-check (admin/verifikator only).
 */
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Eye, Download, Users, FileText, Database } from 'lucide-react';
import { isConvexConfigured } from '../lib/convexClient';

// `stats.*` mungkin belum ter-codegen (sebelum user jalankan `npx convex dev`
// untuk pertama kali). Resolve LAZY di runtime — kalau undefined, fallback
// ke null dan UI render placeholder. JANGAN akses property di top-level
// module karena akan throw saat impor → crash seluruh halaman.
function getStatsApiRef(): any | null {
  const ref = (api as unknown as { stats?: { getStats?: any } }).stats?.getStats;
  return ref ?? null;
}

interface StatsResult {
  totalVisits: number;
  totalDownloads: number;
  downloadsPDF: number;
  downloadsGeoJSON: number;
  downloadsCSV: number;
  totalUsers: number;
  updatedAt?: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + '20', color: accent }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const ref = getStatsApiRef();
  // useQuery diizinkan menerima 'skip' kalau Convex tidak siap — tetap aman
  // di server-side render dan saat ref belum ada.
  const stats = useQuery(
    ref ?? ('skip' as any),
    isConvexConfigured() && ref ? {} : 'skip',
  ) as StatsResult | undefined;

  if (!isConvexConfigured()) {
    return (
      <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <Database className="inline w-4 h-4 mr-1.5 -mt-0.5" />
        Convex belum terkonfigurasi — statistik tidak tersedia.
        Tambahkan <code className="bg-amber-100 px-1 rounded">VITE_CONVEX_URL</code> di
        <code className="bg-amber-100 px-1 rounded ml-1">.env.development.local</code>.
      </div>
    );
  }

  if (!ref) {
    return (
      <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <Database className="inline w-4 h-4 mr-1.5 -mt-0.5" />
        Statistik akan aktif setelah deploy schema baru. Jalankan{' '}
        <code className="bg-amber-100 px-1 rounded">npx convex dev</code> sekali
        agar table <code className="bg-amber-100 px-1 rounded">siteStats</code> &amp;{' '}
        functions <code className="bg-amber-100 px-1 rounded">stats.*</code> ter-deploy.
      </div>
    );
  }

  if (!stats) {
    // Loading skeleton
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 h-[88px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const lastUpdate = stats.updatedAt
    ? new Date(stats.updatedAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Statistik Penggunaan</h3>
          <p className="text-[11px] text-gray-500">
            Update terakhir: {lastUpdate}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Eye}
          label="Kunjungan"
          value={stats.totalVisits}
          hint="Sesi peta interaktif"
          accent="#0ea5e9"
        />
        <StatCard
          icon={Download}
          label="Total Unduhan"
          value={stats.totalDownloads}
          hint="Semua format"
          accent="#10b981"
        />
        <StatCard
          icon={Users}
          label="User Terdaftar"
          value={stats.totalUsers}
          hint="Profil tersinkron"
          accent="#8b5cf6"
        />
        <StatCard
          icon={FileText}
          label="PDF / GeoJSON / CSV"
          value={`${stats.downloadsPDF} / ${stats.downloadsGeoJSON} / ${stats.downloadsCSV}`}
          hint="Per format"
          accent="#f59e0b"
        />
      </div>
    </div>
  );
}
