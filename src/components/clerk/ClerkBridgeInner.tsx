/**
 * ClerkBridgeInner — komponen yang benar-benar memanggil hook Clerk.
 * DIPISAH agar ClerkBridge.tsx (di entry) TIDAK statically import clerk-react.
 * File ini di-dynamic import oleh ClerkBridge.tsx hanya saat ClerkProvider
 * sudah ter-mount (useClerkReady === true).
 */
import { useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useAuth } from '../../context/useAuth';
import { convex, isConvexConfigured } from '../../lib/convexClient';
import { api } from '../../../convex/_generated/api';
import type { AuthUser } from '../../context/authModel';

function makeInitials(nama: string) {
  return nama.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U';
}

/** Role server (tabel userProfiles) → role UI AuthContext. */
function toUiRole(role: string | null | undefined): AuthUser['role'] {
  if (role === 'admin' || role === 'admin_nasional') return 'admin';
  if (role === 'verifikator') return 'verifikator';
  return 'viewer';
}

export default function ClerkBridgeInner() {
  const { isSignedIn, isLoaded, signOut, getToken, sessionClaims } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { user: localUser, signInExternal, logout } = useAuth();
  const syncedRef = useRef<string | null>(null);
  const initialSyncDone = useRef(false);

  // Sambungkan sesi Clerk ke klien Convex: semua panggilan mutation/query
  // otomatis membawa token Clerk sehingga guard server-side (requireRole)
  // mengenali pemanggil. Pola sama dengan ConvexProviderWithClerk resmi;
  // dipasang di sini karena ClerkProvider di-load lazy via ClerkProviderGate.
  useEffect(() => {
    if (!isConvexConfigured()) return;
    convex.setAuth(async ({ forceRefreshToken }) => {
      try {
        if (sessionClaims?.aud === 'convex') {
          return (await getToken({ skipCache: forceRefreshToken })) ?? null;
        }
        return (await getToken({ template: 'convex', skipCache: forceRefreshToken })) ?? null;
      } catch {
        return null;
      }
    });
  }, [getToken, sessionClaims]);

  // Sync Clerk → AuthContext + Convex
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !clerkUser) {
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

    if (syncedRef.current === clerkUser.id) return;
    syncedRef.current = clerkUser.id;

    (async () => {
      if (isConvexConfigured() && email) {
        try {
          await convex.mutation(api.profiles.upsert, {
            clerkId: clerkUser.id,
            nama,
            email,
            unit: 'Pengguna Umum',
          });
          // Role & unit diambil dari server (userProfiles) — sumber kebenaran
          // untuk gating UI; bootstrap admin via env ADMIN_EMAILS di Convex.
          const profile = await convex.query(api.profiles.getByClerkId, {
            clerkId: clerkUser.id,
          });
          if (profile) {
            baseUser.id = profile._id as unknown as string;
            baseUser.role = toUiRole(profile.role);
            if (profile.unit) baseUser.unit = profile.unit;
            if (profile.provinsi) baseUser.provinsi = profile.provinsi;
          }
        } catch (err) {
          console.warn('[ClerkBridge] Convex profiles.upsert gagal:', err);
        }
      }
      signInExternal(baseUser);
      initialSyncDone.current = true;
    })();
  }, [isLoaded, isSignedIn, clerkUser, localUser?.id, logout, signInExternal]);

  // Bila user logout dari AuthContext, juga signOut dari Clerk.
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