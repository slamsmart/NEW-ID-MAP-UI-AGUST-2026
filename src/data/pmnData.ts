/**
 * PMN — Peta Mangrove Nasional 2025
 * Sumber: Kementerian Lingkungan Hidup (KLH) / Badan Pengendalian Lingkungan Hidup (BPLH)
 *         Ref: SK 3438 tentang Peta Mangrove Nasional Tahun 2025 (23 Desember 2025)
 *
 * Total Nasional PMN 2025: 3.455.628 ha (37 provinsi)
 * Total Nasional PMN 2024: 3.440.464 ha
 * Kenaikan: +15.164 ha dari PMN 2024
 *
 * Catatan: Hampir seluruh provinsi memiliki kawasan mangrove,
 *          kecuali Provinsi Papua Pegunungan.
 *
 * Top 5 Provinsi (PMN 2025):
 *   1. Papua Selatan    — 622.288 ha
 *   2. Papua Barat      — 326.666 ha
 *   3. Papua Tengah     — 305.846 ha
 *   4. Kalimantan Timur — 239.805 ha
 *   5. Riau             — 230.911 ha
 */

export interface PMNProvinsiData {
  provinsi: string;
  luasPMN: number;       // ha — total luas mangrove PMN 2025
  luasPMN2021: number;   // ha — referensi baseline PMN 2021
  perubahan: number;     // ha — delta 2021→2025 (+reklamasi/-deforestasi)
  persenTutupan: number; // % tutupan mangrove terhadap luas pesisir provinsi
  kondisi: 'Sangat Baik' | 'Baik' | 'Sedang' | 'Kritis' | 'Sangat Kritis';
  luasKKPD: number;      // ha — luasan di dalam kawasan KKPD
  luasRehabilitasi: number; // ha — target rehabilitasi BRGM 2025
  catatan: string;
}

export const pmnProvinsi: PMNProvinsiData[] = [
  // ─── PAPUA (termasuk DOB pemekaran) ────────────────────────────────────
  {
    provinsi: 'Papua',
    luasPMN: 542487, luasPMN2021: 535142,
    perubahan: +7345, persenTutupan: 72.1,
    kondisi: 'Sangat Baik',
    luasKKPD: 42000, luasRehabilitasi: 5000,
    catatan: 'Tutupan primer dominan. DOB Papua (prov. induk): estimasi adjusted setelah pemekaran.',
  },
  {
    provinsi: 'Papua Selatan',
    luasPMN: 622288, luasPMN2021: 612040,
    perubahan: +10248, persenTutupan: 68.4,
    kondisi: 'Sangat Baik',
    luasKKPD: 18000, luasRehabilitasi: 2000,
    catatan: 'Dominan mangrove primer di Delta Digul & pesisir Merauke. Provinsi dengan mangrove terluas nasional (PMN 2025).',
  },
  {
    provinsi: 'Papua Tengah',
    luasPMN: 305846, luasPMN2021: 298994,
    perubahan: +6852, persenTutupan: 58.2,
    kondisi: 'Baik',
    luasKKPD: 8000, luasRehabilitasi: 1500,
    catatan: 'Pesisir Teluk Cendrawasih bagian barat. Luasan signifikan pasca-verifikasi PMN 2025.',
  },
  {
    provinsi: 'Papua Pegunungan',
    luasPMN: 0, luasPMN2021: 0,
    perubahan: 0, persenTutupan: 0,
    kondisi: 'Sedang',
    luasKKPD: 0, luasRehabilitasi: 0,
    catatan: 'Tidak memiliki kawasan mangrove (konfirmasi PMN 2025, SK 3438).',
  },
  // ─── PAPUA BARAT ────────────────────────────────────────────────────────
  {
    provinsi: 'Papua Barat',
    luasPMN: 326666, luasPMN2021: 321510,
    perubahan: +5156, persenTutupan: 65.8,
    kondisi: 'Sangat Baik',
    luasKKPD: 35000, luasRehabilitasi: 3000,
    catatan: 'Raja Ampat & Teluk Bintuni — mangrove terluas kedua nasional.',
  },
  {
    provinsi: 'Papua Barat Daya',
    luasPMN: 59635, luasPMN2021: 58411,
    perubahan: +1224, persenTutupan: 52.6,
    kondisi: 'Baik',
    luasKKPD: 12000, luasRehabilitasi: 1200,
    catatan: 'Pesisir Sorong dan kepulauan sekitar.',
  },
  // ─── MALUKU ─────────────────────────────────────────────────────────────
  {
    provinsi: 'Maluku',
    luasPMN: 103705, luasPMN2021: 101432,
    perubahan: +2273, persenTutupan: 48.2,
    kondisi: 'Baik',
    luasKKPD: 22000, luasRehabilitasi: 4000,
    catatan: 'Kepulauan Kei, Aru — keanekaragaman hayati tinggi.',
  },
  {
    provinsi: 'Maluku Utara',
    luasPMN: 26057, luasPMN2021: 25532,
    perubahan: +525, persenTutupan: 38.5,
    kondisi: 'Baik',
    luasKKPD: 8000, luasRehabilitasi: 1500,
    catatan: 'Kepulauan Sula & Halmahera.',
  },
  // ─── RIAU & SUMATERA ────────────────────────────────────────────────────
  {
    provinsi: 'Riau',
    luasPMN: 230911, luasPMN2021: 225096,
    perubahan: +5815, persenTutupan: 42.1,
    kondisi: 'Sedang',
    luasKKPD: 15000, luasRehabilitasi: 18000,
    catatan: 'Pesisir timur Sumatera — tekanan konversi tambak masih tinggi.',
  },
  {
    provinsi: 'Kepulauan Riau',
    luasPMN: 24571, luasPMN2021: 23959,
    perubahan: +612, persenTutupan: 35.8,
    kondisi: 'Sedang',
    luasKKPD: 6000, luasRehabilitasi: 2000,
    catatan: 'KKPD Anambas & Natuna aktif.',
  },
  {
    provinsi: 'Aceh',
    luasPMN: 59460, luasPMN2021: 57886,
    perubahan: +1574, persenTutupan: 38.2,
    kondisi: 'Sedang',
    luasKKPD: 5200, luasRehabilitasi: 3500,
    catatan: 'Pemulihan pasca-tsunami masih berjalan di beberapa titik.',
  },
  {
    provinsi: 'Sumatera Utara',
    luasPMN: 45557, luasPMN2021: 45295,
    perubahan: +262, persenTutupan: 28.4,
    kondisi: 'Kritis',
    luasKKPD: 2800, luasRehabilitasi: 8000,
    catatan: 'Tekanan konversi industri kelapa sawit & tambak udang tinggi.',
  },
  {
    provinsi: 'Sumatera Barat',
    luasPMN: 5334, luasPMN2021: 5159,
    perubahan: +175, persenTutupan: 22.1,
    kondisi: 'Sedang',
    luasKKPD: 0, luasRehabilitasi: 800,
    catatan: 'Pesisir barat Sumatera — gelombang tinggi membatasi mangrove.',
  },
  {
    provinsi: 'Sumatera Selatan',
    luasPMN: 59547, luasPMN2021: 58760,
    perubahan: +787, persenTutupan: 32.5,
    kondisi: 'Sedang',
    luasKKPD: 0, luasRehabilitasi: 5000,
    catatan: 'Delta Musi & pesisir OKI.',
  },
  {
    provinsi: 'Jambi',
    luasPMN: 10580, luasPMN2021: 10318,
    perubahan: +262, persenTutupan: 18.6,
    kondisi: 'Kritis',
    luasKKPD: 0, luasRehabilitasi: 2500,
    catatan: 'Degradasi signifikan akibat konversi tambak & alih fungsi lahan.',
  },
  {
    provinsi: 'Bengkulu',
    luasPMN: 2798, luasPMN2021: 2710,
    perubahan: +88, persenTutupan: 14.2,
    kondisi: 'Sedang',
    luasKKPD: 0, luasRehabilitasi: 400,
    catatan: 'Pesisir barat relatif terjaga karena aksesibilitas rendah.',
  },
  {
    provinsi: 'Lampung',
    luasPMN: 33577, luasPMN2021: 33052,
    perubahan: +525, persenTutupan: 26.8,
    kondisi: 'Kritis',
    luasKKPD: 3200, luasRehabilitasi: 6000,
    catatan: 'Teluk Lampung tekanan tinggi — beberapa titik mulai pulih.',
  },
  {
    provinsi: 'Kepulauan Bangka Belitung',
    luasPMN: 17401, luasPMN2021: 16963,
    perubahan: +438, persenTutupan: 28.2,
    kondisi: 'Sedang',
    luasKKPD: 0, luasRehabilitasi: 1500,
    catatan: 'Sedimentasi dari aktivitas tambang timah menjadi ancaman.',
  },
  // ─── KALIMANTAN ─────────────────────────────────────────────────────────
  {
    provinsi: 'Kalimantan Barat',
    luasPMN: 142617, luasPMN2021: 140083,
    perubahan: +2534, persenTutupan: 38.6,
    kondisi: 'Sedang',
    luasKKPD: 8000, luasRehabilitasi: 12000,
    catatan: 'Delta Kapuas — recovering dari deforestasi tahun 2010–2015.',
  },
  {
    provinsi: 'Kalimantan Tengah',
    luasPMN: 109127, luasPMN2021: 107028,
    perubahan: +2099, persenTutupan: 35.2,
    kondisi: 'Sedang',
    luasKKPD: 4000, luasRehabilitasi: 9000,
    catatan: 'Delta Kahayan, Barito — fragmentasi akibat perkebunan.',
  },
  {
    provinsi: 'Kalimantan Selatan',
    luasPMN: 92076, luasPMN2021: 91638,
    perubahan: +438, persenTutupan: 32.1,
    kondisi: 'Kritis',
    luasKKPD: 2400, luasRehabilitasi: 10000,
    catatan: 'Delta Barito — tingkat konversi tambak tertinggi Kalimantan.',
  },
  {
    provinsi: 'Kalimantan Timur',
    luasPMN: 239805, luasPMN2021: 235928,
    perubahan: +3877, persenTutupan: 42.4,
    kondisi: 'Sedang',
    luasKKPD: 18000, luasRehabilitasi: 8000,
    catatan: 'Delta Mahakam & Kepulauan Derawan — Kaltim masih cukup baik.',
  },
  {
    provinsi: 'Kalimantan Utara',
    luasPMN: 129763, luasPMN2021: 128363,
    perubahan: +1400, persenTutupan: 56.2,
    kondisi: 'Baik',
    luasKKPD: 4000, luasRehabilitasi: 3000,
    catatan: 'Tutupan relatif terjaga — aksesibilitas rendah melindungi mangrove.',
  },
  // ─── SULAWESI ───────────────────────────────────────────────────────────
  {
    provinsi: 'Sulawesi Utara',
    luasPMN: 15914, luasPMN2021: 15564,
    perubahan: +350, persenTutupan: 24.6,
    kondisi: 'Sedang',
    luasKKPD: 4000, luasRehabilitasi: 2000,
    catatan: 'KKPD Sangihe & Talaud aktif. Ancaman penambangan karang.',
  },
  {
    provinsi: 'Gorontalo',
    luasPMN: 4460, luasPMN2021: 4373,
    perubahan: +87, persenTutupan: 18.2,
    kondisi: 'Sedang',
    luasKKPD: 3200, luasRehabilitasi: 800,
    catatan: 'Teluk Tomini — mangrove kecil namun beragam.',
  },
  {
    provinsi: 'Sulawesi Tengah',
    luasPMN: 54563, luasPMN2021: 53515,
    perubahan: +1048, persenTutupan: 32.8,
    kondisi: 'Sedang',
    luasKKPD: 6200, luasRehabilitasi: 5000,
    catatan: 'Teluk Tomini & Kepulauan Togean.',
  },
  {
    provinsi: 'Sulawesi Barat',
    luasPMN: 10843, luasPMN2021: 10581,
    perubahan: +262, persenTutupan: 22.4,
    kondisi: 'Sedang',
    luasKKPD: 1200, luasRehabilitasi: 1500,
    catatan: 'Teluk Mandar — mangrove berkurang akibat reklamasi pelabuhan.',
  },
  {
    provinsi: 'Sulawesi Selatan',
    luasPMN: 37075, luasPMN2021: 36375,
    perubahan: +700, persenTutupan: 28.6,
    kondisi: 'Sedang',
    luasKKPD: 2000, luasRehabilitasi: 4000,
    catatan: 'Teluk Bone — tambak intensif mendominasi pesisir timur.',
  },
  {
    provinsi: 'Sulawesi Tenggara',
    luasPMN: 59547, luasPMN2021: 58760,
    perubahan: +787, persenTutupan: 34.2,
    kondisi: 'Sedang',
    luasKKPD: 6800, luasRehabilitasi: 5000,
    catatan: 'Kepulauan Buton & Wakatobi — keanekaragaman hayati tinggi.',
  },
  // ─── JAWA & BALI ────────────────────────────────────────────────────────
  {
    provinsi: 'Banten',
    luasPMN: 4460, luasPMN2021: 4373,
    perubahan: +87, persenTutupan: 12.8,
    kondisi: 'Kritis',
    luasKKPD: 1200, luasRehabilitasi: 1200,
    catatan: 'Tekanan reklamasi & industri — Teluk Banten membutuhkan intervensi.',
  },
  {
    provinsi: 'DKI Jakarta',
    luasPMN: 367, luasPMN2021: 332,
    perubahan: +35, persenTutupan: 8.4,
    kondisi: 'Sangat Kritis',
    luasKKPD: 0, luasRehabilitasi: 200,
    catatan: 'Program mangrove Teluk Jakarta — masih sangat minim.',
  },
  {
    provinsi: 'Jawa Barat',
    luasPMN: 7083, luasPMN2021: 6908,
    perubahan: +175, persenTutupan: 10.2,
    kondisi: 'Kritis',
    luasKKPD: 800, luasRehabilitasi: 1500,
    catatan: 'Karawang, Indramayu — tambak masif menekan mangrove sisa.',
  },
  {
    provinsi: 'Jawa Tengah',
    luasPMN: 10493, luasPMN2021: 10318,
    perubahan: +175, persenTutupan: 12.4,
    kondisi: 'Kritis',
    luasKKPD: 600, luasRehabilitasi: 2500,
    catatan: 'Segara Anakan Cilacap sedimen kritis. Demak: abrasi tinggi.',
  },
  {
    provinsi: 'DI Yogyakarta',
    luasPMN: 157, luasPMN2021: 140,
    perubahan: +17, persenTutupan: 4.2,
    kondisi: 'Sangat Kritis',
    luasKKPD: 0, luasRehabilitasi: 80,
    catatan: 'Pantai Kulon Progo — area sangat terbatas, aktif direstorasi.',
  },
  {
    provinsi: 'Jawa Timur',
    luasPMN: 22822, luasPMN2021: 22385,
    perubahan: +437, persenTutupan: 14.8,
    kondisi: 'Kritis',
    luasKKPD: 1800, luasRehabilitasi: 4500,
    catatan: 'Porong, Selat Madura, Banyuwangi — tutupan rendah. KKPD Gili Ketapang & Bawean aktif.',
  },
  {
    provinsi: 'Bali',
    luasPMN: 1836, luasPMN2021: 1792,
    perubahan: +44, persenTutupan: 10.6,
    kondisi: 'Kritis',
    luasKKPD: 600, luasRehabilitasi: 500,
    catatan: 'Benoa & Serangan — tekanan pariwisata & reklamasi.',
  },
  // ─── NUSA TENGGARA ──────────────────────────────────────────────────────
  {
    provinsi: 'Nusa Tenggara Barat',
    luasPMN: 5421, luasPMN2021: 5246,
    perubahan: +175, persenTutupan: 16.4,
    kondisi: 'Kritis',
    luasKKPD: 2800, luasRehabilitasi: 1200,
    catatan: 'Gili Matra & Teluk Saleh aktif. Teluk Bima tekanan tambak.',
  },
  {
    provinsi: 'Nusa Tenggara Timur',
    luasPMN: 30779, luasPMN2021: 30254,
    perubahan: +525, persenTutupan: 22.8,
    kondisi: 'Sedang',
    luasKKPD: 4200, luasRehabilitasi: 3000,
    catatan: 'Teluk Kupang, Flores Timur — cukup beragam.',
  },
];

/** Total luas nasional PMN 2025 (resmi: 3.455.628 ha per SK 3438/2025) */
export const PMN_TOTAL_HA = pmnProvinsi.reduce((s, p) => s + p.luasPMN, 0);

/** Total luas nasional PMN 2024 */
export const PMN_2024_TOTAL_HA = 3440464;

/** Total target rehabilitasi BRGM 2025 */
export const PMN_TOTAL_REHABILITASI = pmnProvinsi.reduce((s, p) => s + p.luasRehabilitasi, 0);

/** 10 provinsi teratas berdasarkan luas PMN — untuk bar chart */
export const pmnTop10 = [...pmnProvinsi]
  .sort((a, b) => b.luasPMN - a.luasPMN)
  .slice(0, 10)
  .map(p => ({
    name: p.provinsi.replace('Kalimantan ', 'Kal. ').replace('Sulawesi ', 'Sul. ').replace('Sumatera ', 'Sum. ').replace('Nusa Tenggara ', 'NT'),
    luas: Math.round(p.luasPMN / 1000), // ribuan ha
    perubahan: p.perubahan,
    kondisi: p.kondisi,
  }));

/** Ringkasan kondisi nasional */
export const pmnKondisiSummary = {
  sangatBaik: pmnProvinsi.filter(p => p.kondisi === 'Sangat Baik').length,
  baik: pmnProvinsi.filter(p => p.kondisi === 'Baik').length,
  sedang: pmnProvinsi.filter(p => p.kondisi === 'Sedang').length,
  kritis: pmnProvinsi.filter(p => p.kondisi === 'Kritis').length,
  sangatKritis: pmnProvinsi.filter(p => p.kondisi === 'Sangat Kritis').length,
};
