/**
 * LoginSuccessToast
 * — Listens for `idmap:login-success` window events and renders a small
 *   centered-top toast that auto-dismisses after ~3.5s.
 * — Mounted once at the app root so it shows up on any page after login
 *   (admin form OR Clerk Google sign-in).
 */
import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastState {
  nama: string;
  role: string;
  title: string;
  key: number;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  verifikator: 'Verifikator',
  viewer: 'Pengguna',
};

export default function LoginSuccessToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ nama: string; role: string }>).detail;
      if (!detail) return;
      setToast({ nama: detail.nama, role: detail.role, title: 'Login berhasil', key: Date.now() });
    };
    const logoutHandler = () => {
      setToast({ nama: '', role: '', title: 'Berhasil keluar', key: Date.now() });
    };
    window.addEventListener('idmap:login-success', handler);
    window.addEventListener('idmap:logout-success', logoutHandler);
    return () => {
      window.removeEventListener('idmap:login-success', handler);
      window.removeEventListener('idmap:logout-success', logoutHandler);
    };
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="fixed left-1/2 top-4 z-[1000] -translate-x-1/2 px-4 sm:top-6"
      style={{ animation: 'idmap-toast-in 0.32s cubic-bezier(0.22, 1, 0.36, 1)' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#071520]/95 px-4 py-3 text-white shadow-2xl shadow-black/30 backdrop-blur-md sm:px-5 sm:py-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f06424]/15 ring-1 ring-[#f06424]/40">
          <CheckCircle2 className="h-5 w-5 text-[#ff9a70]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white sm:text-sm">
            {toast.title}
          </p>
          <p className="mt-0.5 text-[12px] text-white/65 sm:text-xs">
            {toast.nama ? <>Selamat datang, <span className="font-semibold text-white/90">{toast.nama}</span>
              {toast.role && (
                <span className="text-[#ffb28e]"> · {ROLE_LABEL[toast.role] ?? toast.role}</span>
              )}</> : <span className="text-white/80">Sesi Anda telah diakhiri.</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-[#ffb28e]"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <style>{`
        @keyframes idmap-toast-in {
          0%   { opacity: 0; transform: translate(-50%, -16px) scale(0.96); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}
