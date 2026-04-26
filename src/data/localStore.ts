import { getAllSurveys } from '../lib/offlineQueue';
import { type DbSurvey } from '../lib/supabase';
import { convex, isConvexConfigured } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import type { MangroveLocation } from '../types';

const CUSTOM_LOCS_KEY = 'idmap_custom_locs';
const SURVEYS_KEY = 'idmap_surveys';

function stripInlineImage(value?: string) {
  return value?.startsWith('data:') ? '' : value;
}

function compactSurveyRecord(rec: SurveyRecord): SurveyRecord {
  return {
    ...rec,
    fotoDokumentasi: stripInlineImage(rec.fotoDokumentasi),
    sarangPoints: rec.sarangPoints?.map(point => ({
      ...point,
      fotoUrl: stripInlineImage(point.fotoUrl),
    })),
  };
}

export interface SurveyRecord {
  id: string;
  timestamp: string;
  namaPetugas: string;
  unit: string;
  locationId: string;
  locationName: string;
  province: string;
  tutupanTajuk: string;
  kerapatan: string;
  salinitas: string;
  ancamanCount: number;
  kondisiUmum: string;
  isCustomLoc: boolean;
  // Extended fields for planting recommendation
  substrat?: string;
  ph?: string;
  suhu?: string;
  koordinatLat?: string;
  koordinatLng?: string;
  spesiesDominan?: string;
  spesiesLain?: string;
  rekomendasiLapangan?: string;
  statusTenurial?: string;
  lajuRegenerasi?: string;
  mhiMangrove?: string;
  ancamanUtama?: string[];
  fotoDokumentasi?: string;
  luasanPotensi?: string;
  skorPotensi?: number;
  googleMapsUrl?: string;
  // Form type
  tujuanSurvei?: 'monitoring' | 'potensi_penanaman' | 'abrasi' | 'vegetasi_mangrove' | 'pendaratan_penyu';
  // Verification status
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verificationNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // Potensi penanaman
  aksesibilitas?: 'mudah' | 'sedang' | 'sulit';
  pengaruhPasang?: string;
  // Abrasi
  tingkatAbrasi?: 'ringan' | 'sedang' | 'parah' | 'sangat_parah';
  kondisiSebelum?: string;
  kondisiSesudah?: string;
  panjangTerdampak?: string;
  prioritasAbrasi?: 'Tinggi' | 'Sedang' | 'Rendah';
  namaPantai?: string;
  // Vegetasi mangrove
  jenisVegetasi?: string;
  luasArea?: string;
  kondisiVegetasi?: string;
  // Pendaratan penyu
  jenisPenyu?: string;
  jumlahSarang?: string;
  statusPerlindungan?: string;
  sarangPoints?: Array<{
    lat: string;
    lng: string;
    catatan?: string;
    waktu?: string;
    fotoUrl?: string;
  }>;
}

function toTujuanSurvei(value?: string | null): SurveyRecord['tujuanSurvei'] {
  if (value === 'potensi_penanaman' || value === 'abrasi' || value === 'vegetasi_mangrove' || value === 'pendaratan_penyu') {
    return value;
  }
  return 'monitoring';
}

function toVerificationStatus(value?: string | null): SurveyRecord['verificationStatus'] {
  if (value === 'approved' || value === 'rejected') return value;
  return 'pending';
}

function buildGoogleMapsUrl(lat?: string | null, lng?: string | null) {
  return lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;
}

export function mapDbSurveyToSurveyRecord(row: Partial<DbSurvey> & Record<string, unknown>): SurveyRecord {
  const lat = row.koordinat_lat != null ? String(row.koordinat_lat) : '';
  const lng = row.koordinat_lng != null ? String(row.koordinat_lng) : '';
  const tujuan = toTujuanSurvei(typeof row.tujuan_survei === 'string' ? row.tujuan_survei : null);
  const photoUrls = Array.isArray(row.photo_urls) ? row.photo_urls.filter((url): url is string => typeof url === 'string') : [];
  const sarangPoints = Array.isArray(row.sarang_points)
    ? row.sarang_points.filter((point): point is NonNullable<SurveyRecord['sarangPoints']>[number] => typeof point === 'object' && point !== null)
    : [];

  return {
    id: String(row.id ?? ''),
    timestamp: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
    namaPetugas: typeof row.petugas_nama === 'string' ? row.petugas_nama : '',
    unit: typeof row.petugas_unit === 'string' ? row.petugas_unit : '',
    locationId: typeof row.location_id === 'string' ? row.location_id : '',
    locationName: typeof row.location_name === 'string' ? row.location_name : '',
    province: typeof row.province === 'string' ? row.province : '',
    tutupanTajuk: row.tutupan_tajuk != null ? String(row.tutupan_tajuk) : '',
    kerapatan: row.kerapatan_estimasi != null ? String(row.kerapatan_estimasi) : '',
    salinitas: row.salinitas != null ? String(row.salinitas) : '',
    ancamanCount: Array.isArray(row.ancaman_utama) ? row.ancaman_utama.length : 0,
    kondisiUmum: typeof row.kondisi_umum === 'string' ? row.kondisi_umum : '',
    isCustomLoc: true,
    substrat: typeof row.substrat === 'string' ? row.substrat : undefined,
    ph: row.ph != null ? String(row.ph) : '',
    suhu: row.suhu != null ? String(row.suhu) : '',
    koordinatLat: lat,
    koordinatLng: lng,
    spesiesDominan: typeof row.spesies_dominan === 'string' ? row.spesies_dominan : undefined,
    spesiesLain: typeof row.spesies_lain === 'string' ? row.spesies_lain : undefined,
    rekomendasiLapangan: typeof row.rekomendasi_lapangan === 'string' ? row.rekomendasi_lapangan : undefined,
    statusTenurial: typeof row.status_tenurial === 'string' ? row.status_tenurial : undefined,
    lajuRegenerasi: typeof row.laju_regenerasi === 'string' ? row.laju_regenerasi : undefined,
    mhiMangrove: undefined,
    ancamanUtama: Array.isArray(row.ancaman_utama) ? row.ancaman_utama.filter((item): item is string => typeof item === 'string') : [],
    fotoDokumentasi: typeof row.foto_dokumentasi === 'string' && row.foto_dokumentasi
      ? row.foto_dokumentasi
      : photoUrls[0] ?? '',
    luasanPotensi: row.luasan_potensi != null ? String(row.luasan_potensi) : undefined,
    skorPotensi: typeof row.skor_potensi === 'number' ? row.skor_potensi : undefined,
    googleMapsUrl: typeof row.google_maps_url === 'string' && row.google_maps_url
      ? row.google_maps_url
      : buildGoogleMapsUrl(lat, lng),
    tujuanSurvei: tujuan,
    verificationStatus: toVerificationStatus(typeof row.verification_status === 'string' ? row.verification_status : null),
    verificationNote: typeof row.verification_note === 'string' ? row.verification_note : undefined,
    verifiedAt: typeof row.verified_at === 'string' ? row.verified_at : undefined,
    verifiedBy: typeof row.verified_by === 'string' ? row.verified_by : undefined,
    aksesibilitas: row.aksesibilitas === 'mudah' || row.aksesibilitas === 'sedang' || row.aksesibilitas === 'sulit'
      ? row.aksesibilitas
      : undefined,
    pengaruhPasang: typeof row.pengaruh_pasang === 'string' ? row.pengaruh_pasang : undefined,
    tingkatAbrasi: row.tingkat_abrasi === 'ringan' || row.tingkat_abrasi === 'sedang' || row.tingkat_abrasi === 'parah' || row.tingkat_abrasi === 'sangat_parah'
      ? row.tingkat_abrasi
      : undefined,
    kondisiSebelum: typeof row.kondisi_sebelum === 'string' ? row.kondisi_sebelum : undefined,
    kondisiSesudah: typeof row.kondisi_sesudah === 'string' ? row.kondisi_sesudah : undefined,
    panjangTerdampak: row.panjang_terdampak != null ? String(row.panjang_terdampak) : undefined,
    prioritasAbrasi: row.prioritas_abrasi === 'Tinggi' || row.prioritas_abrasi === 'Sedang' || row.prioritas_abrasi === 'Rendah'
      ? row.prioritas_abrasi
      : undefined,
    namaPantai: typeof row.nama_pantai === 'string' ? row.nama_pantai : undefined,
    jenisVegetasi: undefined,
    luasArea: undefined,
    kondisiVegetasi: undefined,
    jenisPenyu: typeof row.jenis_penyu === 'string' ? row.jenis_penyu : undefined,
    jumlahSarang: row.jumlah_sarang != null ? String(row.jumlah_sarang) : undefined,
    statusPerlindungan: typeof row.status_perlindungan === 'string' ? row.status_perlindungan : undefined,
    sarangPoints,
  };
}

export function getCustomLocations(): MangroveLocation[] {
  try {
    const d = localStorage.getItem(CUSTOM_LOCS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveCustomLocation(loc: MangroveLocation): void {
  const existing = getCustomLocations();
  existing.push(loc);
  localStorage.setItem(CUSTOM_LOCS_KEY, JSON.stringify(existing));
}

export function getSurveys(): SurveyRecord[] {
  try {
    const d = localStorage.getItem(SURVEYS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveSurvey(rec: SurveyRecord): void {
  const prepare = (item: SurveyRecord) => {
    if (!item.verificationStatus) {
      item.verificationStatus = 'pending';
    }
    return item;
  };

  const existing = getSurveys();
  const prepared = prepare({ ...rec });

  try {
    existing.unshift(prepared);
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch {
    const compacted = compactSurveyRecord(prepared);
    const fallback = getSurveys();
    fallback.unshift(compacted);
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(fallback.slice(0, 200)));
  }
}

export async function fetchSurveys(): Promise<SurveyRecord[]> {
  if (!isConvexConfigured()) {
    return getSurveys();
  }

  try {
    const rows = await getAllSurveys();
    const merged = rows.map(row => mapDbSurveyToSurveyRecord(row as Partial<DbSurvey> & Record<string, unknown>));
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(merged.slice(0, 200)));
    return merged;
  } catch {
    return getSurveys();
  }
}

export function updateSurvey(id: string, updates: Partial<SurveyRecord>): void {
  const existing = getSurveys();
  const idx = existing.findIndex(s => s.id === id);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...updates };
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(existing.slice(0, 200)));
  }
}

export function deleteSurvey(id: string): void {
  const existing = getSurveys();
  const filtered = existing.filter(s => s.id !== id);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(filtered.slice(0, 200)));
}

export async function removeSurvey(id: string): Promise<void> {
  deleteSurvey(id);
  if (!isConvexConfigured()) return;

  await convex.mutation(api.surveys.remove, { legacyId: id });
}

export function verifySurvey(id: string, status: 'approved' | 'rejected', note: string, verifiedBy: string): void {
  const existing = getSurveys();
  const idx = existing.findIndex(s => s.id === id);
  if (idx >= 0) {
    existing[idx].verificationStatus = status;
    existing[idx].verificationNote = note;
    existing[idx].verifiedAt = new Date().toISOString();
    existing[idx].verifiedBy = verifiedBy;
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(existing.slice(0, 200)));
  }
}

export async function verifySurveyRemote(id: string, status: 'approved' | 'rejected', note: string, verifiedBy: string): Promise<void> {
  verifySurvey(id, status, note, verifiedBy);
  if (!isConvexConfigured()) return;

  await convex.mutation(api.surveys.verify, {
    legacyId: id,
    status,
    note: note || undefined,
    verifiedBy,
  });
}

/**
 * Update parsial survei via Convex.
 * Strategi: ambil dokumen existing dari Convex, merge updates, upsert kembali.
 * (Convex tidak punya "update partial by legacyId" — pakai upsert idempotent.)
 */
export async function updateSurveyRemote(id: string, updates: Partial<SurveyRecord>): Promise<void> {
  updateSurvey(id, updates);
  if (!isConvexConfigured()) return;

  const existing = await convex.query(api.surveys.getByLegacyId, { legacyId: id });
  if (!existing) return;

  const num = (v: string | undefined) =>
    v === undefined ? undefined : (v ? Number.parseFloat(v) || undefined : undefined);
  const int = (v: string | undefined) =>
    v === undefined ? undefined : (v ? Number.parseInt(v, 10) || undefined : undefined);

  const merged = {
    legacyId: id,
    tujuanSurvei: existing.tujuanSurvei,
    petugasNama: existing.petugasNama,
    petugasNip: existing.petugasNip,
    petugasUnit: existing.petugasUnit,
    tanggal: existing.tanggal,
    locationId: existing.locationId,
    locationName: updates.locationName ?? existing.locationName,
    province: updates.province ?? existing.province,
    kabKota: existing.kabKota,
    kecamatan: existing.kecamatan,
    koordinatLat: updates.koordinatLat !== undefined ? num(updates.koordinatLat) : existing.koordinatLat,
    koordinatLng: updates.koordinatLng !== undefined ? num(updates.koordinatLng) : existing.koordinatLng,
    gpsAccuracy: existing.gpsAccuracy,
    googleMapsUrl: updates.googleMapsUrl ?? existing.googleMapsUrl,
    metodeSurvei: existing.metodeSurvei,
    tutupanTajuk: updates.tutupanTajuk !== undefined ? num(updates.tutupanTajuk) : existing.tutupanTajuk,
    kerapatanEstimasi: existing.kerapatanEstimasi,
    spesiesDominan: existing.spesiesDominan,
    spesiesLain: existing.spesiesLain,
    lajuRegenerasi: existing.lajuRegenerasi,
    kondisiSerasah: existing.kondisiSerasah,
    salinitas: updates.salinitas !== undefined ? num(updates.salinitas) : existing.salinitas,
    ph: existing.ph,
    suhu: existing.suhu,
    kekeruhan: existing.kekeruhan,
    substrat: updates.substrat !== undefined ? (updates.substrat || undefined) : existing.substrat,
    elevasi: existing.elevasi,
    pasangSurut: existing.pasangSurut,
    ancamanUtama: updates.ancamanUtama ?? existing.ancamanUtama,
    jarakPemukiman: existing.jarakPemukiman,
    luasTambakEstimasi: existing.luasTambakEstimasi,
    aktivitasManusia: existing.aktivitasManusia,
    statusTenurial: existing.statusTenurial,
    namaArea: existing.namaArea,
    luasanPotensi: existing.luasanPotensi,
    aksesibilitas: existing.aksesibilitas,
    pengaruhPasang: existing.pengaruhPasang,
    skorPotensi: existing.skorPotensi,
    namaPantai: updates.namaPantai ?? existing.namaPantai,
    indikasiAbrasi: existing.indikasiAbrasi,
    kondisiSebelum: updates.kondisiSebelum ?? existing.kondisiSebelum,
    kondisiSesudah: updates.kondisiSesudah ?? existing.kondisiSesudah,
    tingkatAbrasi: updates.tingkatAbrasi ?? existing.tingkatAbrasi,
    panjangTerdampak: existing.panjangTerdampak,
    luasanTerdampak: existing.luasanTerdampak,
    prioritasAbrasi: updates.prioritasAbrasi ?? existing.prioritasAbrasi,
    kondisiUmum: updates.kondisiUmum ?? existing.kondisiUmum,
    rekomendasiLapangan: updates.rekomendasiLapangan ?? existing.rekomendasiLapangan,
    jenisPenyu: updates.jenisPenyu ?? existing.jenisPenyu,
    jumlahSarang: updates.jumlahSarang !== undefined ? int(updates.jumlahSarang) : existing.jumlahSarang,
    statusPerlindungan: updates.statusPerlindungan ?? existing.statusPerlindungan,
    sarangPoints: updates.sarangPoints ?? existing.sarangPoints,
    fotoDokumentasi: existing.fotoDokumentasi,
    photoUrls: existing.photoUrls,
    verificationStatus: existing.verificationStatus,
    verificationNote: existing.verificationNote,
    verifiedBy: existing.verifiedBy,
    verifiedAt: existing.verifiedAt,
    syncStatus: existing.syncStatus,
  };

  await convex.mutation(api.surveys.upsert, merged);
}

export async function fetchVerificationStats() {
  const surveys = await fetchSurveys();
  return {
    total: surveys.length,
    pending: surveys.filter(s => (s.verificationStatus ?? 'pending') === 'pending').length,
    approved: surveys.filter(s => s.verificationStatus === 'approved').length,
    rejected: surveys.filter(s => s.verificationStatus === 'rejected').length,
  };
}

export async function fetchSurveyStats() {
  const surveys = await fetchSurveys();
  const today = new Date().toISOString().split('T')[0];
  const todayCount = surveys.filter(s => s.timestamp.startsWith(today)).length;
  const customLocs = getCustomLocations();
  return {
    total: surveys.length,
    today: todayCount,
    customLocCount: customLocs.length,
    lastSubmit: surveys[0]?.timestamp ?? null,
  };
}

export function getVerificationStats() {
  const surveys = getSurveys();
  return {
    total: surveys.length,
    pending: surveys.filter(s => s.verificationStatus === 'pending').length,
    approved: surveys.filter(s => s.verificationStatus === 'approved').length,
    rejected: surveys.filter(s => s.verificationStatus === 'rejected').length,
  };
}

export function getSurveyStats() {
  const surveys = getSurveys();
  const today = new Date().toISOString().split('T')[0];
  const todayCount = surveys.filter(s => s.timestamp.startsWith(today)).length;
  const customLocs = getCustomLocations();
  return {
    total: surveys.length,
    today: todayCount,
    customLocCount: customLocs.length,
    lastSubmit: surveys[0]?.timestamp ?? null,
  };
}
