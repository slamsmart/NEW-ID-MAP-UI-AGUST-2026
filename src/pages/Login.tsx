import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldCheck, User, Globe } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  admin_nasional: 'Admin Nasional',
  petugas_daerah: 'Petugas Daerah',
  viewer: 'Viewer Publik',
};

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  admin_nasional: { bg: 'bg-green-700', text: 'text-green-700' },
  petugas_daerah: { bg: 'bg-blue-700', text: 'text-blue-700' },
  viewer: { bg: 'bg-gray-600', text: 'text-gray-600' },
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin_nasional: <ShieldCheck className="w-4 h-4" />,
  petugas_daerah: <User className="w-4 h-4" />,
  viewer: <Globe className="w-4 h-4" />,
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (ok) {
      navigate('/', { replace: true });
    } else {
      setError('Username atau password tidak valid. Gunakan akun demo di bawah.');
    }
  };

  const quickLogin = (u: string, p: string) => {
    login(u, p);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="ID-MAP" className="h-20 w-auto mx-auto mb-4" draggable={false} />
          <p className="text-sm text-gray-500">Sistem Pemantauan & Restorasi Mangrove Pesisir Indonesia</p>
          <p className="text-xs text-gray-400 mt-1">Kementerian Kelautan dan Perikanan RI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Login Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Masuk ke Sistem</h2>
            <p className="text-xs text-gray-500 mb-6">Gunakan kredensial akun yang telah didaftarkan.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  autoComplete="username"
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="masukkan username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    autoComplete="current-password"
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="masukkan password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-semibold py-2.5 rounded-lg hover:bg-green-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Prototype Hackathon · Data tersimpan di browser lokal
              </p>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-3">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-gray-700">Akun Demo (Hackathon)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Klik untuk login langsung sebagai role yang dipilih.</p>
            </div>

            {DEMO_ACCOUNTS.map(acc => {
              const colors = ROLE_COLOR[acc.role];
              return (
                <button
                  key={acc.id}
                  onClick={() => quickLogin(acc.username, acc.password)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white">{ROLE_ICON[acc.role]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{acc.nama}</p>
                        <span className={`text-xs ${colors.bg} text-white px-1.5 py-0.5 rounded font-medium`}>
                          {ROLE_LABEL[acc.role]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{acc.unit}</p>
                      <div className="mt-2 font-mono text-xs text-gray-400 bg-gray-50 rounded px-2 py-1 inline-block">
                        {acc.username} / {acc.password}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
              <p className="text-xs font-semibold text-amber-800 mb-1">Catatan Prototype</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Autentikasi menggunakan localStorage browser. Data survei dan lokasi baru yang diinput tersimpan
                di perangkat masing-masing. Tidak ada koneksi ke server eksternal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
