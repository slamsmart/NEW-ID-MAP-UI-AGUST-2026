import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  MapPin, ClipboardList, Activity, ArrowUpRight, Users, Leaf,
} from 'lucide-react';
import {
  mangroveLocations, ekosistemData, alerts, timeSeriesData,
} from '../data/mockData';
import { fetchSurveyStats, fetchSurveys, getSurveyStats, getSurveys } from '../data/localStore';
import StatusBadge from '../components/shared/StatusBadge';
import StatsPanel from '../components/StatsPanel';
import { useAuth } from '../context/useAuth';

const STATUS_COLORS: Record<string, string> = {
  lebat: '#16a34a',
  sedang: '#eab308',
  jarang: '#f97316',
  kritis: '#ef4444',
};

interface HeroKPIProps {
  label: string;
  value: string;
  unit: string;
  trend: number;
  data: { v: number }[];
  color: string;
  trendNegative?: boolean;
}

function HeroKPI({ label, value, unit, trend, data, color }: HeroKPIProps) {
  const isUp = trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}% vs tahun lalu</span>
          </div>
        </div>
        <div className="w-24 h-14 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'verifikator';
  const totalArea = mangroveLocations.reduce((s, l) => s + l.areaHa, 0);
  const avgHealth = Math.round(ekosistemData.reduce((s, e) => s + e.skorKesehatan, 0) / ekosistemData.length);
  const kritisCount = mangroveLocations.filter(l => l.status === 'kritis').length;
  const lebatCount = mangroveLocations.filter(l => l.status === 'lebat').length;

  const [surveyStats, setSurveyStats] = useState(getSurveyStats());
  const [recentSurveys, setRecentSurveys] = useState(getSurveys().slice(0, 5));

  useEffect(() => {
    const refresh = async () => {
      const [stats, surveys] = await Promise.all([fetchSurveyStats(), fetchSurveys()]);
      setSurveyStats(stats);
      setRecentSurveys(surveys.slice(0, 5));
    };
    void refresh();
    const handleStorage = () => { void refresh(); };
    window.addEventListener('storage', handleStorage);
    const timer = setInterval(refresh, 5000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
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
    'Luas Mangrove (ha)': d.luasMangrove,
    'Area Restorasi (ha)': d.luasRestorasi,
    'Tutupan (%)': d.persenTutupan,
  }));

  // Data sparkline mini chart untuk hero KPI cards
  const sparkArea = timeSeriesData.slice(-6).map(d => ({ v: d.luasMangrove }));
  const sparkHealth = timeSeriesData.slice(-6).map(d => ({ v: d.persenTutupan }));
  const sparkRestore = timeSeriesData.slice(-6).map(d => ({ v: d.luasRestorasi }));

  // Tutupan persen (lokasi lebat / total)
  const tutupanLebatPct = Math.round((lebatCount / mangroveLocations.length) * 100);
  // Skor kesehatan persen
  const healthPct = avgHealth;

  // Top lokasi by luas (untuk widget gaya "Sources Usage")
  const topLokasi = [...mangroveLocations]
    .sort((a, b) => b.areaHa - a.areaHa)
    .slice(0, 6);
  const totalTopLuas = topLokasi.reduce((s, l) => s + l.areaHa, 0);

  return (
    <div className="space-y-6">

      {/* Stats Panel — admin/verifikator only (Convex-backed) */}
      {isStaff && <StatsPanel />}

      {/* Identity Banner */}
      <div
        className="rounded-xl overflow-hidden border border-white/15 shadow-lg shadow-emerald-900/20"
        style={{
          background:
            'linear-gradient(120deg, #064e3b 0%, #047857 30%, #0e7490 70%, #0369a1 100%)',
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4 sm:gap-6 sm:px-6">
          <div className="flex-1 min-w-0">
            <p className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest mb-0.5 sm:text-xs">Wilker Cabdin KP Kab. Malang</p>
            <h2 className="text-white text-lg font-bold drop-shadow-sm sm:text-xl">Integrasi Data Mangrove dan Pesisir</h2>
            <p className="text-white/80 text-[13px] mt-0.5 sm:text-sm">Data Monitoring Mangrove/Vegetasi dan Ekosistem Pesisir</p>
          </div>
          <div className="flex-shrink-0 hidden lg:flex flex-col gap-2 items-end">
            <div className="border border-white/25 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <p className="text-emerald-200 text-xs font-medium">Ref. Data</p>
              <p className="text-white text-lg font-black">2024–2025</p>
              <p className="text-white/70 text-xs">Wilker Cabdin KP Kab. Malang</p>
            </div>
            {surveyStats.total > 0 && (
              <div className="border border-sky-300/40 bg-sky-400/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                <p className="text-sky-50 text-xs font-medium">{surveyStats.total} survei EcoTrack</p>
                {surveyStats.today > 0 && <p className="text-sky-100/80 text-xs">{surveyStats.today} hari ini</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Source Banner */}
      <div
        className="rounded-xl px-5 py-3 flex flex-wrap items-center gap-3 border border-white/15 shadow-md shadow-sky-900/20"
        style={{
          background:
            'linear-gradient(120deg, #052e2b 0%, #064e4f 50%, #0c4a6e 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
          <span className="text-xs font-bold text-white">Sumber Data · Wilker Cabdin KP Kab. Malang 2024–2025</span>
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'GMW v3.0', sub: 'JAXA' },
            { label: 'Sentinel-2 MSI', sub: 'ESA Copernicus' },
            { label: 'PMN 2025', sub: 'KLHK / BRGM' },
            { label: 'MonMang Monitoring', sub: 'Earth Engine' },
            { label: 'BMKG Oseanografi', sub: 'BMKG' },
            { label: 'RBI & Garis Pantai', sub: 'BIG' },
          ].map(s => (
            <span key={s.label} className="text-xs bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 rounded px-2 py-0.5">
              {s.label} <span className="text-white/60">· {s.sub}</span>
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

      {/* Realtime Activity Stats — compact pill row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Survei EcoTrack</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{surveyStats.total}</p>
            {surveyStats.today > 0 && <p className="text-[11px] text-blue-600 font-medium">+{surveyStats.today} hari ini</p>}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Lokasi Terdaftar</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{mangroveLocations.length + surveyStats.customLocCount}</p>
            {surveyStats.customLocCount > 0 && <p className="text-[11px] text-green-600 font-medium">+{surveyStats.customLocCount} lokasi baru</p>}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Notifikasi Aktif</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{alerts.filter(a => a.type !== 'info').length}</p>
            <p className="text-[11px] text-red-500 font-medium">{alerts.filter(a => a.type === 'critical').length} kritis</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">Survei Terakhir</p>
            {surveyStats.lastSubmit ? (
              <>
                <p className="text-xs font-bold text-gray-800 truncate">{recentSurveys[0]?.namaPetugas ?? '—'}</p>
                <p className="text-[11px] text-gray-400">{new Date(surveyStats.lastSubmit).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
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

      {/* === HERO KPI ROW (3 cards with inline mini bar chart) === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HeroKPI
          label="Total Luas Mangrove Wilker"
          value={totalArea.toLocaleString('id-ID')}
          unit="ha"
          trend={3.2}
          data={sparkArea}
          color="#16a34a"
        />
        <HeroKPI
          label="Indeks Tutupan Vegetasi"
          value={`${healthPct}`}
          unit="/ 100"
          trend={4.2}
          data={sparkHealth}
          color="#0ea5e9"
        />
        <HeroKPI
          label="Area Restorasi Aktif"
          value={timeSeriesData[timeSeriesData.length - 1]?.luasRestorasi?.toLocaleString('id-ID') ?? '0'}
          unit="ha"
          trend={5.1}
          data={sparkRestore}
          color="#f97316"
          trendNegative={false}
        />
      </div>

      {/* === GAUGE + DONUT + TOP LOKASI WIDGET === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauge: Tutupan Lebat */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 text-center">Tutupan Lebat</h3>
          <div className="relative flex-1 flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%" cy="80%"
                innerRadius="100%" outerRadius="160%"
                barSize={18}
                startAngle={180} endAngle={0}
                data={[{ name: 'tutupan', value: tutupanLebatPct, fill: '#16a34a' }]}
              >
                <RadialBar background={{ fill: '#e5e7eb' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
              <span className="text-4xl font-bold text-gray-900">{tutupanLebatPct}<span className="text-2xl text-gray-400">%</span></span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">Lokasi tutupan lebat <span className="font-semibold text-gray-700">{lebatCount}/{mangroveLocations.length}</span></p>
        </div>

        {/* Donut: Distribusi Status Tutupan */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 text-center">Distribusi Status Tutupan</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">{Math.round(((lebatCount + mangroveLocations.filter(l => l.status === 'sedang').length) / mangroveLocations.length) * 100)}<span className="text-xl text-gray-400">%</span></span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sehat</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {statusPieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{d.value} <span className="text-gray-400 font-normal">lokasi</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Lokasi Widget — gaya "Sources Usage" */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700">Konsentrasi Mangrove Wilker</h3>
          <p className="text-[11px] text-gray-500 mb-3">Distribusi luas mangrove pada lokasi pemantauan teratas</p>
          <div className="space-y-2">
            {topLokasi.map((loc) => {
              const pct = Math.round((loc.areaHa / totalTopLuas) * 100);
              return (
                <div key={loc.id} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[loc.status] }} />
                  <span className="text-gray-700 truncate flex-1">{loc.name}</span>
                  <span className="font-semibold text-gray-800 tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 bg-gray-900 rounded-xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Top Lokasi</p>
              <p className="text-xs font-bold text-white truncate">{topLokasi[0]?.name}</p>
            </div>
            <span className="text-xs font-bold text-green-400 tabular-nums">
              {Math.round((topLokasi[0]?.areaHa ?? 0) / totalTopLuas * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* === DARK CTA + COMMUNITY CTA === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Indeks Kesehatan Ekosistem (gaya Climate Change Index) */}
        <div className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4 border border-gray-800">
          <div className="relative w-20 h-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="100%"
                barSize={6}
                startAngle={90} endAngle={-270}
                data={[{ value: avgHealth, fill: '#f97316' }]}
              >
                <RadialBar background={{ fill: '#1f2937' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-white">{avgHealth}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">Indeks Kesehatan Ekosistem</p>
            <p className="text-gray-400 text-xs mt-0.5">Skor agregat tutupan, vegetasi, dan kualitas habitat mangrove</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-500" />
        </div>

        {/* Aktivitas Survei (gaya water level / community) */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 flex items-center gap-4 border border-green-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 opacity-30 pointer-events-none" aria-hidden>
            <Leaf className="w-full h-full text-green-600" />
          </div>
          <div className="relative w-16 h-16 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="65%" outerRadius="100%"
                barSize={6}
                startAngle={90} endAngle={-270}
                data={[{ value: Math.min(surveyStats.total * 5, 100), fill: '#16a34a' }]}
              >
                <RadialBar background={{ fill: '#dcfce7' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-green-800">{surveyStats.total}</span>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-green-900 font-bold text-base">Komunitas EcoTrack</p>
            <p className="text-green-800 text-xs mt-0.5">Survei lapangan kolaboratif dari tim Wilker Cabdin Malang</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"><Users className="w-2.5 h-2.5 text-white" /></div>
                <div className="w-5 h-5 rounded-full bg-teal-500 border-2 border-white" />
                <div className="w-5 h-5 rounded-full bg-green-700 border-2 border-white" />
              </div>
              <span className="text-[11px] font-semibold text-green-900">{surveyStats.total} entri · {surveyStats.customLocCount} lokasi baru</span>
            </div>
          </div>
        </div>
      </div>

      {/* === TREND CHART (full width) === */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Tren Luas Mangrove Wilker Cabdin KP Kab. Malang</h3>
            <p className="text-xs text-gray-500">Data multi-temporal 2018–2025</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700 font-medium">+2.7%/thn</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Area type="monotone" dataKey="Luas Mangrove (ha)" stroke="#16a34a" strokeWidth={2.5} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* === LUAS PER LOKASI + NOTIFIKASI === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Luas per Lokasi */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800">Luas Mangrove per Lokasi Pemantauan</h3>
            <span className="text-xs bg-green-50 text-green-700 border border-green-100 rounded px-2 py-0.5">Kab. Malang</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Dalam hektar · Wilker Cabdin KP Kab. Malang 2025</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mangroveLocations.map(l => ({ name: l.name.length > 20 ? l.name.slice(0, 20) + '…' : l.name, luas: l.areaHa, status: l.status }))} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                formatter={(v) => [`${Number(v ?? 0).toLocaleString('id-ID')} ha`, 'Luas']}
              />
              <Bar dataKey="luas" name="Luas (ha)" radius={[0, 6, 6, 0]}>
                {mangroveLocations.map((loc, i) => (
                  <Cell
                    key={i}
                    fill={
                      loc.status === 'lebat' ? '#16a34a'
                      : loc.status === 'sedang' ? '#eab308'
                      : loc.status === 'jarang' ? '#f97316'
                      : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
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

      {/* Lokasi Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Lokasi Pemantauan — Kab. Malang</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total: {mangroveLocations.length} lokasi aktif · Wilker Cabdin KP Kab. Malang</p>
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
