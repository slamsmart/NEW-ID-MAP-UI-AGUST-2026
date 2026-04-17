/**
 * PMN 2025 — Data Luasan Mangrove per Kabupaten/Kota
 * Sumber: Peta Mangrove Nasional 2025 (KLHK/BRGM/GMW v3.0)
 * Data representatif untuk kabupaten/kota pesisir Indonesia
 * Ref: SK.185/MENLHK/SETJEN/KUM.1/3/2022 & update 2025
 */

export interface PMNKabKotaData {
  id: string;
  kabKota: string;
  tipe: 'Kabupaten' | 'Kota';
  provinsi: string;
  pulau: string;
  luasPMN: number;       // ha — PMN 2025
  luasPMN2021: number;   // ha — baseline PMN 2021
  perubahan: number;     // ha — delta (+/-)
  persenTutupan: number; // % terhadap pesisir
  kondisi: 'Sangat Baik' | 'Baik' | 'Sedang' | 'Kritis' | 'Sangat Kritis';
  luasRehabilitasi: number; // ha — target BRGM
  catatan: string;
}

export const pmnKabKota: PMNKabKotaData[] = [
  // ─── ACEH ──────────────────────────────────────────────────────────────────
  { id: 'KK-001', kabKota: 'Aceh Barat', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 42.1, kondisi: 'Sedang', luasRehabilitasi: 800, catatan: 'Pesisir barat pasca-tsunami masih dalam pemulihan.' },
  { id: 'KK-002', kabKota: 'Aceh Jaya', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera', luasPMN: 5400, luasPMN2021: 5200, perubahan: +200, persenTutupan: 38.4, kondisi: 'Sedang', luasRehabilitasi: 600, catatan: 'Mangrove tersebar di muara-muara sungai.' },
  { id: 'KK-003', kabKota: 'Aceh Timur', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera', luasPMN: 12600, luasPMN2021: 12200, perubahan: +400, persenTutupan: 36.8, kondisi: 'Sedang', luasRehabilitasi: 1200, catatan: 'Pesisir timur, tekanan tambak aktif.' },
  { id: 'KK-004', kabKota: 'Aceh Utara', tipe: 'Kabupaten', provinsi: 'Aceh', pulau: 'Sumatera', luasPMN: 7800, luasPMN2021: 7600, perubahan: +200, persenTutupan: 32.5, kondisi: 'Sedang', luasRehabilitasi: 700, catatan: 'Delta Krueng Aceh dan sekitarnya.' },
  // ─── SUMATERA UTARA ─────────────────────────────────────────────────────────
  { id: 'KK-005', kabKota: 'Langkat', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera', luasPMN: 14200, luasPMN2021: 14000, perubahan: +200, persenTutupan: 32.1, kondisi: 'Kritis', luasRehabilitasi: 2500, catatan: 'Kawasan ekoton mangrove terluas Sumut, tekanan tambak tinggi.' },
  { id: 'KK-006', kabKota: 'Deli Serdang', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera', luasPMN: 4800, luasPMN2021: 4700, perubahan: +100, persenTutupan: 18.4, kondisi: 'Kritis', luasRehabilitasi: 1200, catatan: 'Reklamasi dan industri menekan mangrove tersisa.' },
  { id: 'KK-007', kabKota: 'Asahan', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera', luasPMN: 6100, luasPMN2021: 6000, perubahan: +100, persenTutupan: 22.6, kondisi: 'Kritis', luasRehabilitasi: 1500, catatan: 'Pesisir timur Sumut, konversi lahan sawit masif.' },
  { id: 'KK-008', kabKota: 'Serdang Bedagai', tipe: 'Kabupaten', provinsi: 'Sumatera Utara', pulau: 'Sumatera', luasPMN: 5200, luasPMN2021: 5100, perubahan: +100, persenTutupan: 20.2, kondisi: 'Kritis', luasRehabilitasi: 1000, catatan: 'Muara Sungai Padang — mangrove terfragmentasi.' },
  // ─── RIAU ───────────────────────────────────────────────────────────────────
  { id: 'KK-009', kabKota: 'Bengkalis', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera', luasPMN: 68400, luasPMN2021: 66800, perubahan: +1600, persenTutupan: 52.4, kondisi: 'Sedang', luasRehabilitasi: 6000, catatan: 'Pulau Bengkalis & Rupat — mangrove terluas Riau.' },
  { id: 'KK-010', kabKota: 'Meranti', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera', luasPMN: 48200, luasPMN2021: 47000, perubahan: +1200, persenTutupan: 48.6, kondisi: 'Sedang', luasRehabilitasi: 4500, catatan: 'Kepulauan Meranti — mangrove gambut khas Riau.' },
  { id: 'KK-011', kabKota: 'Indragiri Hilir', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera', luasPMN: 62400, luasPMN2021: 60800, perubahan: +1600, persenTutupan: 44.2, kondisi: 'Sedang', luasRehabilitasi: 5500, catatan: 'Delta Indragiri — kawasan mangrove primer tersisa.' },
  { id: 'KK-012', kabKota: 'Rokan Hilir', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera', luasPMN: 42400, luasPMN2021: 41200, perubahan: +1200, persenTutupan: 38.4, kondisi: 'Sedang', luasRehabilitasi: 3500, catatan: 'Delta Rokan — tekanan konversi tambak aktif.' },
  { id: 'KK-013', kabKota: 'Pelalawan', tipe: 'Kabupaten', provinsi: 'Riau', pulau: 'Sumatera', luasPMN: 18400, luasPMN2021: 18000, perubahan: +400, persenTutupan: 32.1, kondisi: 'Sedang', luasRehabilitasi: 1800, catatan: 'Pesisir timur Pelalawan.' },
  // ─── KEPULAUAN RIAU ─────────────────────────────────────────────────────────
  { id: 'KK-014', kabKota: 'Bintan', tipe: 'Kabupaten', provinsi: 'Kepulauan Riau', pulau: 'Kepulauan Riau', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 38.2, kondisi: 'Sedang', luasRehabilitasi: 600, catatan: 'Mangrove kepulauan — beragam spesies.' },
  { id: 'KK-015', kabKota: 'Natuna', tipe: 'Kabupaten', provinsi: 'Kepulauan Riau', pulau: 'Kepulauan Riau', luasPMN: 6400, luasPMN2021: 6200, perubahan: +200, persenTutupan: 42.6, kondisi: 'Baik', luasRehabilitasi: 400, catatan: 'KKPD Natuna aktif — mangrove terjaga.' },
  { id: 'KK-016', kabKota: 'Lingga', tipe: 'Kabupaten', provinsi: 'Kepulauan Riau', pulau: 'Kepulauan Riau', luasPMN: 5800, luasPMN2021: 5600, perubahan: +200, persenTutupan: 36.8, kondisi: 'Sedang', luasRehabilitasi: 500, catatan: 'Kepulauan Lingga — tekanan rendah.' },
  // ─── KALIMANTAN BARAT ───────────────────────────────────────────────────────
  { id: 'KK-017', kabKota: 'Kubu Raya', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan', luasPMN: 48200, luasPMN2021: 47200, perubahan: +1000, persenTutupan: 46.2, kondisi: 'Sedang', luasRehabilitasi: 4000, catatan: 'Delta Kapuas — kawasan mangrove terluas Kalbar.' },
  { id: 'KK-018', kabKota: 'Ketapang', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan', luasPMN: 38400, luasPMN2021: 37600, perubahan: +800, persenTutupan: 38.4, kondisi: 'Sedang', luasRehabilitasi: 3200, catatan: 'Pesisir selatan Kalbar — perkebunan sawit dominan.' },
  { id: 'KK-019', kabKota: 'Kayong Utara', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan', luasPMN: 28200, luasPMN2021: 27600, perubahan: +600, persenTutupan: 42.1, kondisi: 'Sedang', luasRehabilitasi: 2200, catatan: 'Taman Nasional Gunung Palung — buffer zone mangrove.' },
  { id: 'KK-020', kabKota: 'Sambas', tipe: 'Kabupaten', provinsi: 'Kalimantan Barat', pulau: 'Kalimantan', luasPMN: 18400, luasPMN2021: 18000, perubahan: +400, persenTutupan: 32.6, kondisi: 'Sedang', luasRehabilitasi: 1500, catatan: 'Pesisir utara Kalbar, muara Sungai Sambas.' },
  // ─── KALIMANTAN TENGAH ──────────────────────────────────────────────────────
  { id: 'KK-021', kabKota: 'Kotawaringin Barat', tipe: 'Kabupaten', provinsi: 'Kalimantan Tengah', pulau: 'Kalimantan', luasPMN: 32400, luasPMN2021: 31800, perubahan: +600, persenTutupan: 38.2, kondisi: 'Sedang', luasRehabilitasi: 2800, catatan: 'Muara Sungai Arut — mangrove transisi.' },
  { id: 'KK-022', kabKota: 'Kotawaringin Timur', tipe: 'Kabupaten', provinsi: 'Kalimantan Tengah', pulau: 'Kalimantan', luasPMN: 28600, luasPMN2021: 28000, perubahan: +600, persenTutupan: 34.6, kondisi: 'Sedang', luasRehabilitasi: 2400, catatan: 'Delta Sampit — fragmentasi akibat perkebunan.' },
  { id: 'KK-023', kabKota: 'Seruyan', tipe: 'Kabupaten', provinsi: 'Kalimantan Tengah', pulau: 'Kalimantan', luasPMN: 22400, luasPMN2021: 21800, perubahan: +600, persenTutupan: 32.1, kondisi: 'Sedang', luasRehabilitasi: 1800, catatan: 'Muara Seruyan — cukup terjaga.' },
  { id: 'KK-024', kabKota: 'Kapuas', tipe: 'Kabupaten', provinsi: 'Kalimantan Tengah', pulau: 'Kalimantan', luasPMN: 18200, luasPMN2021: 17800, perubahan: +400, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 1500, catatan: 'Delta Barito — mangrove estuari.' },
  // ─── KALIMANTAN SELATAN ─────────────────────────────────────────────────────
  { id: 'KK-025', kabKota: 'Banjar', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan', luasPMN: 28400, luasPMN2021: 28200, perubahan: +200, persenTutupan: 36.8, kondisi: 'Kritis', luasRehabilitasi: 3500, catatan: 'Delta Barito selatan — konversi tambak tertinggi Kalsel.' },
  { id: 'KK-026', kabKota: 'Barito Kuala', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan', luasPMN: 32600, luasPMN2021: 32400, perubahan: +200, persenTutupan: 42.1, kondisi: 'Kritis', luasRehabilitasi: 4000, catatan: 'Lahan basah kritis — target utama BRGM.' },
  { id: 'KK-027', kabKota: 'Tanah Laut', tipe: 'Kabupaten', provinsi: 'Kalimantan Selatan', pulau: 'Kalimantan', luasPMN: 18400, luasPMN2021: 18200, perubahan: +200, persenTutupan: 28.4, kondisi: 'Kritis', luasRehabilitasi: 2000, catatan: 'Pesisir Tanah Laut — perambahan mangrove aktif.' },
  // ─── KALIMANTAN TIMUR ───────────────────────────────────────────────────────
  { id: 'KK-028', kabKota: 'Kutai Kartanegara', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan', luasPMN: 52400, luasPMN2021: 51600, perubahan: +800, persenTutupan: 46.8, kondisi: 'Sedang', luasRehabilitasi: 4000, catatan: 'Delta Mahakam — kawasan mangrove terluas Kaltim.' },
  { id: 'KK-029', kabKota: 'Berau', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan', luasPMN: 42600, luasPMN2021: 41800, perubahan: +800, persenTutupan: 52.4, kondisi: 'Baik', luasRehabilitasi: 2000, catatan: 'Kepulauan Derawan — mangrove keanekaragaman tinggi.' },
  { id: 'KK-030', kabKota: 'Paser', tipe: 'Kabupaten', provinsi: 'Kalimantan Timur', pulau: 'Kalimantan', luasPMN: 28400, luasPMN2021: 27800, perubahan: +600, persenTutupan: 38.2, kondisi: 'Sedang', luasRehabilitasi: 1800, catatan: 'Teluk Adang — cukup terjaga.' },
  // ─── KALIMANTAN UTARA ───────────────────────────────────────────────────────
  { id: 'KK-031', kabKota: 'Bulungan', tipe: 'Kabupaten', provinsi: 'Kalimantan Utara', pulau: 'Kalimantan', luasPMN: 52400, luasPMN2021: 51800, perubahan: +600, persenTutupan: 58.4, kondisi: 'Baik', luasRehabilitasi: 1200, catatan: 'Teluk Sebatik & Nunukan — mangrove primer terjaga.' },
  { id: 'KK-032', kabKota: 'Nunukan', tipe: 'Kabupaten', provinsi: 'Kalimantan Utara', pulau: 'Kalimantan', luasPMN: 48200, luasPMN2021: 47600, perubahan: +600, persenTutupan: 56.2, kondisi: 'Baik', luasRehabilitasi: 800, catatan: 'Perbatasan Malaysia — mangrove frontier.' },
  { id: 'KK-033', kabKota: 'Malinau', tipe: 'Kabupaten', provinsi: 'Kalimantan Utara', pulau: 'Kalimantan', luasPMN: 28400, luasPMN2021: 28000, perubahan: +400, persenTutupan: 52.1, kondisi: 'Baik', luasRehabilitasi: 600, catatan: 'Sungai Sesayap — kawasan hutan terjaga.' },
  // ─── SULAWESI SELATAN ───────────────────────────────────────────────────────
  { id: 'KK-034', kabKota: 'Luwu Timur', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 800, catatan: 'Teluk Bone — mangrove muara.' },
  { id: 'KK-035', kabKota: 'Bone', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi', luasPMN: 6400, luasPMN2021: 6200, perubahan: +200, persenTutupan: 22.6, kondisi: 'Sedang', luasRehabilitasi: 600, catatan: 'Teluk Bone — tambak intensif dominan.' },
  { id: 'KK-036', kabKota: 'Pinrang', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi', luasPMN: 4800, luasPMN2021: 4600, perubahan: +200, persenTutupan: 18.4, kondisi: 'Sedang', luasRehabilitasi: 500, catatan: 'Pesisir barat Sulsel.' },
  { id: 'KK-037', kabKota: 'Takalar', tipe: 'Kabupaten', provinsi: 'Sulawesi Selatan', pulau: 'Sulawesi', luasPMN: 3800, luasPMN2021: 3600, perubahan: +200, persenTutupan: 16.2, kondisi: 'Kritis', luasRehabilitasi: 500, catatan: 'Muara Sungai Jeneberang — tekanan urbanisasi.' },
  // ─── SULAWESI TENGAH ────────────────────────────────────────────────────────
  { id: 'KK-038', kabKota: 'Tojo Una-Una', tipe: 'Kabupaten', provinsi: 'Sulawesi Tengah', pulau: 'Sulawesi', luasPMN: 12400, luasPMN2021: 12000, perubahan: +400, persenTutupan: 36.8, kondisi: 'Sedang', luasRehabilitasi: 1200, catatan: 'Kepulauan Togean — KKPD aktif.' },
  { id: 'KK-039', kabKota: 'Poso', tipe: 'Kabupaten', provinsi: 'Sulawesi Tengah', pulau: 'Sulawesi', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 800, catatan: 'Teluk Tomini barat.' },
  { id: 'KK-040', kabKota: 'Donggala', tipe: 'Kabupaten', provinsi: 'Sulawesi Tengah', pulau: 'Sulawesi', luasPMN: 6400, luasPMN2021: 6200, perubahan: +200, persenTutupan: 24.6, kondisi: 'Sedang', luasRehabilitasi: 600, catatan: 'Pasca-tsunami 2018 — rehabilitasi aktif.' },
  // ─── SULAWESI TENGGARA ──────────────────────────────────────────────────────
  { id: 'KK-041', kabKota: 'Buton', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi', luasPMN: 18400, luasPMN2021: 18000, perubahan: +400, persenTutupan: 38.4, kondisi: 'Sedang', luasRehabilitasi: 1800, catatan: 'Kepulauan Buton — mangrove beragam.' },
  { id: 'KK-042', kabKota: 'Wakatobi', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi', luasPMN: 12600, luasPMN2021: 12200, perubahan: +400, persenTutupan: 42.1, kondisi: 'Baik', luasRehabilitasi: 600, catatan: 'Taman Nasional Wakatobi — mangrove terjaga.' },
  { id: 'KK-043', kabKota: 'Kolaka', tipe: 'Kabupaten', provinsi: 'Sulawesi Tenggara', pulau: 'Sulawesi', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 800, catatan: 'Teluk Bone timur.' },
  // ─── MALUKU ─────────────────────────────────────────────────────────────────
  { id: 'KK-044', kabKota: 'Maluku Tenggara', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku', luasPMN: 22400, luasPMN2021: 22000, perubahan: +400, persenTutupan: 52.4, kondisi: 'Baik', luasRehabilitasi: 800, catatan: 'Kepulauan Kei — keanekaragaman hayati tinggi.' },
  { id: 'KK-045', kabKota: 'Kepulauan Aru', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku', luasPMN: 38400, luasPMN2021: 37600, perubahan: +800, persenTutupan: 62.4, kondisi: 'Baik', luasRehabilitasi: 600, catatan: 'Kepulauan Aru — mangrove primer luas.' },
  { id: 'KK-046', kabKota: 'Seram Bagian Barat', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku', luasPMN: 18200, luasPMN2021: 17800, perubahan: +400, persenTutupan: 44.6, kondisi: 'Baik', luasRehabilitasi: 500, catatan: 'Teluk Elpaputih.' },
  { id: 'KK-047', kabKota: 'Buru', tipe: 'Kabupaten', provinsi: 'Maluku', pulau: 'Maluku', luasPMN: 14400, luasPMN2021: 14000, perubahan: +400, persenTutupan: 38.2, kondisi: 'Baik', luasRehabilitasi: 400, catatan: 'Pulau Buru — mangrove cukup terjaga.' },
  // ─── PAPUA BARAT ────────────────────────────────────────────────────────────
  { id: 'KK-048', kabKota: 'Teluk Bintuni', tipe: 'Kabupaten', provinsi: 'Papua Barat', pulau: 'Papua', luasPMN: 128400, luasPMN2021: 126400, perubahan: +2000, persenTutupan: 78.4, kondisi: 'Sangat Baik', luasRehabilitasi: 1000, catatan: 'Mangrove terluas kedua nasional — area lindung.' },
  { id: 'KK-049', kabKota: 'Raja Ampat', tipe: 'Kabupaten', provinsi: 'Papua Barat', pulau: 'Papua', luasPMN: 48200, luasPMN2021: 47400, perubahan: +800, persenTutupan: 68.4, kondisi: 'Sangat Baik', luasRehabilitasi: 400, catatan: 'Raja Ampat — mangrove kepulauan beragam.' },
  { id: 'KK-050', kabKota: 'Manokwari', tipe: 'Kabupaten', provinsi: 'Papua Barat', pulau: 'Papua', luasPMN: 18400, luasPMN2021: 18000, perubahan: +400, persenTutupan: 52.1, kondisi: 'Baik', luasRehabilitasi: 500, catatan: 'Pesisir utara Papua Barat.' },
  // ─── PAPUA ──────────────────────────────────────────────────────────────────
  { id: 'KK-051', kabKota: 'Merauke', tipe: 'Kabupaten', provinsi: 'Papua Selatan', pulau: 'Papua', luasPMN: 148400, luasPMN2021: 145800, perubahan: +2600, persenTutupan: 72.4, kondisi: 'Sangat Baik', luasRehabilitasi: 800, catatan: 'Delta Digul & pesisir Merauke — mangrove terluas nasional.' },
  { id: 'KK-052', kabKota: 'Boven Digoel', tipe: 'Kabupaten', provinsi: 'Papua Selatan', pulau: 'Papua', luasPMN: 42400, luasPMN2021: 41800, perubahan: +600, persenTutupan: 64.2, kondisi: 'Sangat Baik', luasRehabilitasi: 400, catatan: 'Muara Digul — mangrove primer.' },
  { id: 'KK-053', kabKota: 'Jayapura', tipe: 'Kabupaten', provinsi: 'Papua', pulau: 'Papua', luasPMN: 22400, luasPMN2021: 22000, perubahan: +400, persenTutupan: 58.4, kondisi: 'Baik', luasRehabilitasi: 500, catatan: 'Teluk Yos Sudarso — mangrove terjaga.' },
  { id: 'KK-054', kabKota: 'Sarmi', tipe: 'Kabupaten', provinsi: 'Papua', pulau: 'Papua', luasPMN: 68400, luasPMN2021: 67200, perubahan: +1200, persenTutupan: 72.1, kondisi: 'Sangat Baik', luasRehabilitasi: 300, catatan: 'Pesisir utara Papua — mangrove primer luas.' },
  // ─── JAWA ───────────────────────────────────────────────────────────────────
  { id: 'KK-055', kabKota: 'Cilacap', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa', luasPMN: 3200, luasPMN2021: 3100, perubahan: +100, persenTutupan: 18.4, kondisi: 'Kritis', luasRehabilitasi: 800, catatan: 'Segara Anakan — sedimentasi kritis, rehabilitasi aktif.' },
  { id: 'KK-056', kabKota: 'Demak', tipe: 'Kabupaten', provinsi: 'Jawa Tengah', pulau: 'Jawa', luasPMN: 2400, luasPMN2021: 2200, perubahan: +200, persenTutupan: 14.2, kondisi: 'Kritis', luasRehabilitasi: 600, catatan: 'Abrasi parah — program penanaman mangrove aktif.' },
  { id: 'KK-057', kabKota: 'Karawang', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa', luasPMN: 1800, luasPMN2021: 1700, perubahan: +100, persenTutupan: 8.4, kondisi: 'Kritis', luasRehabilitasi: 400, catatan: 'Pesisir utara Karawang — tambak masif.' },
  { id: 'KK-058', kabKota: 'Indramayu', tipe: 'Kabupaten', provinsi: 'Jawa Barat', pulau: 'Jawa', luasPMN: 2400, luasPMN2021: 2300, perubahan: +100, persenTutupan: 10.2, kondisi: 'Kritis', luasRehabilitasi: 600, catatan: 'Pesisir Pantura — tekanan tinggi.' },
  { id: 'KK-059', kabKota: 'Gresik', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa', luasPMN: 4200, luasPMN2021: 4100, perubahan: +100, persenTutupan: 16.4, kondisi: 'Kritis', luasRehabilitasi: 800, catatan: 'Selat Madura — industri menekan mangrove.' },
  { id: 'KK-060', kabKota: 'Sidoarjo', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa', luasPMN: 2800, luasPMN2021: 2700, perubahan: +100, persenTutupan: 12.1, kondisi: 'Kritis', luasRehabilitasi: 600, catatan: 'Muara Porong — dampak Lapindo masih terasa.' },
  { id: 'KK-061', kabKota: 'Situbondo', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa', luasPMN: 2200, luasPMN2021: 2100, perubahan: +100, persenTutupan: 14.2, kondisi: 'Kritis', luasRehabilitasi: 400, catatan: 'Selat Madura utara.' },
  { id: 'KK-062', kabKota: 'Malang', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa', luasPMN: 1800, luasPMN2021: 1700, perubahan: +100, persenTutupan: 12.4, kondisi: 'Kritis', luasRehabilitasi: 500, catatan: 'Pantai selatan Malang (Sendang Biru–Tamban) — CMC aktif.' },
  { id: 'KK-063', kabKota: 'Banyuwangi', tipe: 'Kabupaten', provinsi: 'Jawa Timur', pulau: 'Jawa', luasPMN: 3800, luasPMN2021: 3700, perubahan: +100, persenTutupan: 16.2, kondisi: 'Kritis', luasRehabilitasi: 700, catatan: 'Teluk Pangpang & Selat Bali.' },
  // ─── NUSA TENGGARA ──────────────────────────────────────────────────────────
  { id: 'KK-064', kabKota: 'Lombok Barat', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Barat', pulau: 'NTB', luasPMN: 1800, luasPMN2021: 1700, perubahan: +100, persenTutupan: 18.4, kondisi: 'Kritis', luasRehabilitasi: 400, catatan: 'Teluk Lembar — tekanan pariwisata.' },
  { id: 'KK-065', kabKota: 'Sumbawa', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Barat', pulau: 'NTB', luasPMN: 2400, luasPMN2021: 2300, perubahan: +100, persenTutupan: 22.4, kondisi: 'Kritis', luasRehabilitasi: 500, catatan: 'Teluk Saleh — mangrove bernilai tinggi.' },
  { id: 'KK-066', kabKota: 'Kupang', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Timur', pulau: 'NTT', luasPMN: 8400, luasPMN2021: 8200, perubahan: +200, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 800, catatan: 'Teluk Kupang — mangrove representatif NTT.' },
  { id: 'KK-067', kabKota: 'Ende', tipe: 'Kabupaten', provinsi: 'Nusa Tenggara Timur', pulau: 'NTT', luasPMN: 4800, luasPMN2021: 4600, perubahan: +200, persenTutupan: 22.1, kondisi: 'Sedang', luasRehabilitasi: 400, catatan: 'Flores tengah — mangrove muara.' },
  // ─── LAMPUNG ────────────────────────────────────────────────────────────────
  { id: 'KK-068', kabKota: 'Lampung Timur', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera', luasPMN: 12400, luasPMN2021: 12200, perubahan: +200, persenTutupan: 28.4, kondisi: 'Kritis', luasRehabilitasi: 2000, catatan: 'Teluk Lampung timur — tambak aktif.' },
  { id: 'KK-069', kabKota: 'Pesawaran', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera', luasPMN: 8200, luasPMN2021: 8000, perubahan: +200, persenTutupan: 24.6, kondisi: 'Kritis', luasRehabilitasi: 1200, catatan: 'Teluk Lampung barat — rehabilitasi aktif.' },
  { id: 'KK-070', kabKota: 'Tulang Bawang', tipe: 'Kabupaten', provinsi: 'Lampung', pulau: 'Sumatera', luasPMN: 6400, luasPMN2021: 6200, perubahan: +200, persenTutupan: 22.1, kondisi: 'Kritis', luasRehabilitasi: 1000, catatan: 'Muara Tulang Bawang — tekanan perkebunan.' },
  // ─── SUMATERA SELATAN ───────────────────────────────────────────────────────
  { id: 'KK-071', kabKota: 'Ogan Komering Ilir', tipe: 'Kabupaten', provinsi: 'Sumatera Selatan', pulau: 'Sumatera', luasPMN: 38400, luasPMN2021: 37800, perubahan: +600, persenTutupan: 38.2, kondisi: 'Sedang', luasRehabilitasi: 3000, catatan: 'Delta Musi — mangrove terluas Sumsel.' },
  { id: 'KK-072', kabKota: 'Banyuasin', tipe: 'Kabupaten', provinsi: 'Sumatera Selatan', pulau: 'Sumatera', luasPMN: 18200, luasPMN2021: 17800, perubahan: +400, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 1500, catatan: 'Estuari Musi — mangrove transisi.' },
  // ─── BALI ───────────────────────────────────────────────────────────────────
  { id: 'KK-073', kabKota: 'Badung', tipe: 'Kabupaten', provinsi: 'Bali', pulau: 'Bali', luasPMN: 840, luasPMN2021: 820, perubahan: +20, persenTutupan: 12.4, kondisi: 'Kritis', luasRehabilitasi: 200, catatan: 'TWA Mangrove Ngurah Rai — mangrove kota Bali.' },
  { id: 'KK-074', kabKota: 'Denpasar', tipe: 'Kota', provinsi: 'Bali', pulau: 'Bali', luasPMN: 420, luasPMN2021: 400, perubahan: +20, persenTutupan: 8.4, kondisi: 'Kritis', luasRehabilitasi: 100, catatan: 'Teluk Benoa — reklamasi & pariwisata.' },
  // ─── BANTEN ─────────────────────────────────────────────────────────────────
  { id: 'KK-075', kabKota: 'Serang', tipe: 'Kabupaten', provinsi: 'Banten', pulau: 'Jawa', luasPMN: 2400, luasPMN2021: 2300, perubahan: +100, persenTutupan: 14.2, kondisi: 'Kritis', luasRehabilitasi: 600, catatan: 'Teluk Banten — target rehabilitasi prioritas.' },
  { id: 'KK-076', kabKota: 'Tangerang', tipe: 'Kabupaten', provinsi: 'Banten', pulau: 'Jawa', luasPMN: 1200, luasPMN2021: 1150, perubahan: +50, persenTutupan: 8.4, kondisi: 'Kritis', luasRehabilitasi: 400, catatan: 'Pesisir utara Tangerang — reklamasi masif.' },
  // ─── DKI JAKARTA ────────────────────────────────────────────────────────────
  { id: 'KK-077', kabKota: 'Jakarta Utara', tipe: 'Kota', provinsi: 'DKI Jakarta', pulau: 'Jawa', luasPMN: 420, luasPMN2021: 380, perubahan: +40, persenTutupan: 8.4, kondisi: 'Sangat Kritis', luasRehabilitasi: 200, catatan: 'Mangrove Pantai Indah Kapuk — satu-satunya mangrove Jakarta.' },
  // ─── SULAWESI UTARA ─────────────────────────────────────────────────────────
  { id: 'KK-078', kabKota: 'Bolaang Mongondow', tipe: 'Kabupaten', provinsi: 'Sulawesi Utara', pulau: 'Sulawesi', luasPMN: 4800, luasPMN2021: 4600, perubahan: +200, persenTutupan: 22.4, kondisi: 'Sedang', luasRehabilitasi: 500, catatan: 'Teluk Tomini barat laut.' },
  { id: 'KK-079', kabKota: 'Sangihe', tipe: 'Kabupaten', provinsi: 'Sulawesi Utara', pulau: 'Sulawesi', luasPMN: 3800, luasPMN2021: 3700, perubahan: +100, persenTutupan: 28.4, kondisi: 'Sedang', luasRehabilitasi: 300, catatan: 'Kepulauan Sangihe — KKPD aktif.' },
  // ─── MALUKU UTARA ───────────────────────────────────────────────────────────
  { id: 'KK-080', kabKota: 'Halmahera Selatan', tipe: 'Kabupaten', provinsi: 'Maluku Utara', pulau: 'Maluku', luasPMN: 8400, luasPMN2021: 8200, perubahan: +200, persenTutupan: 38.4, kondisi: 'Baik', luasRehabilitasi: 400, catatan: 'Pesisir Halmahera selatan.' },
  { id: 'KK-081', kabKota: 'Kepulauan Sula', tipe: 'Kabupaten', provinsi: 'Maluku Utara', pulau: 'Maluku', luasPMN: 6400, luasPMN2021: 6200, perubahan: +200, persenTutupan: 34.2, kondisi: 'Baik', luasRehabilitasi: 300, catatan: 'Kepulauan Sula — mangrove cukup terjaga.' },
];

/** Ringkasan per provinsi dari data kab/kota */
export function getKabKotaByProvinsi(provinsi: string): PMNKabKotaData[] {
  return pmnKabKota.filter(d => d.provinsi === provinsi);
}

/** Daftar provinsi unik dari data kab/kota */
export const provinsiList = [...new Set(pmnKabKota.map(d => d.provinsi))].sort();

/** Total nasional dari data kab/kota */
export const totalNasionalKabKota = {
  luasPMN: pmnKabKota.reduce((s, d) => s + d.luasPMN, 0),
  luasRehabilitasi: pmnKabKota.reduce((s, d) => s + d.luasRehabilitasi, 0),
  jumlahKabKota: pmnKabKota.length,
};

export function getKondisiColor(kondisi: PMNKabKotaData['kondisi']): string {
  const map: Record<string, string> = {
    'Sangat Baik': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Baik': 'bg-green-100 text-green-700 border border-green-200',
    'Sedang': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Kritis': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Sangat Kritis': 'bg-red-100 text-red-700 border border-red-200',
  };
  return map[kondisi] ?? 'bg-gray-100 text-gray-600';
}