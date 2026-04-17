import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, UserPlus, X, Eye, EyeOff, AlertCircle, CheckCircle,
  ShieldCheck, Mail, KeyRound, ArrowRight, Loader2, Satellite,
  ClipboardList, Bot,
} from 'lucide-react';
import { ADMIN_ACCOUNTS } from '../context/authAccounts';
import { useAuth } from '../context/useAuth';

type ModalMode = 'none' | 'login-choice' | 'admin-login' | 'user-login' | 'user-otp' | 'signup' | 'signup-otp';

export default function LandingPage() {
  const { login, loginWithEmail, verifyOTP, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Kalau user sudah login (autoconfirm atau session restore) → langsung ke dashboard
  useEffect(() => {
    if (user) { navigate('/dashboard', { replace: true }); }
  }, [user, navigate]);
  const [modal, setModal] = useState<ModalMode>('none');

  // Admin login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // User (email OTP) state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // shown for hackathon demo
  const [otpNotice, setOtpNotice] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign up state
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

  // ── Admin login ──
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (ok) { closeModal(); navigate('/dashboard', { replace: true }); }
    else setAdminError('Username atau password tidak valid.');
  };

  const quickLogin = (u: string, p: string) => {
    login(u, p);
    closeModal();
    navigate('/dashboard', { replace: true });
  };

  // ── User email OTP ──
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Email wajib diisi.'); return; }
    setLoading(true);
    const res = await loginWithEmail(email.trim());
    setLoading(false);
    if (!res.success) { setEmailError(res.error ?? 'Gagal mengirim kode.'); return; }
    setOtpNotice(res.warning ?? '');
    // Autoconfirm mode: user state akan di-set oleh useEffect
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

  // ── Sign up ──
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suNama.trim() || !suEmail.trim()) { setSuError('Nama dan email wajib diisi.'); return; }
    setLoading(true);
    const res = await signUp({ nama: suNama, email: suEmail, unit: suUnit, provinsi: suProvinsi });
    setLoading(false);
    if (!res.success) { setSuError(res.error ?? 'Gagal mendaftar.'); return; }
    setOtpNotice(res.warning ?? '');

    // Jika ada demoOtp → mode demo, tampilkan OTP screen
    if (res.demoOtp) {
      setDemoOtp(res.demoOtp);
      setSuEmail(suEmail.trim());
      setModal('signup-otp');
      return;
    }

    // Mode production: cek apakah user sudah langsung login (autoconfirm aktif)
    // useEffect di atas akan handle navigate jika user state berubah
    // Jika tidak autoconfirm → tampilkan OTP screen
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
    <div className="w-full min-h-screen bg-white flex flex-col">

      {/* ── HERO ── */}
      <div
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: '100vh', background: '#f8fafb' }}
      >
        {/* Geometric line background — isometric grid */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="iso-grid" x="0" y="0" width="80" height="46" patternUnits="userSpaceOnUse">
              {/* isometric diamond lines */}
              <line x1="0" y1="23" x2="40" y2="0"  stroke="#d1d5db" strokeWidth="0.8" />
              <line x1="40" y1="0"  x2="80" y2="23" stroke="#d1d5db" strokeWidth="0.8" />
              <line x1="80" y1="23" x2="40" y2="46" stroke="#d1d5db" strokeWidth="0.8" />
              <line x1="40" y1="46" x2="0"  y2="23" stroke="#d1d5db" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso-grid)" opacity="0.5" />
        </svg>
        {/* Soft radial glow di tengah */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0.95) 30%, rgba(248,250,251,0.7) 70%, transparent 100%)'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4 text-center py-20">
          <img src="/logo.svg" alt="ID-MAP" className="h-32 w-auto mb-6 drop-shadow-2xl" draggable={false} />
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl drop-shadow-sm">
            Integrasi Data Mangrove dan Pesisir
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-800 max-w-xl leading-relaxed drop-shadow-sm">
            Data Monitoring Mangrove/Vegetasi dan Ekosistem Pesisir
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setModal('login-choice')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-green-800 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all text-base"
            >
              <LogIn className="w-5 h-5" /> Login
            </button>
            <button
              onClick={() => setModal('signup')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-800 font-bold rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all text-base"
            >
              <UserPlus className="w-5 h-5" /> Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* ── MODULE CARDS ── */}
      <div className="max-w-5xl mx-auto px-4 pb-16 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'SpaceWatch', desc: 'Pantau citra satelit Sentinel & Landsat multi-temporal', badge: 'bg-blue-600', icon: Satellite },
            { label: 'EcoTrack', desc: 'Input & survei data lapangan berbasis mobile.', badge: 'bg-green-700', icon: ClipboardList },
            { label: 'RestoreAI', desc: 'Rekomendasi Restorasi & kebijakan berbasis AI', badge: 'bg-orange-500', icon: Bot },
          ].map(m => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${m.badge} rounded-lg flex items-center justify-center`}>
                  <m.icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xs text-white font-bold px-2 py-0.5 rounded ${m.badge}`}>{m.label}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MODALS                                      */}
      {/* ═══════════════════════════════════════════ */}
      {modal !== 'none' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* ── Login choice ── */}
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

          {/* ── Admin login ── */}
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

              {/* Demo quick login */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 mb-3">Akun Demo — klik untuk langsung masuk</p>
                <div className="flex flex-col gap-2">
                  {ADMIN_ACCOUNTS.map(acc => (
                    <button key={acc.id} onClick={() => quickLogin(acc.username, acc.password)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-left">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${acc.role === 'verifikator' ? 'bg-green-800' : 'bg-blue-600'}`}>
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{acc.nama}</p>
                        <p className="text-xs text-gray-400">{acc.username} / {acc.password}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => setModal('login-choice')} className="text-blue-600 hover:underline">← Kembali</button>
              </p>
            </ModalBox>
          )}

          {/* ── User email login ── */}
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
                {' · '}
                Belum terdaftar?{' '}
                <button onClick={() => setModal('signup')} className="text-green-700 font-semibold hover:underline">Sign Up</button>
              </p>
            </ModalBox>
          )}

          {/* ── OTP verification (login) ── */}
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

          {/* ── Sign up ── */}
          {modal === 'signup' && (
            <ModalBox title="Daftar Akun Baru" onClose={closeModal}>
              <p className="text-xs text-gray-500 mb-5">Buat akun pengguna untuk mengakses data mangrove Wilker Cabdin KP Kab. Malang.</p>
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
                  Akun baru mendapat akses <strong>Viewer</strong> — bisa lihat dashboard, peta & data monitoring. Akses input data lapangan memerlukan role Admin dari Verifikator.
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

          {/* ── OTP verification (signup) ── */}
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

// ── Shared sub-components ──────────────────────────────────────────────────

function ModalBox({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
      <button onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 transition-colors">
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3 mb-5">
        <img src="/logo.svg" alt="ID-MAP" className="h-8 w-auto" draggable={false} />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {msg}
    </div>
  );
}

