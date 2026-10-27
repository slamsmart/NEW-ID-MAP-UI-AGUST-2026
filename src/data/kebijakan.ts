export interface DasarHukum {
  nomor: string;
  keterangan: string;
}

export interface KebijakanLokasi {
  locationId: string;
  prioritas: 1 | 2 | 3 | 4 | 5;
  statusRisiko: 'kritis' | 'perhatian' | 'baik';
  ringkasan: string;
  rekomendasiPendek: string[];   // 0–6 bulan
  rekomendasiMenengah: string[]; // 6–24 bulan
  rekomendasiPanjang: string[];  // > 24 bulan
  dasarHukum: DasarHukum[];
  targetCapaian: string;
  instansiPJ: string[];
  estimasiAnggaran: string;
  catatanKhusus: string;
}

/**
 * Rekomendasi kebijakan per lokasi — Wilker Cabdin KP Kab. Malang
 * (Kota Surabaya, Kab. Sidoarjo, Kab. Pasuruan, Kota Pasuruan, Kab. Malang).
 *
 * Potensi luasan mangrove terbesar berada di pesisir utara; pesisir selatan
 * Kab. Malang relatif sempit. Angka luas & anggaran adalah estimasi lapangan
 * dan perlu diverifikasi dengan PMN/GMW serta kajian teknis sebelum penetapan.
 */
export const kebijakanData: KebijakanLokasi[] = [
  {
    locationId: 'LOC-001',
    prioritas: 5,
    statusRisiko: 'baik',
    ringkasan: 'Ekowisata Mangrove Wonorejo (Surabaya) terkelola baik (skor 84). Aset percontohan Jawa Timur dengan potensi karbon biru dan edukasi publik yang besar.',
    rekomendasiPendek: [
      'Pertahankan monitoring rutin dan pemeliharaan jalur tracking ekowisata',
      'Perkuat data baseline tutupan dengan Sentinel-2 dan verifikasi lapangan',
      'Optimalkan nursery Wonorejo sebagai pemasok bibit untuk lokasi utara lain',
    ],
    rekomendasiMenengah: [
      'Kembangkan skema karbon biru bersama Pemkot Surabaya dan akademik (ITS/Unair)',
      'Perkuat kelompok pengelola ekowisata sebagai model co-management',
      'Integrasikan edukasi konservasi pesisir ke program sekolah dan wisata kota',
    ],
    rekomendasiPanjang: [
      'Jadikan referensi restorasi mangrove perkotaan untuk pengajuan anggaran ke pusat',
      'Kembangkan dana konservasi dari retribusi ekowisata untuk keberlanjutan',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'Perpres No. 120/2020', keterangan: 'Badan Restorasi Gambut dan Mangrove' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Pertahankan skor ≥ 82/100 dan daftarkan skema karbon biru 2026',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'DLH Kota Surabaya'],
    estimasiAnggaran: 'Estimasi Rp 900 juta/tahun (monitoring + ekowisata): perlu dilakukan verifikasi',
    catatanKhusus: 'Kandidat utama percontohan untuk usulan anggaran mangrove Jawa Timur ke pusat.',
  },
  {
    locationId: 'LOC-002',
    prioritas: 3,
    statusRisiko: 'perhatian',
    ringkasan: 'Pesisir Gunung Anyar–Medokan Ayu (Surabaya) tutupan sedang (62%). Tekanan tambak dan permukiman kota perlu dikelola agar sabuk hijau tidak menyusut.',
    rekomendasiPendek: [
      'Pemetaan tambak aktif di sabuk mangrove dengan Sentinel-2 dan validasi lapangan',
      'Tetapkan batas ruang mangrove dalam rencana ruang laut Kota Surabaya',
      'Siapkan bibit dari nursery Gunung Anyar untuk penyulaman zona jarang',
    ],
    rekomendasiMenengah: [
      'Rehabilitasi zona transisi dengan Avicennia marina yang toleran kondisi kota',
      'Terapkan silvofishery pada tambak yang berbatasan dengan kawasan',
      'Perkuat kelompok pengawas pesisir bersama kelurahan setempat',
    ],
    rekomendasiPanjang: [
      'Sambungkan koridor hijau Gunung Anyar–Wonorejo sebagai satu bentang pesisir timur Surabaya',
      'Integrasikan ke RTRW/Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur untuk kepastian ruang jangka panjang',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan dan Pengelolaan Lingkungan Hidup' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Naikkan tutupan ke 70% dalam 3 tahun; nol konversi baru',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'DLH Kota Surabaya'],
    estimasiAnggaran: 'Estimasi Rp 1,2 miliar/tahun: perlu dilakukan verifikasi',
    catatanKhusus: 'Pengendalian tekanan tambak perkotaan adalah kunci mempertahankan sabuk hijau.',
  },
  {
    locationId: 'LOC-003',
    prioritas: 2,
    statusRisiko: 'perhatian',
    ringkasan: 'Delta Sungai Porong–Segoro Tambak (Sidoarjo) berpotensi sangat luas (±320 ha) namun tertekan tambak besar (±220 ha) dan sedimentasi. Peluang restorasi skala besar.',
    rekomendasiPendek: [
      'Audit sempadan pantai/sungai dan pemetaan tambak di delta Porong',
      'Manfaatkan sedimen delta untuk restorasi alami (natural regeneration) terpandu',
      'Susun rencana restorasi bertahap prioritas zona lumpur baru',
    ],
    rekomendasiMenengah: [
      'Silvofishery pada 150 ha tambak yang berbatasan dengan kawasan',
      'Bangun nursery skala besar (Tlocor) untuk mendukung restorasi delta',
      'Bentuk tim patroli gabungan DKP–Pemkab Sidoarjo untuk pengendalian tekanan',
    ],
    rekomendasiPanjang: [
      'Jadikan delta Porong lokus restorasi mangrove skala besar untuk pengajuan anggaran pusat',
      'Integrasikan ke Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur dan skema karbon biru Jawa Timur',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'PP No. 22/2021', keterangan: 'Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Restorasi 150 ha dalam 3 tahun; turunkan indeks ancaman < 5',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Sidoarjo', 'BPDASHL Brantas'],
    estimasiAnggaran: 'Estimasi Rp 3,5 miliar/tahun (restorasi skala besar): perlu dilakukan verifikasi',
    catatanKhusus: 'Potensi luasan terbesar di wilker; layak menjadi flagship usulan anggaran mangrove Jatim.',
  },
  {
    locationId: 'LOC-004',
    prioritas: 1,
    statusRisiko: 'kritis',
    ringkasan: 'MENDESAK: Pesisir Sedati–Kalanganyar (Sidoarjo) tutupan tinggal 40%, tambak ±300 ha, tenurial bersengketa. Sabuk hijau bandara/pesisir terancam.',
    rekomendasiPendek: [
      'SEGERA: hentikan konversi baru di sabuk mangrove Sedati (penertiban sempadan)',
      'Pemetaan presisi tambak dan batas kawasan dengan citra SAR/Sentinel',
      'Mediasi tenurial difasilitasi ATR/BPN Sidoarjo dalam 60 hari',
    ],
    rekomendasiMenengah: [
      'Restorasi zona kritis dengan Avicennia/Rhizophora dan pemulihan hidrologi',
      'Silvofishery pada tambak terdampak sebagai jalan tengah sosial-ekonomi',
      'Perkuat sabuk hijau pelindung kawasan pesisir dan infrastruktur sekitar',
    ],
    rekomendasiPanjang: [
      'Tetapkan perlindungan ruang mangrove Sedati dalam RTRW/Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur',
      'Bangun sistem pemantauan dini konversi lahan berbasis citra rutin',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil — larangan perusakan mangrove' },
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan Lingkungan Hidup' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Hentikan degradasi dalam 3 bulan; tutupan ke 55% dalam 2 tahun',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Sidoarjo', 'ATR/BPN Sidoarjo'],
    estimasiAnggaran: 'Estimasi Rp 4,5 miliar (penertiban + restorasi): perlu dilakukan verifikasi',
    catatanKhusus: 'PRIORITAS TERTINGGI. Konflik tenurial adalah hambatan utama keberlanjutan restorasi.',
  },
  {
    locationId: 'LOC-005',
    prioritas: 3,
    statusRisiko: 'perhatian',
    ringkasan: 'Pesisir Lekok–Jatirejo (Kab. Pasuruan) luas (±230 ha) dengan tutupan sedang (63%). Basis kuat untuk perluasan sabuk hijau pantura Pasuruan.',
    rekomendasiPendek: [
      'Perkuat nursery Lekok dan penyulaman zona jarang',
      'Verifikasi status hutan lindung dan sempadan pantai',
      'Kolaborasi kelompok tani/nelayan untuk penanaman partisipatif',
    ],
    rekomendasiMenengah: [
      'Perluasan tanam 100 ha ke zona pesisir yang sesuai',
      'Silvofishery pada tambak yang berbatasan dengan kawasan',
      'Bangun kapasitas Pokmaswas pesisir Pasuruan',
    ],
    rekomendasiPanjang: [
      'Sabuk hijau menerus Lekok–Nguling sebagai pelindung pantura',
      'Integrasi ke Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur dan program karbon biru Jatim',
    ],
    dasarHukum: [
      { nomor: 'UU No. 41/1999', keterangan: 'Kehutanan (Hutan Lindung)' },
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Tutupan 72% dalam 3 tahun; perluasan tanam 100 ha',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Pasuruan', 'BPDASHL Brantas'],
    estimasiAnggaran: 'Estimasi Rp 1,6 miliar/tahun: perlu dilakukan verifikasi',
    catatanKhusus: 'Kawasan luas dengan tekanan sedang; efektif untuk perluasan restorasi.',
  },
  {
    locationId: 'LOC-006',
    prioritas: 3,
    statusRisiko: 'perhatian',
    ringkasan: 'Pesisir Nguling–Penunggul (Kab. Pasuruan) tutupan sedang (56%). Perlu pemantauan tambak dan penguatan kelompok pengawas.',
    rekomendasiPendek: [
      'Pemetaan tambak dan zona jarang dengan Sentinel-2',
      'Penyulaman dari nursery Nguling pada bidang prioritas',
      'Sosialisasi batas kawasan ke masyarakat pesisir',
    ],
    rekomendasiMenengah: [
      'Rehabilitasi 80 ha zona transisi',
      'Silvofishery pada tambak berbatasan',
      'Perkuat monitoring partisipatif Pokmaswas',
    ],
    rekomendasiPanjang: [
      'Sambungkan koridor Lekok–Nguling menjadi bentang pantura Pasuruan',
      'Integrasi ke Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'UU No. 32/2009', keterangan: 'Perlindungan Lingkungan Hidup' },
    ],
    targetCapaian: 'Tutupan 65% dalam 3 tahun; nol konversi baru',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Pasuruan'],
    estimasiAnggaran: 'Estimasi Rp 1,1 miliar/tahun: perlu dilakukan verifikasi',
    catatanKhusus: 'Pengelolaan berbasis masyarakat menentukan keberlanjutan.',
  },
  {
    locationId: 'LOC-007',
    prioritas: 2,
    statusRisiko: 'kritis',
    ringkasan: 'Pesisir Kota Pasuruan–Panggungrejo tutupan jarang (38%) dengan abrasi garis pantai kota aktif. Perlindungan pesisir mendesak.',
    rekomendasiPendek: [
      'Pasang pelindung pantai sementara (cerucuk/APO) di titik abrasi terparah',
      'Distribusi bibit Sonneratia/Avicennia toleran salinitas tinggi',
      'Verifikasi tenurial lahan pesisir kota',
    ],
    rekomendasiMenengah: [
      'Restorasi bertahap sabuk hijau pelindung permukiman kota',
      'Bangun struktur pelindung pantai permanen pada titik kritis',
      'Kolaborasi Pemkot Pasuruan untuk ruang mangrove kota',
    ],
    rekomendasiPanjang: [
      'Integrasikan mangrove ke rencana perlindungan pesisir Kota Pasuruan',
      'Sistem pemantauan abrasi berbasis citra dan sensor',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'UU No. 24/2007', keterangan: 'Penanggulangan Bencana (abrasi/rob)' },
      { nomor: 'Perda Prov. Jatim No. 1/2018', keterangan: 'Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur' },
    ],
    targetCapaian: 'Hentikan abrasi dalam 6 bulan; tutupan 50% dalam 2 tahun',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkot Pasuruan', 'BBWS Brantas'],
    estimasiAnggaran: 'Estimasi Rp 2,4 miliar (perlindungan pesisir + restorasi): perlu dilakukan verifikasi',
    catatanKhusus: 'Abrasi mengancam permukiman kota; perlindungan pesisir berbasis mangrove prioritas.',
  },
  {
    locationId: 'LOC-008',
    prioritas: 5,
    statusRisiko: 'baik',
    ringkasan: 'Clungup Mangrove Conservation (CMC), Kab. Malang, kondisi sangat baik (skor 89) namun luasan sempit (±34 ha). Model konservasi berbasis masyarakat yang berhasil.',
    rekomendasiPendek: [
      'Pertahankan patroli dan pemeliharaan oleh kelompok masyarakat',
      'Dokumentasikan praktik CMC sebagai model replikasi',
      'Manfaatkan nursery Clungup untuk suplai bibit lokasi lain',
    ],
    rekomendasiMenengah: [
      'Perkuat ekowisata konservasi berbasis kuota kunjungan',
      'Kolaborasi riset dengan UB/akademik untuk basis data biodiversitas',
    ],
    rekomendasiPanjang: [
      'Jadikan CMC rujukan tata kelola co-management untuk wilker',
      'Kembangkan pembiayaan berkelanjutan dari ekowisata',
    ],
    dasarHukum: [
      { nomor: 'UU No. 5/1990', keterangan: 'Konservasi Sumber Daya Alam Hayati dan Ekosistemnya' },
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
    ],
    targetCapaian: 'Pertahankan skor ≥ 88/100; jaga daya dukung kunjungan',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Malang'],
    estimasiAnggaran: 'Estimasi Rp 500 juta/tahun: perlu dilakukan verifikasi',
    catatanKhusus: 'Luas sempit tetapi kualitas terbaik; catatan penting: sebagian lahan sekitar adalah hutan darat Perhutani, bukan mangrove.',
  },
  {
    locationId: 'LOC-009',
    prioritas: 4,
    statusRisiko: 'perhatian',
    ringkasan: 'Sendangbiru–Tamban (Kab. Malang) tutupan sedang (58%) pada sabuk sempit. Perlu pemeliharaan dan penyulaman terarah.',
    rekomendasiPendek: [
      'Penyulaman zona jarang dari nursery Sendangbiru',
      'Pantau tekanan aktivitas pelabuhan/perikanan sekitar',
      'Perjelas status tenurial bidang mangrove',
    ],
    rekomendasiMenengah: [
      'Rehabilitasi bidang sempit yang terdegradasi',
      'Perkuat kelompok pengawas lokal',
    ],
    rekomendasiPanjang: [
      'Pertahankan fungsi lindung sabuk pantai selatan',
      'Integrasi data ke basis PMN dan Materi Teknis Perairan Pesisir (MATEK PP) Provinsi Jawa Timur',
    ],
    dasarHukum: [
      { nomor: 'UU No. 41/1999', keterangan: 'Kehutanan (Hutan Lindung)' },
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
    ],
    targetCapaian: 'Tutupan 65% dalam 2 tahun; tenurial jelas 2025',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'Pemkab Malang'],
    estimasiAnggaran: 'Estimasi Rp 600 juta/tahun: perlu dilakukan verifikasi',
    catatanKhusus: 'Sabuk sempit; fokus pemeliharaan, bukan perluasan besar.',
  },
  {
    locationId: 'LOC-010',
    prioritas: 2,
    statusRisiko: 'kritis',
    ringkasan: 'Bajul Mati–Kondang Merak (Kab. Malang) sabuk mangrove sangat sempit (±9 ha), tutupan kritis (28%), abrasi aktif dan tenurial bersengketa.',
    rekomendasiPendek: [
      'Stabilisasi titik abrasi dengan pelindung sementara',
      'Distribusi bibit toleran salinitas untuk zona terdepan',
      'Mediasi tenurial difasilitasi ATR/BPN Kab. Malang',
    ],
    rekomendasiMenengah: [
      'Restorasi bidang prioritas dengan pendekatan realistis untuk pantai sempit',
      'Kombinasikan mangrove dengan vegetasi pantai (cemara laut) bila lokasi tidak cocok mangrove',
    ],
    rekomendasiPanjang: [
      'Perlindungan pesisir terpadu untuk melindungi permukiman di belakang pantai',
      'Pemantauan abrasi rutin berbasis citra',
    ],
    dasarHukum: [
      { nomor: 'UU No. 27/2007 jo. 1/2014', keterangan: 'Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil' },
      { nomor: 'UU No. 24/2007', keterangan: 'Penanggulangan Bencana (abrasi)' },
    ],
    targetCapaian: 'Hentikan abrasi dalam 6 bulan; stabilkan sabuk yang ada',
    instansiPJ: ['DKP Provinsi Jawa Timur', 'Cabdin KP Kab. Malang', 'ATR/BPN Kab. Malang'],
    estimasiAnggaran: 'Estimasi Rp 1,2 miliar (perlindungan pesisir): perlu dilakukan verifikasi',
    catatanKhusus: 'Tidak semua pantai selatan cocok mangrove; pantai berombak besar lebih efektif dengan cemara laut/pandan.',
  },
];
