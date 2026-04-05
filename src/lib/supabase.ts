import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Jika env belum diisi, client tetap dibuat tapi semua operasi akan gagal gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

export const isSupabaseConfigured = () =>
  !!supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' &&
  !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key';

// ── Types (mirror dari schema SQL) ──────────────────────────────────────────

export interface DbLocation {
  id: string;
  name: string;
  province: string;
  district: string;
  lat: number;
  lng: number;
  area_ha: number;
  status: 'kritis' | 'jarang' | 'sedang' | 'lebat';
  kawasan: 'konservasi' | 'hutan_lindung' | 'apl';
  last_survey: string | null;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface DbSurvey {
  id: string;
  created_at?: string;
  petugas_nama: string;
  petugas_nip: string | null;
  petugas_unit: string;
  location_id: string;
  location_name: string;
  province: string;
  tanggal: string;
  metode_survei: string;
  koordinat_lat: number | null;
  koordinat_lng: number | null;
  gps_accuracy: number | null;
  // Ekosistem
  tutupan_tajuk: number | null;
  kerapatan_estimasi: number | null;
  spesies_dominan: string | null;
  spesies_lain: string | null;
  laju_regenerasi: string | null;
  kondisi_serasah: string | null;
  // Lingkungan
  salinitas: number | null;
  ph: number | null;
  suhu: number | null;
  kekeruhan: number | null;
  substrat: string | null;
  elevasi: number | null;
  pasang_surut: string | null;
  // Tekanan
  ancaman_utama: string[];
  jarak_pemukiman: number | null;
  luas_tambak_estimasi: number | null;
  aktivitas_manusia: string | null;
  status_tenurial: string | null;
  // Catatan
  kondisi_umum: string | null;
  rekomendasi_lapangan: string | null;
  // Sync
  sync_status: 'synced' | 'pending';
  photo_urls: string[];
}
