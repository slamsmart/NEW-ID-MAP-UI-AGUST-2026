/**
 * StatsPanel
 * — Menampilkan total visit, total download (per format), dan total user
 *   dari Convex `stats.getStats`. Aman ditampilkan kalau Convex tidak ter-
 *   konfigurasi: panel akan render placeholder graceful.
 * — Dipakai di Dashboard, dibungkus role-check (admin/verifikator only).
 */
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Eye, Download, Users, FileText, Database, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { isConvexConfigured } from '../lib/convexClient';

// `stats.*` mungkin belum ter-codegen (sebelum user jalankan `npx convex dev`
// untuk pertama kali). Resolve LAZY di runtime — kalau undefined, fallback
// ke null dan UI render placeholder. JANGAN akses property di top-level
// module karena akan throw saat impor → crash seluruh halaman.
function getStatsApiRef(): any | null {
  const ref = (api as unknown as { stats?: { getStats?: any } }).stats?.getStats;
  return ref ?? null;
}

function getStatsDetailApiRef(): any | null {
  const ref = (api as unknown as { stats?: { getStatsDetail?: any } }).stats?.getStatsDetail;
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

interface StatsDetailResult {
  byMonth: Array<{ key: string; label: string; visits: number; downloads: number }>;
  byQuarter: Array<{ key: string; label: string; visits: number; downloads: number }>;
  totalUsers: number;
  updatedAt?: number;
}

function ChartCard({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Array<{ label: string; visits: number; downloads: number }>;
}) {
  const totalVisits = data.reduce((s, d) => s + d.visits, 0);
  const totalDownloads = data.reduce((s, d) => s + d.downloads, 0);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-gray-800">{title}</h4>
          <p className="text-[11px] text-gray-500">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-[10px] font-semibold">
          <span className="text-sky-600">Kunjungan {totalVisits.toLocaleString('id-ID')}</span>
          <span className="text-emerald-600">Unduhan {totalDownloads.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} interval={0} angle={-30} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: 'rgba(14,165,233,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="visits" name="Kunjungan" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar dataKey="downloads" name="Unduhan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const ref = getStatsApiRef();
  const detailRef = getStatsDetailApiRef();
  // useQuery diizinkan menerima 'skip' kalau Convex tidak siap — tetap aman
  // di server-side render dan saat ref belum ada.
  const stats = useQuery(
    ref ?? ('skip' as any),
    isConvexConfigured() && ref ? {} : 'skip',
  ) as StatsResult | undefined;
  const detail = useQuery(
    detailRef ?? ('skip' as any),
    isConvexConfigured() && detailRef ? {} : 'skip',
  ) as StatsDetailResult | undefined;

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

  const handleExportPDF = () => {
    const now = new Date();
    const dateStr = now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8"/>
        <title>Laporan Statistik Visitor - ID-MAP</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #191c1e; }
          .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #006a61; padding-bottom: 20px; }
          .header h1 { font-size: 22px; font-weight: 700; color: #003527; }
          .header p { font-size: 13px; color: #404944; margin-top: 4px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
          .stat-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
          .stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; font-weight: 600; }
          .stat-card .value { font-size: 28px; font-weight: 600; color: #111827; margin-top: 4px; }
          .stat-card .hint { font-size: 12px; color: #9ca3af; margin-top: 2px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan Statistik Visitor</h1>
          <p>ID-MAP — Integrasi Data Mangrove & Pesisir</p>
          <p>Wilker Cabdin KP Kab. Malang</p>
          <p style="margin-top:8px;font-size:12px;color:#006a61;font-weight:600;">Dicetak: ${dateStr}</p>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">Total Kunjungan</div>
            <div class="value">${stats.totalVisits.toLocaleString('id-ID')}</div>
            <div class="hint">Semua halaman (termasuk kunjungan berulang)</div>
          </div>
          <div class="stat-card">
            <div class="label">User Terdaftar</div>
            <div class="value">${stats.totalUsers.toLocaleString('id-ID')}</div>
            <div class="hint">Profil tersinkron via Clerk</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Unduhan</div>
            <div class="value">${stats.totalDownloads.toLocaleString('id-ID')}</div>
            <div class="hint">Semua format (PDF + GeoJSON + CSV)</div>
          </div>
          <div class="stat-card">
            <div class="label">Rincian Unduhan</div>
            <div class="value" style="font-size:18px;">PDF: ${stats.downloadsPDF} · GeoJSON: ${stats.downloadsGeoJSON} · CSV: ${stats.downloadsCSV}</div>
            <div class="hint">Per format file</div>
          </div>
        </div>
        <div class="footer">
          <p>Dokumen ini dicetak dari sistem ID-MAP — Integrasi Data Mangrove dan Pesisir</p>
          <p>Cabang Dinas Kelautan dan Perikanan Kab. Malang · ${now.getFullYear()}</p>
        </div>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Statistik Penggunaan</h3>
          <p className="text-[11px] text-gray-500">
            Update terakhir: {lastUpdate}
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 bg-[#071520] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0d404f] transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Export PDF
        </button>
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

      {/* Grafik detail per bulan & triwulan (admin/verifikator) */}
      {detailRef ? (
        detail ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ChartCard
              title="Kunjungan & Unduhan per Bulan"
              subtitle="12 bulan terakhir · semua kunjungan dihitung (IP sama tetap dicatat)"
              data={detail.byMonth}
            />
            <ChartCard
              title="Kunjungan & Unduhan per Triwulan"
              subtitle="8 triwulan terakhir · TW1–TW4 per tahun"
              data={detail.byQuarter}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <BarChart3 className="w-4 h-4" />
            Memuat detail statistik per bulan & triwulan…
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <BarChart3 className="w-4 h-4" />
          Grafik per bulan/triwulan aktif setelah fungsi{' '}
          <code className="bg-amber-100 px-1 rounded">stats.getStatsDetail</code> ter-deploy
          (jalankan <code className="bg-amber-100 px-1 rounded">npx convex dev</code> sekali).
        </div>
      )}
    </div>
  );
}
