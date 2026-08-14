/** Shared DB shapes used by offline queue + Convex adapters (snake_case). */

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
  tujuan_survei: 'monitoring' | 'potensi_penanaman' | 'abrasi' | 'pendaratan_penyu' | 'monitoring_vegetasi';
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
  tutupan_tajuk: number | null;
  kerapatan_estimasi: number | null;
  spesies_dominan: string | null;
  spesies_lain: string | null;
  laju_regenerasi: string | null;
  kondisi_serasah: string | null;
  salinitas: number | null;
  ph: number | null;
  suhu: number | null;
  kekeruhan: number | null;
  substrat: string | null;
  elevasi: number | null;
  pasang_surut: string | null;
  ancaman_utama: string[];
  jarak_pemukiman: number | null;
  luas_tambak_estimasi: number | null;
  aktivitas_manusia: string | null;
  status_tenurial: string | null;
  kondisi_umum: string | null;
  rekomendasi_lapangan: string | null;
  jenis_penyu?: string | null;
  jumlah_sarang?: number | null;
  status_perlindungan?: string | null;
  sarang_points?: Array<{ lat: string; lng: string; catatan?: string; waktu?: string; fotoUrl?: string }>;
  sync_status: 'synced' | 'pending';
  photo_urls: string[];
  foto_dokumentasi?: string | null;
  google_maps_url?: string | null;
  luasan_potensi?: number | null;
  skor_potensi?: number | null;
  aksesibilitas?: 'mudah' | 'sedang' | 'sulit' | null;
  pengaruh_pasang?: string | null;
  nama_pantai?: string | null;
  tingkat_abrasi?: 'ringan' | 'sedang' | 'parah' | 'sangat_parah' | null;
  panjang_terdampak?: number | null;
  prioritas_abrasi?: 'Tinggi' | 'Sedang' | 'Rendah' | null;
  kondisi_sebelum?: string | null;
  kondisi_sesudah?: string | null;
  verification_status?: 'pending' | 'approved' | 'rejected' | null;
  verification_note?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
}
