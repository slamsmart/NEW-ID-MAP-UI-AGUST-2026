/**
 * Opsi profil Pokmaswas untuk form entry & legenda Peta Interaktif.
 * Kombinasi "pilihan tetap + bebas" (user bisa menambah nilai lain).
 */

/** Ruang lingkup wilayah kerja kelompok pengawas. */
export const RUANG_LINGKUP_OPTIONS: string[] = [
  'Pesisir',
  'Perairan Umum',
];

/**
 * Kawasan pantai — isian bebas, tapi diberikan saran umum
 * (datalist) agar konsisten antar entri.
 */
export const KAWASAN_PANTAI_SUGGESTIONS: string[] = [
  'Pantai Bajulmati',
  'Pantai Goa China',
  'Pantai Balekambang',
  'Pantai Sendang Biru',
  'Pantai Tamban',
  'Pantai Kondang Merak',
  'Pantai Watu Karung',
  'Pantai Pasir Putih',
  'Pantai Wonogiri',
  'Muara Brantas',
  'Muara Porong',
  'Muara Kali Porong',
  'Perairan Sumbermanjing',
  'Perairan Tasikmadu',
];

/** Bidang / core yang ditekuni kelompok. Bisa pilih lebih dari satu. */
export const BIDANG_CORE_OPTIONS: string[] = [
  'Perlindungan Penyu',
  'Restorasi Mangrove',
  'Pengawasan Illegal Fishing',
  'Budidaya Rumput Laut',
  'Ekowisata Bahari',
  'Pengelolaan Sampah Laut',
  'Edukasi & Kampanye Konservasi',
  'Mitigasi Abrasi',
  'Monitoring Ekosistem Pesisir',
  'Perlindungan Terumbu Karang',
];

/** Kab/Kota yang lazim di wilker Cabdin KP Kab. Malang. */
export const KAB_KOTA_OPTIONS: string[] = [
  'KAB. MALANG',
  'KAB. PASURUAN',
  'KOTA PASURUAN',
  'KAB. SIDOARJO',
  'KAB. BLITAR',
  'KAB. LUMAJANG',
  'KOTA BATU',
];
