import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import {
  ShieldCheck, Search, Filter, Download, ArrowUpDown, TreePine,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Info, MapPin, Waves,
} from 'lucide-react';
import {
  mangroveKabkota, kabkotaSummary, getKondisiColor, getAbrasiBadge,
  type KondisiMangrove,
} from '../data/mangroveKabkota';
import { PMN_TOTAL_HA } from '../data/pmnData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SortKey = 'kabKota' | 'provinsi' | 'luasPMN2025' | 'perubahan' | 'kondisi' | 'tingkatAbrasi';
type SortDir = 'asc' | 'desc';

const KONDISI_ORDER: KondisiMangrove[] = ['Sangat Baik', 'Baik', 'Sedang', 'Kritis', 'Sangat Kritis'];

const KONDISI_CHART_COLOR: Record<KondisiMangrove, string> = {
  'Sangat Baik': '#059669',
  'Baik': '#16a34a',
  'Sedang': '#ca8a04',
  'Kritis': '#ea580c',
  'Sangat Kritis': '#dc2626',
};

const PULAU_OPTIONS = ['Semua Pulau', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Maluku', 'Papua', 'Bali & Nusa Tenggara'];

interface TooltipPayloadEntry {
  value?: number;
}

interface CustomTooltipBarProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function PerubahanBadge({ delta }: { delta: number }) {
  if (delta > 0) return (
    <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
      <TrendingUp className="w-3 h-3" />+{delta.toLocaleString('id-ID')} ha
    </span>
  );
  if (delta < 0) return (
    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
      <TrendingDown className="w-3 h-3" />{delta.toLocaleString('id-ID')} ha
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <Minus className="w-3 h-3" />Stabil
    </span>
  );
}

function AbrasiBadge({ level }: { level: 'Tinggi' | 'Sedang' | 'Rendah' }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getAbrasiBadge(level)}`}>
      {level}
    </span>
  );
}

function KondisiBadge({ kondisi }: { kondisi: KondisiMangrove }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getKondisiColor(kondisi)}`}>
      {kondisi}
    </span>
  );
}

function SortIcon({ active }: { active: boolean }) {
  return (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 ${active ? 'text-green-600' : 'text-gray-400'}`} />
  );
}

const CustomTooltipBar = ({ active, payload, label }: CustomTooltipBarProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-green-700">Luas PMN 2025: <strong>{payload[0]?.value?.toLocaleString('id-ID')} ha</strong></p>
      {payload[1] && <p className="text-blue-600">Target Rehab: <strong>{payload[1]?.value?.toLocaleString('id-ID')} ha</strong></p>}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MangroveNasional() {
  const [search, setSearch] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('semua');
  const [filterPulau, setFilterPulau] = useState<string>('Semua Pulau');
  const [filterAbrasi, setFilterAbrasi] = useState<string>('semua');
  const [sortKey, setSortKey] = useState<SortKey>('luasPMN2025');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...mangroveKabkota];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(k =>
        k.kabKota.toLowerCase().includes(q) ||
        k.provinsi.toLowerCase().includes(q)
      );
    }
    if (filterKondisi !== 'semua') data = data.filter(k => k.kondisi === filterKondisi);
    if (filterPulau !== 'Semua Pulau') data = data.filter(k => k.pulau === filterPulau);
    if (filterAbrasi !== 'semua') data = data.filter(k => k.tingkatAbrasi === filterAbrasi);

    data.sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortKey === 'kondisi') {
        va = KONDISI_ORDER.indexOf(a.kondisi);
        vb = KONDISI_ORDER.indexOf(b.kondisi);
      } else {
        va = a[sortKey] as string | number;
        vb = b[sortKey] as string | number;
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return data;
  }, [search, filterKondisi, filterPulau, filterAbrasi, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Chart data: top 12 by area
  const chartData = useMemo(() =>
    [...mangroveKabkota]
      .sort((a, b) => b.luasPMN2025 - a.luasPMN2025)
      .slice(0, 12)
      .map(k => ({
        name: k.kabKota.replace('Kab. ', '').replace('Kota ', ''),
        luas: k.luasPMN2025,
        rehab: k.luasRehabilitasi,
        kondisi: k.kondisi,
      })),
    []
  );

  // Pie chart: kondisi
  const pieData = useMemo(() => [
    { name: 'Sangat Baik', value: kabkotaSummary.byKondisi.sangatBaik, fill: KONDISI_CHART_COLOR['Sangat Baik'] },
    { name: 'Baik', value: kabkotaSummary.byKondisi.baik, fill: KONDISI_CHART_COLOR['Baik'] },
    { name: 'Sedang', value: kabkotaSummary.byKondisi.sedang, fill: KONDISI_CHART_COLOR['Sedang'] },
    { name: 'Kritis', value: kabkotaSummary.byKondisi.kritis, fill: KONDISI_CHART_COLOR['Kritis'] },
    { name: 'Sangat Kritis', value: kabkotaSummary.byKondisi.sangatKritis, fill: KONDISI_CHART_COLOR['Sangat Kritis'] },
  ].filter(d => d.value > 0), []);

  // CSV export
  const handleExport = () => {
    const header = ['Kab/Kota', 'Tipe', 'Provinsi', 'Pulau', 'Luas PMN 2025 (ha)', 'Luas PMN 2021 (ha)', 'Perubahan (ha)', 'Kondisi', 'Target Rehab (ha)', 'Tingkat Abrasi', 'Panjang Pesisir (km)', 'Jenis Dominan', 'Catatan'];
    const rows = filtered.map(k => [
      k.kabKota, k.tipe, k.provinsi, k.pulau,
      k.luasPMN2025, k.luasPMN2021, k.perubahan,
      k.kondisi, k.luasRehabilitasi, k.tingkatAbrasi, k.panjangPesisir,
      k.jenisDominan.join('; '), k.catatan,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `mangrove_kabkota_PMN2025_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Admin badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs font-medium text-amber-800">
          Data ini bersifat <strong>RAHASIA INTERNAL</strong> — hanya dapat diakses Admin Nasional.
          Sumber: Peta Mangrove Nasional (PMN) 2025 · KLHK / BRGM / GMW v3.0
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
            <TreePine className="w-4 h-4 text-[#0d404f]" />
          </div>
          <p className="text-xs text-gray-500">Total Mangrove Nasional</p>
          <p className="text-xl font-bold text-gray-800">{(PMN_TOTAL_HA / 1000).toFixed(0)}K ha</p>
          <p className="text-xs text-green-600 mt-0.5">±{(PMN_TOTAL_HA).toLocaleString('id-ID')} ha PMN 2025</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <MapPin className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-xs text-gray-500">Kab/Kota Tersedia</p>
          <p className="text-xl font-bold text-gray-800">{kabkotaSummary.totalKabKota}</p>
          <p className="text-xs text-gray-400 mt-0.5">dari 514 kab/kota pesisir</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-700" />
          </div>
          <p className="text-xs text-gray-500">Kondisi Kritis + Sangat Kritis</p>
          <p className="text-xl font-bold text-gray-800">{kabkotaSummary.byKondisi.kritis + kabkotaSummary.byKondisi.sangatKritis}</p>
          <p className="text-xs text-red-500 mt-0.5">kab/kota perlu intervensi</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-[#0d404f]" />
          </div>
          <p className="text-xs text-gray-500">Target Rehabilitasi</p>
          <p className="text-xl font-bold text-gray-800">{(kabkotaSummary.totalLuasRehabilitasi / 1000).toFixed(1)}K ha</p>
          <p className="text-xs text-gray-400 mt-0.5">target BRGM 2025</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1">Top 12 Kab/Kota — Luas Mangrove PMN 2025</p>
          <p className="text-xs text-gray-400 mb-4">Dibanding target rehabilitasi BRGM 2025</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }}
                angle={-40} textAnchor="end" interval={0}
              />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="luas" name="Luas PMN 2025" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={KONDISI_CHART_COLOR[entry.kondisi as KondisiMangrove]} />
                ))}
              </Bar>
              <Bar dataKey="rehab" name="Target Rehab" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(KONDISI_CHART_COLOR).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
                {k}
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1">Distribusi Kondisi</p>
          <p className="text-xs text-gray-400 mb-2">per kab/kota dalam dataset</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip
                formatter={(value: ValueType | undefined, name: NameType | undefined) => [`${value ?? 0} kab/kota`, String(name ?? '')]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abrasi Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Waves className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-gray-800">Tingkat Abrasi per Kab/Kota</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Abrasi Tinggi', val: kabkotaSummary.byAbrasi.tinggi, color: 'bg-red-100 text-red-800 border-red-200' },
            { label: 'Abrasi Sedang', val: kabkotaSummary.byAbrasi.sedang, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            { label: 'Abrasi Rendah', val: kabkotaSummary.byAbrasi.rendah, color: 'bg-green-100 text-green-800 border-green-200' },
          ].map(item => (
            <div key={item.label} className={`border rounded-xl p-3 text-center ${item.color}`}>
              <p className="text-2xl font-bold">{item.val}</p>
              <p className="text-xs font-medium mt-0.5">{item.label}</p>
              <p className="text-xs opacity-70">kab/kota</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-800">Data Lengkap per Kabupaten/Kota</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Menampilkan {Math.min(paginated.length, PER_PAGE)} dari {filtered.length} kab/kota
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs bg-[#071520] hover:bg-[#0d404f] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Search className="w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kab/kota atau provinsi..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-gray-700 outline-none w-full sm:w-44"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={filterPulau}
                onChange={e => { setFilterPulau(e.target.value); setPage(1); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
              >
                {PULAU_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <select
              value={filterKondisi}
              onChange={e => { setFilterKondisi(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
            >
              <option value="semua">Semua Kondisi</option>
              {KONDISI_ORDER.map(k => <option key={k}>{k}</option>)}
            </select>
            <select
              value={filterAbrasi}
              onChange={e => { setFilterAbrasi(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700"
            >
              <option value="semua">Semua Abrasi</option>
              <option value="Tinggi">Abrasi Tinggi</option>
              <option value="Sedang">Abrasi Sedang</option>
              <option value="Rendah">Abrasi Rendah</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('kabKota')}>
                  Kab/Kota <SortIcon active={sortKey === 'kabKota'} />
                </th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('provinsi')}>
                  Provinsi <SortIcon active={sortKey === 'provinsi'} />
                </th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Pulau</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('luasPMN2025')}>
                  Luas 2025 (ha) <SortIcon active={sortKey === 'luasPMN2025'} />
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Luas 2021 (ha)</th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('perubahan')}>
                  Perubahan <SortIcon active={sortKey === 'perubahan'} />
                </th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('kondisi')}>
                  Kondisi <SortIcon active={sortKey === 'kondisi'} />
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Target Rehab</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer whitespace-nowrap" onClick={() => handleSort('tingkatAbrasi')}>
                  Abrasi <SortIcon active={sortKey === 'tingkatAbrasi'} />
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Pesisir (km)</th>
                <th className="text-left px-3 py-3 font-semibold text-gray-600 whitespace-nowrap">Spesies Dominan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-gray-800">{k.kabKota}</p>
                    <p className="text-gray-400 text-xs">{k.tipe}</p>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{k.provinsi}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{k.pulau}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                    {k.luasPMN2025.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-500">
                    {k.luasPMN2021.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <PerubahanBadge delta={k.perubahan} />
                  </td>
                  <td className="px-3 py-2.5">
                    <KondisiBadge kondisi={k.kondisi} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">
                    {k.luasRehabilitasi.toLocaleString('id-ID')} ha
                  </td>
                  <td className="px-3 py-2.5">
                    <AbrasiBadge level={k.tingkatAbrasi} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{k.panjangPesisir.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1 max-w-56">
                      {k.jenisDominan.slice(0, 2).map((sp, i) => (
                        <span key={i} className="text-xs italic bg-green-50 text-green-800 border border-green-100 px-1.5 py-0.5 rounded">
                          {sp}
                        </span>
                      ))}
                      {k.jenisDominan.length > 2 && (
                        <span className="text-xs text-gray-400">+{k.jenisDominan.length - 2}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                    Tidak ada data sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ‹ Sebelumnya
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return p <= totalPages ? (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs border rounded-lg ${page === p ? 'bg-[#071520] text-white border-[#071520]' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ) : null;
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Berikutnya ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-relaxed">
          Data luasan merupakan estimasi resmi PMN 2025 berdasarkan interpretasi citra satelit multitemporal
          (Sentinel-2 + Landsat-9) + integrasi GMW v3.0. Pemda wajib memverifikasi batas administratif di lapangan.
          Data ini bersifat referensi dan dapat berubah seiring pembaruan survei nasional.
        </p>
      </div>
    </div>
  );
}
