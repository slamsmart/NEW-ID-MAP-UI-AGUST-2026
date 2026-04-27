/**
 * ClerkBridge — menjembatani sesi Clerk dengan AuthContext lokal + Convex.
 *
 * Alur:
 *   1. Clerk hosted sign-in (Google) menyelesaikan auth.
 *   2. Hook ini deteksi `isSignedIn=true`, ambil profil dasar (nama, email).
 *   3. Upsert ke Convex `userProfiles` via `api.profiles.upsert` (pakai clerkId).
 *   4. Set `AuthUser` di AuthContext via `signInExternal`, agar seluruh app
 *      treat user ini sama seperti login OTP (dapat akses Unduh PDF dll).
 *   5. Bila Clerk signOut, panggil AuthContext.logout().
 *
 * Komponen ini tidak render apa-apa.
 */
import { useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useAuth } from '../context/useAuth';
import { convex, isConvexConfigured } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import type { AuthUser } from '../context/authModel';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function makeInitials(nama: string) {
  return nama.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U';
}

export default function ClerkBridge() {
  // Render nothing & jangan jalankan hook bila Clerk tidak diaktifkan.
  if (!isClerkConfigured) return null;
  return <ClerkBridgeInner />;
}

function ClerkBridgeInner() {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { user: localUser, signInExternal, logout } = useAuth();
  const syncedRef = useRef<string | null>(null);
  // True only AFTER signInExternal has been called at least once for the
  // current Clerk session. Prevents the second effect from racing the first
  // effect's async upsert and prematurely calling signOut() — which would
  // bounce the user straight back to the landing page on first sign-in.
  const initialSyncDone = useRef(false);

  // Sync Clerk → AuthContext + Convex
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !clerkUser) {
      // Bila sebelumnya kita pernah sign-in via Clerk dan sekarang Clerk signed-out,
      // pastikan AuthContext lokal juga dibersihkan.
      if (syncedRef.current && localUser?.id === syncedRef.current) {
        void logout();
        syncedRef.current = null;
      }
      initialSyncDone.current = false;
      return;
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      '';
    const nama =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      email.split('@')[0] ||
      'Pengguna';

    const baseUser: AuthUser = {
      id: clerkUser.id,
      nama,
      email,
      unit: 'Pengguna Umum',
      role: 'viewer',
      initials: makeInitials(nama),
    };

    // Hindari sync ulang untuk user yang sama
    if (syncedRef.current === clerkUser.id) return;
    syncedRef.current = clerkUser.id;

    // Push ke Convex (best-effort) lalu set AuthContext.
    (async () => {
      if (isConvexConfigured() && email) {
        try {
          const id = await convex.mutation(api.profiles.upsert, {
            clerkId: clerkUser.id,
            nama,
            email,
            unit: 'Pengguna Umum',
            role: 'viewer',
          });
          baseUser.id = id as unknown as string;
        } catch (err) {
          console.warn('[ClerkBridge] Convex profiles.upsert gagal:', err);
        }
      }
      signInExternal(baseUser);
      initialSyncDone.current = true;
    })();
  }, [isLoaded, isSignedIn, clerkUser, localUser?.id, logout, signInExternal]);

  // Bila user logout dari AuthContext (mis. tombol Logout app), juga signOut dari Clerk.
  // GUARD: hanya jalan kalau initialSyncDone — supaya tidak race dengan effect
  // pertama yang sedang async menyiapkan localUser saat baru sign-in.
  useEffect(() => {
    if (!isLoaded) return;
    if (!localUser && isSignedIn && initialSyncDone.current) {
      void signOut();
      syncedRef.current = null;
      initialSyncDone.current = false;
    }
  }, [isLoaded, isSignedIn, localUser, signOut]);

  return null;
}
