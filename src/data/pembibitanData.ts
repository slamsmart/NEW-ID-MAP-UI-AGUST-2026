/**
 * Data Lokasi Pembibitan Mangrove Tersertifikasi
 * Sumber: BRGM (Badan Restorasi Gambut dan Mangrove), KLHK Ditjen PDASRH,
 *         Balai Pengelolaan Hutan Wilayah, dan UPT Daerah — 2025
 * Referensi: Perpres 120/2020, SNI 7604:2011 Mutu Bibit Mangrove
 */

export type StatusPembibitan = 'aktif' | 'dalam_verifikasi' | 'tidak_aktif';
export type PulauPembibitan = 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Papua' | 'Bali & NTT';

export interface SertifikasiItem {
  label: string;
  kode: string;
  terpenuhi: boolean;
}

export interface PembibitanMangrove {
  id: string;
  nama: string;
  institusi: string;
  kabKota: string;
  provinsi: string;
  pulau: PulauPembibitan;
  lat: number;
  lng: number;
  status: StatusPembibitan;
  kapasitasBibit: number;         // bibit/tahun
  tahunBerdiri: number;
  spesiesUnggulan: string[];
  sertifikasi: SertifikasiItem[];
  kontak: string;
  catatan: string;
  sumberData: string;
}

const makeSert = (overrides: Partial<Record<string, boolean>> = {}): SertifikasiItem[] => [
  {
    kode: 'SNI-7604',
    label: 'Sertifikat Mutu Benih (SNI 7604:2011)',
    terpenuhi: overrides['SNI-7604'] ?? true,
  },
  {
    kode: 'IZIN-OPS',
    label: 'Izin Operasional KLHK / BRGM',
    terpenuhi: overrides['IZIN-OPS'] ?? true,
  },
  {
    kode: 'ASAL-USUL',
    label: 'Sertifikat Asal-Usul Benih (Provenance)',
    terpenuhi: overrides['ASAL-USUL'] ?? true,
  },
  {
    kode: 'KAP-VER',
    label: 'Verifikasi Kapasitas Produksi',
    terpenuhi: overrides['KAP-VER'] ?? true,
  },
  {
    kode: 'SIS-MON',
    label: 'Sistem Monitoring & Pelacakan Bibit',
    terpenuhi: overrides['SIS-MON'] ?? false,
  },
  {
    kode: 'LAB-UJI',
    label: 'Laboratorium Pengujian Terakreditasi',
    terpenuhi: overrides['LAB-UJI'] ?? false,
  },
];

export const pembibitanData: PembibitanMangrove[] = [
  // ── SUMATERA ─────────────────────────────────────────────────────────────────
  {
    id: 'PBT-001',
    nama: 'UPT Pembibitan Mangrove BRGM Bengkalis',
    institusi: 'BRGM / KLHK',
    kabKota: 'Kab. Bengkalis',
    provinsi: 'Riau',
    pulau: 'Sumatera',
    lat: 1.4733,
    lng: 102.1133,
    status: 'aktif',
    kapasitasBibit: 500000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina', 'Bruguiera gymnorrhiza'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'Balai Pengelolaan Hutan Produksi Wilayah III Riau',
    catatan: 'Nursery utama BRGM wilayah Riau. Mensuplai bibit untuk rehabilitasi 1.200 ha kawasan pesisir Bengkalis & Meranti.',
    sumberData: 'BRGM Laporan Tahunan 2024',
  },
  {
    id: 'PBT-002',
    nama: 'Nursery Mangrove BRGM Siak',
    institusi: 'BRGM / Pemda Siak',
    kabKota: 'Kab. Siak',
    provinsi: 'Riau',
    pulau: 'Sumatera',
    lat: 1.2167,
    lng: 102.0167,
    status: 'aktif',
    kapasitasBibit: 250000,
    tahunBerdiri: 2022,
    spesiesUnggulan: ['Rhizophora mucronata', 'Sonneratia alba', 'Avicennia officinalis'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'Dinas LHK Kabupaten Siak',
    catatan: 'Kolaborasi BRGM dan Pemerintah Kab. Siak. Terintegrasi dengan program restorasi gambut.',
    sumberData: 'BRGM 2024',
  },
  {
    id: 'PBT-003',
    nama: 'Nursery Mangrove Langkat BPDAS Wampu Sei Ular',
    institusi: 'KLHK / BPDAS Wampu Sei Ular',
    kabKota: 'Kab. Langkat',
    provinsi: 'Sumatera Utara',
    pulau: 'Sumatera',
    lat: 3.9333,
    lng: 98.3833,
    status: 'aktif',
    kapasitasBibit: 180000,
    tahunBerdiri: 2019,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina', 'Ceriops tagal'],
    sertifikasi: makeSert({ 'SIS-MON': true }),
    kontak: 'BPDAS Wampu Sei Ular, Medan',
    catatan: 'Mensuplai rehabilitasi kawasan mangrove Suaka Margasatwa Karang Gading & Langkat Timur.',
    sumberData: 'KLHK Ditjen PDASRH 2024',
  },
  {
    id: 'PBT-004',
    nama: 'Pembibitan Mangrove BRGM Aceh Timur',
    institusi: 'BRGM / Dinas LHK Aceh',
    kabKota: 'Kab. Aceh Timur',
    provinsi: 'Aceh',
    pulau: 'Sumatera',
    lat: 4.5500,
    lng: 97.8333,
    status: 'aktif',
    kapasitasBibit: 200000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia caseolaris'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'Dinas LHK Provinsi Aceh — UPTD Persemaian',
    catatan: 'Mendukung program 1.000 ha rehabilitasi mangrove pesisir timur Aceh pasca-tsunami.',
    sumberData: 'BRGM 2024 / Dinas LHK Aceh',
  },
  {
    id: 'PBT-005',
    nama: 'Nursery Mangrove Pesisir Lampung BPDAS Way Seputih',
    institusi: 'KLHK / BPDAS Way Seputih-Way Sekampung',
    kabKota: 'Kab. Pesawaran',
    provinsi: 'Lampung',
    pulau: 'Sumatera',
    lat: -5.4333,
    lng: 105.2167,
    status: 'aktif',
    kapasitasBibit: 150000,
    tahunBerdiri: 2020,
    spesiesUnggulan: ['Rhizophora mucronata', 'Avicennia marina', 'Bruguiera cylindrica'],
    sertifikasi: makeSert({ 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'BPDAS Way Seputih-Way Sekampung',
    catatan: 'Nursery pendukung rehabilitasi Teluk Lampung dan kawasan pesisir register 40.',
    sumberData: 'KLHK 2024',
  },

  // ── JAWA ─────────────────────────────────────────────────────────────────────
  {
    id: 'PBT-006',
    nama: 'UPT Persemaian Mangrove Muara Gembong',
    institusi: 'KLHK / BBKSDA Jabar',
    kabKota: 'Kab. Bekasi',
    provinsi: 'Jawa Barat',
    pulau: 'Jawa',
    lat: -6.0167,
    lng: 107.1833,
    status: 'aktif',
    kapasitasBibit: 300000,
    tahunBerdiri: 2018,
    spesiesUnggulan: ['Avicennia marina', 'Rhizophora apiculata', 'Sonneratia alba'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'BBKSDA Jawa Barat / UPTD Persemaian',
    catatan: 'Nursery mangrove terbesar di Jawa Barat. Mensuplai bibit untuk restorasi pesisir utara Jabar.',
    sumberData: 'BBKSDA Jabar 2024',
  },
  {
    id: 'PBT-007',
    nama: 'Nursery Mangrove TWA Muara Angke',
    institusi: 'BKSDA DKI Jakarta / Yayasan Konservasi',
    kabKota: 'Jakarta Utara',
    provinsi: 'DKI Jakarta',
    pulau: 'Jawa',
    lat: -6.1014,
    lng: 106.7468,
    status: 'aktif',
    kapasitasBibit: 80000,
    tahunBerdiri: 2015,
    spesiesUnggulan: ['Avicennia marina', 'Rhizophora stylosa', 'Bruguiera gymnorrhiza'],
    sertifikasi: makeSert({ 'KAP-VER': false, 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'BKSDA DKI Jakarta — Seksi TWA Muara Angke',
    catatan: 'Nursery terpadu dalam kawasan TWA Muara Angke. Berfungsi edukatif dan konservasi in-situ.',
    sumberData: 'BKSDA DKI Jakarta 2024',
  },
  {
    id: 'PBT-008',
    nama: 'Nursery Mangrove Indramayu BPDAS Cimanuk',
    institusi: 'KLHK / BPDAS Cimanuk-Citanduy',
    kabKota: 'Kab. Indramayu',
    provinsi: 'Jawa Barat',
    pulau: 'Jawa',
    lat: -6.3250,
    lng: 108.3208,
    status: 'aktif',
    kapasitasBibit: 120000,
    tahunBerdiri: 2020,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'BPDAS Cimanuk-Citanduy',
    catatan: 'Mendukung rehabilitasi tambak-mangrove sistem silvofishery Kab. Indramayu.',
    sumberData: 'KLHK Ditjen PDASRH 2023',
  },
  {
    id: 'PBT-009',
    nama: 'Pembibitan Mangrove Cilacap BPDAS Serayu Opak',
    institusi: 'KLHK / BPDAS Serayu Opak Progo',
    kabKota: 'Kab. Cilacap',
    provinsi: 'Jawa Tengah',
    pulau: 'Jawa',
    lat: -7.7167,
    lng: 109.0167,
    status: 'aktif',
    kapasitasBibit: 100000,
    tahunBerdiri: 2019,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia alba', 'Ceriops tagal'],
    sertifikasi: makeSert({ 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'BPDAS Serayu Opak Progo — Seksi Cilacap',
    catatan: 'Nursery pendukung restorasi kawasan mangrove Segara Anakan Cilacap.',
    sumberData: 'KLHK 2023',
  },
  {
    id: 'PBT-010',
    nama: 'UPT Pembibitan Mangrove Gresik KKP',
    institusi: 'KKP / Ditjen PSDKP',
    kabKota: 'Kab. Gresik',
    provinsi: 'Jawa Timur',
    pulau: 'Jawa',
    lat: -7.1569,
    lng: 112.6520,
    status: 'aktif',
    kapasitasBibit: 200000,
    tahunBerdiri: 2017,
    spesiesUnggulan: ['Avicennia marina', 'Rhizophora mucronata', 'Sonneratia alba'],
    sertifikasi: makeSert({ 'SIS-MON': true }),
    kontak: 'Balai Pengelolaan Sumberdaya Pesisir dan Laut Surabaya',
    catatan: 'Nursery utama KKP Jawa Timur. Mensuplai bibit bagi program Rehabilitasi Mangrove Pesisir (RMP) Jatim.',
    sumberData: 'KKP / BPSPL Surabaya 2024',
  },

  // ── KALIMANTAN ───────────────────────────────────────────────────────────────
  {
    id: 'PBT-011',
    nama: 'Nursery Mangrove BRGM Kubu Raya',
    institusi: 'BRGM / KLHK',
    kabKota: 'Kab. Kubu Raya',
    provinsi: 'Kalimantan Barat',
    pulau: 'Kalimantan',
    lat: -0.3167,
    lng: 109.3333,
    status: 'aktif',
    kapasitasBibit: 400000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia alba', 'Sonneratia alba', 'Bruguiera parviflora'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'BRGM Sekretariat Wilayah Kalimantan Barat',
    catatan: 'Nursery terbesar BRGM di Kalimantan. Target 400 ha/tahun rehabilitasi pesisir Kubu Raya.',
    sumberData: 'BRGM Laporan Tahunan 2024',
  },
  {
    id: 'PBT-012',
    nama: 'Pembibitan Mangrove Batu Ampar BPDAS Kapuas',
    institusi: 'KLHK / BPDAS Kapuas',
    kabKota: 'Kab. Kubu Raya (Batu Ampar)',
    provinsi: 'Kalimantan Barat',
    pulau: 'Kalimantan',
    lat: 0.9167,
    lng: 108.7667,
    status: 'aktif',
    kapasitasBibit: 160000,
    tahunBerdiri: 2020,
    spesiesUnggulan: ['Rhizophora mucronata', 'Avicennia marina', 'Xylocarpus granatum'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'BPDAS Kapuas / Dinas LHK Kalbar',
    catatan: 'Berlokasi di dalam kawasan hutan mangrove Batu Ampar — salah satu mangrove terluas di Kalbar.',
    sumberData: 'KLHK 2024',
  },
  {
    id: 'PBT-013',
    nama: 'Nursery Mangrove BRGM Ketapang',
    institusi: 'BRGM / Dinas LHK Kalbar',
    kabKota: 'Kab. Ketapang',
    provinsi: 'Kalimantan Barat',
    pulau: 'Kalimantan',
    lat: -1.8333,
    lng: 110.0000,
    status: 'dalam_verifikasi',
    kapasitasBibit: 120000,
    tahunBerdiri: 2023,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina'],
    sertifikasi: makeSert({ 'ASAL-USUL': false, 'KAP-VER': false, 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'Dinas LHK Kab. Ketapang',
    catatan: 'Nursery baru dalam proses verifikasi BRGM. Target operasional penuh Q2 2025.',
    sumberData: 'BRGM 2024',
  },
  {
    id: 'PBT-014',
    nama: 'UPT Nursery Mangrove Delta Mahakam',
    institusi: 'BRGM / BPHP Kaltim',
    kabKota: 'Kab. Kutai Kartanegara',
    provinsi: 'Kalimantan Timur',
    pulau: 'Kalimantan',
    lat: -0.9167,
    lng: 117.0500,
    status: 'aktif',
    kapasitasBibit: 350000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Avicennia marina', 'Avicennia alba', 'Sonneratia alba', 'Nypa fruticans'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'BPHP Wilayah XI Kaltim / BRGM',
    catatan: 'Nursery utama untuk rehabilitasi Delta Mahakam — ekosistem mangrove prioritas nasional.',
    sumberData: 'BRGM / BPHP Kaltim 2024',
  },
  {
    id: 'PBT-015',
    nama: 'Nursery Mangrove Berau BRGM',
    institusi: 'BRGM / TNBT Berau',
    kabKota: 'Kab. Berau',
    provinsi: 'Kalimantan Timur',
    pulau: 'Kalimantan',
    lat: 2.1667,
    lng: 117.5000,
    status: 'aktif',
    kapasitasBibit: 200000,
    tahunBerdiri: 2022,
    spesiesUnggulan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Ceriops tagal'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'BRGM / Dinas LHK Kab. Berau',
    catatan: 'Mendukung restorasi kawasan mangrove Kepulauan Derawan dan pesisir Berau.',
    sumberData: 'BRGM 2024',
  },
  {
    id: 'PBT-016',
    nama: 'UPT Pembibitan Mangrove Tarakan',
    institusi: 'KLHK / BPDAS Mahakam-Berau',
    kabKota: 'Kota Tarakan',
    provinsi: 'Kalimantan Utara',
    pulau: 'Kalimantan',
    lat: 3.3167,
    lng: 117.6333,
    status: 'aktif',
    kapasitasBibit: 150000,
    tahunBerdiri: 2019,
    spesiesUnggulan: ['Rhizophora mucronata', 'Avicennia marina', 'Sonneratia caseolaris'],
    sertifikasi: makeSert({ 'SIS-MON': false }),
    kontak: 'BPDAS Mahakam-Berau / Dinas LHK Kaltara',
    catatan: 'Mensuplai bibit untuk rehabilitasi mangrove Tarakan — salah satu kota dengan mangrove urban terbesar.',
    sumberData: 'KLHK 2024',
  },

  // ── SULAWESI ─────────────────────────────────────────────────────────────────
  {
    id: 'PBT-017',
    nama: 'Nursery Mangrove Maros BRGM Sulsel',
    institusi: 'BRGM / BPHP Sulsel',
    kabKota: 'Kab. Maros',
    provinsi: 'Sulawesi Selatan',
    pulau: 'Sulawesi',
    lat: -5.0133,
    lng: 119.5700,
    status: 'aktif',
    kapasitasBibit: 250000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina', 'Bruguiera gymnorrhiza'],
    sertifikasi: makeSert({ 'SIS-MON': true }),
    kontak: 'BRGM Wilayah Sulawesi / BPHP Wilayah VII',
    catatan: 'Nursery utama BRGM Sulawesi. Mensuplai bibit untuk 800 ha rehabilitasi Teluk Bone dan pesisir Makassar.',
    sumberData: 'BRGM 2024',
  },
  {
    id: 'PBT-018',
    nama: 'Nursery Mangrove Kolaka Dishut Sultra',
    institusi: 'Dinas Kehutanan Sulawesi Tenggara',
    kabKota: 'Kab. Kolaka',
    provinsi: 'Sulawesi Tenggara',
    pulau: 'Sulawesi',
    lat: -4.0500,
    lng: 121.5833,
    status: 'aktif',
    kapasitasBibit: 100000,
    tahunBerdiri: 2020,
    spesiesUnggulan: ['Rhizophora apiculata', 'Avicennia marina', 'Sonneratia alba'],
    sertifikasi: makeSert({ 'ASAL-USUL': false, 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'Dinas Kehutanan Provinsi Sulawesi Tenggara',
    catatan: 'Pembibitan komunitas terpadu dengan nelayan lokal. Proses sertifikasi asal-usul benih dalam pengajuan.',
    sumberData: 'Dishut Sultra 2024',
  },

  // ── PAPUA ─────────────────────────────────────────────────────────────────────
  {
    id: 'PBT-019',
    nama: 'UPT Pembibitan Mangrove BRGM Teluk Bintuni',
    institusi: 'BRGM / KLHK',
    kabKota: 'Kab. Teluk Bintuni',
    provinsi: 'Papua Barat',
    pulau: 'Papua',
    lat: -2.1167,
    lng: 133.5333,
    status: 'aktif',
    kapasitasBibit: 600000,
    tahunBerdiri: 2021,
    spesiesUnggulan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Avicennia marina', 'Xylocarpus granatum'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'BRGM Sekretariat Papua / BPHP Wilayah XVIII',
    catatan: 'Nursery terbesar BRGM di Papua. Teluk Bintuni memiliki mangrove 225.000 ha — terluas di Indonesia.',
    sumberData: 'BRGM Laporan Tahunan 2024',
  },
  {
    id: 'PBT-020',
    nama: 'Nursery Mangrove BRGM Mimika',
    institusi: 'BRGM / Pemda Mimika',
    kabKota: 'Kab. Mimika',
    provinsi: 'Papua Tengah',
    pulau: 'Papua',
    lat: -4.5417,
    lng: 136.3833,
    status: 'aktif',
    kapasitasBibit: 300000,
    tahunBerdiri: 2022,
    spesiesUnggulan: ['Avicennia marina', 'Rhizophora mucronata', 'Sonneratia alba'],
    sertifikasi: makeSert({ 'LAB-UJI': false }),
    kontak: 'BRGM / Dinas LHK Kab. Mimika',
    catatan: 'Mendukung rehabilitasi kawasan terdampak di sekitar area operasional Timika — program CSR & pemerintah.',
    sumberData: 'BRGM 2024',
  },
  {
    id: 'PBT-021',
    nama: 'Nursery Mangrove BRGM Sorong',
    institusi: 'BRGM / BPHP Papua Barat',
    kabKota: 'Kota Sorong',
    provinsi: 'Papua Barat Daya',
    pulau: 'Papua',
    lat: -0.8833,
    lng: 131.2500,
    status: 'dalam_verifikasi',
    kapasitasBibit: 200000,
    tahunBerdiri: 2023,
    spesiesUnggulan: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza', 'Avicennia alba'],
    sertifikasi: makeSert({ 'KAP-VER': false, 'SIS-MON': false, 'LAB-UJI': false }),
    kontak: 'BPHP Wilayah XVII Papua Barat',
    catatan: 'Nursery baru dalam proses verifikasi. Akan menjadi hub suplai bibit untuk kepulauan Raja Ampat.',
    sumberData: 'BRGM 2024',
  },

  // ── BALI & NTT ───────────────────────────────────────────────────────────────
  {
    id: 'PBT-022',
    nama: 'Balai Pengelolaan Mangrove Denpasar',
    institusi: 'KLHK / BBKSDA Bali',
    kabKota: 'Kota Denpasar',
    provinsi: 'Bali',
    pulau: 'Bali & NTT',
    lat: -8.7497,
    lng: 115.2130,
    status: 'aktif',
    kapasitasBibit: 90000,
    tahunBerdiri: 2010,
    spesiesUnggulan: ['Rhizophora stylosa', 'Avicennia marina', 'Ceriops tagal', 'Bruguiera gymnorrhiza'],
    sertifikasi: makeSert({ 'SIS-MON': true, 'LAB-UJI': true }),
    kontak: 'BBKSDA Bali / Taman Hutan Raya Ngurah Rai',
    catatan: 'Nursery tertua & tersertifikasi penuh di Bali. Terintegrasi dengan kawasan TWA Mangrove Ngurah Rai seluas 1.373 ha.',
    sumberData: 'BBKSDA Bali 2024',
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export function getStatusColor(status: StatusPembibitan): string {
  switch (status) {
    case 'aktif': return '#16a34a';
    case 'dalam_verifikasi': return '#d97706';
    case 'tidak_aktif': return '#6b7280';
  }
}

export function getStatusLabel(status: StatusPembibitan): string {
  switch (status) {
    case 'aktif': return 'Aktif Tersertifikasi';
    case 'dalam_verifikasi': return 'Dalam Verifikasi';
    case 'tidak_aktif': return 'Tidak Aktif';
  }
}

export function countSertified(items: SertifikasiItem[]): number {
  return items.filter(s => s.terpenuhi).length;
}

export const pembibitanSummary = (() => {
  const aktif = pembibitanData.filter(p => p.status === 'aktif').length;
  const verifikasi = pembibitanData.filter(p => p.status === 'dalam_verifikasi').length;
  const totalKapasitas = pembibitanData.reduce((sum, p) => sum + p.kapasitasBibit, 0);
  const provinsiSet = new Set(pembibitanData.map(p => p.provinsi));
  return {
    total: pembibitanData.length,
    aktif,
    verifikasi,
    totalKapasitas,
    provinsiCount: provinsiSet.size,
  };
})();

// ── Custom Nursery (Admin-added) ──────────────────────────────────────────────

const CUSTOM_NURSERIES_KEY = 'idmap_custom_nurseries';

export interface CustomNursery {
  id: string;
  nama: string;
  institusi: string;
  sertifikat: string;      // free text: nama/nomor sertifikat & penerbit
  kapasitasBibit: number;  // bibit/tahun
  provinsi: string;
  kabKota: string;
  lat: number;
  lng: number;
  addedBy: string;
  addedAt: string;         // ISO timestamp
}

export function getCustomNurseries(): CustomNursery[] {
  try {
    const d = localStorage.getItem(CUSTOM_NURSERIES_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

export function saveCustomNursery(n: CustomNursery): void {
  const existing = getCustomNurseries();
  existing.push(n);
  localStorage.setItem(CUSTOM_NURSERIES_KEY, JSON.stringify(existing));
}

export function deleteCustomNursery(id: string): void {
  const existing = getCustomNurseries().filter(n => n.id !== id);
  localStorage.setItem(CUSTOM_NURSERIES_KEY, JSON.stringify(existing));
}
