/**
 * ClerkSignInBridge — jembatan form username/email+password custom ke Clerk.
 *
 * Validasi kredensial terjadi DI SERVER (Clerk API), bukan dicocokkan di
 * browser. Dirender HANYA saat ClerkProvider sudah ter-mount — parent harus
 * gate dengan `isClerkConfigured && useClerkReady()` sebelum memasang
 * komponen ini, karena `useSignIn` butuh konteks Clerk.
 *
 * Komponen tidak merender apa pun; ia menyerahkan handle ke parent via
 * `onReady` sehingga tampilan form 100% dikuasai parent.
 */
import { useEffect } from 'react';
import { useSignIn } from '@clerk/clerk-react';

export type PasswordSignInResult = 'ok' | 'invalid' | 'not-ready';

export interface PasswordSignInHandle {
  signInWithPassword: (identifier: string, password: string) => Promise<PasswordSignInResult>;
}

export default function ClerkSignInBridge({ onReady }: { onReady: (h: PasswordSignInHandle) => void }) {
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (!isLoaded) return;
    onReady({
      signInWithPassword: async (identifier, password) => {
        if (!signIn || !identifier || !password) return 'not-ready';
        try {
          const res = await signIn.create({ identifier, password });
          if (res.status === 'complete' && res.createdSessionId) {
            await setActive?.({ session: res.createdSessionId });
            return 'ok';
          }
          // needs_second_factor / needs_identifier dsb. — jalur yang tidak
          // dipakai admin ID-MAP perlakukan sebagai kredensial tidak valid.
          return 'invalid';
        } catch {
          return 'invalid';
        }
      },
    });
  }, [isLoaded, signIn, setActive, onReady]);

  return null;
}
