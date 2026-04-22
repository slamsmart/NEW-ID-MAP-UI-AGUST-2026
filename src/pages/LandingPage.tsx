import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, UserPlus, X, Eye, EyeOff, AlertCircle, CheckCircle,
  ShieldCheck, Mail, KeyRound, ArrowRight, Loader2,
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

  return (
    <div className="w-full min-h-screen flex flex-col">

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(10, 60, 40, 0.88)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ID-MAP" className="h-9 w-auto" draggable={false} />
          <span className="text-white font-bold text-base tracking-wide hidden sm:block">ID-MAP</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModal('login-choice')}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/15 transition-all"
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
          <button
            onClick={() => setModal('signup')}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-teal-400 text-green-950 hover:bg-teal-300 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Daftar
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div
        className="relative w-full flex flex-col items-center justify-center"
        style={{
          minHeight: '100vh',
          backgroundImage: 'url(/mangrove-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,30,20,0.55) 0%, rgba(0,20,15,0.70) 60%, rgba(0,10,8,0.85) 100%)' }} />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center px-4 text-center pt-24 pb-16">
          <p className="text-teal-300 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase mb-4">
            Sistem Informasi Mangrove &amp; Pesisir
          </p>

          {/* Decorative underline */}
          <div className="w-12 h-0.5 bg-teal-400 mb-5 rounded-full" />

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl drop-shadow-lg">
            Integrasi Data Mangrove dan Pesisir
          </h1>

          <p className="mt-5 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
            Platform pemantauan ekosistem mangrove dan pesisir secara terpadu — dari data lapangan hingga peta interaktif nasional.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={() => navigate('/peta')}
              className="px-10 py-3 rounded-full font-bold text-green-950 text-base shadow-xl transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6ee7b7, #14b8a6)' }}
            >
              Jelajahi
            </button>
          </div>
        </div>

        {/* Bottom wave / scroll hint */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 z-10">
          <div className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
            <div className="w-0.5 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div className="bg-green-950 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-400 text-xs font-semibold tracking-widest uppercase text-center mb-2">Modul Utama</p>
          <h2 className="text-white text-2xl font-bold text-center mb-8">Apa yang bisa dilakukan?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: 'SpaceWatch',
                desc: 'Pantau citra satelit Sentinel & Landsat multi-temporal untuk analisis perubahan tutupan mangrove.',
                color: '#0ea5e9',
                icon: '🛰️',
              },
              {
                label: 'EcoTrack',
                desc: 'Input dan survei data lapangan berbasis mobile dengan kemampuan offline.',
                color: '#22c55e',
                icon: '📋',
              },
              {
                label: 'RestoreAI',
                desc: 'Rekomendasi restorasi & kebijakan berbasis kecerdasan buatan dan data spasial.',
                color: '#f97316',
                icon: '🤖',
              },
            ].map(m => (
              <div
                key={m.label}
                className="rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all group"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-3xl mb-3">{m.icon}</div>
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: m.color }}
                >
                  {m.label}
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-green-950 border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2025 ID-MAP — Dinas Kelautan dan Perikanan
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MODALS                                      */}
      {/* ═══════════════════════════════════════════ */}
      {modal !== 'none' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {modal === 'login-choice' && (
            <ModalBox title="Masuk ke ID-MAP" onClose={closeModal}>
              <p className="text-sm text-gray-500 mb-6 text-center">Pilih jenis akun Anda</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setModal('admin-login')}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-green-200 rounded-2xl hover:border-green-600 hover:bg-green-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Verifikator / Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Username &amp; Password</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                </button>
                <button
                  onClick={() => setModal('user-login')}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-blue-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Pengguna Umum</p>
                    <p className="text-xs text-gray-500 mt-0.5">Email &amp; Kode Verifikasi</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-5">
                Belum punya akun?{' '}
                <button onClick={() => setModal('signup')} className="text-green-700 font-semibold hover:underline">Sign Up di sini</button>
              </p>
            </ModalBox>
          )}

          {modal === 'admin-login' && (
            <ModalBox title="Login Verifikator / Admin" onClose={closeModal}>
              <form onSubmit={handleAdminLogin} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                  <input
                    autoFocus
                    value={username}
                    onChange={e => { setUsername(e.target.value); setAdminError(''); }}
                    placeholder="contoh: verifikator / admin"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setAdminError(''); }}
                      placeholder="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {adminError && <ErrorBox msg={adminError} />}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-green-800 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                  <LogIn className="w-4 h-4" /> Masuk
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => setModal('login-choice')} className="text-blue-600 hover:underline">← Kembali</button>
              </p>
            </ModalBox>
          )}

          {modal === 'user-login' && (
            <ModalBox title="Login dengan Email" onClose={closeModal}>
              <p className="text-xs text-gray-500 mb-5">Kami akan mengirimkan kode verifikasi 6 digit ke email Anda.</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alamat Email</label>
                  <input
                    autoFocus type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="nama@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {emailError && <ErrorBox msg={emailError} />}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => setModal('login-choice')} className="text-blue-600 hover:underline">← Kembali</button>
                {' · '}Belum terdaftar?{' '}
                <button onClick={() => setModal('signup')} className="text-green-700 font-semibold hover:underline">Sign Up</button>
              </p>
            </ModalBox>
          )}

          {modal === 'user-otp' && (
            <ModalBox title="Masukkan Kode Verifikasi" onClose={closeModal}>
              <p className="text-xs text-gray-500 mb-1">Kode dikirim ke <strong>{email}</strong></p>
              {otpNotice && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-center">
                  <p className="text-xs text-amber-800">{otpNotice}</p>
                </div>
              )}
              {demoOtp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 text-center">
                  <p className="text-xs text-blue-600 font-medium">Kode Verifikasi</p>
                  <p className="text-2xl font-black text-blue-800 tracking-widest mt-1">{demoOtp}</p>
                </div>
              )}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode 6 Digit</label>
                  <input
                    autoFocus
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-xl font-mono tracking-widest text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {otpError && <ErrorBox msg={otpError} />}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                  <KeyRound className="w-4 h-4" /> Verifikasi &amp; Masuk
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => setModal('user-login')} className="text-blue-600 hover:underline">← Kirim ulang</button>
              </p>
            </ModalBox>
          )}

          {modal === 'signup' && (
            <ModalBox title="Daftar Akun Baru" onClose={closeModal}>
              <p className="text-xs text-gray-500 mb-5">Buat akun pengguna untuk mengakses data mangrove.</p>
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input value={suNama} onChange={e => { setSuNama(e.target.value); setSuError(''); }}
                    placeholder="Nama lengkap Anda"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={suEmail} onChange={e => { setSuEmail(e.target.value); setSuError(''); }}
                    placeholder="nama@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instansi / Unit Kerja</label>
                  <input value={suUnit} onChange={e => setSuUnit(e.target.value)}
                    placeholder="cth: Dinas Kelautan Kab. Situbondo"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provinsi</label>
                  <input value={suProvinsi} onChange={e => setSuProvinsi(e.target.value)}
                    placeholder="cth: Jawa Timur"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" />
                </div>
                {suError && <ErrorBox msg={suError} />}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                  Akun baru mendapat akses <strong>Viewer</strong>. Akses input data lapangan memerlukan role Admin dari Verifikator.
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-green-800 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                  <UserPlus className="w-4 h-4" /> Daftar &amp; Kirim Kode
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">
                Sudah punya akun?{' '}
                <button onClick={() => setModal('login-choice')} className="text-green-700 font-semibold hover:underline">Login</button>
              </p>
            </ModalBox>
          )}

          {modal === 'signup-otp' && (
            <ModalBox title="Verifikasi Email" onClose={closeModal}>
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800">Akun berhasil dibuat! Verifikasi email Anda untuk masuk.</p>
              </div>
              <p className="text-xs text-gray-500 mb-1">Kode dikirim ke <strong>{suEmail}</strong></p>
              {otpNotice && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-center">
                  <p className="text-xs text-amber-800">{otpNotice}</p>
                </div>
              )}
              {demoOtp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 text-center">
                  <p className="text-xs text-blue-600 font-medium">Kode Verifikasi</p>
                  <p className="text-2xl font-black text-blue-800 tracking-widest mt-1">{demoOtp}</p>
                </div>
              )}
              <form onSubmit={handleSignUpOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode 6 Digit</label>
                  <input
                    autoFocus
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-xl font-mono tracking-widest text-center focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
                {otpError && <ErrorBox msg={otpError} />}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-green-800 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                  <KeyRound className="w-4 h-4" /> Verifikasi &amp; Masuk
                </button>
              </form>
            </ModalBox>
          )}
        </div>
      )}
    </div>
  );
}

function ModalBox({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{title}</h2>
      <div className="w-8 h-0.5 bg-green-500 rounded-full mb-4" />
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-600">{msg}</p>
    </div>
  );
}
