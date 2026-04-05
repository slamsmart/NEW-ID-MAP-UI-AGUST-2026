import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldCheck, User, Globe } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  admin_nasional: 'Admin Nasional',
  petugas_daerah: 'Petugas Daerah',
  viewer: 'Viewer Publik',
};

const ROLE_COLOR: Record<string, string> = {
  admin_nasional: 'bg-green-700',
  petugas_daerah: 'bg-blue-700',
  viewer: 'bg-gray-500',
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
    if (ok) navigate('/', { replace: true });
    else setError('Username atau password tidak valid.');
  };

  const quickLogin = (u: string, p: string) => {
    login(u, p);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8">
        <img
          src="/logo.svg"
          alt="ID-MAP"
          className="h-24 w-auto mx-auto mb-5"
          draggable={false}
        />
        <h1 className="text-base font-semibold text-gray-700">
          Sistem Pemantauan &amp; Restorasi Mangrove Pesisir Indonesia
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Basis data untuk Pemantauan dan Restorasi Lingkungan
        </p>
      </div>

      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">Masuk ke Sistem</h2>
        <p className="text-xs text-gray-500 mb-6">Gunakan akun yang terdaftar atau klik akun demo di bawah.</p>

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
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
      </div>

      <div className="w-full max-w-3xl">
        <p className="text-xs text-center text-gray-500 font-medium mb-3">
          Akun Demo Hackathon 2026 — klik untuk login langsung
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_ACCOUNTS.map(acc => {
            const bg = ROLE_COLOR[acc.role];
            return (
              <button
                key={acc.id}
                onClick={() => quickLogin(acc.username, acc.password)}
                className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white">{ROLE_ICON[acc.role]}</span>
                  </div>
                  <span className={`text-xs ${bg} text-white px-2 py-0.5 rounded font-semibold`}>
                    {ROLE_LABEL[acc.role]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{acc.nama}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight truncate">{acc.unit}</p>
                <div className="mt-3 font-mono text-xs text-gray-400 bg-gray-50 rounded px-2 py-1.5 text-center group-hover:bg-green-50 transition-colors">
                  {acc.username} / {acc.password}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Prototype Hackathon 2026 · Data tersimpan di browser · ID-MAP v1.0
        </p>
      </div>
    </div>
  );
}
