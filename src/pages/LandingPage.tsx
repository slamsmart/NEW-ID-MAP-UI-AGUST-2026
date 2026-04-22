import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, UserPlus, X, Eye, EyeOff, AlertCircle, CheckCircle,
  ShieldCheck, Mail, KeyRound, ArrowRight, Loader2, Radar, ClipboardPenLine, Bot,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

type ModalMode = 'none' | 'login-choice' | 'admin-login' | 'user-login' | 'user-otp' | 'signup' | 'signup-otp';

export default function LandingPage() {
  const { login, loginWithEmail, verifyOTP, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) { navigate('/dashboard', { replace: true }); }
  }, [user, navigate]);

  const [modal, setModal] = useState<ModalMode>('none');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);

  const [suNama, setSuNama] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suUnit, setSuUnit] = useState('');
  const [suProvinsi, setSuProvinsi] = useState('');
  const [suError, setSuError] = useState('');

  const closeModal = () => {
    setModal('none');
    setUsername(''); setPassword(''); setAdminError(''); setShowPass(false);
    setEmail(''); setOtp(''); setEmailError(''); setOtpError(''); setDemoOtp(''); setOtpNotice('');
    setSuNama(''); setSuEmail(''); setSuUnit(''); setSuProvinsi(''); setSuError('');
    setLoading(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (ok) { closeModal(); navigate('/dashboard', { replace: true }); }
    else setAdminError('Username atau password tidak valid.');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Email wajib diisi.'); return; }
    setLoading(true);
    const res = await loginWithEmail(email.trim());
    setLoading(false);
    if (!res.success) { setEmailError(res.error ?? 'Gagal mengirim kode.'); return; }
    setOtpNotice(res.warning ?? '');
    setDemoOtp(res.demoOtp ?? '');
    setModal('user-otp');
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyOTP(email.trim(), otp.trim());
    setLoading(false);
    if (ok) { closeModal(); navigate('/dashboard', { replace: true }); }
    else setOtpError('Kode verifikasi salah atau sudah kedaluwarsa.');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suNama.trim() || !suEmail.trim()) { setSuError('Nama dan email wajib diisi.'); return; }
    setLoading(true);
    const res = await signUp({ nama: suNama, email: suEmail, unit: suUnit, provinsi: suProvinsi });
    setLoading(false);
    if (!res.success) { setSuError(res.error ?? 'Gagal mendaftar.'); return; }
    setOtpNotice(res.warning ?? '');
    if (res.demoOtp) { setDemoOtp(res.demoOtp); setSuEmail(suEmail.trim()); setModal('signup-otp'); return; }
    setSuEmail(suEmail.trim());
    setModal('signup-otp');
  };

  const handleSignUpOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyOTP(suEmail.trim(), otp.trim());
    setLoading(false);
    if (ok) { closeModal(); navigate('/dashboard', { replace: true }); }
    else setOtpError('Kode verifikasi salah atau sudah kedaluwarsa.');
  };

  const featureCards = [
    {
      label: 'SpaceWatch',
      desc: 'Pantau citra satelit Sentinel & Landsat multi-temporal untuk analisis perubahan tutupan mangrove.',
      color: '#38bdf8',
      icon: Radar,
      glow: 'rgba(56, 189, 248, 0.18)',
    },
    {
      label: 'EcoTrack',
      desc: 'Input dan survei data lapangan berbasis mobile dengan kemampuan offline.',
      color: '#34d399',
      icon: ClipboardPenLine,
      glow: 'rgba(52, 211, 153, 0.18)',
    },
    {
      label: 'RestoreAI',
      desc: 'Rekomendasi restorasi & kebijakan berbasis kecerdasan buatan dan data spasial.',
      color: '#fb923c',
      icon: Bot,
      glow: 'rgba(251, 146, 60, 0.18)',
    },
  ] as const;

  return (
    <div className="w-full min-h-screen flex flex-col bg-green-950">
      <nav
        className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 py-3"
        style={{ background: 'rgba(10, 60, 40, 0.88)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo.svg" alt="ID-MAP" className="h-8 sm:h-9 w-auto flex-shrink-0" draggable={false} />
            <span className="truncate text-sm font-bold tracking-wide text-white sm:text-base">ID-MAP</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setModal('login-choice')}
              className="flex items-center justify-center gap-2 rounded-full border border-white/40 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/15 sm:px-5 sm:text-sm"
            >
              <LogIn className="h-4 w-4" /> <span className="hidden xs:inline">Login</span>
            </button>
            <button
              onClick={() => setModal('signup')}
              className="flex items-center justify-center gap-2 rounded-full bg-teal-400 px-3 py-2 text-xs font-semibold text-green-950 transition-all hover:bg-teal-300 sm:px-5 sm:text-sm"
            >
              <UserPlus className="h-4 w-4" /> <span className="hidden xs:inline">Daftar</span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className="relative flex w-full flex-col items-center justify-center overflow-hidden"
        style={{
          minHeight: '100dvh',
          backgroundImage: 'url(/mangrove-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,30,20,0.55) 0%, rgba(0,20,15,0.70) 60%, rgba(0,10,8,0.85) 100%)' }}
        />

        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 text-center pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-24">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-300 sm:text-sm sm:tracking-[0.22em]">
            Platform Monitoring Mangrove dan Ekosistem Pesisir
          </p>

          <div className="mb-5 h-0.5 w-12 rounded-full bg-teal-400" />

          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Integrasi Data Mangrove dan Pesisir
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Platform pemantauan ekosistem mangrove dan pesisir secara terpadu dari data lapangan secara akurat
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/peta')}
              className="w-full rounded-full px-6 py-3 text-base font-bold text-green-950 shadow-xl transition-all hover:scale-[1.02] sm:w-auto sm:px-10"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #14b8a6)' }}
            >
              Jelajahi
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-0 right-0 z-10 hidden flex-col items-center gap-1 sm:flex">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/40 pt-1.5">
            <div className="h-2 w-0.5 animate-bounce rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      <div className="bg-green-950 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-teal-400">Modul Utama</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">Apa yang bisa dilakukan?</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featureCards.map(m => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="group rounded-3xl border border-white/10 p-5 transition-all hover:-translate-y-1 sm:p-6"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))' }}
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 shadow-lg"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${m.glow}, rgba(255,255,255,0.04))` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: m.color }} />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: m.color }}>
                    {m.label}
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-green-950 px-4 py-5 text-center text-xs text-white/40">
        © 2025 ID-MAP — Dinas Kelautan dan Perikanan
      </div>

      {modal !== 'none' && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="flex min-h-full items-center justify-center py-4 sm:py-8">
            {modal === 'login-choice' && (
              <ModalBox title="Masuk ke ID-MAP" onClose={closeModal}>
                <p className="mb-6 text-center text-sm text-gray-500">Pilih jenis akun Anda</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setModal('admin-login')}
                    className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-green-200 p-5 transition-all hover:border-green-600 hover:bg-green-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 transition-transform group-hover:scale-105">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">Verifikator / Admin</p>
                      <p className="mt-0.5 text-xs text-gray-500">Username &amp; Password</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                  </button>
                  <button
                    onClick={() => setModal('user-login')}
                    className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-blue-200 p-5 transition-all hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 transition-transform group-hover:scale-105">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">Pengguna Umum</p>
                      <p className="mt-0.5 text-xs text-gray-500">Email &amp; Kode Verifikasi</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                  </button>
                </div>
                <p className="mt-5 text-center text-xs text-gray-400">
                  Belum punya akun?{' '}
                  <button onClick={() => setModal('signup')} className="font-semibold text-green-700 hover:underline">Sign Up di sini</button>
                </p>
              </ModalBox>
            )}

            {modal === 'admin-login' && (
              <ModalBox title="Login Verifikator / Admin" onClose={closeModal}>
                <form onSubmit={handleAdminLogin} className="mt-2 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Username</label>
                    <input
                      autoFocus
                      value={username}
                      onChange={e => { setUsername(e.target.value); setAdminError(''); }}
                      placeholder="contoh: verifikator / admin"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setAdminError(''); }}
                        placeholder="password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {adminError && <ErrorBox msg={adminError} />}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 py-2.5 font-bold text-white transition-colors hover:bg-green-700"
                  >
                    <LogIn className="h-4 w-4" /> Masuk
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-gray-400">
                  <button onClick={() => setModal('login-choice')} className="text-blue-600 hover:underline">← Kembali</button>
                </p>
              </ModalBox>
            )}

            {modal === 'user-login' && (
              <ModalBox title="Login dengan Email" onClose={closeModal}>
                <p className="mb-5 text-xs text-gray-500">Kami akan mengirimkan kode verifikasi 6 digit ke email Anda.</p>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Alamat Email</label>
                    <input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="nama@email.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {emailError && <ErrorBox msg={emailError} />}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {loading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-gray-400">
                  <button onClick={() => setModal('login-choice')} className="text-blue-600 hover:underline">← Kembali</button>
                  {' · '}Belum terdaftar?{' '}
                  <button onClick={() => setModal('signup')} className="font-semibold text-green-700 hover:underline">Sign Up</button>
                </p>
              </ModalBox>
            )}

            {modal === 'user-otp' && (
              <ModalBox title="Masukkan Kode Verifikasi" onClose={closeModal}>
                <p className="mb-1 text-xs text-gray-500">Kode dikirim ke <strong>{email}</strong></p>
                {otpNotice && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
                    <p className="text-xs text-amber-800">{otpNotice}</p>
                  </div>
                )}
                {demoOtp && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-center">
                    <p className="text-xs font-medium text-blue-600">Kode Verifikasi</p>
                    <p className="mt-1 text-2xl font-black tracking-widest text-blue-800">{demoOtp}</p>
                  </div>
                )}
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Kode 6 Digit</label>
                    <input
                      autoFocus
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center font-mono text-xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {otpError && <ErrorBox msg={otpError} />}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    <KeyRound className="h-4 w-4" /> Verifikasi &amp; Masuk
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-gray-400">
                  <button onClick={() => setModal('user-login')} className="text-blue-600 hover:underline">← Kirim ulang</button>
                </p>
              </ModalBox>
            )}

            {modal === 'signup' && (
              <ModalBox title="Daftar Akun Baru" onClose={closeModal}>
                <p className="mb-5 text-xs text-gray-500">Buat akun pengguna untuk mengakses data mangrove.</p>
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      value={suNama}
                      onChange={e => { setSuNama(e.target.value); setSuError(''); }}
                      placeholder="Nama lengkap Anda"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={suEmail}
                      onChange={e => { setSuEmail(e.target.value); setSuError(''); }}
                      placeholder="nama@email.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Instansi / Unit Kerja</label>
                    <input
                      value={suUnit}
                      onChange={e => setSuUnit(e.target.value)}
                      placeholder="cth: Dinas Kelautan Kab. Situbondo"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Provinsi</label>
                    <input
                      value={suProvinsi}
                      onChange={e => setSuProvinsi(e.target.value)}
                      placeholder="cth: Jawa Timur"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  {suError && <ErrorBox msg={suError} />}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Akun baru mendapat akses <strong>Viewer</strong>. Akses input data lapangan memerlukan role Admin dari Verifikator.
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 py-2.5 font-bold text-white transition-colors hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4" /> Daftar &amp; Kirim Kode
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-gray-400">
                  Sudah punya akun?{' '}
                  <button onClick={() => setModal('login-choice')} className="font-semibold text-green-700 hover:underline">Login</button>
                </p>
              </ModalBox>
            )}

            {modal === 'signup-otp' && (
              <ModalBox title="Verifikasi Email" onClose={closeModal}>
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <p className="text-xs text-green-800">Akun berhasil dibuat! Verifikasi email Anda untuk masuk.</p>
                </div>
                <p className="mb-1 text-xs text-gray-500">Kode dikirim ke <strong>{suEmail}</strong></p>
                {otpNotice && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
                    <p className="text-xs text-amber-800">{otpNotice}</p>
                  </div>
                )}
                {demoOtp && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-center">
                    <p className="text-xs font-medium text-blue-600">Kode Verifikasi</p>
                    <p className="mt-1 text-2xl font-black tracking-widest text-blue-800">{demoOtp}</p>
                  </div>
                )}
                <form onSubmit={handleSignUpOTP} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Kode 6 Digit</label>
                    <input
                      autoFocus
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center font-mono text-xl tracking-widest focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  {otpError && <ErrorBox msg={otpError} />}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 py-2.5 font-bold text-white transition-colors hover:bg-green-700"
                  >
                    <KeyRound className="h-4 w-4" /> Verifikasi &amp; Masuk
                  </button>
                </form>
              </ModalBox>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModalBox({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-300 transition-colors hover:text-gray-500"
      >
        <X className="h-5 w-5" />
      </button>
      <h2 className="mb-1 pr-8 text-lg font-bold text-gray-800">{title}</h2>
      <div className="mb-4 h-0.5 w-8 rounded-full bg-green-500" />
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
      <p className="text-xs text-red-600">{msg}</p>
    </div>
  );
}
