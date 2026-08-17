import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import {
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  MapPin, ClipboardList, ArrowUpRight, Users, Leaf,
  Calendar, Clock, AlertCircle, Pencil, Upload, X,
} from 'lucide-react';
import { useRef } from 'react';
import {
  mangroveLocations as seedLocations, ekosistemData, alerts, timeSeriesData,
} from '../data/seedData';
import { fetchAllLocations } from '../data/locations';
import { fetchSurveyStats, fetchSurveys, getSurveyStats, getSurveys, getVerificationStats } from '../data/localStore';
import type { MangroveLocation } from '../types';
import StatusBadge from '../components/shared/StatusBadge';
import StatsPanel from '../components/StatsPanel';
import HeaderActions from '../components/Layout/HeaderActions';
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
    <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-body-sm text-body-sm text-md-on-surface-variant">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-headline-md text-headline-md text-md-on-surface tracking-tight">{value}</span>
            <span className="font-body-sm text-body-sm text-md-on-surface-variant/70">{unit}</span>
          </div>
          <div className={`flex items-center gap-1 mt-2 font-label-md text-label-md ${isUp ? 'text-md-secondary' : 'text-md-error'}`}>
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
  const [mangroveLocations, setMangroveLocations] = useState<MangroveLocation[]>(seedLocations);
  const totalArea = mangroveLocations.reduce((s, l) => s + l.areaHa, 0);
  const avgHealth = Math.round(ekosistemData.reduce((s, e) => s + e.skorKesehatan, 0) / ekosistemData.length);
  const kritisCount = mangroveLocations.filter(l => l.status === 'kritis').length;
  const lebatCount = mangroveLocations.filter(l => l.status === 'lebat').length;

  const [surveyStats, setSurveyStats] = useState(getSurveyStats());
  const [recentSurveys, setRecentSurveys] = useState(getSurveys().slice(0, 5));
  const [verificationStats, setVerificationStats] = useState(getVerificationStats());

  // ── Dashboard header image ──
  const BANNER_KEY = 'dashboard_header_img';
  const [bannerImg, setBannerImg] = useState<string | null>(
    () => localStorage.getItem(BANNER_KEY)
  );
  const [bannerEditing, setBannerEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      localStorage.setItem(BANNER_KEY, result);
      setBannerImg(result);
      setBannerEditing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerRemove = () => {
    localStorage.removeItem(BANNER_KEY);
    setBannerImg(null);
    setBannerEditing(false);
  };

  useEffect(() => {
    void fetchAllLocations().then(setMangroveLocations);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      const [stats, surveys] = await Promise.all([fetchSurveyStats(), fetchSurveys()]);
      setSurveyStats(stats);
      setRecentSurveys(surveys.slice(0, 5));
      setVerificationStats(getVerificationStats());
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
    <div className="space-y-4">

      {/* ── Dashboard Header Banner ── */}
      <section className="relative rounded-2xl overflow-hidden flex flex-col group bg-[#071520]">
        {/* Background: gambar upload atau navy solid senada sidebar kiri */}
        {bannerImg ? (
          <img
            src={bannerImg}
            alt="Dashboard header"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#071520] bg-[linear-gradient(160deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.05)_100%)]" />
        )}

        {/* Overlay gelap hanya saat pakai gambar upload agar teks tetap terbaca */}
        {bannerImg && <div className="absolute inset-0 bg-black/40" />}

        {/* Konten: teks di pojok kiri atas box, aksi + akun di kanan atas */}
        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-start justify-between gap-4 px-5 py-5 md:px-6">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">ID-MAP · Cabdin KP Kab. Malang</p>
            <h2 className="text-white text-2xl md:text-[28px] font-bold leading-tight tracking-tight">Dashboard Utama</h2>
            <p className="text-white/65 text-sm mt-1">Real-time ecosystem health and verification tracking.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/5 text-white rounded-lg flex items-center gap-2 text-xs font-semibold border border-white/10">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {/* Tombol edit — hanya tampil untuk staff */}
              {isStaff && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setBannerEditing(e => !e); fileInputRef.current?.click(); }}
                    title="Ganti gambar header"
                    className="p-2 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  {bannerImg && (
                    <button
                      onClick={handleBannerRemove}
                      title="Hapus gambar header"
                      className="p-2 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-red-500/40 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <HeaderActions
              variant="dark"
              hideSearch
              onMenuClick={() => window.dispatchEvent(new CustomEvent('idmap:open-sidebar'))}
            />
          </div>
        </div>

        {/* Edit mode hint — overlay saat hover untuk staff */}
        {isStaff && !bannerEditing && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-2 bg-[#0d1b2a]/80 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/10">
              <Pencil className="w-3.5 h-3.5" /> Klik untuk ganti gambar header
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerUpload}
        />
      </section>

      {/* Statistics Cards — colored top border style */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surveys */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Survei</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{surveyStats.total.toLocaleString('id-ID')}</span>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> 12%
            </span>
          </div>
          <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full w-full" />
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-gray-200 border-t-4 border-t-emerald-600 rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disetujui</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{verificationStats.approved}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">STABLE</span>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${verificationStats.total > 0 ? Math.round((verificationStats.approved / verificationStats.total) * 100) : 0}%` }} />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-gray-200 border-t-4 border-t-amber-500 rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Menunggu</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{verificationStats.pending}</span>
            <span className="text-amber-600 text-xs font-semibold flex items-center gap-0.5">
              <Clock className="w-3.5 h-3.5" /> Review
            </span>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${verificationStats.total > 0 ? Math.round((verificationStats.pending / verificationStats.total) * 100) : 0}%` }} />
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-200 border-t-4 border-t-red-500 rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ditolak</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600">{verificationStats.rejected}</span>
            <span className="text-red-500 text-xs font-semibold flex items-center gap-0.5">
              <AlertCircle className="w-3.5 h-3.5" /> Check
            </span>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: `${verificationStats.total > 0 ? Math.round((verificationStats.rejected / verificationStats.total) * 100) : 0}%` }} />
          </div>
        </div>
      </section>

      {/* Stats Panel — admin/verifikator only (Convex-backed) */}
      {isStaff && <StatsPanel />}

      {/* Recent Surveys Feed (visible only if any survey recorded) */}
      {recentSurveys.length > 0 && (
        <div className="bg-md-surface-lowest border border-md-outline-variant rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-md-outline-variant flex items-center gap-2">
            <div className="w-2 h-2 bg-md-secondary rounded-full animate-pulse" />
            <h3 className="font-headline-sm text-headline-sm text-md-primary">Aktivitas Survei EcoTrack Terkini</h3>
            <span className="ml-auto font-label-md text-label-md text-md-on-surface-variant">{surveyStats.total} total entri</span>
          </div>
          <div className="divide-y divide-md-outline-variant">
            {recentSurveys.map(s => (
              <div key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-md-secondary-container/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-md-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-md-on-surface truncate">{s.locationName}</p>
                  <p className="font-body-sm text-body-sm text-md-on-surface-variant truncate">{s.namaPetugas} · {s.unit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.tutupanTajuk && <p className="font-label-md text-label-md text-md-on-surface">Tutupan: {s.tutupanTajuk}%</p>}
                  <p className="font-body-sm text-body-sm text-md-on-surface-variant/70">{new Date(s.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                {s.isCustomLoc && (
                  <span className="bg-md-tertiary-container/20 text-md-tertiary rounded px-1.5 py-0.5 font-label-md text-label-md flex-shrink-0">Baru</span>
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
          color="#0d404f"
        />
        <HeroKPI
          label="Indeks Tutupan Vegetasi"
          value={`${healthPct}`}
          unit="/ 100"
          trend={4.2}
          data={sparkHealth}
          color="#071520"
        />
        <HeroKPI
          label="Area Restorasi Aktif"
          value={timeSeriesData[timeSeriesData.length - 1]?.luasRestorasi?.toLocaleString('id-ID') ?? '0'}
          unit="ha"
          trend={5.1}
          data={sparkRestore}
          color="#334155"
          trendNegative={false}
        />
      </div>

      {/* === GAUGE + DONUT + TOP LOKASI WIDGET === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauge: Tutupan Lebat */}
        <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm flex flex-col">
          <h3 className="font-headline-sm text-headline-sm text-md-primary text-center">Tutupan Lebat</h3>
          <div className="relative flex-1 flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%" cy="80%"
                innerRadius="100%" outerRadius="160%"
                barSize={18}
                startAngle={180} endAngle={0}
                data={[{ name: 'tutupan', value: tutupanLebatPct, fill: '#006a61' }]}
              >
                <RadialBar background={{ fill: '#e0e3e5' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
              <span className="font-headline-lg text-headline-lg text-md-on-surface">{tutupanLebatPct}<span className="font-headline-md text-headline-md text-md-on-surface-variant/70">%</span></span>
            </div>
          </div>
          <p className="text-center font-body-sm text-body-sm text-md-on-surface-variant mt-1">Lokasi tutupan lebat <span className="font-label-md text-label-md text-md-on-surface">{lebatCount}/{mangroveLocations.length}</span></p>
        </div>

        {/* Donut: Distribusi Status Tutupan */}
        <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-md-primary text-center">Distribusi Status Tutupan</h3>
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
              <span className="font-headline-md text-headline-md text-md-on-surface">{Math.round(((lebatCount + mangroveLocations.filter(l => l.status === 'sedang').length) / mangroveLocations.length) * 100)}<span className="font-headline-sm text-headline-sm text-md-on-surface-variant/70">%</span></span>
              <span className="font-label-md text-label-md text-md-on-surface-variant uppercase">Sehat</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {statusPieData.map(d => (
              <div key={d.name} className="flex items-center justify-between font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-md-on-surface-variant">{d.name}</span>
                </div>
                <span className="font-label-md text-label-md text-md-on-surface">{d.value} <span className="text-md-on-surface-variant/70 font-normal">lokasi</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Lokasi Widget — gaya "Sources Usage" */}
        <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-md-primary">Konsentrasi Mangrove Wilker</h3>
          <p className="font-body-sm text-body-sm text-md-on-surface-variant mb-3">Distribusi luas mangrove pada lokasi pemantauan teratas</p>
          <div className="space-y-2">
            {topLokasi.map((loc) => {
              const pct = Math.round((loc.areaHa / totalTopLuas) * 100);
              return (
                <div key={loc.id} className="flex items-center gap-2 font-body-sm text-body-sm">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[loc.status] }} />
                  <span className="text-md-on-surface-variant truncate flex-1">{loc.name}</span>
                  <span className="font-label-md text-label-md text-md-on-surface tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 bg-md-primary rounded-xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="font-label-md text-label-md text-md-inverse-primary uppercase">Top Lokasi</p>
              <p className="font-label-md text-label-md text-white truncate">{topLokasi[0]?.name}</p>
            </div>
            <span className="font-label-md text-label-md text-md-inverse-primary tabular-nums">
              {Math.round((topLokasi[0]?.areaHa ?? 0) / totalTopLuas * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* === DARK CTA + COMMUNITY CTA === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Indeks Kesehatan Ekosistem (gaya Climate Change Index) */}
        <div className="bg-md-primary rounded-xl p-4 flex items-center gap-4 border border-md-primary-container">
          <div className="relative w-20 h-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="100%"
                barSize={6}
                startAngle={90} endAngle={-270}
                data={[{ value: avgHealth, fill: '#95d3ba' }]}
              >
                <RadialBar background={{ fill: '#0b513d' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-label-md text-label-md text-white">{avgHealth}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-headline-sm text-headline-sm text-white">Indeks Kesehatan Ekosistem</p>
            <p className="font-body-sm text-body-sm text-md-inverse-primary/80 mt-0.5">Skor agregat tutupan, vegetasi, dan kualitas habitat mangrove</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-md-inverse-primary" />
        </div>

        {/* Aktivitas Survei (gaya water level / community) */}
        <div className="bg-md-secondary-container rounded-xl p-4 flex items-center gap-4 border border-md-outline-variant relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 opacity-25 pointer-events-none" aria-hidden>
            <Leaf className="w-full h-full text-md-secondary" />
          </div>
          <div className="relative w-16 h-16 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="65%" outerRadius="100%"
                barSize={6}
                startAngle={90} endAngle={-270}
                data={[{ value: Math.min(surveyStats.total * 5, 100), fill: '#006a61' }]}
              >
                <RadialBar background={{ fill: '#ffffff' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-label-md text-label-md text-md-on-secondary-container">{surveyStats.total}</span>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-headline-sm text-headline-sm text-md-on-secondary-container">Komunitas EcoTrack</p>
            <p className="font-body-sm text-body-sm text-md-on-secondary-container/80 mt-0.5">Survei lapangan kolaboratif dari tim Wilker Cabdin Malang</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-md-secondary border-2 border-white flex items-center justify-center"><Users className="w-2.5 h-2.5 text-white" /></div>
                <div className="w-5 h-5 rounded-full bg-md-primary border-2 border-white" />
                <div className="w-5 h-5 rounded-full bg-md-tertiary border-2 border-white" />
              </div>
              <span className="font-label-md text-label-md text-md-on-secondary-container">{surveyStats.total} entri · {surveyStats.customLocCount} lokasi baru</span>
            </div>
          </div>
        </div>
      </div>

      {/* === TREND CHART (full width) === */}
      <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-md-primary">Tren Luas Mangrove Wilker Cabdin KP Kab. Malang</h3>
            <p className="font-body-sm text-body-sm text-md-on-surface-variant">Data multi-temporal 2018–2025</p>
          </div>
          <div className="flex items-center gap-1.5 bg-md-secondary-container/40 border border-md-outline-variant rounded-lg px-2.5 py-1">
            <TrendingUp className="w-3.5 h-3.5 text-md-secondary" />
            <span className="font-label-md text-label-md text-md-on-secondary-container">+2.7%/thn</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006a61" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#006a61" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
            <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: '#404944' }} />
            <YAxis tick={{ fontSize: 12, fill: '#404944' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #bfc9c3', fontSize: '12px' }} />
            <Area type="monotone" dataKey="Luas Mangrove (ha)" stroke="#006a61" strokeWidth={2.5} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* === LUAS PER LOKASI + NOTIFIKASI === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Luas per Lokasi */}
        <div className="lg:col-span-2 bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline-sm text-headline-sm text-md-primary">Luas Mangrove per Lokasi Pemantauan</h3>
            <span className="font-label-md text-label-md bg-md-secondary-container/40 text-md-on-secondary-container border border-md-outline-variant rounded px-2 py-0.5">Kab. Malang</span>
          </div>
          <p className="font-body-sm text-body-sm text-md-on-surface-variant mb-4">Dalam hektar · Wilker Cabdin KP Kab. Malang 2025</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={mangroveLocations.map(l => ({ name: l.name.length > 20 ? l.name.slice(0, 20) + '…' : l.name, luas: l.areaHa, status: l.status }))} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#404944' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#404944' }} width={120} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #bfc9c3', fontSize: '12px' }}
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
        <div className="bg-md-surface-lowest rounded-xl p-4 border border-md-outline-variant shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-sm text-headline-sm text-md-primary">Notifikasi Terkini</h3>
            <span className="font-label-md text-label-md bg-md-error-container text-md-error border border-md-error/20 rounded-full px-2 py-0.5">
              {alerts.filter(a => a.type !== 'info').length} aktif
            </span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {alerts.slice(0, 6).map(alert => (
              <div
                key={alert.id}
                className={`flex gap-2.5 p-3 rounded-xl border font-body-sm text-body-sm ${
                  alert.type === 'critical'
                    ? 'bg-md-error-container/60 border-md-error/20'
                    : alert.type === 'warning'
                    ? 'bg-md-secondary-container/30 border-md-outline-variant'
                    : 'bg-md-tertiary-container/15 border-md-outline-variant'
                }`}
              >
                {alert.type === 'critical' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-md-error flex-shrink-0 mt-0.5" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-md-secondary flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-md-tertiary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-2.5 h-2.5 text-md-on-surface-variant" />
                    <span className="font-label-md text-label-md text-md-on-surface">{alert.lokasi}</span>
                  </div>
                  <p className="text-md-on-surface-variant leading-relaxed">{alert.pesan}</p>
                  <p className="text-md-on-surface-variant/70 mt-1">{alert.tanggal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lokasi Table */}
      <div className="bg-md-surface-lowest rounded-xl border border-md-outline-variant overflow-hidden">
        <div className="px-4 py-3 border-b border-md-outline-variant flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-md-primary">Lokasi Pemantauan — Kab. Malang</h3>
            <p className="font-body-sm text-body-sm text-md-on-surface-variant mt-0.5">Total: {mangroveLocations.length} lokasi aktif · Wilker Cabdin KP Kab. Malang</p>
          </div>
          <span className="font-label-md text-label-md bg-md-secondary-container/40 text-md-on-secondary-container border border-md-outline-variant rounded-lg px-2.5 py-1">
            {totalArea.toLocaleString('id-ID')} ha total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-md-surface-high font-label-md text-label-md uppercase text-md-on-surface-variant">
                <th className="px-4 py-3 text-left">Lokasi</th>
                <th className="px-3 py-3 text-left">Provinsi</th>
                <th className="px-3 py-3 text-center">Luas (ha)</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Kawasan</th>
                <th className="px-3 py-3 text-center">Skor</th>
                <th className="px-3 py-3 text-center">Survey</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline-variant">
              {mangroveLocations.map(loc => {
                const eco = ekosistemData.find(e => e.locationId === loc.id);
                return (
                  <tr key={loc.id} className="hover:bg-md-surface-low transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[loc.status] }} />
                        <span className="font-body-sm text-body-sm font-medium text-md-on-surface">{loc.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-body-sm text-body-sm text-md-on-surface-variant">{loc.province}</td>
                    <td className="px-3 py-2.5 text-center font-body-sm text-body-sm text-md-on-surface">
                      {loc.areaHa.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <StatusBadge status={loc.kawasan} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`font-label-md text-label-md font-bold ${
                          (eco?.skorKesehatan ?? 0) >= 75 ? 'text-md-secondary'
                          : (eco?.skorKesehatan ?? 0) >= 50 ? 'text-md-tertiary'
                          : 'text-md-error'
                        }`}
                      >
                        {eco?.skorKesehatan ?? '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-body-sm text-body-sm text-md-on-surface-variant/70">
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
