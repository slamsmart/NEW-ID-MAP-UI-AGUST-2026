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
