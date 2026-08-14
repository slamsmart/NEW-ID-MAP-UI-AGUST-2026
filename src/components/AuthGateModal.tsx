import { useState, useEffect, useRef } from 'react';
import { X, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/clerk-react';
// Note: hook Clerk hanya dipanggil di komponen anak yang dirender saat
// `isClerkConfigured`, supaya app tidak crash bila ClerkProvider absen.
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface AuthGateModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional pesan kontekstual di header. Default: "Akses fitur lengkap...". */
  reason?: string;
  /** Setelah login sukses, navigasi ke path ini. Default: '/dashboard'. */
  redirectTo?: string;
}

export default function AuthGateModal({
  open, onClose, reason, redirectTo = '/dashboard',
}: AuthGateModalProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const ok = login(username.trim(), password);
    if (ok) {
      setSuccess('Berhasil masuk. Mengalihkan...');
      setTimeout(() => { onClose(); navigate(redirectTo, { replace: true }); }, 600);
    } else {
      setError('Username atau password tidak valid.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop dengan gradien hijau→biru tema mangrove */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.55), transparent 55%),' +
            'radial-gradient(circle at 80% 80%, rgba(14,165,233,0.55), transparent 55%),' +
            'linear-gradient(135deg, rgba(6,78,59,0.92), rgba(7,89,133,0.92))',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      />

      {/* Glass card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-7 shadow-2xl animate-fade-up text-fade-scope"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
          border: '1px solid rgba(255,255,255,0.25)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <img src="/logo.png" alt="ID-MAP" className="h-14 mx-auto mb-3 drop-shadow-lg" draggable={false} />
          <h2 className="text-white font-extrabold text-2xl tracking-wide">LOGIN</h2>
          <p className="text-white/80 text-xs mt-1 leading-relaxed">
            {reason ?? 'Akses fitur lengkap ID-MAP Cabdin KP Kab. Malang.'}
          </p>
        </div>

        {/* Sign-in user umum (Clerk) — Google / TikTok / X */}
        {isClerkConfigured && (
          <div className="mb-4">
            <SignInButton mode="modal" forceRedirectUrl={redirectTo}>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 rounded-full text-sm font-semibold bg-white text-gray-800 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <ProviderIcons />
                Lanjut dengan akun sosial
              </button>
            </SignInButton>
            <p className="text-center text-[10px] text-white/70 mt-2">
              Untuk pengguna umum (lihat &amp; download). Google · TikTok · X.
            </p>
            <ClerkSignedInWatcher onSignedIn={() => { onClose(); navigate(redirectTo, { replace: true }); }} />
            <div className="flex items-center gap-3 my-4 text-[11px] text-white/70">
              <span className="flex-1 h-px bg-white/25" />
              khusus admin / verifikator
              <span className="flex-1 h-px bg-white/25" />
            </div>
          </div>
        )}

        {/* Form admin/verifikator */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <input
              type="text"
              value={username}
              autoComplete="username"
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Username admin / verifikator"
              className="w-full bg-white/95 text-gray-800 placeholder-gray-400 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
            />
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full bg-white/95 text-gray-800 placeholder-gray-400 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Toggle password"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-100 bg-red-500/30 border border-red-300/40 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-xs text-emerald-100 bg-emerald-500/30 border border-emerald-300/40 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: 'linear-gradient(90deg, #064e3b, #0f172a)' }}
          >
            <LogIn className="w-4 h-4" /> SIGN IN ADMIN
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function ProviderIcons() {
  // Google "G" + TikTok note + X glyph berjajar — netral untuk multi-provider.
  return (
    <span className="flex items-center -space-x-1.5">
      {/* Google G */}
      <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
        <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.3 5.2C41.4 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
      </span>
      {/* TikTok */}
      <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-sm" aria-label="TikTok">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M19.6 6.7a5.4 5.4 0 0 1-3.2-1V15a4.6 4.6 0 1 1-4.6-4.6h.7v2.6h-.7a2 2 0 1 0 2 2V2h2.6a2.8 2.8 0 0 0 2.8 2.8c.1 0 .3 0 .4-.1z"/>
        </svg>
      </span>
      {/* X */}
      <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-sm" aria-label="X">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M18.244 2H21.5l-7.5 8.57L22.92 22h-6.83l-5.34-6.97L4.6 22H1.34l8.04-9.18L1.08 2h7.01l4.83 6.39L18.24 2zm-1.2 18.27h1.88L7.04 3.66H5.05l11.99 16.61z"/>
        </svg>
      </span>
    </span>
  );
}

/**
 * Sub-component yang panggil hook `useUser()` Clerk — dirender hanya saat
 * `isClerkConfigured=true` agar app tidak crash bila ClerkProvider absen.
 * Memantau status sesi dan memanggil `onSignedIn` ketika user baru sign-in.
 */
function ClerkSignedInWatcher({ onSignedIn }: { onSignedIn: () => void }) {
  const { isSignedIn, isLoaded } = useUser();
  const triggered = useRef(false);
  useEffect(() => {
    if (isLoaded && isSignedIn && !triggered.current) {
      triggered.current = true;
      // Beri ClerkBridge waktu sebentar untuk sync ke Convex + AuthContext
      setTimeout(onSignedIn, 300);
    }
  }, [isLoaded, isSignedIn, onSignedIn]);
  return null;
}
