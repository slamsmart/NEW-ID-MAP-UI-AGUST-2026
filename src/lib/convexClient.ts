/**
 * Convex Client — singleton untuk panggilan dari luar React tree
 * (offlineQueue, localStore helpers). Komponen React tetap pakai
 * `useQuery`/`useMutation` lewat <ConvexProvider> di main.tsx.
 */
import { ConvexReactClient } from 'convex/react';
import type { DbSurvey, DbLocation } from '../types/db';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convex = new ConvexReactClient(
  convexUrl || 'https://placeholder.convex.cloud',
  { unsavedChangesWarning: false },
);

export const isConvexConfigured = () =>
  !!convexUrl && convexUrl !== 'https://placeholder.convex.cloud';

// ── Adapters: snake_case (Supabase shape) ↔ camelCase (Convex shape) ──────

const sanitizeNumber = (v: unknown): number | undefined =>
  v == null ? undefined : Number(v) || (Number(v) === 0 ? 0 : undefined);

const sanitizeString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

/** DbSurvey (snake_case) → args untuk `api.surveys.upsert` (camelCase). */
export function dbSurveyToConvexArgs(input: DbSurvey) {
  const s = input as DbSurvey & Record<string, unknown>;
  return {
    legacyId: s.id,
    tujuanSurvei: s.tujuan_survei,

    petugasNama: s.petugas_nama ?? '',
    petugasNip: sanitizeString(s.petugas_nip),
    petugasUnit: s.petugas_unit ?? '',
    tanggal: s.tanggal ?? new Date().toISOString().split('T')[0],

    locationId: sanitizeString(s.location_id),
    locationName: s.location_name ?? '',
    province: s.province ?? '',
    kabKota: sanitizeString((s as Record<string, unknown>).kab_kota),
    kecamatan: sanitizeString((s as Record<string, unknown>).kecamatan),
    koordinatLat: sanitizeNumber(s.koordinat_lat),
    koordinatLng: sanitizeNumber(s.koordinat_lng),
    gpsAccuracy: sanitizeNumber(s.gps_accuracy),
    googleMapsUrl: sanitizeString((s as Record<string, unknown>).google_maps_url),

    metodeSurvei: sanitizeString(s.metode_survei),
    tutupanTajuk: sanitizeNumber(s.tutupan_tajuk),
    kerapatanEstimasi: sanitizeNumber(s.kerapatan_estimasi),
    spesiesDominan: sanitizeString(s.spesies_dominan),
    spesiesLain: sanitizeString(s.spesies_lain),
    lajuRegenerasi: sanitizeString(s.laju_regenerasi),
    kondisiSerasah: sanitizeString(s.kondisi_serasah),

    salinitas: sanitizeNumber(s.salinitas),
    ph: sanitizeNumber(s.ph),
    suhu: sanitizeNumber(s.suhu),
    kekeruhan: sanitizeNumber(s.kekeruhan),
    substrat: sanitizeString(s.substrat),
    elevasi: sanitizeNumber(s.elevasi),
    pasangSurut: sanitizeString(s.pasang_surut),

    ancamanUtama: Array.isArray(s.ancaman_utama) ? s.ancaman_utama as string[] : [],
    jarakPemukiman: sanitizeNumber(s.jarak_pemukiman),
    luasTambakEstimasi: sanitizeNumber(s.luas_tambak_estimasi),
    aktivitasManusia: sanitizeString(s.aktivitas_manusia),
    statusTenurial: sanitizeString(s.status_tenurial),

    namaArea: sanitizeString((s as Record<string, unknown>).nama_area),
    luasanPotensi: sanitizeNumber((s as Record<string, unknown>).luasan_potensi),
    aksesibilitas: sanitizeString((s as Record<string, unknown>).aksesibilitas),
    pengaruhPasang: sanitizeString((s as Record<string, unknown>).pengaruh_pasang),
    skorPotensi: sanitizeNumber((s as Record<string, unknown>).skor_potensi),

    namaPantai: sanitizeString((s as Record<string, unknown>).nama_pantai),
    indikasiAbrasi: sanitizeString((s as Record<string, unknown>).indikasi_abrasi),
    kondisiSebelum: sanitizeString((s as Record<string, unknown>).kondisi_sebelum),
    kondisiSesudah: sanitizeString((s as Record<string, unknown>).kondisi_sesudah),
    tingkatAbrasi: sanitizeString((s as Record<string, unknown>).tingkat_abrasi),
    panjangTerdampak: sanitizeNumber((s as Record<string, unknown>).panjang_terdampak),
    luasanTerdampak: sanitizeNumber((s as Record<string, unknown>).luasan_terdampak),
    prioritasAbrasi: sanitizeString((s as Record<string, unknown>).prioritas_abrasi),

    kondisiUmum: sanitizeString(s.kondisi_umum),
    rekomendasiLapangan: sanitizeString(s.rekomendasi_lapangan),

    jenisPenyu: sanitizeString(s.jenis_penyu),
    jumlahSarang: sanitizeNumber(s.jumlah_sarang),
    statusPerlindungan: sanitizeString(s.status_perlindungan),
    sarangPoints: Array.isArray(s.sarang_points)
      ? (s.sarang_points as Array<{ lat: string; lng: string; catatan?: string; waktu?: string; fotoUrl?: string }>)
      : [],

    fotoDokumentasi: sanitizeString((s as Record<string, unknown>).foto_dokumentasi),
    photoUrls: Array.isArray(s.photo_urls) ? s.photo_urls as string[] : [],

    verificationStatus: ((s as Record<string, unknown>).verification_status === 'approved' ||
      (s as Record<string, unknown>).verification_status === 'rejected')
      ? (s as Record<string, unknown>).verification_status as 'approved' | 'rejected'
      : 'pending' as const,
    verificationNote: sanitizeString((s as Record<string, unknown>).verification_note),
    verifiedBy: sanitizeString((s as Record<string, unknown>).verified_by),
    verifiedAt: sanitizeString((s as Record<string, unknown>).verified_at),

    syncStatus: 'synced' as const,
  };
}

/** Convex doc (camelCase) → DbSurvey (snake_case) untuk konsumsi mapDbSurveyToSurveyRecord. */
export function convexSurveyToDbSurvey(c: Record<string, unknown>): DbSurvey {
  return {
    id: c.legacyId as string,
    created_at: typeof c._creationTime === 'number' ? new Date(c._creationTime).toISOString() : undefined,
    tujuan_survei: c.tujuanSurvei as DbSurvey['tujuan_survei'],
    petugas_nama: (c.petugasNama as string) ?? '',
    petugas_nip: (c.petugasNip as string) ?? null,
    petugas_unit: (c.petugasUnit as string) ?? '',
    location_id: (c.locationId as string) ?? '',
    location_name: (c.locationName as string) ?? '',
    province: (c.province as string) ?? '',
    tanggal: (c.tanggal as string) ?? '',
    metode_survei: (c.metodeSurvei as string) ?? '',
    koordinat_lat: (c.koordinatLat as number) ?? null,
    koordinat_lng: (c.koordinatLng as number) ?? null,
    gps_accuracy: (c.gpsAccuracy as number) ?? null,
    tutupan_tajuk: (c.tutupanTajuk as number) ?? null,
    kerapatan_estimasi: (c.kerapatanEstimasi as number) ?? null,
    spesies_dominan: (c.spesiesDominan as string) ?? null,
    spesies_lain: (c.spesiesLain as string) ?? null,
    laju_regenerasi: (c.lajuRegenerasi as string) ?? null,
    kondisi_serasah: (c.kondisiSerasah as string) ?? null,
    salinitas: (c.salinitas as number) ?? null,
    ph: (c.ph as number) ?? null,
    suhu: (c.suhu as number) ?? null,
    kekeruhan: (c.kekeruhan as number) ?? null,
    substrat: (c.substrat as string) ?? null,
    elevasi: (c.elevasi as number) ?? null,
    pasang_surut: (c.pasangSurut as string) ?? null,
    ancaman_utama: Array.isArray(c.ancamanUtama) ? c.ancamanUtama as string[] : [],
    jarak_pemukiman: (c.jarakPemukiman as number) ?? null,
    luas_tambak_estimasi: (c.luasTambakEstimasi as number) ?? null,
    aktivitas_manusia: (c.aktivitasManusia as string) ?? null,
    status_tenurial: (c.statusTenurial as string) ?? null,
    kondisi_umum: (c.kondisiUmum as string) ?? null,
    rekomendasi_lapangan: (c.rekomendasiLapangan as string) ?? null,
    jenis_penyu: (c.jenisPenyu as string) ?? null,
    jumlah_sarang: (c.jumlahSarang as number) ?? null,
    status_perlindungan: (c.statusPerlindungan as string) ?? null,
    sarang_points: Array.isArray(c.sarangPoints)
      ? c.sarangPoints as DbSurvey['sarang_points']
      : [],
    sync_status: 'synced',
    photo_urls: Array.isArray(c.photoUrls) ? c.photoUrls as string[] : [],
    foto_dokumentasi: (c.fotoDokumentasi as string) ?? null,
    google_maps_url: (c.googleMapsUrl as string) ?? null,
    luasan_potensi: (c.luasanPotensi as number) ?? null,
    skor_potensi: (c.skorPotensi as number) ?? null,
    aksesibilitas: (c.aksesibilitas as DbSurvey['aksesibilitas']) ?? null,
    pengaruh_pasang: (c.pengaruhPasang as string) ?? null,
    nama_pantai: (c.namaPantai as string) ?? null,
    tingkat_abrasi: (c.tingkatAbrasi as DbSurvey['tingkat_abrasi']) ?? null,
    panjang_terdampak: (c.panjangTerdampak as number) ?? null,
    prioritas_abrasi: (c.prioritasAbrasi as DbSurvey['prioritas_abrasi']) ?? null,
    kondisi_sebelum: (c.kondisiSebelum as string) ?? null,
    kondisi_sesudah: (c.kondisiSesudah as string) ?? null,
    verification_status: (c.verificationStatus as DbSurvey['verification_status']) ?? 'pending',
    verification_note: (c.verificationNote as string) ?? null,
    verified_by: (c.verifiedBy as string) ?? null,
    verified_at: (c.verifiedAt as string) ?? null,
  };
}

/** DbLocation (snake_case) → args untuk `api.locations.upsert` (camelCase). */
export function dbLocationToConvexArgs(l: DbLocation) {
  return {
    legacyId: l.id,
    name: l.name,
    province: l.province,
    district: l.district,
    lat: l.lat,
    lng: l.lng,
    areaHa: l.area_ha,
    status: l.status,
    kawasan: l.kawasan,
    lastSurvey: l.last_survey ?? undefined,
    isCustom: l.is_custom,
    createdBy: l.created_by ?? undefined,
  };
}
