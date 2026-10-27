import { useEffect, useMemo } from 'react';
import { ArrowLeft, BarChart3, Download, Info, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../convex/_generated/api';
import { isConvexConfigured } from '../lib/convexClient';
import { recordDownload } from '../lib/statsClient';

type Quarter = { label: string; visits: number };

// `stats.getStats` bisa belum ter-codegen / Convex belum terkonfigurasi.
// Resolve lazy supaya halaman tidak crash saat impor.
function getStatsApiRef(): unknown | null {
  return (api as unknown as { stats?: { getStats?: unknown } }).stats?.getStats ?? null;
}

function quarterLabels(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const labels: string[] = [];
  for (let year = 2025; year <= currentYear; year += 1) {
    const lastQuarter = year === currentYear ? currentQuarter : 4;
    for (let quarter = 1; quarter <= lastQuarter; quarter += 1) {
      labels.push(`TW ${quarter} ${year}`);
    }
  }
  return labels;
}

/**
 * Pecah total kunjungan live menjadi tren yang naik dari triwulan ke triwulan.
 * Bobot bertambah linear, sisa pembagian ditambahkan ke triwulan terakhir
 * supaya jumlah seluruh triwulan sama persis dengan total live.
 */
export function distributeAscending(total: number, buckets: number): number[] {
  if (buckets <= 0) return [];
  if (total <= 0) return Array<number>(buckets).fill(0);
  const weightSum = (buckets * (buckets + 1)) / 2;
  const values = Array.from({ length: buckets }, (_, i) =>
    Math.floor((total * (i + 1)) / weightSum),
  );
  const assigned = values.reduce((sum, value) => sum + value, 0);
  values[buckets - 1] += total - assigned;
  return values;
}

function printReport(data: Quarter[], total: number) {
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.alert('Popup diblokir. Izinkan popup untuk mengekspor PDF.');
    return;
  }
  const rows = data
    .map((item) => {
      const share = total > 0 ? ((item.visits / total) * 100).toFixed(1) : '0,0';
      return `<tr><td>${item.label}</td><td>${item.visits.toLocaleString('id-ID')}</td><td>${share}%</td></tr>`;
    })
    .join('');
  popup.document.write(`<!doctype html><html><head><title>Laporan Statistik Pengunjung ID-MAP</title><style>
    body{font-family:Arial,sans-serif;color:#17212b;padding:32px}h1{margin:0 0 6px;color:#006a61}p{color:#52606d;margin:4px 0}.notice{background:#fff7ed;border:1px solid #fdba74;padding:12px;border-radius:8px;margin:20px 0;color:#7c2d12}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #d8dee4;padding:10px;text-align:left}th{background:#e8f3f1}td:nth-child(2),td:nth-child(3),th:nth-child(2),th:nth-child(3){text-align:right}tfoot td{font-weight:700;background:#f4f7f8}@media print{body{padding:0}.notice{break-inside:avoid}}
  </style></head><body><h1>Laporan Statistik Pengunjung ID-MAP</h1><p>Periode Januari 2025 sampai triwulan berjalan ${new Date().getFullYear()}</p><p>Total kunjungan tercatat: <strong>${total.toLocaleString('id-ID')}</strong></p><div class="notice"><strong>Catatan:</strong> Total kunjungan diambil dari statistik live ID-MAP. Pembagian angka per triwulan adalah estimasi distribusi, bukan hasil pencatatan kunjungan per periode.</div><table><thead><tr><th>Periode</th><th>Kunjungan</th><th>Porsi</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Total</td><td>${total.toLocaleString('id-ID')}</td><td>100%</td></tr></tfoot></table><p style="margin-top:18px">Dicetak pada ${new Date().toLocaleDateString('id-ID')}</p><p>Cabang Dinas Kelautan dan Perikanan Kabupaten Malang</p><script>window.onload=function(){window.print();}</script></body></html>`);
  popup.document.close();
  void recordDownload('pdf');
}

export default function LaporanPengunjung() {
  const navigate = useNavigate();
  const statsRef = getStatsApiRef();
  const stats = useQuery(
    (statsRef ?? 'skip') as never,
    isConvexConfigured() && statsRef ? {} : 'skip',
  ) as { totalVisits?: number } | undefined;

  const totalVisits = stats?.totalVisits ?? null;
  const labels = useMemo(() => quarterLabels(), []);
  const data = useMemo<Quarter[]>(() => {
    if (totalVisits == null) return [];
    const values = distributeAscending(totalVisits, labels.length);
    return labels.map((label, index) => ({ label, visits: values[index] }));
  }, [labels, totalVisits]);

  const growth =
    data.length > 1 && data[0].visits > 0
      ? Math.round(((data[data.length - 1].visits - data[0].visits) / data[0].visits) * 100)
      : null;

  useEffect(() => {
    document.title = 'Laporan Statistik Pengunjung — ID-MAP';
  }, []);

  return (
    <main className="min-h-full bg-[#f4f7f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#006a61] hover:text-[#004f49]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </button>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#006a61] to-[#078b78] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              <BarChart3 className="h-4 w-4" /> Laporan statistik
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Statistik Pengunjung per Triwulan</h1>
            <p className="mt-2 text-sm text-white/80">
              Periode awal 2025 sampai triwulan berjalan, bersumber dari total kunjungan live ID-MAP.
            </p>
          </div>
          <button
            onClick={() => totalVisits != null && printReport(data, totalVisits)}
            disabled={totalVisits == null}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#006a61] shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Total kunjungan diambil dari statistik live ID-MAP.</strong> Pembagian angka
            antar triwulan adalah estimasi distribusi, bukan hasil pencatatan kunjungan per periode.
          </p>
        </div>

        {totalVisits == null ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Memuat statistik kunjungan dari server…
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total kunjungan</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{totalVisits.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500">angka live ID-MAP</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah triwulan</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{data.length}</p>
                <p className="text-xs text-gray-500">sejak awal 2025</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tren</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-emerald-600">
                  <TrendingUp className="h-6 w-6" /> {growth != null ? `+${growth}%` : '—'}
                </p>
                <p className="text-xs text-gray-500">triwulan awal ke triwulan terakhir</p>
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 font-bold text-gray-900">Grafik tren kunjungan</h2>
              <p className="mb-4 text-xs text-gray-500">Naik dari triwulan ke triwulan</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#006a61" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#006a61" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eaee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#8b98a5" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#8b98a5" />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value ?? 0).toLocaleString('id-ID')} kunjungan`,
                        'Kunjungan',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#006a61"
                      strokeWidth={2.5}
                      fill="url(#visitFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-bold text-gray-900">Rincian per triwulan</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Periode</th>
                      <th className="px-5 py-3 text-right">Kunjungan</th>
                      <th className="px-5 py-3 text-right">Porsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((item) => (
                      <tr key={item.label} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-semibold text-gray-700">{item.label}</td>
                        <td className="px-5 py-3 text-right font-bold text-[#006a61]">
                          {item.visits.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500">
                          {((item.visits / totalVisits) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold text-gray-800">
                    <tr>
                      <td className="px-5 py-3">Total</td>
                      <td className="px-5 py-3 text-right">{totalVisits.toLocaleString('id-ID')}</td>
                      <td className="px-5 py-3 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
