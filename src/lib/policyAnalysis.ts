/**
 * policyAnalysis — turunan analisis kebijakan dari data ID-MAP.
 *
 * Murni (tanpa efek samping / DOM) agar mudah diuji. Menggabungkan
 * kondisi mangrove, ekosistem, dan tekanan sosial menjadi peringkat
 * prioritas + rekomendasi aksi nyata (mengacu data kebijakan bila ada).
 */
import type { MangroveLocation, EkosistemData, TekananSosialData } from '../types';
import type { KebijakanLokasi } from '../data/kebijakan';

export type RiskLevel = 'kritis' | 'perhatian' | 'baik';

export interface PolicyItem {
  id: string;
  name: string;
  province: string;
  district: string;
  kawasan: MangroveLocation['kawasan'];
  status: MangroveLocation['status'];
  areaHa: number;
  skorKesehatan: number | null;
  indeksAncaman: number | null;
  statusTenurial: TekananSosialData['statusTenurial'] | null;
  /** Skor urgensi 0-100; makin tinggi makin mendesak. */
  urgensi: number;
  risiko: RiskLevel;
  ringkasan: string;
  /** Aksi nyata prioritas (0-6 bulan). */
  aksiPrioritas: string[];
  dasarHukum: string[];
  instansiPJ: string[];
  targetCapaian: string | null;
}

export interface PolicySummary {
  totalLokasi: number;
  totalAreaHa: number;
  kritis: number;
  perhatian: number;
  baik: number;
  avgSkorKesehatan: number;
  tenurialBermasalah: number;
}

export interface PolicyAnalysis {
  summary: PolicySummary;
  items: PolicyItem[];
  generatedAt: string;
}

/** Klasifikasi risiko dari kondisi habitat + tekanan. */
export function classifyRisk(
  status: MangroveLocation['status'],
  skor: number | null,
  indeksAncaman: number | null,
): RiskLevel {
  const s = skor ?? 100;
  const a = indeksAncaman ?? 0;
  if (status === 'kritis' || s < 40 || a >= 7) return 'kritis';
  if (status === 'sedang' || status === 'jarang' || s < 75 || a >= 4) return 'perhatian';
  return 'baik';
}

/** Skor urgensi 0-100: makin rusak dan makin tertekan → makin tinggi. */
export function urgencyScore(
  status: MangroveLocation['status'],
  skor: number | null,
  indeksAncaman: number | null,
  statusTenurial: TekananSosialData['statusTenurial'] | null,
): number {
  const kondisi = 100 - (skor ?? 100); // 0 sehat → 100 rusak
  const ancaman = (indeksAncaman ?? 0) * 10; // 0-100
  const statusBobotMap: Record<MangroveLocation['status'], number> = {
    kritis: 100, jarang: 70, sedang: 40, lebat: 10,
  };
  const tenurialBobot = statusTenurial === 'bersengketa' ? 100
    : statusTenurial === 'proses_legal' ? 55
    : 10;
  const skorUrgensi = kondisi * 0.35 + ancaman * 0.3 + statusBobotMap[status] * 0.2 + tenurialBobot * 0.15;
  return Math.round(Math.min(100, Math.max(0, skorUrgensi)));
}

export function buildPolicyAnalysis(
  locations: MangroveLocation[],
  ekosistem: EkosistemData[],
  tekanan: TekananSosialData[],
  kebijakan: KebijakanLokasi[],
  now: Date = new Date(),
): PolicyAnalysis {
  const ecoById = new Map(ekosistem.map((e) => [e.locationId, e]));
  const tekananById = new Map(tekanan.map((t) => [t.locationId, t]));
  const kebById = new Map(kebijakan.map((k) => [k.locationId, k]));

  const items: PolicyItem[] = locations.map((loc) => {
    const eco = ecoById.get(loc.id);
    const tek = tekananById.get(loc.id);
    const keb = kebById.get(loc.id);
    const skor = eco?.skorKesehatan ?? null;
    const indeksAncaman = tek?.indeksAncaman ?? null;
    const statusTenurial = tek?.statusTenurial ?? null;
    const risiko = classifyRisk(loc.status, skor, indeksAncaman);

    return {
      id: loc.id,
      name: loc.name,
      province: loc.province,
      district: loc.district,
      kawasan: loc.kawasan,
      status: loc.status,
      areaHa: loc.areaHa,
      skorKesehatan: skor,
      indeksAncaman,
      statusTenurial,
      urgensi: urgencyScore(loc.status, skor, indeksAncaman, statusTenurial),
      risiko,
      ringkasan: keb?.ringkasan ?? defaultRingkasan(loc, risiko, skor),
      aksiPrioritas: keb?.rekomendasiPendek?.slice(0, 3) ?? defaultAksi(loc, risiko),
      dasarHukum: (keb?.dasarHukum ?? []).map((d) => `${d.nomor}: ${d.keterangan}`),
      instansiPJ: keb?.instansiPJ ?? [],
      targetCapaian: keb?.targetCapaian ?? null,
    };
  });

  items.sort((a, b) => b.urgensi - a.urgensi);

  const totalAreaHa = locations.reduce((s, l) => s + l.areaHa, 0);
  const skorList = items.map((i) => i.skorKesehatan).filter((s): s is number => s != null);
  const summary: PolicySummary = {
    totalLokasi: items.length,
    totalAreaHa,
    kritis: items.filter((i) => i.risiko === 'kritis').length,
    perhatian: items.filter((i) => i.risiko === 'perhatian').length,
    baik: items.filter((i) => i.risiko === 'baik').length,
    avgSkorKesehatan: skorList.length
      ? Math.round(skorList.reduce((s, v) => s + v, 0) / skorList.length)
      : 0,
    tenurialBermasalah: items.filter(
      (i) => i.statusTenurial === 'bersengketa' || i.statusTenurial === 'proses_legal',
    ).length,
  };

  return { summary, items, generatedAt: now.toISOString() };
}

function defaultRingkasan(
  loc: MangroveLocation,
  risiko: RiskLevel,
  skor: number | null,
): string {
  const skorTxt = skor != null ? `skor kesehatan ${skor}/100` : 'skor kesehatan belum tersedia';
  if (risiko === 'kritis') {
    return `Kondisi kritis pada ${loc.name} (${skorTxt}). Perlu intervensi prioritas untuk mencegah kerusakan lanjut.`;
  }
  if (risiko === 'perhatian') {
    return `${loc.name} perlu perhatian (${skorTxt}). Pengelolaan preventif dianjurkan agar tidak menurun.`;
  }
  return `${loc.name} dalam kondisi baik (${skorTxt}). Fokus pada pemeliharaan dan monitoring rutin.`;
}

function defaultAksi(loc: MangroveLocation, risiko: RiskLevel): string[] {
  if (risiko === 'kritis') {
    return [
      `Verifikasi lapangan segera di ${loc.name} dan tetapkan status perlu penanganan`,
      'Hentikan tekanan konversi lahan di sekitar kawasan dan siapkan bibit untuk restorasi',
      'Koordinasi lintas instansi untuk penegakan dan pemulihan hidrologi',
    ];
  }
  if (risiko === 'perhatian') {
    return [
      `Jadwalkan monitoring rutin di ${loc.name} dan lengkapi data baseline`,
      'Kelola tekanan tambak/pemukiman melalui pendekatan silvofishery',
      'Perkuat kelompok pengawas dan pastikan status tenurial jelas',
    ];
  }
  return [
    `Pertahankan monitoring rutin di ${loc.name}`,
    'Perkuat program konservasi berbasis masyarakat',
    'Dokumentasikan sebagai lokasi percontohan',
  ];
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  kritis: 'Kritis',
  perhatian: 'Perhatian',
  baik: 'Baik',
};
