import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (ok) navigate('/', { replace: true });
    else setError('Username atau password tidak valid.');
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 font-sans overflow-hidden"
      style={{
        background:
          'radial-gradient(80% 60% at 78% 12%, #155e75 0%, transparent 55%),' +
          'radial-gradient(75% 65% at 35% 95%, #14b8a6 0%, transparent 55%),' +
          'linear-gradient(160deg, #0e7490 0%, #0f766e 50%, #115e59 100%)',
      }}
    >

      <div className="relative z-10 w-full max-w-md">
        {/* Brand row */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/logo.svg"
            alt="ID-MAP"
            className="h-16 w-auto mb-3 drop-shadow-lg"
            draggable={false}
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Admin · Verifikator
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl border border-white/30 p-8 shadow-2xl backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
            boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          <h1 className="text-center text-3xl font-light tracking-[0.3em] text-white mb-1">
            LOGIN
          </h1>
          <p className="text-center text-xs text-white/70 mb-7">
            Masuk ke ID-MAP
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-full bg-white/85 backdrop-blur shadow-inner">
              <input
                type="text"
                value={username}
                autoComplete="username"
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Username"
                className="w-full bg-transparent rounded-full px-5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="relative rounded-full bg-white/85 backdrop-blur shadow-inner">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                className="w-full bg-transparent rounded-full px-5 py-3 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-50 bg-red-500/30 border border-red-300/40 rounded-full px-4 py-2 backdrop-blur">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900/85 hover:bg-slate-900 text-white font-medium tracking-[0.2em] py-3 rounded-full transition-all hover:shadow-lg active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              SIGN IN
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/70">
            Lupa password?{' '}
            <a href="mailto:idmap.cabdinmalang@jatimprov.go.id" className="font-semibold text-white hover:underline">
              Hubungi Admin
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-white/60">
          ID-MAP v1.0 · Cabdin KP Kab. Malang
        </p>
        <p className="mt-1 text-center text-[11px]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white underline-offset-2 hover:underline"
          >
            ← Kembali ke Beranda
          </button>
        </p>
      </div>
    </div>
  );
}
