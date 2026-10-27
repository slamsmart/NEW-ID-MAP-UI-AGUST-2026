/**
 * ClerkAuthGate — Lazy wrapper yang membungkus children dengan SignInButton /
 * SignUpButton Clerk. Tidak meng-import clerk-react secara statis, jadi chunk
 * Clerk hanya diunduh saat komponen ini pertama kali dirender (setelah
 * ClerkProvider siap).
 *
 * Dipakai di PetaPublik untuk tombol Login/Daftar yang membuka modal Clerk.
 * Fallback: cloneElement dengan onClick yang menampilkan AccountNotice.
 */
import { useEffect, useState, cloneElement, type ReactElement } from 'react';
import { useClerkReady } from './ClerkReadyContext';

type ClerkModule = {
  SignInButton: (props: {
    mode: 'modal';
    forceRedirectUrl: string;
    children: React.ReactNode;
  }) => React.ReactElement | null;
  SignUpButton: (props: {
    mode: 'modal';
    forceRedirectUrl: string;
    children: React.ReactNode;
  }) => React.ReactElement | null;
};

export default function ClerkAuthGate({
  children,
  mode = 'signin',
  redirectUrl = '/peta',
  onFallback,
}: {
  children: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  mode?: 'signin' | 'signup';
  redirectUrl?: string;
  onFallback?: (e: React.MouseEvent) => void;
}) {
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

  if (!clerkReady || !mod) {
    // Clerk belum siap → fallback (AccountNotice)
    return cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onFallback?.(e);
      },
    });
  }

  if (mode === 'signup') {
    return (
      <mod.SignUpButton mode="modal" forceRedirectUrl={redirectUrl}>
        {children}
      </mod.SignUpButton>
    );
  }

  return (
    <mod.SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
      {children}
    </mod.SignInButton>
  );
}