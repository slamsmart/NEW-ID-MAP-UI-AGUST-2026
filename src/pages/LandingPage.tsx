import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn, UserPlus, ShieldCheck, Radar, ClipboardPenLine, Bot, Leaf,
  Mail, Phone, MapPin, Menu, X,
} from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useAuth } from '../context/useAuth';
import { useAccountNotice } from '../components/AccountRequiredNotice';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'fitur', label: 'Fitur Utama' },
  { id: 'contact', label: 'Contact' },
] as const;

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { show: showAccountNotice } = useAccountNotice();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (user) { navigate('/dashboard', { replace: true }); }
  }, [user, navigate]);

  // Tutup drawer saat back button Android ditekan
  useEffect(() => {
    if (!navOpen) return;
    const handler = () => setNavOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navOpen]);

  const featureCards = [
    {
      label: 'SpaceWatch',
      desc: 'Pantau citra satelit Sentinel & Landsat multi-temporal untuk analisis perubahan tutupan mangrove dari atas.',
      color: '#38bdf8',
      icon: Radar,
      glow: 'rgba(56, 189, 248, 0.20)',
    },
    {
      label: 'EcoTrack',
      desc: 'Input dan survei data lapangan berbasis mobile dengan kemampuan offline-first oleh petugas daerah.',
      color: '#34d399',
      icon: ClipboardPenLine,
      glow: 'rgba(52, 211, 153, 0.20)',
    },
    {
      label: 'BioSense',
      desc: 'Sensor lingkungan & analisis biodiversitas — salinitas, pH, suhu, hingga komposisi spesies pesisir.',
      color: '#a78bfa',
      icon: Leaf,
      glow: 'rgba(167, 139, 250, 0.20)',
    },
    {
      label: 'RestoreAI',
      desc: 'Rekomendasi restorasi & kebijakan berbasis kecerdasan buatan dan data spasial multi-sumber.',
      color: '#fb923c',
      icon: Bot,
      glow: 'rgba(251, 146, 60, 0.20)',
    },
  ] as const;

  const scrollTo = (id: string) => {
    setNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // ROOT: tidak ada overflow hidden/clip sama sekali
    <div
      className="relative w-full min-h-screen flex flex-col font-sans text-white"
      style={{
        background:
          'radial-gradient(70% 55% at 12% 10%, rgba(45,212,191,0.35) 0%, transparent 60%),' +
          'radial-gradient(60% 50% at 92% 22%, rgba(34,197,94,0.30) 0%, transparent 60%),' +
          'radial-gradient(80% 70% at 80% 95%, rgba(13,148,136,0.28) 0%, transparent 65%),' +
          'radial-gradient(80% 70% at 8% 90%, rgba(16,185,129,0.22) 0%, transparent 65%),' +
          'linear-gradient(135deg, #042f2e 0%, #064e3b 30%, #0c4a6e 70%, #0f172a 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(20,184,166,0.10) 0%, transparent 50%)',
          mixBlendMode: 'screen',
          zIndex: 0,
        }}
      />

      {/* ── NAV ──
          FIX: backdrop-blur pada fixed element adalah penyebab utama Chrome Android
          total freeze. GPU compositor tidak bisa handle fixed+blur+scroll bersamaan
          di kebanyakan device Android. Diganti background solid semi-transparan.
          transform:translateZ(0) memaksa nav ke GPU layer tersendiri.
      */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3"
        style={{
          background: 'rgba(4,47,46,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={() => scrollTo('home')} className="flex min-w-0 items-center gap-3">
            <img src="/logo.svg" alt="ID-MAP" className="h-8 sm:h-9 w-auto flex-shrink-0" draggable={false} />
            <span className="truncate text-sm font-bold tracking-wide text-white sm:text-base">ID-MAP</span>
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <li key={link.id}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-all hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              title="Login khusus admin / verifikator"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/65 transition-all hover:bg-white/10 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
            <span className="hidden sm:block h-5 w-px bg-white/15" aria-hidden />

            {isClerkConfigured ? (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-full border border-white/40 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/15 sm:px-5 sm:text-sm">
                    <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button type="button" className="flex items-center justify-center gap-2 rounded-full bg-teal-400 px-3 py-2 text-xs font-semibold text-emerald-950 transition-all hover:bg-teal-300 sm:px-5 sm:text-sm">
                    <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Daftar</span>
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <button onClick={() => showAccountNotice()} className="flex items-center justify-center gap-2 rounded-full border border-white/40 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/15 sm:px-5 sm:text-sm">
                  <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                </button>
                <button onClick={() => showAccountNotice()} className="flex items-center justify-center gap-2 rounded-full bg-teal-400 px-3 py-2 text-xs font-semibold text-emerald-950 transition-all hover:bg-teal-300 sm:px-5 sm:text-sm">
                  <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Daftar</span>
                </button>
              </>
            )}

            <button
              onClick={() => setNavOpen(o => !o)}
              className="md:hidden rounded-full p-2 text-white/85 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer — backdrop-blur dihapus, pakai solid bg */}
        {navOpen && (
          <div
            className="md:hidden mt-3 mx-2 rounded-2xl border border-white/10 p-2"
            style={{ background: 'rgba(4,47,46,0.98)' }}
          >
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/10"
              >
                {link.label}
              </button>
            ))}
            <div className="my-1 h-px bg-white/10" />
            <div className="flex flex-col gap-2 px-1 py-1">
              {isClerkConfigured ? (
                <>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <button type="button" onClick={() => setNavOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-all hover:bg-teal-300">
                      <UserPlus className="h-4 w-4" /> Daftar Akun
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button type="button" onClick={() => setNavOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10">
                      <LogIn className="h-4 w-4" /> Login
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setNavOpen(false); showAccountNotice(); }} className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-all hover:bg-teal-300">
                    <UserPlus className="h-4 w-4" /> Daftar Akun
                  </button>
                  <button type="button" onClick={() => { setNavOpen(false); showAccountNotice(); }} className="flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10">
                    <LogIn className="h-4 w-4" /> Login
                  </button>
                </>
              )}
            </div>
            <div className="my-1 h-px bg-white/10" />
            <Link to="/login" onClick={() => setNavOpen(false)} className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              <ShieldCheck className="h-4 w-4" />
              Login admin / verifikator
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 scroll-mt-20"
        style={{
          minHeight: 'min(88dvh, 760px)',
          backgroundImage: 'url(/hero-mangrove.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(4,47,46,0.78) 0%, rgba(13,148,136,0.55) 45%, rgba(15,23,42,0.78) 100%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 12% 10%, rgba(45,212,191,0.30) 0%, transparent 60%),radial-gradient(55% 50% at 90% 18%, rgba(20,184,166,0.25) 0%, transparent 60%),radial-gradient(70% 60% at 80% 95%, rgba(13,148,136,0.30) 0%, transparent 65%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(4,47,46,0.85) 100%)' }} />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-5 text-center sm:px-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300 sm:mb-4 sm:text-sm sm:tracking-[0.22em]">
            Platform Monitoring Mangrove dan Ekosistem Pesisir
          </p>
          <div className="mb-4 h-0.5 w-10 rounded-full bg-teal-400 sm:mb-5 sm:w-12" />
          <h1 className="max-w-4xl text-[28px] font-extrabold leading-[1.15] text-white drop-shadow-lg sm:text-5xl md:text-6xl tracking-tight">
            Selamat Datang di ID-MAP
          </h1>
          <p className="lp-justify mt-4 max-w-2xl text-[14px] leading-relaxed text-white/85 sm:mt-5 sm:text-base">
            Temukan informasi data mangrove dan pesisir dalam satu platform dari data lapangan hingga visualisasi interaktif untuk memahami kondisi lingkungan secara cepat dan tepat.
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <button
              onClick={() => navigate('/peta')}
              className="w-full rounded-full px-8 py-3 text-base font-bold text-emerald-950 shadow-xl transition-all hover:scale-[1.02] sm:w-auto sm:px-10"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #14b8a6)' }}
            >
              Jelajahi Peta
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="w-full rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white/90 transition-all hover:bg-white/10 sm:w-auto sm:px-10"
            >
              Tentang Kami
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="relative z-10 px-5 py-14 sm:px-6 sm:py-24 scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-teal-300 sm:text-xs">About</p>
            <h2 className="text-2xl font-bold tracking-tight leading-tight sm:text-4xl">Tentang ID-MAP & Visi Konservasi</h2>
            <div className="my-4 h-0.5 w-10 rounded-full bg-teal-400 sm:my-5 sm:w-12" />
            <p className="lp-justify text-[14px] leading-relaxed text-white/80 sm:text-base">
              <strong className="text-white">ID-MAP</strong> (Integrasi Data Mangrove dan Pesisir) adalah platform terpadu yang dikelola oleh Cabang Dinas Kelautan dan Perikanan Kab. Malang untuk memantau, memetakan, serta mendukung restorasi ekosistem mangrove dan pesisir di Indonesia.
            </p>
            <p className="lp-justify mt-3 text-[14px] leading-relaxed text-white/75 sm:mt-4 sm:text-base">
              Misi kami: menghadirkan data lapangan, citra satelit, dan kecerdasan buatan dalam satu antarmuka memungkinkan pemerintah, akademisi, dan masyarakat untuk mengambil keputusan berbasis bukti demi <em>blue economy</em> yang lestari.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-white/85 sm:mt-6 sm:text-sm">
              {[
                'Pemantauan tutupan mangrove multi-temporal',
                'Survei lapangan offline-first oleh petugas daerah',
                'Verifikasi data oleh tim ahli sebelum publikasi',
                'Rekomendasi restorasi berbasis AI & spasial',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <Leaf className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:aspect-[4/3] sm:rounded-3xl"
            style={{ backgroundImage: 'url(/mangrove-hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.30) 0%, rgba(15,23,42,0.55) 100%)' }} />
            {/* FIX: backdrop-blur dihapus, pakai solid bg */}
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 p-4" style={{ background: 'rgba(4,47,46,0.88)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-300">Visi 2030</p>
              <p className="mt-1 text-sm font-semibold text-white">Indonesia menjadi pusat data dan riset mangrove tropis terdepan di Asia Tenggara.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FITUR UTAMA ── */}
      <section id="fitur" className="relative z-10 px-5 py-14 sm:px-6 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center sm:mb-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-teal-300 sm:text-xs">Modul Utama</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Fitur Utama Platform</h2>
            <div className="mx-auto my-4 h-0.5 w-10 rounded-full bg-teal-400 sm:my-5 sm:w-12" />
            <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-white/75 sm:text-base">
              Empat modul yang saling terhubung untuk siklus penuh: <em>observe → record → understand → act</em>.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {featureCards.map(m => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="group rounded-2xl border border-white/10 p-5 transition-all hover:-translate-y-1 hover:border-white/20 sm:rounded-3xl sm:p-6"
                  // FIX: backdrop-blur-sm dihapus dari semua cards
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))' }}
                >
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${m.glow}, rgba(255,255,255,0.04))` }}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: m.color }} />
                  </div>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs" style={{ color: m.color }}>{m.label}</div>
                  <p className="lp-justify text-[13px] leading-relaxed text-white/75 sm:text-sm">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="relative z-10 px-5 py-14 sm:px-6 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center sm:mb-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-teal-300 sm:text-xs">Contact</p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Hubungi Tim ID-MAP</h2>
            <div className="mx-auto my-4 h-0.5 w-10 rounded-full bg-teal-400 sm:my-5 sm:w-12" />
            <p className="mx-auto max-w-2xl text-[14px] leading-relaxed text-white/75 sm:text-base">
              Pertanyaan, kerja sama, atau usulan integrasi data? Tim kami siap merespons.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {[
              { icon: Mail, label: 'Email', value: 'id.map.admin@gmail.com', href: 'mailto:id.map.admin@gmail.com' },
              { icon: Phone, label: 'Telepon', value: '(0341) 395059', href: 'tel:+6234395059' },
              { icon: MapPin, label: 'Alamat', value: 'Cabdin KP Kab. Malang\nJl. Trunojoyo 12 Kepanjen Malang 65153', href: 'https://maps.app.goo.gl/Av23rVxdUS2v4JvW9' },
            ].map(c => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border border-white/10 p-4 transition-all hover:-translate-y-1 hover:border-teal-400/40 sm:flex-col sm:p-6"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300 group-hover:bg-teal-400/25 sm:h-11 sm:w-11">
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 sm:text-[11px]">{c.label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-white break-words sm:mt-1 sm:text-sm">{c.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-xs text-white/50">
        <p>© 2025 ID-MAP — Dinas Kelautan dan Perikanan Provinsi Jawa Timur</p>
        <p className="mt-1.5">
          <Link to="/login" className="inline-flex items-center gap-1 text-white/60 hover:text-white transition-colors">
            <ShieldCheck className="h-3 w-3" />
            Login admin / verifikator
          </Link>
        </p>
      </footer>
    </div>
  );
}