/**
 * ClerkAuthButtons — Lazy wrapper untuk SignInButton / SignUpButton Clerk.
 *
 * Tidak meng-import `@clerk/clerk-react` secara statis, sehingga landing page
 * dan halaman publik tidak mengunduh Clerk pada first load. Clerk chunk baru
 * di-fetch saat komponen ini pertama kali dirender (setelah ClerkProvider
 * siap — dicek via `useClerkReady()`).
 *
 * Props:
 *  - origin: path redirect setelah login (default 'dashboard').
 *  - onClose: callback opsional setelah menu/tutup.
 */
import { useEffect, useState, type ComponentType } from 'react';
import { useClerkReady } from './ClerkContext';

type ClerkButtonsProps = {
  origin: string;
  onClose?: () => void;
};

type ClerkModule = {
  SignInButton: ComponentType<{
    mode: 'modal';
    forceRedirectUrl: string;
    children: React.ReactNode;
  }>;
  SignUpButton: ComponentType<{
    mode: 'modal';
    forceRedirectUrl: string;
    children: React.ReactNode;
  }>;
};

export default function ClerkAuthButtons({ origin, onClose }: ClerkButtonsProps) {
  const clerkReady = useClerkReady();
  const [mod, setMod] = useState<ClerkModule | null>(null);

  useEffect(() => {
    if (!clerkReady) return;
    let cancelled = false;
    import('@clerk/clerk-react').then((m) => {
      if (!cancelled) {
        setMod({
          SignInButton: m.SignInButton,
          SignUpButton: m.SignUpButton,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clerkReady]);

  if (!clerkReady) return null;

  const redirectUrl = '/' + origin;

  const btnClass =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-colors';

  // Clerk chunk masih diunduh → tampilkan placeholder ukuran sama agar tidak
  // ada lompatan layout atau tombol hilang sesaat.
  if (!mod) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" disabled className={`${btnClass} opacity-60 border border-[#2f3d57] text-white`}>
          Login
        </button>
        <button type="button" disabled className={`${btnClass} opacity-60 bg-[#1e293b] text-white`}>
          Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <mod.SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
        <button
          type="button"
          onClick={onClose}
          className={`${btnClass} border border-[#2f3d57] text-white hover:bg-[#1e293b]`}
        >
          Login
        </button>
      </mod.SignInButton>
      <mod.SignUpButton mode="modal" forceRedirectUrl={redirectUrl}>
        <button
          type="button"
          onClick={onClose}
          className={`${btnClass} bg-[#1e293b] text-white hover:bg-[#334155]`}
        >
          Daftar
        </button>
      </mod.SignUpButton>
    </div>
  );
}