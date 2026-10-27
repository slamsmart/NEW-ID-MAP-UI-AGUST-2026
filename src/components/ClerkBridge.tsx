/**
 * ClerkBridge — jembatan sesi Clerk → AuthContext lokal + Convex.
 *
 * Gate ini TIDAK meng-import clerk-react secara statis, sehingga entry chunk
 * tetap ringan. Saat ClerkProvider lazy ter-mount (`useClerkReady()` true),
 * ClerkBridgeInner (yang memakai hook Clerk) di-dynamic import lalu dirender.
 */
import { useEffect, useState, type ComponentType } from 'react';
import { useClerkReady } from './clerk/ClerkReadyContext';

const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function ClerkBridge() {
  if (!isClerkConfigured) return null;
  return <ClerkBridgeGate />;
}

function ClerkBridgeGate() {
  const clerkReady = useClerkReady();
  const [Inner, setInner] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!clerkReady) return;
    let cancelled = false;
    import('./clerk/ClerkBridgeInner').then((m) => {
      if (!cancelled) setInner(() => m.default);
    });
    return () => {
      cancelled = true;
    };
  }, [clerkReady]);

  if (!clerkReady || !Inner) return null;
  return <Inner />;
}