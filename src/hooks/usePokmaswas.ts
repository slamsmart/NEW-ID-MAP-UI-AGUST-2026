import { useEffect, useMemo, useState } from 'react';
import { convex, isConvexConfigured } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { pokmaswasData, type PokmaswasRecord } from '../data/pokmaswasData';

/**
 * usePokmaswas — menggabungkan seed statis (PKM-001..044) dengan
 * entri yang disimpan di Convex (hasil form admin).
 *
 * Menggunakan watchQuery (bukan useQuery) agar bila fungsi Convex
 * belum ter-deploy, aplikasi tetap jalan dengan data statis saja
 * (error ditangkap, tidak merusak render).
 */
export function usePokmaswas() {
  const [custom, setCustom] = useState<PokmaswasRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConvexConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;

    let unsubscribe = () => {};
    try {
      const watch = convex.watchQuery(api.pokmaswas.list, {});
      unsubscribe = watch.onUpdate(() => {
        try {
          const data = watch.localQueryResult() as
            | Array<{
                legacyId: string;
                no: number;
                kabupatenKota: string;
                nama: string;
                alamat: string;
                ketua: string;
                noHp: string;
                lat: number;
                lng: number;
                ruangLingkup?: string;
                kawasanPantai?: string;
                bidangCore: string[];
                createdBy?: string;
              }>
            | undefined;
          if (active && data) {
            setCustom(
              data.map((d) => ({
                id: d.legacyId,
                no: d.no,
                kabupatenKota: d.kabupatenKota,
                nama: d.nama,
                alamat: d.alamat,
                ketua: d.ketua,
                noHp: d.noHp,
                lat: d.lat,
                lng: d.lng,
                ruangLingkup: d.ruangLingkup,
                kawasanPantai: d.kawasanPantai,
                bidangCore: d.bidangCore ?? [],
                isCustom: true,
              })),
            );
          }
        } catch {
          /* fungsi belum deploy — abaikan, tetap pakai seed statis */
        } finally {
          if (active) setLoading(false);
        }
      });
      const onErr = (e: unknown) => {
        console.warn('[pokmaswas] convex belum tersedia:', e);
        if (active) setLoading(false);
      };
      const anyWatch = watch as unknown as {
        onError?: (cb: (e: unknown) => void) => void;
      };
      anyWatch.onError?.(onErr);
    } catch (e) {
      console.warn('[pokmaswas] gagal menginisialisasi convex:', e);
      setLoading(false);
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const records = useMemo<PokmaswasRecord[]>(() => {
    const customById = new Map(custom.map((c) => [c.id, c]));
    const staticIds = new Set(pokmaswasData.map((r) => r.id));
    // Entri Convex (hasil edit/tambah) menimpa seed statis dengan id sama.
    const merged = pokmaswasData.map((r) => customById.get(r.id) ?? r);
    // Tambahan: entri Convex yang id-nya belum ada di seed.
    const extra = custom.filter((c) => !staticIds.has(c.id));
    return [...merged, ...extra];
  }, [custom]);

  return { records, custom, loading };
}
