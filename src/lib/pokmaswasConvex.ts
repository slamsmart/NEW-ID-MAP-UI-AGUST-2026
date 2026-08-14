import { convex, isConvexConfigured } from './convexClient';
import { api } from '../../convex/_generated/api';

export interface PokmaswasInput {
  no?: number;
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
}

/**
 * Simpan entri Pokmaswas baru ke Convex.
 * Melempar error bila Convex belum ter-deploy (fungsi tidak ditemukan).
 */
export async function addPokmaswas(input: PokmaswasInput): Promise<void> {
  if (!isConvexConfigured()) {
    throw new Error(
      'Convex belum dikonfigurasi. Jalankan `npx convex dev` untuk mengaktifkan backend.',
    );
  }
  await convex.mutation(api.pokmaswas.add, input);
}

/** Update entri yang sudah ada (by legacyId). */
export async function updatePokmaswas(
  legacyId: string,
  input: PokmaswasInput,
): Promise<void> {
  if (!isConvexConfigured()) {
    throw new Error(
      'Convex belum dikonfigurasi. Jalankan `npx convex dev` untuk mengaktifkan backend.',
    );
  }
  await convex.mutation(api.pokmaswas.upsert, { legacyId, ...input });
}

/** Hapus entri Pokmaswas (by legacyId). */
export async function deletePokmaswas(legacyId: string): Promise<void> {
  if (!isConvexConfigured()) {
    throw new Error(
      'Convex belum dikonfigurasi. Jalankan `npx convex dev` untuk mengaktifkan backend.',
    );
  }
  await convex.mutation(api.pokmaswas.remove, { legacyId });
}
