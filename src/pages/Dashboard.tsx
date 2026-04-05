import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TreePine, AlertTriangle, CheckCircle, TrendingUp,
  MapPin, Sprout, ClipboardList, Activity,
} from 'lucide-react';
import {
  mangroveLocations, ekosistemData, alerts, timeSeriesData,
} from '../data/mockData';
import {
  PMN_TOTAL_HA, PMN_TOTAL_REHABILITASI, pmnTop10, pmnKondisiSummary, pmnProvinsi,
} from '../data/pmnData';
import { getSurveyStats, getSurveys } from '../data/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import KPICard from '../components/shared/KPICard';
import StatusBadge from '../components/shared/StatusBadge';

const STATUS_COLORS: Record<string, string> = {
  lebat: '#16a34a',
  sedang: '#eab308',
  jarang: '#f97316',
  kritis: '#ef4444',
};

export default function Dashboard() {
  const totalArea = mangroveLocations.reduce((s, l) => s + l.areaHa, 0);
  const avgHealth = Math.round(ekosistemData.reduce((s, e) => s + e.skorKesehatan, 0) / ekosistemData.length);
  const kritisCount = mangroveLocations.filter(l => l.status === 'kritis').length;
  const lebatCount = mangroveLocations.filter(l => l.status === 'lebat').length;

  const [surveyStats, setSurveyStats] = useState(getSurveyStats());
  const [recentSurveys, setRecentSurveys] = useState(getSurveys().slice(0, 5));

  useEffect(() => {
    const refresh = () => {
      setSurveyStats(getSurveyStats());
      setRecentSurveys(getSurveys().slice(0, 5));
    };
    refresh();
    window.addEventListener('storage', refresh);
    const timer = setInterval(refresh, 5000);

    // Supabase realtime: listen INSERT di tabel surveys
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('surveys-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'surveys' }, () => {
          refresh();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const statusPieData = [
    { name: 'Lebat', value: lebatCount, color: '#16a34a' },
    { name: 'Sedang', value: mangroveLocations.filter(l => l.status === 'sedang').length, color: '#eab308' },
    { name: 'Jarang', value: mangroveLocations.filter(l => l.status === 'jarang').length, color: '#f97316' },
    { name: 'Kritis', value: kritisCount, color: '#ef4444' },
  ];

  const trendData = timeSeriesData.map(d => ({
    tahun: d.tahun,
    'Luas Mangrove (×1000 ha)': Math.round(d.luasMangrove / 1000),
    'Area Restorasi (ha)': d.luasRestorasi,
    'Tutupan (%)': d.persenTutupan,
  }));

  return (
    <div className="space-y-6">

      {/* Identity Banner */}
      <div className="bg-green-950 rounded-xl overflow-hidden border border-green-900">
        <div className="flex items-center gap-6 px-6 py-4">
          <div className="flex-shrink-0">
            <img src="/logo.svg" alt="ID-MAP" className="h-18 w-auto object-contain" style={{height:'72px'}} draggable={false} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-0.5">Sistem Pemantauan Terintegrasi</p>
            <h2 className="text-white text-xl font-bold">Integrasi Data Mangrove dan Pesisir</h2>
            <p className="text-green-400 text-sm mt-0.5">Sebagai basis data untuk pemantauan dan restorasi lingkungan</p>
          </div>
          <div className="flex-shrink-0 hidden lg:flex flex-col gap-2 items-end">
            <div className="border border-green-800 rounded-lg px-4 py-2 text-center">
              <p className="text-green-500 text-xs font-medium">Ref. Data</p>
              <p className="text-white text-lg font-black">2024–2025</p>
              <p className="text-green-600 text-xs">GMW · PMN · MonMang</p>
            </div>
            {surveyStats.total > 0 && (
              <div className="border border-blue-700 bg-blue-900/30 rounded-lg px-3 py-1.5 text-center">
                <p className="text-blue-300 text-xs font-medium">{surveyStats.total} survei EcoTrack</p>
                {surveyStats.today > 0 && <p className="text-blue-400 text-xs">{surveyStats.today} hari ini</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Source Banner */}
      <div className="bg-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-3 border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-white">Sumber Data Referensi 2024–2025</span>
        </div>
        <div className="h-4 w-px bg-slate-600" />
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'GMW v3.0', sub: 'JAXA' },
            { label: 'Sentinel-2 MSI', sub: 'ESA Copernicus' },
            { label: 'PMN 2025', sub: 'KLHK / BRGM' },
            { label: 'MonMang Monitoring', sub: 'Earth Engine' },
            { label: 'BMKG Oseanografi', sub: 'BMKG' },
            { label: 'RBI & Garis Pantai', sub: 'BIG' },
          ].map(s => (
            <span key={s.label} className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-0.5">
              {s.label} <span className="text-slate-500">· {s.sub}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Platform Modules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'SpaceWatch', desc: 'Monitoring citra satelit Sentinel-2 & Landsat multi-temporal', color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-700', icon: '🛰️' },
          { label: 'EcoTrack', desc: 'Input data lapangan dan survei tim lapangan berbasis mobile', color: 'border-green-300 bg-green-50', badge: 'bg-green-700', icon: '📋', link: '/input-lapangan' },
          { label: 'BioSense', desc: 'Sensor IoT kualitas air: salinitas, pH, suhu, kekeruhan real-time', color: 'border-teal-300 bg-teal-50', badge: 'bg-teal-700', icon: '📡' },
          { label: 'RestoreAI', desc: 'Rekomendasi restorasi & kebijakan berbasis klasifikasi XGBoost/RF', color: 'border-orange-300 bg-orange-50', badge: 'bg-orange-700', icon: '🤖' },
        ].map(m => (
          <div key={m.label} className={`border rounded-xl p-4 ${m.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{m.icon}</span>
              <span className={`text-xs text-white font-bold px-2 py-0.5 rounded ${m.badge}`}>{m.label}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Realtime Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Survei EcoTrack</p>
            <p className="text-lg font-bold text-gray-900">{surveyStats.total}</p>
            {surveyStats.today > 0 && <p className="text-xs text-blue-600 font-medium">+{surveyStats.today} hari ini</p>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Lokasi Terdaftar</p>
            <p className="text-lg font-bold text-gray-900">{mangroveLocations.length + surveyStats.customLocCount}</p>
            {surveyStats.customLocCount > 0 && <p className="text-xs text-green-600 font-medium">+{surveyStats.customLocCount} lokasi baru</p>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Notifikasi Aktif</p>
            <p className="text-lg font-bold text-gray-900">{alerts.filter(a => a.type !== 'info').length}</p>
            <p className="text-xs text-red-500 font-medium">{alerts.filter(a => a.type === 'critical').length} kritis</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Survei Terakhir</p>
            {surveyStats.lastSubmit ? (
              <>
                <p className="text-xs font-bold text-gray-800 truncate">{recentSurveys[0]?.namaPetugas ?? '—'}</p>
                <p className="text-xs text-gray-400">{new Date(surveyStats.lastSubmit).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Surveys Feed (visible only if any survey recorded) */}
      {recentSurveys.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-800">Aktivitas Survei EcoTrack Terkini</h3>
            <span className="ml-auto text-xs text-gray-400">{surveyStats.total} total entri</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSurveys.map(s => (
              <div key={s.id} className="px-5 py-3 flex items-center gap-4 text-xs">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{s.locationName}</p>
                  <p className="text-gray-500 truncate">{s.namaPetugas} · {s.unit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.tutupanTajuk && <p className="font-medium text-gray-700">Tutupan: {s.tutupanTajuk}%</p>}
                  <p className="text-gray-400">{new Date(s.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                {s.isCustomLoc && (
                  <span className="bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium flex-shrink-0">Baru</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Luas Mangrove PMN 2025"
          value={(PMN_TOTAL_HA / 1000000).toFixed(2).replace('.', ',') + ' Jt'}
          unit="ha"
          trend={2.6}
          icon={<TreePine className="w-6 h-6 text-green-600" />}
          colorClass="text-green-700"
          bgClass="bg-green-100"
        />
        <KPICard
          label="Skor Kesehatan Rata-rata"
          value={`${avgHealth}`}
          unit="/ 100"
          trend={4.2}
          icon={<Sprout className="w-6 h-6 text-blue-600" />}
          colorClass="text-blue-700"
          bgClass="bg-blue-100"
        />
        <KPICard
          label="Target Rehabilitasi BRGM 2025"
          value={(PMN_TOTAL_REHABILITASI / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          unit="× 10³ ha"
          trend={22.5}
          icon={<Sprout className="w-6 h-6 text-teal-600" />}
          colorClass="text-teal-700"
          bgClass="bg-teal-100"
        />
        <KPICard
          label="Provinsi Kritis / Sangat Kritis"
          value={`${pmnKondisiSummary.kritis + pmnKondisiSummary.sangatKritis}`}
          unit="provinsi"
          trend={-8}
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          colorClass="text-red-600"
          bgClass="bg-red-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Tren Luas Mangrove Nasional</h3>
              <p className="text-xs text-gray-500">Data multi-temporal 2018–2024</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">+2.7%/thn</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="Luas Mangrove (×1000 ha)"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-1">Distribusi Status Tutupan</h3>
          <p className="text-xs text-gray-500 mb-4">Berdasarkan {mangroveLocations.length} lokasi pemantauan</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {statusPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusPieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-gray-600">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Provinsi Bar — PMN 2025 Top 10 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800">Luas Mangrove per Provinsi (PMN 2025)</h3>
            <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded px-2 py-0.5">Top 10</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Dalam ribuan hektar · Sumber: KLHK / BRGM / GMW v3.0</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pmnTop10} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}K`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                formatter={(v) => [`${(Number(v ?? 0) * 1000).toLocaleString('id-ID')} ha`, 'Luas PMN']}
              />
              <Bar dataKey="luas" name="Luas (×1000 ha)" radius={[0, 6, 6, 0]}>
                {pmnTop10.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.kondisi === 'Sangat Baik' ? '#16a34a'
                      : entry.kondisi === 'Baik' ? '#4ade80'
                      : entry.kondisi === 'Sedang' ? '#eab308'
                      : entry.kondisi === 'Kritis' ? '#f97316'
                      : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Notifikasi Terkini</h3>
            <span className="text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-medium">
              {alerts.filter(a => a.type !== 'info').length} aktif
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {alerts.slice(0, 6).map(alert => (
              <div
                key={alert.id}
                className={`flex gap-2.5 p-3 rounded-xl border text-xs ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-100'
                    : alert.type === 'warning'
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-blue-50 border-blue-100'
                }`}
              >
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                    <span className="font-semibold text-gray-700 text-xs">{alert.lokasi}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{alert.pesan}</p>
                  <p className="text-gray-400 mt-1">{alert.tanggal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PMN 2025 — Kondisi Nasional */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Peta Mangrove Nasional 2025 — Kondisi per Provinsi</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Total nasional: <strong>{PMN_TOTAL_HA.toLocaleString('id-ID')} ha</strong> · 38 provinsi · Sumber: KLHK / BRGM / GMW v3.0 JAXA
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            {[
              { label: 'Sangat Baik', color: 'bg-green-600', count: pmnKondisiSummary.sangatBaik },
              { label: 'Baik', color: 'bg-green-400', count: pmnKondisiSummary.baik },
              { label: 'Sedang', color: 'bg-yellow-400', count: pmnKondisiSummary.sedang },
              { label: 'Kritis', color: 'bg-orange-400', count: pmnKondisiSummary.kritis },
              { label: 'Sgt Kritis', color: 'bg-red-500', count: pmnKondisiSummary.sangatKritis },
            ].map(k => (
              <div key={k.label} className="flex items-center gap-1 text-xs text-gray-600">
                <div className={`w-2 h-2 rounded-full ${k.color}`} />
                <span>{k.label}: <strong>{k.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2.5 text-left font-semibold">Provinsi</th>
                <th className="px-4 py-2.5 text-right font-semibold">Luas PMN 2025 (ha)</th>
                <th className="px-4 py-2.5 text-right font-semibold">PMN 2021 (ha)</th>
                <th className="px-4 py-2.5 text-right font-semibold">Perubahan</th>
                <th className="px-4 py-2.5 text-center font-semibold">Kondisi</th>
                <th className="px-4 py-2.5 text-right font-semibold">Rehab. (ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pmnProvinsi.slice(0, 15).map(p => (
                <tr key={p.provinsi} className="hover:bg-green-50/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{p.provinsi}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700 font-medium">{p.luasPMN.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{p.luasPMN2021.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    <span className={p.perubahan >= 0 ? 'text-green-600' : 'text-red-500'}>
                      {p.perubahan >= 0 ? '+' : ''}{p.perubahan.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.kondisi === 'Sangat Baik' ? 'bg-green-100 text-green-700'
                      : p.kondisi === 'Baik' ? 'bg-green-50 text-green-600'
                      : p.kondisi === 'Sedang' ? 'bg-yellow-100 text-yellow-700'
                      : p.kondisi === 'Kritis' ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                    }`}>{p.kondisi}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-teal-600 font-medium">{p.luasRehabilitasi.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pmnProvinsi.length > 15 && (
          <div className="px-5 py-3 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-400">Menampilkan 15 dari {pmnProvinsi.length} provinsi · Data lengkap tersedia di modul Laporan</span>
          </div>
        )}
      </div>

      {/* Lokasi Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Daftar Lokasi Pemantauan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total: {mangroveLocations.length} lokasi aktif</p>
          </div>
          <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-lg px-2.5 py-1 font-medium">
            {totalArea.toLocaleString('id-ID')} ha total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 text-left font-semibold">Lokasi</th>
                <th className="px-4 py-3 text-left font-semibold">Provinsi</th>
                <th className="px-4 py-3 text-center font-semibold">Luas (ha)</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Kawasan</th>
                <th className="px-4 py-3 text-center font-semibold">Skor</th>
                <th className="px-4 py-3 text-center font-semibold">Survey</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mangroveLocations.map(loc => {
                const eco = ekosistemData.find(e => e.locationId === loc.id);
                return (
                  <tr key={loc.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[loc.status] }} />
                        <span className="font-medium text-gray-800">{loc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{loc.province}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">
                      {loc.areaHa.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={loc.kawasan} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-bold text-sm ${
                          (eco?.skorKesehatan ?? 0) >= 75 ? 'text-green-600'
                          : (eco?.skorKesehatan ?? 0) >= 50 ? 'text-yellow-600'
                          : 'text-red-500'
                        }`}
                      >
                        {eco?.skorKesehatan ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      {loc.lastSurvey}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
