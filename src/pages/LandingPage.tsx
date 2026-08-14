import { useEffect, useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Button, Badge, Card, CardContent } from '../components/ui';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogIn, UserPlus, ShieldCheck, Radar, ClipboardPenLine, Bot, Leaf,
  Mail, Phone, MapPin, Menu, X, CheckCircle2, Eye, Users, FileText,
} from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useAccountNotice } from '../components/AccountRequiredNotice';
import { recordVisit } from '../lib/statsClient';
import { convex, isConvexConfigured } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const NAV_LINKS = [
  { id: 'home', label: 'Beranda' },
  { id: 'about', label: 'Tentang' },
  { id: 'fitur', label: 'Fitur Utama' },
  { id: 'contact', label: 'Kontak' },
] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const { show: showAccountNotice } = useAccountNotice();
  const [navOpen, setNavOpen] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Landing page accessible for all roles — no redirect
  }, []);

  // Record visit on every page load
  useEffect(() => {
    document.title = 'ID-MAP — Integrasi Data Mangrove Pesisir';
    void recordVisit();
    // Fetch stats for display
    if (isConvexConfigured()) {
      const statsApi = (api as any).stats;
      if (statsApi?.getStats) {
        convex.query(statsApi.getStats, {}).then((data: any) => {
          if (data) {
            setVisitCount(data.totalVisits ?? 0);
            setUserCount(data.totalUsers ?? 0);
          }
        }).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const handler = () => setNavOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navOpen]);

  const featureCards = [
    {
      label: 'SPACEWATCH',
      desc: 'Pantau citra satelit Sentinel & Landsat multi-temporal untuk analisis perubahan tutupan mangrove dari atas.',
      icon: Radar,
      bg: 'bg-[#064e3b]',
    },
    {
      label: 'GROUNDCHECK',
      desc: 'Input dan survei data lapangan berbasis mobile dengan kemampuan offline-first oleh petugas daerah.',
      icon: ClipboardPenLine,
      bg: 'bg-[#86f2e4]',
    },
    {
      label: 'ARCGIS ANALYST',
      desc: 'Sensor lingkungan & analisis biodiversitas — salinitas, pH, suhu, hingga komposisi spesies pesisir.',
      icon: Leaf,
      bg: 'bg-[#d5e3fc]',
    },
    {
      label: 'AI ANALYST / RECOMMENDATION',
      desc: 'Rekomendasi restorasi & kebijakan berbasis kecerdasan buatan dan data spasial multi-sumber.',
      icon: Bot,
      bg: 'bg-[#b0f0d6]',
    },
  ] as const;

  useScrollReveal();

  const scrollTo = (id: string) => {
    setNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col font-sans bg-[#f7f9fb] text-[#191c1e]">

      {/* ── NAV (TopAppBar) ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-white shadow-sm border-b border-gray-200"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2">
            <img src="/logo.png" alt="ID-MAP" className="h-9 w-auto" draggable={false} />
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    i === 0
                      ? 'text-[#006a61] border-b-2 border-[#006a61] pb-1'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <a
                href="/pedoman-teknis"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Pedoman Teknis
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              title="Login admin / verifikator"
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <span className="hidden sm:block h-5 w-px bg-gray-200" aria-hidden />

            {isClerkConfigured ? (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button type="button" className="text-gray-700 text-sm font-semibold hover:text-gray-900 transition-all">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button type="button" className="bg-[#006a61] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#005049] transition-all">
                    Daftar
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <button onClick={() => showAccountNotice()} className="text-gray-700 text-sm font-semibold hover:text-gray-900 transition-all">
                  Login
                </button>
                <button onClick={() => showAccountNotice()} className="bg-[#006a61] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#005049] transition-all">
                  Daftar
                </button>
              </>
            )}

            <button
              onClick={() => setNavOpen(o => !o)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
              aria-label="Toggle menu"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="md:hidden mt-3 mx-2 rounded-2xl border border-gray-200 p-2 bg-white shadow-lg">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.label}
              </button>
            ))}
            <a
              href="/pedoman-teknis"
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-2 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <FileText className="w-4 h-4" />
              Pedoman Teknis
            </a>
            <div className="my-1 h-px bg-gray-200" />
            <div className="flex flex-col gap-2 px-1 py-1">
              {isClerkConfigured ? (
                <>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <button type="button" onClick={() => setNavOpen(false)} className="w-full rounded-full bg-[#006a61] px-4 py-2.5 text-sm font-bold text-white">
                      <UserPlus className="h-4 w-4 inline mr-2" />Daftar
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button type="button" onClick={() => setNavOpen(false)} className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">
                      <LogIn className="h-4 w-4 inline mr-2" />Login
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setNavOpen(false); showAccountNotice(); }} className="w-full rounded-full bg-[#006a61] px-4 py-2.5 text-sm font-bold text-white">
                    <UserPlus className="h-4 w-4 inline mr-2" />Daftar
                  </button>
                  <button type="button" onClick={() => { setNavOpen(false); showAccountNotice(); }} className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">
                    <LogIn className="h-4 w-4 inline mr-2" />Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── HERO ── */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
          style={{
            backgroundImage: 'url(/hero-mangrove.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* clean solid dark overlay — no green gradient */}
          <div className="absolute inset-0 bg-[#0a0f0d]/60" />

          {/* subtle noise texture for depth */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px',
            }}
          />

          <div className="relative z-10 max-w-4xl px-6 text-center">
            {/* badge */}
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white/80 backdrop-blur-sm mb-8 px-4 py-1.5 text-xs tracking-[0.15em] uppercase rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 mr-1 inline-block" />
                Platform Monitoring Mangrove &amp; Ekosistem Pesisir
              </Badge>
            </div>

            <h1
              className="text-white font-extrabold mb-5 tracking-tight leading-[1.06]"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontFeatureSettings: '"ss01"' }}
            >
              {/* Baris 1 heading */}
              <span
                className="block animate-text-fade"
                style={{ animationDelay: '0.25s' }}
              >
                Integrasi Data Mangrove
              </span>
              {/* Baris 2 heading — muncul lebih lambat */}
              <span
                className="block text-white/55 font-bold animate-text-fade"
                style={{ animationDelay: '0.45s' }}
              >
                &amp; Pesisir Jawa Timur
              </span>
            </h1>

            <p
              className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto leading-[1.75] mb-10 font-normal tracking-wide animate-fade-up"
              style={{ animationDelay: '0.65s' }}
            >
              Satu platform untuk memantau, memetakan, dan merestorasi ekosistem mangrove — dari data lapangan hingga visualisasi spasial interaktif.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up"
              style={{ animationDelay: '0.80s' }}
            >
              <Button variant="hero" size="lg" onClick={() => navigate('/peta')}>
                <MapPin className="w-4 h-4" />
                Lihat Peta Interaktif
              </Button>
              <Button variant="hero-outline" size="lg" onClick={() => scrollTo('about')}>
                Tentang Kami
              </Button>
            </div>
          </div>

          {/* scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50">
            <span className="text-white text-[10px] uppercase tracking-widest font-medium">Scroll</span>
            <div className="w-px h-8 bg-white/40 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full bg-white rounded-full animate-[scrolldown_1.6s_ease-in-out_infinite]" style={{ height: '40%' }} />
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="py-20 bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 reveal">
                <Badge variant="secondary" className="rounded text-xs tracking-wider uppercase">About</Badge>
                <h2 className="text-[#003527] text-3xl font-bold tracking-tight leading-tight">Tentang ID-MAP &amp; Visi Konservasi</h2>
                <div className="space-y-4 text-[#404944] text-base leading-relaxed">
                  <p>
                    <strong className="text-[#003527]">ID-MAP</strong> (Integrasi Data Mangrove dan Pesisir) adalah platform terpadu yang dikelola oleh Cabang Dinas Kelautan dan Perikanan Kab. Malang untuk memantau, memetakan, serta mendukung restorasi ekosistem mangrove dan pesisir di Indonesia.
                  </p>
                  <p>
                    Misi kami: menghadirkan data lapangan, citra satelit, dan kecerdasan buatan dalam satu antarmuka memungkinkan pemerintah, akademisi, dan masyarakat untuk mengambil keputusan berbasis bukti demi <em>blue economy</em> yang lestari.
                  </p>
                </div>
                <ul className="space-y-3 pt-4">
                  {[
                    'Pemantauan tutupan mangrove multi-temporal',
                    'Survei lapangan offline-first oleh petugas daerah',
                    'Verifikasi data oleh tim ahli sebelum publikasi',
                    'Rekomendasi restorasi berbasis AI & spasial',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#006a61] mt-0.5 flex-shrink-0" />
                      <span className="text-[#191c1e] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative group reveal reveal-delay-2">
                <div className="absolute -inset-4 bg-[#003527]/5 rounded-2xl -rotate-2 transition-transform group-hover:rotate-0" />
                <div className="relative overflow-hidden rounded-xl shadow-xl border border-[#bfc9c3]">
                  <div
                    className="w-full aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: 'url(/mangrove-hero.webp)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FITUR UTAMA ── */}
        <section id="fitur" className="py-20 bg-[#f7f9fb] scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6 text-center mb-16 reveal">
            <Badge variant="secondary" className="rounded text-xs tracking-wider uppercase mb-4">Modul Utama</Badge>
            <h2 className="text-[#003527] text-3xl font-bold tracking-tight leading-tight mt-3 mb-4">Fitur Utama Platform</h2>
            <p className="text-[#404944] text-base max-w-2xl mx-auto leading-relaxed text-balance">
              Empat modul yang saling terhubung untuk siklus penuh: <em>observe → record → understand → act</em>
            </p>
          </div>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((m, i) => {
                const Icon = m.icon;
                const delays = ['reveal-delay-1','reveal-delay-2','reveal-delay-3','reveal-delay-4'];
                return (
                  <Card
                    key={m.label}
                    className={`reveal reveal-once ${delays[i]} p-8 hover:border-[#006a61] hover:shadow-lg group cursor-default`}
                  >
                    <CardContent className="p-0">
                      <div className={`w-14 h-14 ${m.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-[#003527] text-base font-semibold mb-2 tracking-tight">{m.label}</h3>
                      <p className="text-[#404944] text-sm leading-relaxed">{m.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-[#003527]">
          <div className="max-w-6xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight mb-4 reveal">Mulai Kontribusi Anda Sekarang</h2>
            <p className="text-lg max-w-2xl mx-auto mb-10 text-white/65 leading-relaxed font-normal reveal reveal-delay-1">
              Akses data real-time dan dukung pelestarian ekosistem pesisir Indonesia bersama ID-MAP.
            </p>
            <div className="flex flex-wrap justify-center gap-4 reveal reveal-delay-2">
              <Button size="xl" className="bg-white text-[#003527] rounded-full hover:bg-white/90">
                Hubungi Petugas
              </Button>
              <Button size="xl" variant="ghost" className="border border-white/30 text-white rounded-full hover:bg-white/10">
                Lihat Dokumentasi
              </Button>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-20 bg-white scroll-mt-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="mb-10 text-center reveal">
              <Badge variant="secondary" className="rounded text-xs tracking-wider uppercase mb-3">Contact</Badge>
              <h2 className="text-[#003527] text-3xl font-bold tracking-tight mt-2">Hubungi Tim ID-MAP</h2>
              <p className="text-[#404944] text-base max-w-2xl mx-auto mt-4">
                Pertanyaan, kerja sama, atau usulan integrasi data? Tim kami siap merespons.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', delay: 'reveal-delay-1', value: 'id.map.admin@gmail.com', href: 'mailto:id.map.admin@gmail.com' },
                { icon: Phone, label: 'Telepon', delay: 'reveal-delay-2', value: '(0341) 395059', href: 'tel:+6234395059' },
                { icon: MapPin, label: 'Alamat', delay: 'reveal-delay-3', value: 'Cabdin KP Kab. Malang\nJl. Trunojoyo 12 Kepanjen Malang 65153', href: 'https://maps.app.goo.gl/Av23rVxdUS2v4JvW9' },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className={`reveal ${c.delay} group flex items-start gap-3 rounded-2xl border border-[#bfc9c3] p-6 transition-all hover:-translate-y-1 hover:border-[#006a61] hover:shadow-md bg-[#f7f9fb]`}
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#86f2e4]/30 text-[#006a61] group-hover:bg-[#86f2e4]/50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#707974]">{c.label}</p>
                      <p className="mt-1 text-sm font-medium text-[#191c1e] whitespace-pre-line">{c.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── STATS VISITOR ── */}
      <section className="py-12 bg-[#f0fdf4] border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-[#006a61] text-xs font-semibold uppercase tracking-widest mb-2">Statistik Platform</p>
            <h2 className="text-[#003527] text-2xl font-semibold">Kunjungan & Pengguna</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="reveal reveal-delay-1 bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-medium text-gray-900">{visitCount.toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-500 mt-1">Total Kunjungan</p>
            </div>
            <div className="reveal reveal-delay-2 bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-medium text-gray-900">{userCount.toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-500 mt-1">Pengguna Terdaftar</p>
            </div>
            <div className="reveal reveal-delay-3 bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
              </div>
              <p className="text-3xl font-medium text-gray-900">Live</p>
              <p className="text-sm text-gray-500 mt-1">Status Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#003527] border-t border-white/10">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-xl font-bold text-white">ID-MAP</span>
          <p className="text-white/70 text-sm text-center md:text-left max-w-md">
            © 2024 ID-MAP. Integrasi Data Mangrove &amp; Pesisir Indonesia. Didukung oleh Cabang Dinas Kelautan dan Perikanan Kabupaten Malang.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <a className="text-white/70 hover:text-white transition-colors text-sm font-medium" href="#">Kebijakan Privasi</a>
          <a className="text-white/70 hover:text-white transition-colors text-sm font-medium" href="#">Syarat &amp; Ketentuan</a>
          <a className="text-white/70 hover:text-white transition-colors text-sm font-medium" href="#">Peta Situs</a>
          <a className="text-white/70 hover:text-white transition-colors text-sm font-medium" href="#">Hubungi Kami</a>
        </div>
      </footer>
    </div>
  );
}
