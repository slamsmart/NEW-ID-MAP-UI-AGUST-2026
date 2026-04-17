/**
 * Data Titik Rawan Abrasi Pesisir
 * Sumber: Survey lapangan DKP + analisis citra satelit
 * Digunakan sebagai dasar rekomendasi lokasi penanaman mangrove
 */

export type PrioritasLevel = 'Tinggi' | 'Sedang' | 'Rendah–Sedang';
export type SubstratType = 'lumpur' | 'pasir' | 'berbatu' | 'campuran';

export interface TitikAbrasi {
  id: string;
  namaPantai: string;
  kecamatan: string;
  kabKota: string;
  provinsi: string;
  koordinat: { lat: number; lng: number };
  googleMapsUrl?: string;
  indikasi: string;
  kondisiSebelum: string;
  kondisiSesudah: string;
  tanamanRekomendasi: string[];
  luasanRestorasi: { min: number; max: number; satuan: string };
  prioritas: PrioritasLevel;
  substrat: SubstratType;
  ancamanUtama: string[];
  skorRisiko: number; // 1–10
}

export const titikAbrasiData: TitikAbrasi[] = [
  {
    id: 'ABR-001',
    namaPantai: 'Modangan',
    kecamatan: 'Donomulyo',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.302, lng: 112.301 },
    indikasi: 'Pantai terbuka, gelombang tinggi, aliran sungai dari daratan',
    kondisiSebelum: 'Pantai lebar dengan vegetasi terbatas',
    kondisiSesudah: 'Penyempitan pantai & minim vegetasi pelindung',
    tanamanRekomendasi: [
      'Cemara laut (Casuarina equisetifolia)',
      'Pandan laut (Pandanus tectorius)',
      'Rumput pantai (Spinifex littoreus)',
    ],
    luasanRestorasi: { min: 15, max: 35, satuan: 'ha' },
    prioritas: 'Sedang',
    substrat: 'pasir',
    ancamanUtama: ['Gelombang tinggi', 'Abrasi pantai', 'Aliran sungai'],
    skorRisiko: 6,
  },
  {
    id: 'ABR-002',
    namaPantai: 'Ngliyep',
    kecamatan: 'Donomulyo',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.358, lng: 112.317 },
    indikasi: 'Ombak kuat',
    kondisiSebelum: 'Pantai lebar & vegetasi alami',
    kondisiSesudah: 'Penyempitan pantai',
    tanamanRekomendasi: [
      'Cemara laut (Casuarina equisetifolia)',
      'Pandan laut (Pandanus tectorius)',
    ],
    luasanRestorasi: { min: 20, max: 50, satuan: 'ha' },
    prioritas: 'Sedang',
    substrat: 'pasir',
    ancamanUtama: ['Ombak kuat', 'Abrasi pantai'],
    skorRisiko: 6,
  },
  {
    id: 'ABR-003',
    namaPantai: 'Balekambang',
    kecamatan: 'Bantur',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.371, lng: 112.472 },
    indikasi: 'Gelombang tinggi',
    kondisiSebelum: 'Pantai relatif stabil',
    kondisiSesudah: 'Erosi lokal',
    tanamanRekomendasi: [
      'Cemara laut (Casuarina equisetifolia)',
      'Ketapang (Terminalia catappa)',
    ],
    luasanRestorasi: { min: 15, max: 40, satuan: 'ha' },
    prioritas: 'Rendah–Sedang',
    substrat: 'pasir',
    ancamanUtama: ['Gelombang tinggi', 'Erosi lokal'],
    skorRisiko: 4,
  },
  {
    id: 'ABR-004',
    namaPantai: 'Jolangkung',
    kecamatan: 'Gedangan',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.389, lng: 112.512 },
    indikasi: 'Perubahan garis pantai',
    kondisiSebelum: 'Pantai berpasir stabil',
    kondisiSesudah: 'Erosi bertahap',
    tanamanRekomendasi: [
      'Cemara laut (Casuarina equisetifolia)',
      'Pandan laut (Pandanus tectorius)',
    ],
    luasanRestorasi: { min: 10, max: 30, satuan: 'ha' },
    prioritas: 'Sedang',
    substrat: 'pasir',
    ancamanUtama: ['Perubahan garis pantai', 'Erosi bertahap'],
    skorRisiko: 5,
  },
  {
    id: 'ABR-005',
    namaPantai: 'Bajul Mati',
    kecamatan: 'Gedangan',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.394, lng: 112.535 },
    indikasi: 'Abrasi kuat',
    kondisiSebelum: 'Pantai stabil',
    kondisiSesudah: 'Pengikisan garis pantai',
    tanamanRekomendasi: [
      'Cemara laut (Casuarina equisetifolia)',
      'Waru laut (Hibiscus tiliaceus)',
    ],
    luasanRestorasi: { min: 15, max: 30, satuan: 'ha' },
    prioritas: 'Sedang',
    substrat: 'pasir',
    ancamanUtama: ['Abrasi kuat', 'Pengikisan garis pantai'],
    skorRisiko: 6,
  },
  {
    id: 'ABR-006',
    namaPantai: 'Sendang Biru',
    kecamatan: 'Sumbermanjing Wetan',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.437, lng: 112.618 },
    indikasi: 'Abrasi parah perubahan arus laut',
    kondisiSebelum: 'Hutan mangrove cukup rapat, garis pantai stabil',
    kondisiSesudah: 'Garis pantai mundur, mangrove berkurang',
    tanamanRekomendasi: [
      'Rhizophora mucronata',
      'Avicennia marina',
      'Sonneratia alba',
    ],
    luasanRestorasi: { min: 50, max: 100, satuan: 'ha' },
    prioritas: 'Tinggi',
    substrat: 'lumpur',
    ancamanUtama: ['Abrasi parah', 'Perubahan arus laut', 'Degradasi mangrove'],
    skorRisiko: 8,
  },
  {
    id: 'ABR-007',
    namaPantai: 'Tamban',
    kecamatan: 'Sumbermanjing Wetan',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.451, lng: 112.634 },
    indikasi: 'Kerusakan mangrove luas',
    kondisiSebelum: 'Ekosistem mangrove alami',
    kondisiSesudah: 'Banyak area terbuka & terdegradasi',
    tanamanRekomendasi: [
      'Rhizophora apiculata',
      'Bruguiera gymnorrhiza',
      'Avicennia marina',
    ],
    luasanRestorasi: { min: 344, max: 344, satuan: 'ha (bagian CMC)' },
    prioritas: 'Tinggi',
    substrat: 'lumpur',
    ancamanUtama: ['Kerusakan mangrove', 'Deforestasi', 'Abrasi pantai'],
    skorRisiko: 9,
  },
  {
    id: 'ABR-008',
    namaPantai: 'Clungup',
    kecamatan: 'Sumbermanjing Wetan',
    kabKota: 'Kab. Malang',
    provinsi: 'Jawa Timur',
    koordinat: { lat: -8.462, lng: 112.648 },
    indikasi: 'Degradasi mangrove',
    kondisiSebelum: 'Mangrove alami cukup luas',
    kondisiSesudah: 'Sebagian area rusak → direhabi­litasi',
    tanamanRekomendasi: [
      'Rhizophora apiculata',
      'Sonneratia alba',
    ],
    luasanRestorasi: { min: 177, max: 177, satuan: 'ha (bagian CMC)' },
    prioritas: 'Sedang',
    substrat: 'lumpur',
    ancamanUtama: ['Degradasi mangrove', 'Abrasi lokal'],
    skorRisiko: 6,
  },
];

/** Skor risiko → warna badge */
export function getSkorColor(skor: number): string {
  if (skor >= 8) return 'bg-red-100 text-red-700 border-red-200';
  if (skor >= 6) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (skor >= 4) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
}

export function getPrioritasColor(p: PrioritasLevel): string {
  if (p === 'Tinggi') return 'bg-red-100 text-red-700 border border-red-200';
  if (p === 'Sedang') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  return 'bg-blue-100 text-blue-700 border border-blue-200';
}

/**
 * Algoritma skor potensi penanaman dari data survei lapangan
 * Faktor: substrat (lumpur/campuran ideal), salinitas 10-30 ppt, tutupan rendah
 */
export function hitungSkorPotensi(substrat: string, salinitas: string, tutupanTajuk: string): number {
  let skor = 0;
  if (substrat === 'lumpur') skor += 4;
  else if (substrat === 'campuran') skor += 3;
  else if (substrat === 'pasir') skor += 1;

  const sal = parseFloat(salinitas);
  if (!isNaN(sal)) {
    if (sal >= 10 && sal <= 30) skor += 3;
    else if (sal < 10 || sal <= 35) skor += 2;
    else skor += 1;
  }

  const tutupan = parseFloat(tutupanTajuk);
  if (!isNaN(tutupan)) {
    if (tutupan < 30) skor += 3;
    else if (tutupan < 60) skor += 2;
    else skor += 1;
  }
  return Math.min(skor, 10);
}

export function rekomendasiSpesiesBySubstrat(substrat: string): string[] {
  switch (substrat) {
    case 'lumpur':
      return ['Rhizophora apiculata', 'Rhizophora mucronata', 'Avicennia marina', 'Sonneratia alba'];
    case 'campuran':
      return ['Avicennia marina', 'Bruguiera gymnorrhiza', 'Rhizophora stylosa'];
    case 'pasir':
      return ['Cemara laut (Casuarina equisetifolia)', 'Pandan laut (Pandanus tectorius)', 'Waru laut (Hibiscus tiliaceus)'];
    case 'berbatu':
      return ['Aegiceras corniculatum', 'Lumnitzera racemosa'];
    default:
      return ['Rhizophora apiculata', 'Avicennia marina'];
  }
}
