import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ClipboardList, Database, Download, Eye,
  Layers3, Mail, Map, MapPin, Menu, MousePointer2, Phone,
  Turtle, Users, X,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAccountNotice } from '../components/AccountRequiredNotice';
import TiltCard from '../components/TiltCard';
import { useAuth } from '../context/useAuth';
import { isConvexConfigured } from '../lib/convexClient';
import { recordVisit } from '../lib/statsClient';
import { useClerkReady } from '../components/clerk/ClerkReadyContext';
import ClerkAuthButtons from '../components/clerk/ClerkAuthButtons';
import MaintenanceNotice from '../components/MaintenanceNotice';

const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const navLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Peta Interaktif', href: '/peta' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Kontak', href: '#kontak' },
  { label: 'Pedoman Teknis', href: '/pedoman-teknis' },
];

const features = [
  {
    icon: Map,
    number: '01',
    title: 'Peta Interaktif',
    text: 'Visualisasikan mangrove, pesisir, abrasi, kawasan konservasi, dan data spasial dalam satu peta.',
    href: '/peta',
  },
  {
    icon: ClipboardList,
    number: '02',
    title: 'Monitoring Lapangan',
    text: 'Catat kondisi ekosistem, koordinat GPS, foto dokumentasi, dan hasil survei secara terstruktur.',
    href: '/input-lapangan',
  },
  {
    icon: Turtle,
    number: '03',
    title: 'Titik Penyu',
    text: 'Kelola titik pendaratan dan titik sarang penyu lengkap dengan koordinat, waktu, dan catatan.',
    href: '/pendaratan-penyu',
  },
  {
    icon: Users,
    number: '04',
    title: 'Data Kelompok',
    text: 'Temukan data kelompok pengawas, kawasan kerja, dan koordinat kelompok masyarakat pesisir.',
    href: '/data-pokmaswas',
  },
];

// Angka menghitung naik dari 0 saat kartu masuk viewport (count-up animation).
function CountUp({ value, className }: { value: number | null; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value == null) return;
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          if (reduceMotion) {
            setDisplay(value);
            return;
          }
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <p ref={ref} className={className}>
      <span aria-hidden="true">{value == null ? '—' : display.toLocaleString('id-ID')}</span>
      {value != null && <span className="sr-only">{value.toLocaleString('id-ID')}</span>}
    </p>
  );
}

function getStatsApiRef(): unknown | null {
  const ref = (api as unknown as { stats?: { getStats?: unknown } }).stats?.getStats;
  return ref ?? null;
}

// Stats live dari Convex (best-effort — fallback '—' bila belum terkonfigurasi
// atau fungsi stats belum ter-deploy di environment production).
function PlatformStats() {
  const statsRef = getStatsApiRef();
  const stats = useQuery(
    (statsRef ?? 'skip') as never,
    isConvexConfigured() && statsRef ? {} : 'skip',
  ) as { totalVisits?: number; totalUsers?: number; totalDownloads?: number } | undefined;
  const visits = stats?.totalVisits;
  const users = stats?.totalUsers;
  const downloads = stats?.totalDownloads;

  // Status platform live: 'Live' saat data stats dari Convex masuk, '…' saat
  // memeriksa, 'Offline' bila backend tidak merespons setelah 4 detik.
  const [statsTimedOut, setStatsTimedOut] = useState(false);
  useEffect(() => {
    if (stats != null) return;
    const timer = window.setTimeout(() => setStatsTimedOut(true), 4000);
    return () => window.clearTimeout(timer);
  }, [stats]);
  const status: 'checking' | 'live' | 'offline' = stats != null
    ? 'live'
    : statsTimedOut
      ? 'offline'
      : 'checking';

  const cards = [
    {
      label: 'Total Kunjungan',
      value: visits ?? null,
      icon: Eye,
    },
    {
      label: 'Pengguna Terdaftar',
      value: users ?? null,
      icon: Users,
    },
    {
      label: 'Doc Diunduh',
      value: downloads ?? null,
      icon: Download,
    },
  ];

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.label} className={`reveal reveal-rise reveal-delay-${index + 1} border-white/10 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d404f]/10 text-[#0d404f]">
              <card.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <CountUp value={card.value} className="font-display text-4xl font-bold tracking-tight text-slate-900" />
            <p className="mt-2 text-sm font-medium text-slate-500">{card.label}</p>
          </CardContent>
        </Card>
      ))}
      <Card className="reveal reveal-rise reveal-delay-4 border-white/10 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${status === 'offline' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            {status === 'offline' ? (
              <span className="relative flex h-4 w-4" aria-hidden="true">
                <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
              </span>
            ) : (
              <span className="relative flex h-4 w-4" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
          <p className={`font-display text-4xl font-bold tracking-tight ${status === 'offline' ? 'text-amber-600' : 'text-slate-900'}`}>
            {status === 'live' ? 'live' : status === 'checking' ? '...' : 'Offline'}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">Status Platform</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthActions({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { show: showAccountNotice } = useAccountNotice();
  const clerkReady = useClerkReady();
  const buttonClass = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-colors';

  // Sudah login (termasuk via Clerk/Google) → tampilkan tombol Dashboard.
  if (user) {
    return (
      <Link to="/dashboard" onClick={onClose} className={`${buttonClass} border border-white/25 bg-white text-slate-800 hover:bg-slate-100`}>
        Dashboard
      </Link>
    );
  }

  if (isClerkConfigured && clerkReady) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* SignIn/SignUp dimuat lazy (chunk Clerk terpisah) agar landing
            page tidak mengunduh Clerk pada first load. */}
        <ClerkAuthButtons origin="dashboard" onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" onClick={() => { onClose?.(); showAccountNotice(); }} className={`${buttonClass} border border-[#2f3d57] text-white hover:bg-[#1e293b]`}>Login</button>
      <button type="button" onClick={() => { onClose?.(); showAccountNotice(); }} className={`${buttonClass} bg-[#1e293b] text-white hover:bg-[#334155]`}>Daftar</button>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'ID MAP (Integrasi Data Mangrove dan Pesisir)';
    void recordVisit();
  }, []);

  const goTo = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('/')) navigate(href);
    else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#071520] font-sans text-white">
      <a href="#konten-utama" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#f06424] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white">Lewati ke konten utama</a>
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/15 bg-[#071520]/55 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-10 lg:px-16">
          <button type="button" onClick={() => goTo('#beranda')} className="text-left" aria-label="ID MAP beranda">
            <img src="/logo-header.png" alt="ID-MAP — Integrasi Data Mangrove dan Pesisir" draggable={false} className="h-9 w-auto sm:h-11" />
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {navLinks.map(link => <button key={link.href} type="button" onClick={() => goTo(link.href)} className="border-b-2 border-transparent pb-1 text-xs font-semibold text-white/75 transition hover:border-[#f06424] hover:text-white">{link.label}</button>)}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <AuthActions />
          </div>
          <button type="button" onClick={() => setMenuOpen(open => !open)} className="rounded-full border border-white/20 p-2 lg:hidden" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="menu-mobile">
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && <div id="menu-mobile" className="mx-4 mb-4 rounded-2xl border border-white/15 bg-[#071520]/95 p-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => <button key={link.href} type="button" onClick={() => goTo(link.href)} className="text-left text-sm font-semibold text-white/80">{link.label}</button>)}
            <div className="border-t border-white/10 pt-3"><AuthActions onClose={() => setMenuOpen(false)} /></div>
          </div>
        </div>}
      </header>

      <main id="konten-utama">
        <section id="beranda" className="relative isolate flex min-h-[720px] items-center overflow-hidden px-5 pb-24 pt-36 sm:px-10 lg:min-h-[800px] lg:px-16">
          <div className="hero-kenburns absolute inset-0 -z-20">
            {/* Bg image + filter statis di dalam wrapper animasi: filter di-raster sekali,
                transform wrapper berjalan murni di compositor → tanpa lag, warna tetap sama. */}
            <div className="bg-hero absolute inset-0 h-full w-full bg-[#0b5260] bg-cover bg-center" style={{ filter: 'brightness(1.12) saturate(1.05)' }} />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(7,21,32,.5)_0%,rgba(7,32,40,.18)_45%,rgba(3,15,24,.46)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-[#071520] to-transparent" />
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] lg:items-end">
            <div className="max-w-2xl lg:-translate-y-8">
              <MaintenanceNotice className="hero-rise hero-rise-1 mb-6 max-w-xl" />
              <p className="hero-rise hero-rise-1 mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#ffb28e]">Platform data pesisir terintegrasi</p>
              <h1 className="hero-rise hero-rise-2 font-hero-title max-w-3xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Integrasi Data Mangrove<br /><span className="text-white">&amp; Pesisir Jawa Timur</span></h1>
              <p className="hero-rise hero-rise-3 mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">ID MAP menyatukan data spasial, monitoring lapangan, dan informasi ekosistem untuk mendukung konservasi serta pengambilan keputusan berbasis data.</p>
              <div className="hero-rise hero-rise-4 mt-8 flex flex-wrap gap-3">
                <Link to="/peta" className="inline-flex items-center gap-2 rounded-full bg-[#f06424] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9531b]">Lihat Peta Interaktif <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/input-lapangan" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Input Monitoring <ClipboardList className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="hero-rise hero-rise-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:translate-y-8">
              {[
                { icon: Layers3, label: 'Layer spasial', value: 'Multi-data' },
                { icon: MousePointer2, label: 'Titik koordinat', value: 'Terpetakan' },
                { icon: Database, label: 'Data monitoring', value: 'Terintegrasi' },
                { icon: CheckCircle2, label: 'Mode lapangan', value: 'Offline-first' },
              ].map(item => <TiltCard key={item.label} className="border border-white/20 border-t-2 border-t-[#f06424] bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.14]"><item.icon className="mb-4 h-5 w-5 text-[#f06424]" aria-hidden="true" /><p className="text-base font-bold">{item.value}</p><p className="mt-1 text-xs text-white/60">{item.label}</p></TiltCard>)}
            </div>
          </div>
        </section>

        <section id="tentang" className="reveal bg-[#071520] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="reveal reveal-rise reveal-delay-1"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f06424]">Tentang kami</p><h2 className="font-display mt-4 text-4xl sm:text-5xl">Tentang ID-MAP &amp; Visi Konservasi</h2></div>
            <div className="reveal reveal-rise reveal-delay-2 max-w-2xl text-white/70"><p className="text-justify text-lg leading-8">ID-MAP (Integrasi Data Mangrove dan Pesisir) adalah platform terpadu yang dikelola oleh Cabang Dinas Kelautan dan Perikanan Kab. Malang untuk memantau, memetakan, serta mendukung restorasi ekosistem mangrove dan pesisir di Indonesia.</p><p className="text-justify mt-5 text-lg leading-8">Misi kami: menghadirkan data lapangan, citra satelit, dan kecerdasan buatan dalam satu antarmuka memungkinkan pemerintah, akademisi, dan masyarakat untuk mengambil keputusan berbasis bukti demi blue economy yang lestari.</p><ul className="mt-7 grid gap-3 text-sm font-semibold text-white/85 sm:grid-cols-2"><li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#f06424]" aria-hidden="true" />Pemantauan tutupan mangrove multi-temporal</li><li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#f06424]" aria-hidden="true" />Survei lapangan offline-first oleh petugas daerah</li><li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#f06424]" aria-hidden="true" />Verifikasi data oleh tim ahli sebelum publikasi</li><li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#f06424]" aria-hidden="true" />Rekomendasi restorasi berbasis AI &amp; spasial</li></ul></div>
          </div>
        </section>

        <section id="fitur" className="reveal relative isolate overflow-hidden bg-[#0d404f] px-5 pt-16 pb-20 sm:px-10 lg:px-16 lg:pt-24 lg:pb-28">
          <div className="bg-fitur absolute inset-0 -z-20 bg-[#0d404f] bg-cover bg-center" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(13,64,79,.92)_0%,rgba(7,21,32,.78)_55%,rgba(7,21,32,.9)_100%)]" />            <div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffb28e]">Fitur utama</p><h2 className="font-display mt-4 text-4xl sm:text-5xl">Dari data lapangan menjadi visual peta interaktif</h2></div><Link to="/peta" className="text-sm font-bold text-white underline decoration-[#f06424] decoration-2 underline-offset-8">Lihat semua data <span aria-hidden="true">→</span></Link></div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{features.map((feature, index) => <Link key={feature.number} to={feature.href} className={`reveal reveal-rise reveal-delay-${index + 1} group block h-full`}><TiltCard className="relative flex h-full min-h-64 flex-col border border-white/20 border-t-2 border-t-[#f06424] bg-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.14] hover:border-t-[#f06424]"><span className="absolute right-4 top-3 text-4xl font-extrabold text-white/10" aria-hidden="true">{feature.number}</span><feature.icon className="h-7 w-7 text-[#f06424]" aria-hidden="true" /><h3 className="mt-16 text-xl font-bold">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{feature.text}</p><ArrowRight className="mt-auto pt-5 h-4 w-4 text-[#ffb28e] transition group-hover:translate-x-1" aria-hidden="true" /></TiltCard></Link>)}</div>
          </div>
        </section>

        <section id="kontak" className="reveal bg-[#071520] px-5 py-20 text-white sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#ffb28e]">Contact</span>
            <h2 className="font-display mt-5 text-4xl text-white sm:text-5xl">Hubungi Tim ID-MAP</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">Pertanyaan, kerja sama, atau usulan integrasi data? Tim kami siap merespons.</p>
            <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
              <a href="mailto:id.map.admin@gmail.com" className="reveal reveal-rise reveal-delay-1 group rounded-2xl border border-white/20 border-t-2 border-t-[#f06424] bg-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.14]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#ffb28e] transition-colors group-hover:bg-[#f06424] group-hover:text-white">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Email</p>
                <p className="mt-1.5 text-base font-bold text-white">id.map.admin@gmail.com</p>
              </a>
              <a href="tel:+62341395059" className="reveal reveal-rise reveal-delay-2 group rounded-2xl border border-white/20 border-t-2 border-t-[#f06424] bg-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.14]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#ffb28e] transition-colors group-hover:bg-[#f06424] group-hover:text-white">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Telepon</p>
                <p className="mt-1.5 text-base font-bold text-white">(0341) 395059</p>
              </a>
              <a href="https://maps.app.goo.gl/Fb6YgqtmQZL9B8XS9" target="_blank" rel="noopener noreferrer" className="reveal reveal-rise reveal-delay-3 group rounded-2xl border border-white/20 border-t-2 border-t-[#f06424] bg-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.14]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#ffb28e] transition-colors group-hover:bg-[#f06424] group-hover:text-white">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Alamat</p>
                <p className="mt-1.5 text-base font-bold leading-relaxed text-white">Cabdin KP Kab. Malang<br />Jl. Trunojoyo 12 Kepanjen<br />Malang 65153</p>
              </a>
            </div>
            <div className="reveal reveal-rise reveal-delay-2 mt-10 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.1)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2">
                <p className="text-sm font-bold text-white">Lokasi Kantor — Cabdin KP Kab. Malang</p>
                <a href="https://maps.app.goo.gl/Fb6YgqtmQZL9B8XS9" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#ffb28e] underline decoration-[#f06424] decoration-2 underline-offset-4 transition hover:text-white">Buka di Google Maps <span aria-hidden="true">→</span></a>
              </div>
              <div className="overflow-hidden rounded-xl">
                <iframe
                  title="Peta lokasi Cabdin KP Kab. Malang"
                  src="https://www.google.com/maps?q=-8.1463107,112.5683732&z=16&output=embed"
                  className="h-64 w-full border-0 sm:h-80"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="statistik" className="reveal relative isolate overflow-hidden bg-[#0d404f] px-5 py-20 text-white sm:px-10 lg:px-16">
          <div className="bg-statistik absolute inset-0 -z-20 bg-[#0d404f] bg-cover bg-center" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(13,64,79,.92)_0%,rgba(7,21,32,.8)_55%,rgba(7,21,32,.92)_100%)]" />
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#ffb28e]">Statistik Platform</span>
            <h2 className="font-display mt-5 text-4xl text-white sm:text-5xl">Kunjungan &amp; Pengguna</h2>
            <PlatformStats />
          </div>
        </section>

        <section id="footer" className="reveal border-t border-white/10 bg-[#071520] px-5 py-14 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-start"><div><img src="/logo-header.png" alt="ID-MAP" draggable={false} className="h-10 w-auto" /><p className="mt-3 max-w-md text-sm text-white/70">© 2024 ID-MAP. Integrasi Data Mangrove &amp; Pesisir Indonesia.</p><p className="mt-1 max-w-md text-sm text-white/70">Didukung oleh Cabang Dinas Kelautan dan Perikanan<br />Kabupaten Malang.</p></div><div className="flex flex-wrap gap-5 text-sm font-semibold text-white/65"><Link to="/kebijakan-privasi" className="transition-colors hover:text-white">Kebijakan Privasi</Link><Link to="/syarat-ketentuan" className="transition-colors hover:text-white">Syarat &amp; Ketentuan</Link></div></div></section>
      </main>
    </div>
  );
}
