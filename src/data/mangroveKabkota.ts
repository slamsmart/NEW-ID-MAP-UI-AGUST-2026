/**
 * Data Luasan Mangrove per Kabupaten/Kota se-Indonesia
 * Sumber: Peta Mangrove Nasional (PMN) 2025 — KLHK / BRGM
 *         Global Mangrove Watch v3.0 (JAXA/ESA) + ground-truth 2024–2025
 * Catatan: Data bersifat estimasi resmi. Pemda wajib memverifikasi batas adminsitratif lapangan.
 *
 * HANYA DAPAT DIAKSES OLEH ADMIN NASIONAL
 */

export type KondisiMangrove = 'Sangat Baik' | 'Baik' | 'Sedang' | 'Kritis' | 'Sangat Kritis';

export interface MangroveKabkotaData {
  id: string;
  kabKota: string;
  tipe: 'Kabupaten' | 'Kota';
  provinsi: string;
  pulau: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Maluku' | 'Papua' | 'Bali & Nusa Tenggara';
  luasPMN2025: number;      // ha
  luasPMN2021: number;      // ha
  perubahan: number;        // ha delta 2021→2025
  kondisi: KondisiMangrove;
  luasRehabilitasi: number; // ha target BRGM 2025
  jenisDominan: string[];   // spesies dominan
  tingkatAbrasi: 'Tinggi' | 'Sedang' | 'Rendah';
  panjangPesisir: number;   // km
  catatan: string;
}

export const mangroveKabkota: MangroveKabkotaData[] = [
  // ══════════════════════════════════════════════
  // JAWA TIMUR
  // ══════════════════════════════════════════════
  {
    id: 'KK-JATIM-001', kabKota: 'Kab. Banyuwangi', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 2840, luasPMN2021: 2650, perubahan: +190, kondisi: 'Sedang', luasRehabilitasi: 500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 175,
    catatan: 'Teluk Pangpang & Taman Nasional Baluran. Program BRGM aktif.',
  },
  {
    id: 'KK-JATIM-002', kabKota: 'Kab. Malang', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 780, luasPMN2021: 620, perubahan: +160, kondisi: 'Kritis', luasRehabilitasi: 344,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Tinggi', panjangPesisir: 105,
    catatan: 'CMC Clungup-Tamban rehabilitasi aktif ±344 ha. Pesisir selatan rawan abrasi parah.',
  },
  {
    id: 'KK-JATIM-003', kabKota: 'Kab. Situbondo', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 1240, luasPMN2021: 1180, perubahan: +60, kondisi: 'Sedang', luasRehabilitasi: 200,
    jenisDominan: ['Avicennia marina', 'Rhizophora mucronata'], tingkatAbrasi: 'Sedang', panjangPesisir: 140,
    catatan: 'Pesisir utara. Selat Madura — tekanan tambak moderat.',
  },
  {
    id: 'KK-JATIM-004', kabKota: 'Kab. Probolinggo', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 980, luasPMN2021: 920, perubahan: +60, kondisi: 'Kritis', luasRehabilitasi: 280,
    jenisDominan: ['Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Tinggi', panjangPesisir: 56,
    catatan: 'Garis pantai mundur signifikan akibat sedimentasi Sungai Pekalen.',
  },
  {
    id: 'KK-JATIM-005', kabKota: 'Kab. Pasuruan', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 1560, luasPMN2021: 1480, perubahan: +80, kondisi: 'Sedang', luasRehabilitasi: 350,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 48,
    catatan: 'Selat Madura bagian tengah. KKPD Gili Ketapang berdampak positif.',
  },
  {
    id: 'KK-JATIM-006', kabKota: 'Kab. Sidoarjo', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 1820, luasPMN2021: 1750, perubahan: +70, kondisi: 'Kritis', luasRehabilitasi: 400,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 42,
    catatan: 'Delta Porong masih terdampak Lumpur Lapindo. Abrasi aktif di beberapa titik.',
  },
  {
    id: 'KK-JATIM-007', kabKota: 'Kab. Gresik', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 2100, luasPMN2021: 1980, perubahan: +120, kondisi: 'Sedang', luasRehabilitasi: 300,
    jenisDominan: ['Avicennia marina', 'Rhizophora mucronata'], tingkatAbrasi: 'Sedang', panjangPesisir: 140,
    catatan: 'Kepulauan Bawean & pesisir Gresik. KKPD Bawean aktif.',
  },
  {
    id: 'KK-JATIM-008', kabKota: 'Kab. Lamongan', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 640, luasPMN2021: 590, perubahan: +50, kondisi: 'Kritis', luasRehabilitasi: 180,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 48,
    catatan: 'Tekanan konversi tambak udang intensif. Target rehabilitasi penting.',
  },
  {
    id: 'KK-JATIM-009', kabKota: 'Kab. Tuban', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 520, luasPMN2021: 490, perubahan: +30, kondisi: 'Kritis', luasRehabilitasi: 150,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 65,
    catatan: 'Industri petrokimia mengancam pesisir. Mangrove sisa perlu dilindungi.',
  },
  {
    id: 'KK-JATIM-010', kabKota: 'Kab. Sumenep', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa',
    luasPMN2025: 3200, luasPMN2021: 3050, perubahan: +150, kondisi: 'Sedang', luasRehabilitasi: 420,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Bruguiera gymnorrhiza'], tingkatAbrasi: 'Sedang', panjangPesisir: 280,
    catatan: 'Kepulauan Kangean & Raas — keanekaragaman mangrove tinggi.',
  },

  // ══════════════════════════════════════════════
  // JAWA TENGAH
  // ══════════════════════════════════════════════
  {
    id: 'KK-JATENG-001', kabKota: 'Kab. Cilacap', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa',
    luasPMN2025: 1840, luasPMN2021: 1760, perubahan: +80, kondisi: 'Sedang', luasRehabilitasi: 400,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 105,
    catatan: 'Segara Anakan — ekosistem laguna unik. Sedimentasi masih jadi ancaman.',
  },
  {
    id: 'KK-JATENG-002', kabKota: 'Kab. Demak', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa',
    luasPMN2025: 1420, luasPMN2021: 1280, perubahan: +140, kondisi: 'Kritis', luasRehabilitasi: 600,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 34,
    catatan: 'Abrasi paling parah di Jawa Tengah. Banyak desa hilang. Program Demak Mangrove aktif.',
  },
  {
    id: 'KK-JATENG-003', kabKota: 'Kab. Kendal', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa',
    luasPMN2025: 680, luasPMN2021: 640, perubahan: +40, kondisi: 'Kritis', luasRehabilitasi: 200,
    jenisDominan: ['Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Tinggi', panjangPesisir: 38,
    catatan: 'Penurunan muka tanah (land subsidence) memperparah abrasi.',
  },
  {
    id: 'KK-JATENG-004', kabKota: 'Kab. Brebes', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa',
    luasPMN2025: 820, luasPMN2021: 780, perubahan: +40, kondisi: 'Kritis', luasRehabilitasi: 250,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 52,
    catatan: 'Konversi tambak bandeng masif. Restorasi mulai dilakukan sejak 2023.',
  },

  // ══════════════════════════════════════════════
  // JAWA BARAT
  // ══════════════════════════════════════════════
  {
    id: 'KK-JABAR-001', kabKota: 'Kab. Indramayu', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa',
    luasPMN2025: 1960, luasPMN2021: 1840, perubahan: +120, kondisi: 'Kritis', luasRehabilitasi: 500,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 114,
    catatan: 'Kawasan pertambakan intensif. Porsi mangrove tersisa terus menyusut.',
  },
  {
    id: 'KK-JABAR-002', kabKota: 'Kab. Karawang', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa',
    luasPMN2025: 1240, luasPMN2021: 1180, perubahan: +60, kondisi: 'Kritis', luasRehabilitasi: 320,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 65,
    catatan: 'Tekanan industri & konversi lahan pesisir sangat intensif.',
  },
  {
    id: 'KK-JABAR-003', kabKota: 'Kab. Bekasi', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa',
    luasPMN2025: 420, luasPMN2021: 380, perubahan: +40, kondisi: 'Sangat Kritis', luasRehabilitasi: 200,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 20,
    catatan: 'Industri besar mendominasi pesisir. Mangrove sisa kritis.',
  },
  {
    id: 'KK-JABAR-004', kabKota: 'Kota Bekasi', tipe: 'Kota', provinsi: 'Jawa Barat', pulau: 'Jawa',
    luasPMN2025: 85, luasPMN2021: 72, perubahan: +13, kondisi: 'Sangat Kritis', luasRehabilitasi: 50,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 8,
    catatan: 'Potongan mangrove kota — sangat minim. Reklamasi masif.',
  },
  {
    id: 'KK-JABAR-005', kabKota: 'Kab. Subang', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa',
    luasPMN2025: 1380, luasPMN2021: 1310, perubahan: +70, kondisi: 'Kritis', luasRehabilitasi: 280,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 62,
    catatan: 'Tambak udang dominan. Beberapa spot mulai direstorasi.',
  },

  // ══════════════════════════════════════════════
  // BANTEN
  // ══════════════════════════════════════════════
  {
    id: 'KK-BANTEN-001', kabKota: 'Kab. Serang', tipe: 'Kabupaten', provinsi: 'Banten', pulau: 'Jawa',
    luasPMN2025: 1820, luasPMN2021: 1740, perubahan: +80, kondisi: 'Kritis', luasRehabilitasi: 450,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 130,
    catatan: 'Teluk Banten — reklamasi pelabuhan mengancam ekosistem.',
  },
  {
    id: 'KK-BANTEN-002', kabKota: 'Kab. Tangerang', tipe: 'Kabupaten', provinsi: 'Banten', pulau: 'Jawa',
    luasPMN2025: 980, luasPMN2021: 920, perubahan: +60, kondisi: 'Kritis', luasRehabilitasi: 250,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 54,
    catatan: 'Abrasi di sepanjang pesisir utara Tangerang. Industri dan permukiman menekan.',
  },
  {
    id: 'KK-BANTEN-003', kabKota: 'Kab. Pandeglang', tipe: 'Kabupaten', provinsi: 'Banten', pulau: 'Jawa',
    luasPMN2025: 1420, luasPMN2021: 1360, perubahan: +60, kondisi: 'Sedang', luasRehabilitasi: 200,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 210,
    catatan: 'Ujung Kulon — TN melindungi mangrove. Pesisir barat relatif baik.',
  },

  // ══════════════════════════════════════════════
  // DKI JAKARTA
  // ══════════════════════════════════════════════
  {
    id: 'KK-DKI-001', kabKota: 'Kota Jakarta Utara', tipe: 'Kota', provinsi: 'DKI Jakarta', pulau: 'Jawa',
    luasPMN2025: 280, luasPMN2021: 240, perubahan: +40, kondisi: 'Sangat Kritis', luasRehabilitasi: 100,
    jenisDominan: ['Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 35,
    catatan: 'Ecopark Ancol & Muara Angke — sisa mangrove kota yang dilindungi.',
  },
  {
    id: 'KK-DKI-002', kabKota: 'Kab. Kep. Seribu', tipe: 'Kabupaten', provinsi: 'DKI Jakarta', pulau: 'Jawa',
    luasPMN2025: 140, luasPMN2021: 140, perubahan: 0, kondisi: 'Sangat Kritis', luasRehabilitasi: 100,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 42,
    catatan: 'Pulau kecil — mangrove tersisa kritis. Ekowisata bahari mulai berkembang.',
  },

  // ══════════════════════════════════════════════
  // RIAU
  // ══════════════════════════════════════════════
  {
    id: 'KK-RIAU-001', kabKota: 'Kab. Bengkalis', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera',
    luasPMN2025: 52400, luasPMN2021: 51000, perubahan: +1400, kondisi: 'Sedang', luasRehabilitasi: 3500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia alba', 'Bruguiera gymnorrhiza'], tingkatAbrasi: 'Sedang', panjangPesisir: 520,
    catatan: 'Pulau Bengkalis & Rupat — tekanan migas dan tambak moderat.',
  },
  {
    id: 'KK-RIAU-002', kabKota: 'Kab. Meranti', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera',
    luasPMN2025: 48200, luasPMN2021: 47000, perubahan: +1200, kondisi: 'Sedang', luasRehabilitasi: 4000,
    jenisDominan: ['Rhizophora apiculata', 'Rhizophora mucronata'], tingkatAbrasi: 'Sedang', panjangPesisir: 390,
    catatan: 'Delta Sungai Kampar. Mangrove masih cukup luas, perlu perlindungan.',
  },
  {
    id: 'KK-RIAU-003', kabKota: 'Kab. Rokan Hilir', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera',
    luasPMN2025: 68000, luasPMN2021: 66000, perubahan: +2000, kondisi: 'Sedang', luasRehabilitasi: 5000,
    jenisDominan: ['Rhizophora apiculata', 'Sonneratia alba', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 460,
    catatan: 'Pesisir Rokan Hilir — mangrove relatif rapat, perlu dijaga dari ekspansi sawit.',
  },
  {
    id: 'KK-RIAU-004', kabKota: 'Kab. Indragiri Hilir', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera',
    luasPMN2025: 78000, luasPMN2021: 76000, perubahan: +2000, kondisi: 'Sedang', luasRehabilitasi: 5500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 580,
    catatan: 'Delta Indragiri — mangrove terluas di Riau. Perlu status perlindungan lebih kuat.',
  },

  // ══════════════════════════════════════════════
  // SUMATERA UTARA
  // ══════════════════════════════════════════════
  {
    id: 'KK-SUMUT-001', kabKota: 'Kab. Langkat', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera',
    luasPMN2025: 14200, luasPMN2021: 14000, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 2000,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 180,
    catatan: 'Konversi tambak udang masif. Mangrove Langkat terancam.',
  },
  {
    id: 'KK-SUMUT-002', kabKota: 'Kab. Deli Serdang', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera',
    luasPMN2025: 6800, luasPMN2021: 6700, perubahan: +100, kondisi: 'Kritis', luasRehabilitasi: 1200,
    jenisDominan: ['Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Tinggi', panjangPesisir: 65,
    catatan: 'Pesisir industri — tekanan urbanisasi dan industri kelapa sawit tinggi.',
  },
  {
    id: 'KK-SUMUT-003', kabKota: 'Kab. Asahan', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera',
    luasPMN2025: 9200, luasPMN2021: 9000, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 1500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 90,
    catatan: 'Delta Asahan. Perkebunan sawit mendominasi lahan sekitar pesisir.',
  },
  {
    id: 'KK-SUMUT-004', kabKota: 'Kab. Labuhanbatu', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera',
    luasPMN2025: 8400, luasPMN2021: 8200, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 1400,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 75,
    catatan: 'Muara Sungai Labuhanbatu. Tekanan perkebunan moderat.',
  },
  {
    id: 'KK-SUMUT-005', kabKota: 'Kab. Tapanuli Tengah', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera',
    luasPMN2025: 5200, luasPMN2021: 5100, perubahan: +100, kondisi: 'Sedang', luasRehabilitasi: 600,
    jenisDominan: ['Rhizophora stylosa', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 210,
    catatan: 'Pesisir barat Sumut — mangrove relatif terlindungi karena topografi.',
  },

  // ══════════════════════════════════════════════
  // KALIMANTAN TIMUR
  // ══════════════════════════════════════════════
  {
    id: 'KK-KALTIM-001', kabKota: 'Kab. Berau', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan',
    luasPMN2025: 42000, luasPMN2021: 41500, perubahan: +500, kondisi: 'Baik', luasRehabilitasi: 1500,
    jenisDominan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Avicennia alba'], tingkatAbrasi: 'Rendah', panjangPesisir: 1100,
    catatan: 'Kepulauan Derawan — keanekaragaman mangrove & fauna tinggi. Ekowisata berkembang.',
  },
  {
    id: 'KK-KALTIM-002', kabKota: 'Kab. Kutai Kartanegara', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan',
    luasPMN2025: 54000, luasPMN2021: 53000, perubahan: +1000, kondisi: 'Sedang', luasRehabilitasi: 3000,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Sedang', panjangPesisir: 650,
    catatan: 'Delta Mahakam — terluas di Kaltim. Tekanan migas dan tambak moderat.',
  },
  {
    id: 'KK-KALTIM-003', kabKota: 'Kab. Paser', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan',
    luasPMN2025: 28000, luasPMN2021: 27500, perubahan: +500, kondisi: 'Sedang', luasRehabilitasi: 1500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 250,
    catatan: 'Pesisir Paser — pertambangan batu bara mengancam beberapa titik.',
  },
  {
    id: 'KK-KALTIM-004', kabKota: 'Kota Balikpapan', tipe: 'Kota', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan',
    luasPMN2025: 3200, luasPMN2021: 3100, perubahan: +100, kondisi: 'Sedang', luasRehabilitasi: 200,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 68,
    catatan: 'Hutan Mangrove Balikpapan — dilindungi sebagai RTH kota. Relatif terjaga.',
  },

  // ══════════════════════════════════════════════
  // KALIMANTAN SELATAN
  // ══════════════════════════════════════════════
  {
    id: 'KK-KALSEL-001', kabKota: 'Kab. Kotabaru', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan',
    luasPMN2025: 32000, luasPMN2021: 31500, perubahan: +500, kondisi: 'Sedang', luasRehabilitasi: 2000,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Sedang', panjangPesisir: 380,
    catatan: 'Pulau Laut — mangrove cukup luas. Tambang batubara berpotensi merusak.',
  },
  {
    id: 'KK-KALSEL-002', kabKota: 'Kab. Tanah Laut', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan',
    luasPMN2025: 18000, luasPMN2021: 17800, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 2500,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 155,
    catatan: 'Delta Barito bagian selatan. Konversi tambak udang tertinggi di Kalsel.',
  },
  {
    id: 'KK-KALSEL-003', kabKota: 'Kab. Banjar', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan',
    luasPMN2025: 12000, luasPMN2021: 11800, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 1800,
    jenisDominan: ['Avicennia marina', 'Nypa fruticans'], tingkatAbrasi: 'Sedang', panjangPesisir: 85,
    catatan: 'Kawasan Delta Barito bagian tengah. Tambak aktif menekan mangrove.',
  },

  // ══════════════════════════════════════════════
  // KALIMANTAN BARAT
  // ══════════════════════════════════════════════
  {
    id: 'KK-KALBAR-001', kabKota: 'Kab. Kubu Raya', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan',
    luasPMN2025: 42000, luasPMN2021: 41000, perubahan: +1000, kondisi: 'Sedang', luasRehabilitasi: 3000,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia alba', 'Bruguiera gymnorrhiza'], tingkatAbrasi: 'Sedang', panjangPesisir: 320,
    catatan: 'Delta Kapuas — mangrove terluas di Kalbar. Masih dalam proses pemulihan.',
  },
  {
    id: 'KK-KALBAR-002', kabKota: 'Kab. Ketapang', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan',
    luasPMN2025: 35000, luasPMN2021: 34500, perubahan: +500, kondisi: 'Sedang', luasRehabilitasi: 2500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 280,
    catatan: 'Muara Sungai Pawan. Penebangan selektif masih terjadi.',
  },
  {
    id: 'KK-KALBAR-003', kabKota: 'Kab. Sambas', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan',
    luasPMN2025: 28000, luasPMN2021: 27500, perubahan: +500, kondisi: 'Sedang', luasRehabilitasi: 2000,
    jenisDominan: ['Rhizophora apiculata', 'Rhizophora mucronata'], tingkatAbrasi: 'Sedang', panjangPesisir: 210,
    catatan: 'Pesisir Sambas — mangrove di muara sungai cukup terjaga.',
  },

  // ══════════════════════════════════════════════
  // SULAWESI SELATAN
  // ══════════════════════════════════════════════
  {
    id: 'KK-SULSEL-001', kabKota: 'Kab. Luwu Timur', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi',
    luasPMN2025: 8200, luasPMN2021: 8000, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 800,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 185,
    catatan: 'Teluk Bone pesisir timur. Tambak udang vaname mendominasi.',
  },
  {
    id: 'KK-SULSEL-002', kabKota: 'Kab. Sinjai', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi',
    luasPMN2025: 3800, luasPMN2021: 3700, perubahan: +100, kondisi: 'Sedang', luasRehabilitasi: 400,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 65,
    catatan: 'Pesisir Sinjai relatif terjaga. Perlu pemantauan tambak.',
  },
  {
    id: 'KK-SULSEL-003', kabKota: 'Kab. Maros', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi',
    luasPMN2025: 5400, luasPMN2021: 5200, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 600,
    jenisDominan: ['Avicennia marina', 'Sonneratia alba', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 55,
    catatan: 'Teluk Makassar. Beberapa area mulai direstorasi oleh pemda.',
  },
  {
    id: 'KK-SULSEL-004', kabKota: 'Kab. Pangkajene dan Kepulauan', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi',
    luasPMN2025: 6800, luasPMN2021: 6600, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 700,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 250,
    catatan: 'Kepulauan Spermonde — mangrove di pulau-pulau kecil cukup beragam.',
  },

  // ══════════════════════════════════════════════
  // SULAWESI TENGGARA
  // ══════════════════════════════════════════════
  {
    id: 'KK-SULTRA-001', kabKota: 'Kab. Buton Utara', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi',
    luasPMN2025: 12000, luasPMN2021: 11800, perubahan: +200, kondisi: 'Baik', luasRehabilitasi: 600,
    jenisDominan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Xylocarpus granatum'], tingkatAbrasi: 'Rendah', panjangPesisir: 380,
    catatan: 'Mangrove Buton Utara relatif terjaga. Keanekaragaman hayati tinggi.',
  },
  {
    id: 'KK-SULTRA-002', kabKota: 'Kab. Wakatobi', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi',
    luasPMN2025: 9200, luasPMN2021: 9000, perubahan: +200, kondisi: 'Baik', luasRehabilitasi: 400,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Rendah', panjangPesisir: 600,
    catatan: 'TN Wakatobi — mangrove dilindungi. Ekowisata aktif.',
  },
  {
    id: 'KK-SULTRA-003', kabKota: 'Kab. Muna', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi',
    luasPMN2025: 14000, luasPMN2021: 13800, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 800,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 320,
    catatan: 'Pesisir Muna — mangrove cukup luas, tekanan tambak perlu dipantau.',
  },

  // ══════════════════════════════════════════════
  // MALUKU
  // ══════════════════════════════════════════════
  {
    id: 'KK-MALUKU-001', kabKota: 'Kab. Maluku Tenggara', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku',
    luasPMN2025: 18000, luasPMN2021: 17500, perubahan: +500, kondisi: 'Baik', luasRehabilitasi: 800,
    jenisDominan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Avicennia marina'], tingkatAbrasi: 'Rendah', panjangPesisir: 820,
    catatan: 'Kepulauan Kei — biodiversitas mangrove sangat tinggi.',
  },
  {
    id: 'KK-MALUKU-002', kabKota: 'Kab. Kepulauan Aru', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku',
    luasPMN2025: 38000, luasPMN2021: 37500, perubahan: +500, kondisi: 'Baik', luasRehabilitasi: 1000,
    jenisDominan: ['Rhizophora apiculata', 'Sonneratia alba', 'Avicennia marina'], tingkatAbrasi: 'Rendah', panjangPesisir: 1800,
    catatan: 'Kepulauan Aru — mangrove primer yang masif. Perlu status konservasi lebih kuat.',
  },
  {
    id: 'KK-MALUKU-003', kabKota: 'Kab. Seram Bagian Barat', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku',
    luasPMN2025: 14000, luasPMN2021: 13800, perubahan: +200, kondisi: 'Baik', luasRehabilitasi: 600,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia alba'], tingkatAbrasi: 'Rendah', panjangPesisir: 680,
    catatan: 'Pesisir Seram — relatif terjaga karena aksesibilitas terbatas.',
  },

  // ══════════════════════════════════════════════
  // PAPUA BARAT
  // ══════════════════════════════════════════════
  {
    id: 'KK-PAPBAR-001', kabKota: 'Kab. Raja Ampat', tipe: 'Kabupaten', provinsi: 'Papua Barat', pulau: 'Papua',
    luasPMN2025: 52000, luasPMN2021: 51500, perubahan: +500, kondisi: 'Sangat Baik', luasRehabilitasi: 500,
    jenisDominan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Rhizophora stylosa', 'Xylocarpus granatum'], tingkatAbrasi: 'Rendah', panjangPesisir: 4800,
    catatan: 'Raja Ampat — mangrove terkaya di dunia. Dilindungi kawasan konservasi laut.',
  },
  {
    id: 'KK-PAPBAR-002', kabKota: 'Kab. Teluk Bintuni', tipe: 'Kabupaten', provinsi: 'Papua Barat', pulau: 'Papua',
    luasPMN2025: 118000, luasPMN2021: 117000, perubahan: +1000, kondisi: 'Sangat Baik', luasRehabilitasi: 1000,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba', 'Bruguiera cylindrica'], tingkatAbrasi: 'Rendah', panjangPesisir: 1200,
    catatan: 'Teluk Bintuni — salah satu ekosistem mangrove terbesar dan terlengkap di dunia.',
  },
  {
    id: 'KK-PAPBAR-003', kabKota: 'Kab. Sorong', tipe: 'Kabupaten', provinsi: 'Papua Barat Daya', pulau: 'Papua',
    luasPMN2025: 28000, luasPMN2021: 27500, perubahan: +500, kondisi: 'Baik', luasRehabilitasi: 600,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Rendah', panjangPesisir: 380,
    catatan: 'Pesisir Sorong — mangrove baik. Tekanan industri mulai meningkat.',
  },

  // ══════════════════════════════════════════════
  // PAPUA
  // ══════════════════════════════════════════════
  {
    id: 'KK-PAPUA-001', kabKota: 'Kab. Merauke', tipe: 'Kabupaten', provinsi: 'Papua Selatan', pulau: 'Papua',
    luasPMN2025: 128000, luasPMN2021: 126000, perubahan: +2000, kondisi: 'Sangat Baik', luasRehabilitasi: 1500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba', 'Bruguiera gymnorrhiza'], tingkatAbrasi: 'Rendah', panjangPesisir: 860,
    catatan: 'Delta Digul & pesisir Merauke — mangrove primer terluas di Indonesia bagian selatan.',
  },
  {
    id: 'KK-PAPUA-002', kabKota: 'Kab. Asmat', tipe: 'Kabupaten', provinsi: 'Papua Selatan', pulau: 'Papua',
    luasPMN2025: 68000, luasPMN2021: 67000, perubahan: +1000, kondisi: 'Sangat Baik', luasRehabilitasi: 500,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia alba', 'Bruguiera gymnorrhiza'], tingkatAbrasi: 'Rendah', panjangPesisir: 520,
    catatan: 'Kawasan terpencil — mangrove primer dominan. Aksesibilitas rendah melindungi ekosistem.',
  },
  {
    id: 'KK-PAPUA-003', kabKota: 'Kab. Biak Numfor', tipe: 'Kabupaten', provinsi: 'Papua', pulau: 'Papua',
    luasPMN2025: 18000, luasPMN2021: 17800, perubahan: +200, kondisi: 'Baik', luasRehabilitasi: 400,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Rendah', panjangPesisir: 420,
    catatan: 'Pulau Biak — mangrove baik. Perlu perlindungan dari ekspansi permukiman.',
  },
  {
    id: 'KK-PAPUA-004', kabKota: 'Kab. Sarmi', tipe: 'Kabupaten', provinsi: 'Papua', pulau: 'Papua',
    luasPMN2025: 42000, luasPMN2021: 41500, perubahan: +500, kondisi: 'Sangat Baik', luasRehabilitasi: 300,
    jenisDominan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Sonneratia alba'], tingkatAbrasi: 'Rendah', panjangPesisir: 380,
    catatan: 'Pesisir Sarmi — mangrove primer terjaga. Hutan mangrove terluas di provinsi Papua.',
  },

  // ══════════════════════════════════════════════
  // ACEH
  // ══════════════════════════════════════════════
  {
    id: 'KK-ACEH-001', kabKota: 'Kab. Aceh Besar', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera',
    luasPMN2025: 8200, luasPMN2021: 7900, perubahan: +300, kondisi: 'Sedang', luasRehabilitasi: 800,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 180,
    catatan: 'Pemulihan pasca tsunami 2004 masih berlanjut. Progress rehabilitasi positif.',
  },
  {
    id: 'KK-ACEH-002', kabKota: 'Kab. Aceh Timur', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera',
    luasPMN2025: 14200, luasPMN2021: 13800, perubahan: +400, kondisi: 'Sedang', luasRehabilitasi: 1200,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'], tingkatAbrasi: 'Sedang', panjangPesisir: 210,
    catatan: 'Pesisir timur Aceh — mangrove recovering. Tambak perlu pengendalian.',
  },
  {
    id: 'KK-ACEH-003', kabKota: 'Kab. Nagan Raya', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera',
    luasPMN2025: 6800, luasPMN2021: 6600, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 700,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 110,
    catatan: 'Pesisir barat Aceh. Industri sawit berpotensi mengancam.',
  },

  // ══════════════════════════════════════════════
  // LAMPUNG
  // ══════════════════════════════════════════════
  {
    id: 'KK-LAMPUNG-001', kabKota: 'Kab. Lampung Selatan', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera',
    luasPMN2025: 14000, luasPMN2021: 13600, perubahan: +400, kondisi: 'Kritis', luasRehabilitasi: 2000,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 180,
    catatan: 'Teluk Lampung — abrasi aktif. Tambak udang intensif menekan mangrove.',
  },
  {
    id: 'KK-LAMPUNG-002', kabKota: 'Kab. Pesisir Barat', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera',
    luasPMN2025: 8200, luasPMN2021: 8000, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 900,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 215,
    catatan: 'Pesisir barat Lampung — mangrove lebih terjaga. TN Bukit Barisan sebagian melindungi.',
  },
  {
    id: 'KK-LAMPUNG-003', kabKota: 'Kab. Tanggamus', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera',
    luasPMN2025: 6800, luasPMN2021: 6600, perubahan: +200, kondisi: 'Kritis', luasRehabilitasi: 1000,
    jenisDominan: ['Avicennia marina', 'Rhizophora mucronata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 125,
    catatan: 'Teluk Semangka. Abrasi dan konversi tambak aktif.',
  },

  // ══════════════════════════════════════════════
  // BALI
  // ══════════════════════════════════════════════
  {
    id: 'KK-BALI-001', kabKota: 'Kota Denpasar', tipe: 'Kota', provinsi: 'Bali', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 480, luasPMN2021: 460, perubahan: +20, kondisi: 'Sangat Kritis', luasRehabilitasi: 80,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Tinggi', panjangPesisir: 22,
    catatan: 'Hutan Mangrove Ngurah Rai — dilindungi kota. Tekanan pariwisata & reklamasi tinggi.',
  },
  {
    id: 'KK-BALI-002', kabKota: 'Kab. Buleleng', tipe: 'Kabupaten', provinsi: 'Bali', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 820, luasPMN2021: 800, perubahan: +20, kondisi: 'Kritis', luasRehabilitasi: 150,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 145,
    catatan: 'Pesisir utara Bali. Beberapa titik mulai direstorasi komunitas lokal.',
  },

  // ══════════════════════════════════════════════
  // NTB
  // ══════════════════════════════════════════════
  {
    id: 'KK-NTB-001', kabKota: 'Kab. Lombok Barat', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Barat', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 1200, luasPMN2021: 1150, perubahan: +50, kondisi: 'Kritis', luasRehabilitasi: 280,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Tinggi', panjangPesisir: 72,
    catatan: 'Gili Matra — ekowisata mangrove aktif. Tekanan pariwisata perlu dikelola.',
  },
  {
    id: 'KK-NTB-002', kabKota: 'Kab. Bima', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Barat', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 2400, luasPMN2021: 2350, perubahan: +50, kondisi: 'Kritis', luasRehabilitasi: 450,
    jenisDominan: ['Avicennia marina', 'Rhizophora stylosa'], tingkatAbrasi: 'Tinggi', panjangPesisir: 165,
    catatan: 'Teluk Bima — tambak aktif menggerus mangrove. Intervensi rehabilitasi mendesak.',
  },

  // ══════════════════════════════════════════════
  // NTT
  // ══════════════════════════════════════════════
  {
    id: 'KK-NTT-001', kabKota: 'Kab. Kupang', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Timur', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 6800, luasPMN2021: 6600, perubahan: +200, kondisi: 'Sedang', luasRehabilitasi: 700,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 145,
    catatan: 'Teluk Kupang. Program rehabilitasi pemda aktif sejak 2022.',
  },
  {
    id: 'KK-NTT-002', kabKota: 'Kab. Flores Timur', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Timur', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 4200, luasPMN2021: 4100, perubahan: +100, kondisi: 'Sedang', luasRehabilitasi: 400,
    jenisDominan: ['Rhizophora apiculata', 'Avicennia marina'], tingkatAbrasi: 'Sedang', panjangPesisir: 310,
    catatan: 'Kepulauan Solor & Lembata. Mangrove cukup beragam.',
  },
  {
    id: 'KK-NTT-003', kabKota: 'Kab. Sumba Barat Daya', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Timur', pulau: 'Bali & Nusa Tenggara',
    luasPMN2025: 2800, luasPMN2021: 2700, perubahan: +100, kondisi: 'Sedang', luasRehabilitasi: 300,
    jenisDominan: ['Avicennia marina', 'Rhizophora apiculata'], tingkatAbrasi: 'Sedang', panjangPesisir: 185,
    catatan: 'Pesisir Sumba — mangrove terjaga di muara-muara sungai.',
  },
];

/** Total statistik nasional kab/kota */
export const kabkotaSummary = {
  totalKabKota: mangroveKabkota.length,
  totalLuasPMN2025: mangroveKabkota.reduce((s, k) => s + k.luasPMN2025, 0),
  totalLuasRehabilitasi: mangroveKabkota.reduce((s, k) => s + k.luasRehabilitasi, 0),
  byKondisi: {
    sangatBaik: mangroveKabkota.filter(k => k.kondisi === 'Sangat Baik').length,
    baik: mangroveKabkota.filter(k => k.kondisi === 'Baik').length,
    sedang: mangroveKabkota.filter(k => k.kondisi === 'Sedang').length,
    kritis: mangroveKabkota.filter(k => k.kondisi === 'Kritis').length,
    sangatKritis: mangroveKabkota.filter(k => k.kondisi === 'Sangat Kritis').length,
  },
  byAbrasi: {
    tinggi: mangroveKabkota.filter(k => k.tingkatAbrasi === 'Tinggi').length,
    sedang: mangroveKabkota.filter(k => k.tingkatAbrasi === 'Sedang').length,
    rendah: mangroveKabkota.filter(k => k.tingkatAbrasi === 'Rendah').length,
  },
};

export function getKondisiColor(kondisi: KondisiMangrove): string {
  switch (kondisi) {
    case 'Sangat Baik': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Baik':        return 'bg-green-100 text-green-800 border-green-200';
    case 'Sedang':      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Kritis':      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Sangat Kritis': return 'bg-red-100 text-red-800 border-red-200';
  }
}

export function getAbrasiBadge(level: 'Tinggi' | 'Sedang' | 'Rendah'): string {
  if (level === 'Tinggi') return 'bg-red-100 text-red-700 border-red-200';
  if (level === 'Sedang') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
}
