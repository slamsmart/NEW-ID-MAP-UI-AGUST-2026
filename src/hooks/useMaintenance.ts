/**
 * useMaintenance — sumber kebenaran tunggal status maintenance di klien.
 *
 * Menggabungkan dua sumber:
 *  1. Saklar RUNTIME dari Convex (`siteConfig.maintenanceEnabled`) yang
 *     digeser verifikator dari halaman Verifikasi Data → mengunci
 *     SELURUH situs, berlaku realtime tanpa rebuild.
 *  2. Konfigurasi BUILD-TIME dari env (`VITE_MAINTENANCE*`) yang bisa
 *     menutup route tertentu saja. Lihat src/lib/maintenance.ts.
 *
 * Situs/route terkunci bila salah satu sumber aktif.
 *
 * PENTING — dua pelajaran dari kegagalan sebelumnya (CHANGELOG-FIXES,
 * entri `siteConfig:get` / `MaintenanceGate fail-open`):
 *
 *  a. FAIL-CLOSED terhadap env. Kunci dari env berlaku SEKETIKA dan tidak
 *     pernah menunggu Convex. Dulu gate mensyaratkan `!loading`, dan karena
 *     query yang error membuat `loading` menetap true, kunci env ikut mati
 *     dan situs production tetap terbuka.
 *  b. TIDAK memakai `useQuery`. Bila fungsi `siteConfig:get` belum ter-deploy,
 *     `useQuery` melempar saat render → crash/`pageerror` di setiap halaman.
 *     Di sini langganan dibaca manual dengan try/catch, jadi backend yang
 *     belum siap hanya menonaktifkan saklar runtime — situs tetap normal.
 */
import { useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { convex, isConvexConfigured } from '../lib/convexClient';
import {
  MAINTENANCE_ETA,
  MAINTENANCE_MESSAGE,
  isRouteUnderMaintenance,
  maintenanceLabels,
  routeLabel,
} from '../lib/maintenance';

interface RemoteConfig {
  maintenanceEnabled: boolean;
  maintenanceMessage?: string;
  maintenanceEta?: string;
  updatedBy?: string;
  updatedAt?: number;
}

/** Status langganan ke Convex. */
type RemoteStatus = 'loading' | 'ready' | 'unavailable';

export interface MaintenanceState {
  /** Saklar verifikator aktif → seluruh situs terkunci. */
  siteWideEnabled: boolean;
  /** Ada yang terkunci: saklar verifikator ATAU route dari env. */
  anyEnabled: boolean;
  /** Saklar runtime belum bisa dipakai (Convex mati / fungsi belum deploy). */
  remoteUnavailable: boolean;
  /** Langganan Convex masih menunggu data pertama. */
  remoteLoading: boolean;
  message: string;
  eta: string;
  /** Nama fitur yang ditutup, untuk banner pemberitahuan. */
  labels: string[];
  /** Verifikator terakhir yang mengubah saklar. */
  updatedBy?: string;
  updatedAt?: number;
  /** True bila pathname ini sedang ditutup. */
  isBlocked: (pathname: string) => boolean;
}

/**
 * `api.siteConfig.get` bisa belum ter-codegen di lokal atau belum ter-deploy
 * di production. Resolve lazy supaya impor modul tidak pernah throw.
 */
function getSiteConfigApiRef(): unknown | null {
  return (api as unknown as { siteConfig?: { get?: unknown } }).siteConfig?.get ?? null;
}

export function useMaintenance(): MaintenanceState {
  const [remote, setRemote] = useState<RemoteConfig | null>(null);
  const [status, setStatus] = useState<RemoteStatus>(() =>
    isConvexConfigured() && getSiteConfigApiRef() ? 'loading' : 'unavailable',
  );

  useEffect(() => {
    const ref = getSiteConfigApiRef();
    if (!isConvexConfigured() || !ref) return;

    let cancelled = false;
    const watch = convex.watchQuery(ref as never, {} as never);

    const read = () => {
      if (cancelled) return;
      try {
        const value = watch.localQueryResult() as RemoteConfig | undefined;
        if (value === undefined) return; // hasil pertama belum tiba
        setRemote(value);
        setStatus('ready');
      } catch (err) {
        // Fungsi belum ter-deploy / backend error → matikan saklar runtime
        // saja. Kunci dari env tidak terpengaruh (fail-closed).
        setRemote(null);
        setStatus('unavailable');
        if (import.meta.env.DEV) {
          console.warn('[useMaintenance] siteConfig.get tidak tersedia:', err);
        }
      }
    };

    read();
    const unsubscribe = watch.onUpdate(read);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const siteWideEnabled = status === 'ready' && remote?.maintenanceEnabled === true;

  const message = (remote?.maintenanceMessage ?? '').trim() || MAINTENANCE_MESSAGE;
  const eta = (remote?.maintenanceEta ?? '').trim() || MAINTENANCE_ETA;

  const envLabels = maintenanceLabels();
  const labels = siteWideEnabled ? [routeLabel('*')] : envLabels;

  return {
    siteWideEnabled,
    anyEnabled: siteWideEnabled || envLabels.length > 0,
    remoteUnavailable: status === 'unavailable',
    remoteLoading: status === 'loading',
    message,
    eta,
    labels,
    updatedBy: remote?.updatedBy,
    updatedAt: remote?.updatedAt,
    // Env dievaluasi lebih dulu dan tanpa syarat → kunci env selalu berlaku
    // walau Convex sedang gagal/loading.
    isBlocked: (pathname: string) =>
      isRouteUnderMaintenance(pathname) || siteWideEnabled,
  };
}
