/**
 * ClerkProviderGate — memuat SDK Clerk secara LAZY (chunk terpisah) agar
 * landing page & halaman publik tidak menunggu / mengunduh Clerk pada
 * first load. Entry chunk berkurang ±20-30KB gzipped.
 *
 * Alur:
 *  1. Clerk dikonfigurasi (env VITE_CLERK_PUBLISHABLE_KEY) → dynamic import
 *     `@clerk/clerk-react` → baru mount <ClerkProvider>.
 *  2. Sebelum siap, children dirender TANPA ClerkProvider; komponen yang
 *     butuh Clerk harus cek `useClerkReady()` dan menampilkan fallback.
 *  3. Clerk TIDAK dikonfigurasi → langsung render children (perilaku lama).
 *
 * `useClerkReady()` dipakai oleh ClerkBridge, AuthActions, dan AuthRequired
 * untuk menahan render tombol/UI Clerk sampai provider benar-benar ter-mount.
 */
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ClerkReadyContext } from './ClerkReadyContext';


export function ClerkProviderGate({ children }: { children: ReactNode }) {
  const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
  type ProviderComponent = React.ComponentType<{
    publishableKey: string;
    afterSignOutUrl?: string;
    children: ReactNode;
  }>;
  const [providerState, setProviderState] = useState<{ Component: ProviderComponent } | null>(null);

  useEffect(() => {
    if (!isClerkConfigured) return;
    let cancelled = false;
    import('@clerk/clerk-react').then((m) => {
      if (cancelled) return;
      const Provider = m.ClerkProvider as unknown as React.ComponentType<{
        publishableKey: string;
        afterSignOutUrl?: string;
        children: ReactNode;
      }>;
      // Simpan sebagai object agar React tidak menganggap Component sebagai
      // fungsi updater state dan menjalankannya tanpa Provider context.
      setProviderState({ Component: Provider });
    });
    return () => {
      cancelled = true;
    };
  }, [isClerkConfigured]);

  const ClerkProvider = providerState?.Component;
  const ready = !isClerkConfigured || ClerkProvider !== undefined;

  return (
    <ClerkReadyContext.Provider value={ready}>
      {ready && ClerkProvider ? (
        <ClerkProvider publishableKey={key ?? ''} afterSignOutUrl="/">
          {children}
        </ClerkProvider>
      ) : (
        children
      )}
    </ClerkReadyContext.Provider>
  );
}
